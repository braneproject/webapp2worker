import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { convertHtml } from '../../lib.ts';

Deno.test("basic", async () => {
  const fileUrl = new URL('index.html', import.meta.url);

  const expectedUrl = new URL('output.js', import.meta.url);
  const expected = await Deno.readTextFile(expectedUrl);

  const actual = await convertHtml({
    contentPath: fileUrl,
    resolvePath: path => new URL(path, import.meta.url),
    readFile: Deno.readTextFile,
  });

  console.log(actual);

  assertEquals(actual, expected);
});
