Very fast JavaScript and Typescript integration, powered by [Deno](https://deno.land).  

- Inline Typechecking and Intellisense for Javascript and Typescript!
- Linting, reporting issues to the **Issues** bar!
- Automatic formatting on save!
- Remote module (e.g. `import { x } from "https://cdn.com/mod.ts"`) support!

**This is version 0.1**. While the most important functions of Deno are integrated here, there are missing features and a few known bugs. This is a best-effort extension, but it might be good enough for now!

## Requirements 🎒

To use this extension, you must have the Deno CLI installed (v.1.10.3 or above). [Here's how you can do that](https://deno.land/#installation).

## Commands ⌨️

- **Cache** - Cache all external dependencies
- **Format Document** - Format with Deno's formatter
- **Rename symbol** - Rename variables, functions, etc.

## Configuration options ⚙️

- You can enable/disable automatic formatting on save in the extension preferences.
- You can de/activate Deno integration on a per-project basis in **Project → Project Settings...**.
- Support for unstable APIs can also be configured on a per-project basis in **Project → Project Settings...**.

## Known bugs 🪳

There are a few bugs which are out of my hands. I'm doing my best to follow up with both Panic and the Deno team to resolve them.

- Many code actions (e.g. automatic imports) do not work.
- Autocompletions are only displayed when certain characters are input (`., \, ', /, @, <, #`).
- The **Jump to definition** command does not work for values defined within external dependencies.

## Mega Shoutouts 📣

Much of the code in this extension is based on — if not entirely lifted from — Cameron Little's [excellent Nova Typescript extension](https://github.com/apexskier/nova-typescript).

## Contributing



