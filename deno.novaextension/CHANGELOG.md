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
