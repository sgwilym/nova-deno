# nova-deno

A Deno extension for Nova.

- LSP integration with all that brings: typechecking, intellisense, hover cards, etc.
- File linting
- Document formatting
- Symbol renaming
- Remote module support + caching

This represents a best effort. It has a few known bugs that need assistance from Panic or Deno — see this repo's issues.

## Outline

The entrypoint `mod.ts` exposes two exports: `activate` and `deactivate`, which are used by Panic's Nova.

The contents of these exports can be found in `src/nova_deno.ts`. This is where the LanguageClient is set up, commands are registered, listeners are set up, etc.

Much (maybe most?) of the code in this repo has been based on, if not entirely copied from, [nova-typescript](https://github.com/apexskier/nova-typescript), which has many useful utilities that could apply to any LSP extension for Nova. 

## Developing

1. Open this project in Nova.
2. Select **Extensions -> Activate Project as Extension** in the menu bar (you will need to enable Extension development in the general section of Nova's preferences to do this).
3. Run the 'Bundle' command, which watches for changes and builds* to `deno.novaextension`.

* This project uses esbuild rather than Deno to build the project, as Nova expects the project's modules to be in CommonJS format.

