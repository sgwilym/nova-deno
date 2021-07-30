Very fast JavaScript and Typescript integration, powered by [Deno](https://deno.land).

- Inline Typechecking and Intellisense for Javascript and Typescript!
- Code linting!
- Automatic formatting on save!
- Remote module (e.g. `import { x } from "https://cdn.com/mod.ts"`) support!
- Task templates for `deno run` and `deno` bundle!

**This is pre-v1.0**. While the most important functions of Deno are integrated here, there are missing features and a few known bugs. This is a best-effort extension, but it might be good enough to start with!

## Requirements 🎒

To use this extension, you must have the Deno CLI installed (v.1.10.3 or above). [Here's how you can do that](https://deno.land/#installation).

## Commands ⌨️

- **Cache** - Cache all external dependencies
- **Format Document** - Format with Deno's formatter
- **Rename symbol** - Rename variables, functions, etc.

## Configuration options ⚙️

All of the below can be configured at a global and per-project basis (via **Project → Project Settings...**).

- Format on save
- Deno language features
- Linting
- Unstable Deno APIs

The following can be configured on a per-project lever:

- Import map
- tsconfig.json

## Known bugs 🪳

There are a few bugs which are out of my hands. I'm doing my best to follow up with both Panic and the Deno team to resolve them.

- Many code actions (e.g. automatic imports) do not work.
- Autocompletions are only displayed when certain characters are input (`., \, ', /, @, <, #`).
- The **Jump to definition** command does not work for values defined within external dependencies.

## Mega Shoutouts 📣

Much of the code in this extension is based on — if not entirely lifted from — Cameron Little's [excellent Nova Typescript extension](https://github.com/apexskier/nova-typescript).

## Contributing

This extension is itself a Deno project. [Come fix bugs and add features with us](https://github.com/sgwilym/nova-deno)!
