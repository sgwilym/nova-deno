Very fast JavaScript and Typescript integration, powered by
[Deno](https://deno.land).

- Inline typechecking and Intellisense for Javascript and Typescript!
- Code linting!
- Automatic formatting on save!
- Remote module (e.g. `import { x } from "https://cdn.com/mod.ts"`) caching!
- Registry import suggestions
- Task templates for `deno run` and `deno` bundle!

**This is pre-v1.0**. While the most important functions of Deno are integrated
here, there are a few limitations due to Nova's LSP integration. This is a
best-effort extension, and I will keep making it better as Nova allows!

## Requirements 🎒

To use this extension, you must have Deno installed (v.1.10.3 or above).
[Here's how you can do that](https://deno.land/#installation).

If you use Deno 1.18+, any deno.json configuration files will be automatically
detected and used by this extension

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

All of those can be defined at a per-project level, including an import map to
use.

## Known bugs 🪳

There are a few bugs which are out of my hands. I'm doing my best to follow up
with both Panic and the Deno team to resolve them.

- Many code actions (e.g. automatic imports) do not work.
- Autocompletions are only displayed when certain characters are input
  (`., \, ', /, @, <, #`).
- The **Jump to definition** command does not work for values defined within
  external dependencies.
- JSDocs are not displayed in hovercards

## Mega Shoutouts 📣

Much of the code in this extension was based on — if not entirely lifted from —
Cameron Little's
[excellent Nova Typescript extension](https://github.com/apexskier/nova-typescript).

## Contributing

This extension is itself a Deno project.
[Come fix bugs and add features with us](https://github.com/sgwilym/nova-deno)!
