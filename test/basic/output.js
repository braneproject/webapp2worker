const _document = document.createDocumentFragment();

const _vhead = document.createElement('div');
_vhead.setAttribute('data-vhead', '');
_vhead.innerHTML = `<title>Webapp to WorkerDOM</title>`;
_document.appendChild(_vhead);

const _vbody = document.createElement('div');
_vbody.setAttribute('data-vbody', '');
_vbody.innerHTML = `<h1>
      Hello, World!
    </h1>`;
_document.appendChild(_vbody);

const _vstyle$0 = document.createElement('style');
_vstyle$0.setAttribute('data-vstyle', '0');
_vstyle$0.innerHTML = `[data-vbody] {
  margin: 0;
}

h1 {
  color: green;
}`;
_vhead.appendChild(_vstyle$0);

const _vstyle$1 = document.createElement('style');
_vstyle$1.setAttribute('data-vstyle', '1');
_vstyle$1.innerHTML = `:root, [data-vbody] {
        font-size: 16px;
      }`;
_vhead.appendChild(_vstyle$1);

document.head = _vhead;
document.body = _vbody;
document.documentElement.appendChild(_document);

/* -begin assets/code.js */
console.log('Hello, World!');
/* -end   assets/code.js */

/* -begin 0 */
console.log("inline script");
/* -end   0 */
