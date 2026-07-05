# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-07-05

### Added
- Docs: FAQ entry explaining that Windows PowerShell strips the `--` token before `summon url -- app`, with workarounds (`cmd`, `summon.cmd`, or PowerShell `--%`).

## [1.1.1] - 2026-07-05

### Changed
- Docs: synced the usage/help block with the actual CLI (`--engine`/`--engines`), added npm downloads and install-size badges, and unified "fuzzy picker" naming.

### Added
- Docs: a "vs other npm openers" comparison against `open-cli`, `opener`, and `open`.

## [1.1.0] - 2026-07-05

### Added
- Interactive **fuzzy picker** for `--recent` and the no-argument menu: type to filter (e.g. `ghb` matches `github`), enter a number to select, or press Enter to cancel. Narrowing to a single match auto-selects it.
- **Configurable search engines**: `--engine`/`-e` chooses an engine for `--search`, and `--engines` lists them. Ships with `google` (default), `ddg`, `bing`, `brave`, `npm`, `gh`, `mdn`, `so`, `yt`, and `wiki`.
- Config keys `searchEngines` (merged with the built-ins) and `defaultSearchEngine`. The legacy `searchEngine` string is still honored as the `custom` engine.
- **Homebrew formula** and **Scoop manifest** under `dist/` for install on macOS/Linux/Windows.

### Changed
- Refactored the CLI into smaller, focused functions.
- Expanded the test suite from 16 to 22 tests.

## [1.0.0] - 2026-07-05

### Added
- Initial release as `summon-open`, providing the cross-platform `summon` command.
- Open URLs, files, folders, and apps on macOS, Windows, and Linux.
- Multiple targets in a single call.
- Smart URL normalization (bare domains get `https://`, existing files always win).
- Bookmarks: `--save`, `@alias` resolution, `--bookmarks`, `--remove-bookmark`.
- Web search via `--search`.
- Clipboard mode (`--clipboard`).
- Reveal in file manager (`--reveal`).
- Recent items and an interactive picker.
- Dry-run mode (`--dry-run`).
- Choose the target app and pass arguments after `--`.
- Stdin support with automatic file-type detection.
- Friendly errors with typed exit codes (0/1/2/3/4).
- Shell completions for bash, zsh, fish, and PowerShell.

[1.1.2]: https://github.com/Aditya060806/summon/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/Aditya060806/summon/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/Aditya060806/summon/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/Aditya060806/summon/releases/tag/v1.0.0
