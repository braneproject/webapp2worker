import { Command } from 'https://deno.land/x/cliffy@v0.19.5/command/mod.ts';
import { minify } from "https://deno.land/x/minifier/mod.ts";

import { convertHtml } from './lib.ts';

const { args, options } = await new Command()
  .name('webapp2worker')
  .description('Convert a plain webapp to the WorkerDOM script')
  .option('-p, --path [path:string]', 'Base directory path to resolve assets')
  .option('-m, --minify [minify:boolean]', 'Minify result', { default: true })
  .arguments('<index_path:string>')
  .parse(Deno.args);

const [indexPath] = args;

const baseUrl = options['path']
  ? new URL(options['path'], import.meta.url)
  : new URL(indexPath, import.meta.url)

let result = await convertHtml({
  contentPath: new URL(indexPath, import.meta.url),
  resolvePath: path => new URL(path, baseUrl),
  readFile: Deno.readTextFile,
});
if (options['minify']) {
  result = minify('js', result);
}

console.log(result);
