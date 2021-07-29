# Working Notes

## 28/7/20

- Added fine-grained options for the extension which can be defined at a global and per-workspace level. Should make using this with the Typescript extension installed a _little_ better (though I need to request a per-project off switch for the TS extension).
- Tried to add tasks for Deno: run and bundle. Complete nightmare piping the options into the commands, had to resort to some ugly looking shell scripts.

## Next time

- A logo that tells of this extension's 0.1-ness.

## 14/7/20

- Decided to just accept limitations for now. Am trying to follow up on bugs with both Deno team and Panic.
- Made dependency caching an explicit command as it downloads third party code to your machine.
- Did a bunch of extension config / README finessing

--

## Next time

- Ran out of steam after seeing that I need some support from Panic to make this complete.
  - Maybe a lot. Just don't know how to proceed with some things that don't work.
  - I guess use tee + send to Panic...
    - ```{"jsonrpc":"2.0","result":[{"title":"Import 'openFile' from module \"./nova_utils.ts\"","kind":"quickfix","diagnostics":[{"range":{"start":{"line":14,"character":2},"end":{"line":14,"character":10}},"severity":1,"code":2304,"source":"deno-ts","message":"Cannot find name 'openFile'."}],"edit":{"documentChanges":[{"textDocument":{"uri":"file:///Volumes/Macintosh%20HD/Users/gwil/Projects/nova-deno/src/nova_deno.ts","version":1334},"edits":[{"range":{"start":{"line":5,"character":0},"end":{"line":5,"character":0}},"newText":"import { openFile } from \"./nova_utils.ts\";\n"}]}]}},{"title":"Add missing function declaration 'openFile'","kind":"quickfix","diagnostics":[{"range":{"start":{"line":14,"character":2},"end":{"line":14,"character":10}},"severity":1,"code":2304,"source":"deno-ts","message":"Cannot find name 'openFile'."}],"edit":{"documentChanges":[{"textDocument":{"uri":"file:///Volumes/Macintosh%20HD/Users/gwil/Projects/nova-deno/src/nova_deno.ts","version":1334},"edits":[{"range":{"start":{"line":194,"character":0},"end":{"line":194,"character":0}},"newText":"\nfunction openFile() {\nthrow new Error(\"Function not implemented.\");\n}\n"}]}]}}],"id":190}```
- Regarding definitions from other modules: 
  - ```{"jsonrpc":"2.0","result":[{"targetUri":"deno:/https/deno.land/x/vscode_languageserver_types%40v0.1.0/mod.ts","targetRange":{"start":{"line":4,"character":0},"end":{"line":3252,"character":0}},"targetSelectionRange":{"start":{"line":4,"character":0},"end":{"line":3252,"character":0}}}],"id":10}```
  - Seems I need a way to override `textDocument/definition` so that I can request a virtual text document from deno

## 12/7/20

- got deno cache working - but do it on each editor change instead.
- let's resolve these weird ass type errors...
- resolved them. some changes since to nova internal API.
- Why is this markdown file being sent to Deno LS?
  - Oh, gotta only invoke deno.cache on the right files...
- I need to find some good types for LSP stuff... (see apply_workspace_edits)
- Investigated non-working code actions. I think this one is on Panic. Need to report.
  - Did it. https://devforum.nova.app/t/code-actions-not-working-with-deno-lsp-how-can-i-diagnose/1058

## Next time

- Figure out what a code lens is re: tests
- Implement deno.cache
- Lift a few more commands from the TS extension

## 11/7/20 part 2

- Got esbuild working again
- Got format on save working, found a diversion between nova types and values being sent
- Still trying to figure out what a code lens is
- Put together a more complete list of things to implement

---

## NEXT TIME

- Need to get esbuild working now that we have URL dependencies
- lots of weird type errors in build.ts
- where to get URL? http? https? deno/std?

## 11/7/20

- So LSP has a bunch of standard commands like 'textDocument/formatting', 'textDocument/rename' etc
- Someone is already making an extension... found the same problem regarding completions (https://devforum.nova.app/t/bug-with-textdocument-completion/969). One salient difference is I'm making this extension with Deno itself.
  - Which is good!
- Started building in more complex command support
- Starting taking code wholesale from apexskier's nova-typescript extension

---

## NEXT TIME

- We got everything working!
- Next: how do we get it to format on save?
- https://deno.land/x/deno@v1.11.2/cli/lsp

## 10/7/20

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
