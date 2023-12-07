# nova-deno

A Deno extension for Nova.

- Integrates [Nova](https://nova.app)'s `LanguageClient` with Deno's built-in
  LSP for full IDE functionality.
- Nova tasks automatically derived from deno.json config.

Read the [user-facing README here](/deno.novaextension/README.md).

## Outline

The entrypoint `src/nova_deno.ts` has two exports: `activate` and `deactivate`,
which are used by Panic's Nova. This is where the LanguageClient is set up,
commands are registered, and disposables are set up.

A build script pulls all the source together into a single javascript file which
can be used by Nova.

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
3. Rebuild the extension using `deno task build`
