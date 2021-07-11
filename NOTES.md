## NEXT TIME

- Need to get esbuild working now that we have URL dependencies
- lots of weird type errors in build.ts
- where to get URL? http? https? deno/std?

# 11/7/20

- So LSP has a bunch of standard commands like 'textDocument/formatting', 'textDocument/rename' etc
- Someone is already making an extension... found the same problem regarding completions (https://devforum.nova.app/t/bug-with-textdocument-completion/969). One salient difference is I'm making this extension with Deno itself.
  - Which is good!
- Started building in more complex command support
- Starting taking code wholesale from apexskier's nova-typescript extension

# NEXT TIME

- We got everything working!
- Next: how do we get it to format on save?
- https://deno.land/x/deno@v1.11.2/cli/lsp

# Working notes -- 10/7/20

How do you make an extension for nova?

- It needs a README
- An Images folder for resources
- A CHANGELOG
- extension.png + @2x
- extension.json (pretty deep, check this out: https://github.com/apexskier/nova-typescript/blob/main/typescript.novaextension/extension.json
  )
- a Scripts folder where the bundled version comes out, to be used as 'main' file

That JSON file is where everything gets pointed out:

- oh, the main file
- which files to active the extension with
- extension entitlements
- the configuration options of the extension
- the workspace config (ie config specific to a project)
- the sidebars in nova, and what they do
- the commands it makes available

How do I make that main file?

we register a new languageclient (https://github.com/apexskier/nova-typescript/blob/main/src/main.ts#L175)
then we'd register a bunch of commands with it.
