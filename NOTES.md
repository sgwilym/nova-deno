# Working notes

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
