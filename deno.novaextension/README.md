Simple and fast JavaScript and Typescript integratian, powered by the
[Deno](https://deno.land) runtime.

- Inline typechecking, completions, and inline API information for Javascript
  and Typescript!
- Tasks derived from deno.json!
- Code linting!
- Automatic formatting on save!
- Remote module (e.g. `import { x } from "https://cdn.com/mod.ts"`) caching!
- Registry import suggestions!
- Task templates for `deno run` and `deno` bundle!

## Requirements 🎒

To use this extension, you must have Deno installed (v.1.10.3 or above).
[Here's how you can do that](https://deno.land/#installation).

If you use Deno 1.18+, any deno.json configuration files will be automatically
detected and used by this extension.

Support for Deno tasks requires Deno 1.20+.

## Commands ⌨️

- **Cache** - Cache all external dependencies
- **Format Document** - Format with Deno's formatter
- **Rename symbol** - Rename variables, functions, etc.
- **Restart Deno LSP server** - You shouldn't have to do this, but it's nice to
  have when you start getting angry.

## Configuration options ⚙️

All of the below can be configured at a global and per-project basis (via
**Project → Project Settings...**).

- Format on save
- Deno language features
- Linting
- Unstable Deno APIs
- Import map

All of those can be defined at a per-project level, including an import map to
use.

## Limitations

There are a few limitations which I'm doing my best to resolve with the help of
Panic.

- The **Jump to definition** command does not work for values defined within
  external dependencies.

## Mega Shoutouts 📣

Much of the code in this extension was based on — if not entirely lifted from —
Cameron Little's
[excellent Nova Typescript extension](https://github.com/apexskier/nova-typescript).

## Contributing

This extension is itself a Deno project.
[Come fix bugs and add features with us](https://github.com/sgwilym/nova-deno)!
