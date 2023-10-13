# Deno 🦕

Everything you need for TypeScript and JavaScript development, powered by the
[Deno](https://deno.land) runtime.

- Zero-config Typescript support.
- A complete development toolchain including a **formatter**, **linter**, **test
  runner**, and **language server**.
- Complete support for standard Web APIs like `fetch`, `WebSocket`, or the
  Streams API.
- An audited [standard library](https://deno.land/std).
- Dependencies without node_modules or package.json.
- Secure by default, requiring explicit permission for file, network or
  environment access.

Deno's complete and _fast_ Rust-based toolchain is the perfect companion for
Nova, bringing a truly zippy TypeScript development environment.

This extension provides the following integrations with Nova:

- Typechecking, linting, completions, code actions, registry import suggestions,
  and more in your editor.
- Tasks in Nova derived from
  [Deno tasks](https://deno.com/blog/v1.20#new-subcommand-deno-task).
- Automatic formatting on save.
- Automatic caching of dependencies on save.
- Commands for renaming symbols, caching dependencies, formatting documents, and
  renaming symbols.
- Symbol search and dedicated sidebar.
- Task templates for `deno run` and `deno bundle` commands.
- Global and per-project configuration settings.

Nova also has built-in support for Deno's debugger thanks to its Deno Debug
project task (**Project → Project Settings → Add Deno Debug using + in Tasks
section**).

### How is this different to the TypeScript extension?

The excellent
[Nova Typescript extension](https://github.com/apexskier/nova-typescript)
assumes you are using the Node.js runtime and everything that ecosystem brings
with it. The `node_modules` folder. `require()` imports. `package.json`. Less
support for Web Platform APIs. No built-in formatter, linter, or test runner.

It can be a lot. If you just want to be able to create a `.ts` file in an empty
folder and get programming, then this extension is for you!

## Requirements 🎒

To use this extension, you must have the Deno runtime installed (v.1.10.3 or
above).
[Installation instructions can be found here](https://deno.land/#installation).

If you use Deno 1.18+, any deno.json configuration files will be automatically
detected and used by this extension.

Support for Deno tasks requires Deno 1.20+.

Support for "cache on save" requires Deno 1.37.0+.

## Commands ⌨️

- **Cache** - Cache all external dependencies
- **Format Document** - Format with Deno's formatter
- **Rename symbol** - Rename variables, functions, etc.
- **Find Symbol** - Search for symbols in the codebase
- **Restart Deno LSP server** - You shouldn't have to do this, but it's nice to
  have when you start getting angry.

## Configuration options ⚙️

All of the below can be configured at a global _and_ per-project basis (via
**Project → Project Settings...**).

- Linting
- Format on save
- Cache on save
- Unstable Deno APIs
- Complete function calls

The following can be configured on a per-project basis:

- Enable Deno features
- Import maps
- Enabled paths
- Disabled paths
- Trusted import hosts
- Untrusted import hosts
- Document preload limit
- TypeScript isolate memory limit

## Maintainers

- [sgwilym](https://github.com/sgwilym)
- [belcar-s](https://github.com/belcar-s)

## Shoutouts 📣

Big thanks to Cameron Little's
[excellent Nova Typescript extension](https://github.com/apexskier/nova-typescript)
for providing an excellent reference (and a lot of code) for developing a great
Nova extension.

## Contributing 🤝

This extension is itself a Deno codebase.
[Come add features and fix bugs with us](https://github.com/sgwilym/nova-deno)!
