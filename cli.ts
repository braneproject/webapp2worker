import { Command } from 'https://deno.land/x/cliffy@v0.19.5/command/mod.ts';
import * as path from 'https://deno.land/std/path/mod.ts';

import { convertHtml } from './lib.ts';

const { args, options } = await new Command()
  .name('webapp2worker')
  .description('Convert a plain webapp to the WorkerDOM script')
  .option('-p, --path [path:string]', 'Base directory path to resolve assets')
  .arguments('<index_path:string>')
  .parse(Deno.args);

const [indexPath] = args;

const cwd = path.toFileUrl(Deno.cwd() + path.sep);

const baseUrl = options['path']
  ? new URL(options['path'], cwd)
  : new URL(indexPath, cwd)

const result = await convertHtml({
  contentPath: new URL(indexPath, cwd),
  resolvePath: path => new URL(path.replace(/^\//, ''), baseUrl),
  readFile: Deno.readTextFile,
});

console.log(result);
