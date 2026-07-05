<div align="center">

```
                                        
   ___ _   _ _ __ ___  _ __ ___   ___  _ __  
  / __| | | | '_ ` _ \| '_ ` _ \ / _ \| '_ \ 
  \__ \ |_| | | | | | | | | | | | (_) | | | |
  |___/\__,_|_| |_| |_|_| |_| |_|\___/|_| |_|
                                        
```

**Open URLs, files, folders, and apps from one cross-platform command.**

Bookmarks, search, clipboard, reveal-in-file-manager, dry-run, multiple targets, and stdin — all in a tool small enough to forget it's there. No more remembering `xdg-open` vs `start` vs `open`.

[![npm version](https://img.shields.io/npm/v/summoncli.svg)](https://www.npmjs.com/package/summoncli)
[![node](https://img.shields.io/node/v/summoncli.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/summoncli.svg)](license)
[![CI](https://github.com/Aditya060806/summon/actions/workflows/main.yml/badge.svg)](https://github.com/Aditya060806/summon/actions)

</div>

<!--
  DEMO: drop a terminal recording here for maximum impact.
  Record with https://github.com/charmbracelet/vhs or https://asciinema.org
  then reference it, e.g.:
  <div align="center"><img src="media/demo.gif" alt="summon demo" width="700"></div>
-->

```console
$ summon github.com                         # scheme added automatically
$ summon report.pdf photo.png notes.txt     # open several things at once
$ summon @docs                              # open a saved bookmark
$ summon -s "how to center a div"           # search the web
$ summon report.pdf --reveal                # highlight it in your file manager
$ cat diagram.png | summon                  # pipe raw bytes straight in
```

---

## Table of Contents

- [Why summon](#why-summon)
- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [Cheatsheet](#cheatsheet)
- [Usage](#usage)
- [Options](#options)
- [Features in depth](#features-in-depth)
  - [Multiple targets](#multiple-targets)
  - [Smart URL normalization](#smart-url-normalization)
  - [Bookmarks](#bookmarks)
  - [Web search](#web-search)
  - [Clipboard](#clipboard)
  - [Reveal in file manager](#reveal-in-file-manager)
  - [Recent & interactive picker](#recent--interactive-picker)
  - [Dry run](#dry-run)
  - [Choosing the app](#choosing-the-app)
  - [Stdin](#stdin)
- [Recipes](#recipes)
- [Configuration](#configuration)
- [Shell completions](#shell-completions)
- [How it works](#how-it-works)
- [Comparison](#comparison)
  - [Feature matrix](#feature-matrix)
  - [Same task, side by side](#same-task-side-by-side)
- [Efficiency](#efficiency)
- [Exit codes](#exit-codes)
- [Platform support](#platform-support)
- [Supported stdin file types](#supported-stdin-file-types)
- [FAQ & troubleshooting](#faq--troubleshooting)
- [Related](#related)
- [Author](#author)
- [License](#license)

---

## Why summon

Every operating system has its own way to "open the default thing":

| OS | Native command |
| --- | --- |
| macOS | `open` |
| Windows | `start` |
| Linux | `xdg-open` |

Writing a script that works everywhere means branching on the platform, escaping arguments differently, and handling edge cases like piped input. `summon` collapses all of that into a single, predictable command — then adds the quality-of-life features the native tools never had.

```sh
# Instead of this…
case "$(uname)" in
  Darwin) open "$url" ;;
  Linux)  xdg-open "$url" ;;
  *)      start "$url" ;;
esac

# …just write this
summon "$url"
```

## Features

- **Cross-platform** — identical behavior on macOS, Windows, and Linux (Android via Termux too).
- **Opens anything** — URLs, files, folders, and executables.
- **Multiple targets** — `summon a.pdf b.png https://x.com` opens them all.
- **Smart URL normalization** — `summon github.com` just works; the `https://` is added for you.
- **Bookmarks** — save aliases (`summon @docs`) and turn `summon` into a daily driver.
- **Web search** — `summon -s "query"` opens a search with your configured engine.
- **Clipboard mode** — `summon -c` opens whatever URL/path you just copied.
- **Reveal** — `summon -r file` highlights it in Finder/Explorer/your file manager.
- **Recent + interactive picker** — re-open recent items or pick from a menu.
- **Dry run** — `--dry-run` prints exactly what would happen without doing it.
- **Pick the app** — force a specific app and pass it arguments.
- **Pipe-friendly** — stream data over stdin; the file type is auto-detected.
- **Friendly errors + exit codes** — scripts can branch on what went wrong.

## Install

Requires **Node.js 20 or newer**.

```sh
npm install --global summoncli
```

This installs the `summon` command. Or run it once without installing:

```sh
npx summoncli https://github.com
```

<details>
<summary>Other install channels</summary>

Homebrew and Scoop manifests are planned. In the meantime, `npm`/`npx` work on every platform. If you maintain a package repo and want to help, contributions are welcome.

</details>

## Quick start

```sh
# Open a URL in your default browser
summon https://github.com

# Bare domains work too — https:// is added automatically
summon github.com

# Open a file, a folder, and a URL at once
summon report.pdf ./project https://news.ycombinator.com

# Open a URL in a specific browser with flags
summon https://github.com -- 'google chrome' --incognito

# Save and reuse bookmarks
summon https://docs.example.com --save docs
summon @docs

# Search the web
summon -s "rust async traits"

# Open whatever URL is on your clipboard
summon --clipboard

# Reveal a file in your file manager
summon report.pdf --reveal

# See what would happen, without doing it
summon github.com --dry-run

# Pipe data in and let summon detect the type
cat photo.png | summon
echo '<h1>Unicorns!</h1>' | summon --extension=html
```

## Cheatsheet

The whole tool at a glance — task on the left, command on the right.

| I want to… | Command |
| --- | --- |
| Open a URL | `summon https://example.com` |
| Open a bare domain | `summon example.com` |
| Open a file | `summon report.pdf` |
| Open a folder | `summon .` |
| Open several things | `summon a.pdf b.png https://x.com` |
| Open in a specific app | `summon url -- firefox` |
| Open with app flags | `summon url -- 'google chrome' --incognito` |
| Save a bookmark | `summon https://docs.example.com --save docs` |
| Open a bookmark | `summon @docs` |
| List bookmarks | `summon --bookmarks` |
| Remove a bookmark | `summon --remove-bookmark docs` |
| Search the web | `summon -s "query here"` |
| Open clipboard URL | `summon -c` |
| Reveal in file manager | `summon report.pdf -r` |
| Re-open something recent | `summon --recent` |
| Preview without opening | `summon url --dry-run` |
| Wait for the app to close | `summon file --wait` |
| Open piped data | `cat photo.png \| summon` |
| Open piped text as HTML | `echo '<h1>Hi</h1>' \| summon --extension=html` |

## Usage

```
$ summon --help

  Usage
    $ summon <file|url|@bookmark> … [options] [-- <app> [args]]
    $ cat <file> | summon [--extension] [options] [-- <app> [args]]

  Options
    --wait, -w          Wait for the app to exit
    --background        Do not bring the app to the foreground (macOS only)
    --extension         File extension for when stdin file type cannot be detected
    --dry-run, -n       Print what would be opened without opening it
    --search, -s        Treat the input as a search query
    --clipboard, -c     Open the URL/path currently on the clipboard
    --reveal, -r        Reveal the file/folder in your file manager
    --recent            Pick from recently opened items
    --save <name>       Save the given target as a bookmark (does not open)
    --remove-bookmark   Remove a saved bookmark by name
    --bookmarks         List saved bookmarks

  Examples
    $ summon https://sindresorhus.com
    $ summon github.com
    $ summon report.pdf photo.png notes.txt
    $ summon https://github.com -- 'google chrome' --incognito
    $ summon @docs
    $ summon https://docs.example.com --save docs
    $ summon -s "rust async traits"
    $ echo '<h1>Hi</h1>' | summon --extension=html
    $ summon report.pdf --reveal
    $ summon --recent
```

## Options

| Flag | Short | Type | Default | Description |
| --- | --- | --- | --- | --- |
| `--wait` | `-w` | boolean | `false` | Wait for the opened app to exit before returning. Great for using `summon` as a `$EDITOR`. |
| `--background` | | boolean | `false` | Open without bringing the app to the foreground. **macOS only.** |
| `--extension` | | string | auto | Extension to use for piped stdin when the type can't be auto-detected. |
| `--dry-run` | `-n` | boolean | `false` | Print what would be opened without launching anything. |
| `--search` | `-s` | boolean | `false` | Treat the input as a web search query. |
| `--clipboard` | `-c` | boolean | `false` | Open the URL/path currently on the clipboard. |
| `--reveal` | `-r` | boolean | `false` | Reveal/highlight the file or folder in the file manager. |
| `--recent` | | boolean | `false` | Interactively pick from recently opened items. |
| `--save <name>` | | string | | Save the given target as a bookmark. Does not open it. |
| `--remove-bookmark <name>` | | string | | Remove a saved bookmark. |
| `--bookmarks` | | boolean | `false` | List saved bookmarks. |
| `-- <app> [args]` | | — | — | Everything after `--` selects a specific app and forwards arguments to it. |

## Features in depth

### Multiple targets

Pass as many files/URLs/bookmarks as you like — they're opened in order:

```sh
summon index.html styles.css https://caniuse.com
```

### Smart URL normalization

If an argument looks like a bare domain (and isn't an existing file), `summon` adds `https://` for you:

```sh
summon github.com          # → https://github.com
summon localhost:3000      # → https://localhost:3000
```

Existing files always win. `summon report.pdf` opens the file if it exists; names ending in a known file extension are treated as files, not domains.

### Bookmarks

Save frequently used targets and open them by alias:

```sh
summon https://github.com/Aditya060806/summon --save repo
summon @repo          # explicit alias form
summon repo           # bare form also works
summon --bookmarks    # list them
summon --remove-bookmark repo
```

Bookmarks live in your [config file](#configuration) and can also be edited by hand.

### Web search

```sh
summon -s "how to exit vim"
```

The engine is configurable — see [Configuration](#configuration). The default is Google.

### Clipboard

Copy a URL or path anywhere, then:

```sh
summon --clipboard
```

Multiple whitespace-separated entries on the clipboard are each opened.

> On Linux this uses `xsel`/`xclip`/`wl-clipboard` under the hood (install one if clipboard access fails on a headless machine).

### Reveal in file manager

Instead of opening a file, highlight it where it lives:

```sh
summon report.pdf --reveal
```

- **macOS** — `open -R` (selects the file in Finder)
- **Windows** — `explorer /select,` (selects the file in Explorer)
- **Linux/other** — opens the containing folder

### Recent & interactive picker

`summon` remembers what you open. Re-open something recent:

```sh
summon --recent
```

Run `summon` with no arguments in a terminal and it shows an interactive menu of your bookmarks and recent items.

### Dry run

Preview actions without side effects — perfect for scripts and for building trust:

```sh
$ summon github.com report.pdf --dry-run
[dry-run] open: https://github.com
[dry-run] open: report.pdf
```

### Choosing the app

Everything after `--` becomes the app and its arguments:

```sh
summon https://example.com -- firefox
summon https://example.com -- 'google chrome' --incognito
```

### Stdin

Pipe data in and `summon` detects the format from the raw bytes, writes a temp file, and opens it:

```sh
cat unicorn.png | summon
echo '{"hi":true}' | summon --extension=json
```

## Recipes

Real-world ways people wire `summon` into their day.

**Use it as your Git editor** (waits until you close the file):

```sh
git config --global core.editor "summon --wait"
```

**Open the current directory in your file manager:**

```sh
summon .
```

**Open a build artifact as soon as it's ready:**

```sh
npm run build && summon dist/index.html
```

**Preview a generated report from a script, or pipe it straight in:**

```sh
node make-report.js > out.html && summon out.html
node make-report.js | summon --extension=html
```

**Open every changed file from your last commit:**

```sh
git diff --name-only HEAD~1 | xargs summon
```

**Quick project bookmarks:**

```sh
summon https://github.com/Aditya060806/summon --save repo
summon https://github.com/Aditya060806/summon/issues --save issues
summon @issues
```

**Search from the terminal without leaving your flow:**

```sh
summon -s "mdn array flatMap"
```

**Open a link you just copied from a chat/email:**

```sh
summon --clipboard
```

**Dry-run in CI to assert what a script would open** (no GUI needed):

```sh
summon "$ARTIFACT_URL" --dry-run    # prints the target, exits 0
```

## Configuration

`summon` stores its config and history in a per-user directory:

| Platform | Location |
| --- | --- |
| Linux/macOS | `$XDG_CONFIG_HOME/summon` or `~/.config/summon` |
| Windows | `%APPDATA%\summon` |

You can override it with the `SUMMON_CONFIG_DIR` environment variable (also handy for testing).

**`config.json`**

```json
{
	"bookmarks": {
		"docs": "https://docs.example.com",
		"repo": "https://github.com/Aditya060806/summon"
	},
	"searchEngine": "https://www.google.com/search?q=%s"
}
```

- `bookmarks` — map of alias → target. Managed via `--save` / `--remove-bookmark`, or edited by hand.
- `searchEngine` — a URL template where `%s` is replaced by the URL-encoded query. Examples:
  - DuckDuckGo: `https://duckduckgo.com/?q=%s`
  - Brave: `https://search.brave.com/search?q=%s`

**`history.json`** stores your most recently opened targets (capped, de-duplicated) and powers `--recent`.

## Shell completions

Completion scripts live in the [`completions/`](completions) folder.

**Bash** — add to `~/.bashrc`:

```sh
source /path/to/summon/completions/summon.bash
```

**Zsh** — put `summon.zsh` on your `$fpath` as `_summon`, or source it from `~/.zshrc`:

```sh
source /path/to/summon/completions/summon.zsh
```

**Fish** — copy to your completions dir:

```sh
cp /path/to/summon/completions/summon.fish ~/.config/fish/completions/
```

**PowerShell** — add to your `$PROFILE`:

```powershell
. /path/to/summon/completions/summon.ps1
```

Completions include all flags and dynamically complete your saved bookmark names.

## How it works

`summon` is a small, dependable layer on top of the battle-tested [`open`](https://github.com/sindresorhus/open) library.

```
                    ┌──────────────────────────┐
                    │      summon <inputs>      │
                    └────────────┬─────────────┘
                                 │
              management flag?   │  (--bookmarks / --save / --remove-bookmark)
             ┌───────────────────┴───────────────────┐
            YES                                       NO
             │                                        │
   read/write config.json                   what are we opening?
   then exit                        ┌───────────────┼───────────────┐
                                clipboard        search           inputs / stdin
                                    │               │                 │
                              read clipboard   build search URL   expand bookmarks
                                    └───────────────┴───────────────┘
                                                    │
                              for each target: expand @bookmark → classify
                                                    │
                        ┌───────────────────────────┼───────────────────────────┐
                   exists on disk?               is a URL?                looks like domain?
                        │ file                      │ url                     │ add https://
                        └───────────────────────────┼───────────────────────────┘
                                                    │
                                    --dry-run? print · --reveal? highlight
                                                    │
                                          open(target, {wait, background, app})
                                                    │
                              OS default handler (macOS open · Windows start · Linux xdg-open)
```

For piped input, `summon` buffers stdin, sniffs the file type from the leading bytes with [`file-type`](https://github.com/sindresorhus/file-type), writes one temp file via [`tempy`](https://github.com/sindresorhus/tempy), and opens that.

## Comparison

### Feature matrix

How `summon` stacks up against common alternatives:

| Capability | **summon** | `xdg-open` | `open` (macOS) | `start` (Windows) | shell `case` script |
| --- | :---: | :---: | :---: | :---: | :---: |
| Works on macOS / Windows / Linux | ✅ | ❌ | macOS only | Win only | ⚠️ manual |
| One identical command everywhere | ✅ | ❌ | ❌ | ❌ | ❌ |
| Open a URL / file / folder | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Multiple targets in one call | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ |
| Auto `https://` for bare domains | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bookmarks / aliases | ✅ | ❌ | ❌ | ❌ | ❌ |
| Web search shortcut | ✅ | ❌ | ❌ | ❌ | ❌ |
| Open from clipboard | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reveal in file manager | ✅ | ❌ | ⚠️ `-R` | ⚠️ | ❌ |
| Recent / interactive picker | ✅ | ❌ | ❌ | ❌ | ❌ |
| Dry-run preview | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read from stdin (pipe) + type detect | ✅ | ❌ | ❌ | ❌ | ❌ |
| Choose a specific app + pass args | ✅ | ❌ | ⚠️ `-a` | ⚠️ | ⚠️ |
| Wait for app to exit | ✅ | ❌ | ⚠️ `-W` | ❌ | ❌ |
| Friendly errors + typed exit codes | ✅ | ❌ | ❌ | ❌ | ⚠️ |

✅ built-in · ⚠️ partial / manual / platform-specific · ❌ not available

### Same task, side by side

The value shows up most when you compare the actual commands for the same job.

| Task | summon | Native / DIY |
| --- | --- | --- |
| Open a URL, any OS | `summon https://x.com` | `open …` / `start …` / `xdg-open …` (pick per OS) |
| Open a bare domain | `summon x.com` | `open https://x.com` (must add scheme yourself) |
| Open 3 files at once | `summon a b c` | `open a; open b; open c` (or a loop) |
| URL in Chrome incognito | `summon x.com -- 'google chrome' --incognito` | `open -a "Google Chrome" --args --incognito x.com` (macOS-only syntax) |
| Reveal a file | `summon f -r` | `open -R f` / `explorer /select,f` / — |
| Search the web | `summon -s "query"` | build the search URL by hand, then open it |
| Open clipboard URL (macOS) | `summon -c` | `open "$(pbpaste)"` |
| Open clipboard URL (Linux) | `summon -c` | `xdg-open "$(xclip -o -selection clipboard)"` |
| Preview without launching | `summon x.com --dry-run` | no native equivalent |
| Pipe + auto-detect type | `cat f \| summon` | no native equivalent |

## Efficiency

`summon` is designed to add as little overhead as possible on top of the native OS handler.

- **Direct opens do no disk I/O of their own.** For `summon <file|url>` there's no buffering and no temp file — it parses arguments and delegates straight to the OS.
- **Stdin is streamed, then written once.** Piped data is consumed as a stream and written to exactly one temp file; no intermediate copies.
- **Detection reads only the header.** File-type detection inspects the leading bytes, so it stays fast even for large inputs.
- **Config reads are lazy and tiny.** Bookmarks/history are small JSON files read only when needed; a corrupt file falls back to defaults instead of crashing.

| Path | Extra memory | Extra disk writes |
| --- | --- | --- |
| `summon <url>` / `<file>` | negligible | none |
| `summon @bookmark` / `-s query` | negligible | 1 small history write |
| `… \| summon` | ~size of piped data | 1 temp file (+ history write) |

> These describe the tool's architecture and relative overhead, not benchmarked timings — actual launch latency is dominated by the target app and the OS.

### Benchmark it yourself

Want real numbers on your machine? Use `--dry-run` to measure `summon`'s own overhead without launching (and juggling) GUI apps, ideally with [hyperfine](https://github.com/sharkdp/hyperfine):

```sh
# summon's own overhead (parse + resolve + classify, no app launch)
hyperfine --warmup 3 'summon https://example.com --dry-run'

# compare against a bare Node startup baseline
hyperfine --warmup 3 'node -e ""'
```

The gap between those two is essentially all of `summon`. Most of the wall-clock time you feel when actually opening something is the target application starting up, which no launcher can avoid.

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success (or nothing selected in a picker) |
| `1` | Generic/unexpected error |
| `2` | File or path not found |
| `3` | Unknown bookmark |
| `4` | Bad usage (empty clipboard, missing query/target, nothing to open) |

## Platform support

| Platform | Underlying mechanism | Notes |
| --- | --- | --- |
| macOS | `open` | `--wait`, `--background`, and `--reveal` fully supported |
| Windows | `start` / `explorer` | `--background` is a no-op (macOS-only) |
| Linux | `xdg-open` + desktop tools | `--reveal` opens the containing folder |
| Android (Termux) | `termux-open` | via the `open` library |

Node.js **20+** is required.

## Supported stdin file types

When you pipe data in, `summon` sniffs the format from the raw bytes and picks a matching extension automatically — covering **100+ formats**:

- **Images** — PNG, JPEG, GIF, WebP, AVIF, HEIC, TIFF, BMP, ICO
- **Video** — MP4, MKV, WebM, MOV, AVI
- **Audio** — MP3, FLAC, WAV, OGG, AAC, M4A
- **Documents** — PDF
- **Archives** — ZIP, GZIP, TAR, 7z, RAR, XZ, ZSTD
- …and many more.

See the full list in the [`file-type` supported formats](https://github.com/sindresorhus/file-type#supported-file-types). If a format can't be detected (e.g. plain text), pass `--extension`.

## FAQ & troubleshooting

**`summon` opens nothing / errors on Linux.**
Ensure a desktop environment and `xdg-utils` are installed (`sudo apt install xdg-utils`).

**Clipboard mode fails on a headless Linux box.**
Install a clipboard backend such as `xclip`, `xsel`, or `wl-clipboard`.

**Piped text opens as `.txt` even though it's something else.**
Plain text has no magic bytes to detect. Use `--extension` to force the type.

**How do I use `summon` as my Git editor?**

```sh
git config --global core.editor "summon --wait"
```

**A non-existent `report.pdf` didn't open a website — good?**
Yes. Names ending in a known file extension are treated as files, so typos give a clear "not found" (exit code 2) instead of launching a browser.

## Related

- [open](https://github.com/sindresorhus/open) — the programmatic API that powers this CLI.

## Author

Built by **Aditya Pandey**.

## License

[MIT](license) © Aditya Pandey
