# Webapp to WorkerDOM

```
Usage: webapp2worker <index_path:string>

Description:

  Convert a plain webapp to the WorkerDOM script

Options:

  -h, --help              - Show this help.
  -p, --path    [path]    - Base directory path to resolve assets
```

## Usage

```bash
w2w path/to/index.html > script.js
```

Then upgrade element using the result;

```html
<!DOCTYPE html>
<html>
<body>
  <div src="script.js" id="upgrade-me"></div>
  <script type="module">
    import {upgradeElement} from 'worker-dom/main.mjs';
    upgradeElement(document.getElementById('upgrade-me'), 'worker-dom/worker.mjs');
  </script>
</body>
</html>
```

## Development

This command is CLI developed using [Deno](https://deno.land/) v1.17.0

You can compile binary your self

```bash
deno compile --allow-read cli.ts
```
