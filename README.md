# nova-deno

A Deno extension for Nova.

- LSP integration with all that brings: typechecking, intellisense.
- File linting
- Document formatting
- Symbol renaming
- Remote module caching
- Registry import suggestions

This represents a best effort. It has a few known bugs that need assistance from
Panic or Deno — see this repo's issues.

## Outline

The entrypoint `mod.ts` exposes two exports: `activate` and `deactivate`, which
are used by Panic's Nova.

The contents of these exports can be found in `src/nova_deno.ts`. This is where
the LanguageClient is set up, commands are registered, listeners are set up,
etc.

This repo uses many useful utilities that could apply to any LSP extension for
Nova which I originally based on / copied from
[nova-typescript](https://github.com/apexskier/nova-typescript). I have started
pulling these out into a module called
[nova_utils](https://github.com/sgwilym/nova_utils).

## Developing

1. Open this project in Nova.
2. Select **Extensions -> Activate Project as Extension** in the menu bar (you
   will need to enable Extension development in the general section of Nova's
   preferences to do this).
3. Run the 'Bundle' command, which outputs a bundle* to `deno.novaextension`.
