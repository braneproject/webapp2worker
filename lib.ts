import {
  DOMParser,
  HTMLDocument,
  Element,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

type Context = {
  resolvePath: (path: string) => URL,
  readFile: (url: URL) => Promise<string>,

  /**
   * Path to index.html
   */
  contentPath: URL,
}

export async function convertHtml(ctx: Context) {
  const {
    readFile,
    contentPath,
  } = ctx;

  const content = await readFile(contentPath);

  const element = new DOMParser().parseFromString(content, 'text/html');
  if (!element) {
    throw new Error('Failed to parse content as HTML');
  }

  const styles = await extractStyleSheets(element, ctx);
  const scripts = await extractScripts(element, ctx);

  const headContent = element.head.innerHTML;
  const bodyContent = element.body.innerHTML;

  return render({
    headContent,
    bodyContent,
    styles,
    scripts,
  });
}

type ExternalScript = {
  _type: 'external',
  src: string,
  content: string,
};

type InlineScript = {
  _type: 'inline',
  content: string,
};

type Script = ExternalScript | InlineScript;

function extractScripts(document: HTMLDocument, ctx: Context): Promise<Script[]> {
  const elements = [...document.querySelectorAll('script:not([type=module])')] as Element[];

  return Promise.all(elements.map(async el => {
    el.remove();
    const src = el.getAttribute('src')!;
    if (src) {
      const contentPath = ctx.resolvePath(src);
      const content = await fetch(contentPath).then(res => res.text());
      return {
        _type: 'external' as const,
        src,
        content,
      };
    } else {
      return {
        _type: 'inline' as const,
        content: el.textContent,
      };
    }
  }));
}

type ExternalStyleSheet = {
  _type: 'external',
  href: string,
  content: string,
};

type InlineStyleSheet = {
  _type: 'inline',
  content: string,
};

type StyleSheet = ExternalStyleSheet | InlineStyleSheet;

function extractStyleSheets(document: HTMLDocument, ctx: Context): Promise<StyleSheet[]> {
  const elements = [...document.querySelectorAll('head > link[rel=stylesheet][href]:not([media=print]), head > style')] as Element[];

  return Promise.all(elements.map(async el => {
    el.remove();

    switch (el.tagName.toLowerCase()) {
      case 'style': {
        return {
          _type: 'inline' as const,
          content: el.textContent,
        };
      }
      case 'link': {
        const href = el.getAttribute('href')!;
        const contentPath = ctx.resolvePath(href);
        const content = await fetch(contentPath).then(res => res.text());
        return {
          _type: 'external' as const,
          href,
          content,
        };
      }
    }
    throw new Error('invariant');
  }));
}

type RenderParams = {
  headContent: string,
  bodyContent: string,
  styles: StyleSheet[],
  scripts: Script[],
};

function render({
  headContent,
  bodyContent,
  styles,
  scripts,
}: RenderParams) {
  let inlineScriptCount = 0;
  let result = `const _document = document.createDocumentFragment();

const _vhead = document.createElement('div');
_vhead.setAttribute('data-vhead', '');
_vhead.innerHTML = \`${headContent.trim()}\`;
_document.appendChild(_vhead);

const _vbody = document.createElement('div');
_vbody.setAttribute('data-vbody', '');
_vbody.innerHTML = \`${bodyContent.trim()}\`;
_document.appendChild(_vbody);

${styles.map((style, i) => {
  const varname = `_vstyle$${i}`;
  const content = style.content
    .replace(/\b(html)\b/g, ':root')
    .replace(/\b(body)\b/g, '[data-vbody]');
  return `const ${varname} = document.createElement('style');
${varname}.setAttribute('data-vstyle', '${i}');
${varname}.innerHTML = \`${content.trim()}\`;
_vhead.appendChild(${varname});
`;
}).join('\n')}
document.head = _vhead;
document.body = _vbody;
document.documentElement.appendChild(_document);
`;

  result += `
${scripts.map(script => {
  const blockname = script._type === 'external'
    ? script.src
    : (inlineScriptCount++).toString();
  return `/* -begin ${blockname} */
${script.content.trim()}
/* -end   ${blockname} */
`;
}).join('\n')}`;

  return result;
}
