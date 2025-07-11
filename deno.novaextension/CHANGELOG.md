## v1.5.4

- Fix a regression where the extension did not support Deno when installed with e.g. Homebrew

## v1.5.3

- Fix an issue where the extension was looking for Deno at the wrong path.

## v1.5.2

- Fix a problem where formatting on save would not work and instead raise an annoying dialog box.

## v1.5.1

- Fix a problem where the Deno format command was not respecting user preferences re: spaces and tabs.

## v1.5.0

- Add a new "Reload Import Registries" command.
- Manually restart the server when the config file changes.
- The "Cache dependencies" command was broken by the underlying command having been removed from the LSP. It has now been updated to the new command.
- Removed the workspace "Enabled paths" and "Disabled paths" setting. If you were to add some enabled paths and remove all of them, Nova would leave an empty array, which would make the Deno LSP decide not to be enabled for anything. If you need to conditionally disable which files are analysed by the LSP, I recommend you use the deno.json `exclude` option to do so.

## v1.4.3

- Changed fallback value for `deno.enablePaths`, as newer versions of Deno LSP
  interpret the previous fallback (an empty array) as enabling no paths.

## v1.4.2

- The per-workspace setting for enabling unstable Deno APIs is now _really_
  respected.
- Preferences for linting, cache on save, and complete function calls have all
  been moved to workspace settings. Changing these settings will no longer
  restart the LSP client!
- Fixed an out of bounds issue for LSP <> Nova range conversions.
- The build process for the extension has been improved, resulting in a smaller
  extension.

## v1.4.1

Two small bug fixes.

- The per-workspace setting for enabling unstable Deno APIs is now respected.
- Deno task detection has been made more efficient.

Additionally, the task templates for `Deno Run` and `Deno Bundle` have been
removed. Deno's `bundle` command has been deprecated for a while (see
https://docs.deno.com/runtime/manual/tools/bundler), and Deno `run` is far
better server by the task runner API.

## v1.4.0

Added a new configuration option:

- Added new global and project settings for "Cache on save". When enabled, the
  extension will automatically cache dependencies when a file is saved without
  you needing to run the 'Cache dependencies' command. Turned off by default!

- Removed the "Enable Deno Language features" global setting. The language
  features are now on by default, and can be manually turned off on in the
  project settings.
- Updated some of the settings descriptions to better explain how the "Enable
  Deno features", "Enabled paths", and "Disabled paths" settings interact.
- Added default values for "Enabled paths" and "Disabled paths" settings so that
  the LSP does not get upset. Hopefully.

## v1.3.0

Added two new configuration options:

- Added a per-workspace "Disabled paths" setting. The Deno extension will not be
  enabled for these paths.
- Added a per-workspace "Complete function calls" setting. When enabled, this
  will include parenthese and arguments when selecting an autocomplete for a
  known function.

## v1.2.0

Added some features to improve the performance of this extension with large
codebases.

- Added per-workspace `enablePath` settings, which enables Deno's LSP to work
  with only paths you specify.
- Added a per-workspace 'Document preload limit' configuration.
- Added a per-workspace 'TypeScript isolate memory limit' configuration.

## v1.1.0

- **Symbols**: This update adds a new 'Find Symbol' command and accompanying
  Deno Symbols sidebar to show the results of your search. (thanks to
  [belcar-s](https://github.com/belcar-s)!)
- The extension will now gracefully handle Deno not being installed
  ([belcar-s](https://github.com/belcar-s)

## v1.0.4

- Fixes an issue where tasks defined in a `deno.jsonc` config file would not be
  exposed as Nova tasks (thanks again, [belcar-s](https://github.com/belcar-s)!)
- Fixes an issue where the extension would not work in files which were not
  associated with any project yet (thanks again,
  [belcar-s](https://github.com/belcar-s)!)

## v1.0.3

- Fixed an issue where the "Enable Deno Language Features" preference was not
  being respected (thanks again, [belcar-s](https://github.com/belcar-s)!)

## v1.0.2

- Fixed an issue where the 'Format on save' preference was not being respected
  (thank you [belcar-s](https://github.com/belcar-s)!)
- Made it so that the LSP is relaunched when the deno.json configuration file is
  modified.

## v1.0.1

- Bump for publishing the updated README.

## v1.0.0

- Added support for automatically detecting
  [Deno tasks](https://deno.com/blog/v1.20#new-subcommand-deno-task) and adding
  them as Nova tasks.
- With Nova 9, many previous issues (such as code actions, or completions only
  being shown on typing certain characters) have gone, and this is a whole new
  extension!
- New icons!

## v0.4.2

- Now properly restarts LSP server when changing global and per-project settings
  in Nova.

## v0.4.1

- Fix issue where formatting on save could not be configured at project level.

## v0.4.0

- Added support for import suggestions!
- Removed configuration file option (Deno will detect it automatically as of
  v1.18)
- Added "Restart Deno LSP server" command.
- Added JSON and JSONC as syntaxes this extension can use.
- Fixed a bug where formatting a document would hang indefinitely.

## v0.3.4

- Makes sure some fixes are actually included in the built extension.
- Added a funding link.

## v0.3.3

- Fixes an issue where enabling network access in the Run task passed the wrong
  flag (thanks [jaydenseric](https://github.com/jaydenseric)!)
- Stops the Deno LSP from printing all its logs as errors in the extension
  console.

## v0.3.2

- Quick update to fix a submission error.

## v0.3.1

- Refactored task templates so that they succeed more often and are easier to
  manage!

## v0.3

- Added per-workspace configs for import maps and tsconfig.json for the LSP to
  use.

## v0.2

- Added global and per-workspace configs for:
  - Language features
  - Linting
  - Format on save
  - Unstable API support.
- Added built in Task Templates for `deno run` and `deno bundle`, which can be
  added and configured from **Project -> Project Settings**.
- Fixed an issue where linting was not being enabled properly.
- Removed unnecessary network access entitlement.

## v0.1

- Initial release
