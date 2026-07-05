<div align="center">

# summon

**Open stuff like URLs, files, and executables — from anywhere, on any OS.**

One command to launch a URL in your browser, a file in its default app, or pipe raw bytes straight into the right program. No platform-specific flags, no remembering `xdg-open` vs `start` vs `open`.

[![npm version](https://img.shields.io/npm/v/summon.svg)](https://www.npmjs.com/package/summon)
[![node](https://img.shields.io/node/v/summon.svg)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/summon.svg)](license)
[![CI](https://github.com/Aditya060806/summon/actions/workflows/main.yml/badge.svg)](https://github.com/Aditya060806/summon/actions)

</div>

---

## Table of Contents

- [Why summon](#why-summon)
- [Features](#features)
- [Install](#install)
- [Quick start](#quick-start)
- [Usage](#usage)
- [Options](#options)
- [How it works](#how-it-works)
- [Comparison](#comparison)
- [Efficiency](#efficiency)
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

Writing a script that works everywhere means branching on the platform, escaping arguments differently, and handling edge cases like piped input. `summon` collapses all of that into a single, predictable command that behaves the same on macOS, Windows, and Linux.

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
- **Pick the app** — force a specific app and pass it arguments (e.g. open a URL in Firefox incognito).
- **Pipe-friendly** — stream data over stdin and `summon` figures out the file type and opens it.
- **Automatic file-type detection** — detects 100+ formats from the raw bytes, no extension required.
- **Wait mode** — block until the opened app exits, perfect for scripts and Git editors.
- **Background mode** — open without stealing focus (macOS).
- **Tiny surface area** — three flags, zero config.

## Install

Requires **Node.js 22 or newer**.

```sh
npm install --global summon
```

Or run it once without installing:

```sh
npx summon https://github.com
```

## Quick start

```sh
# Open a URL in your default browser
summon https://github.com

# Open a file in its default app
summon report.pdf

# Open the current folder in your file manager
summon .

# Open a URL in a specific browser with flags
summon https://github.com -- 'google chrome' --incognito

# Pipe data in and let summon detect the type
cat photo.png | summon

# Render inline HTML in the browser
echo '<h1>Hello!</h1>' | summon --extension=html
```

## Usage

```
$ summon --help

  Usage
    $ summon <file|url> [--wait] [--background] [-- <app> [args]]
    $ cat <file> | summon [--extension] [--wait] [--background] [-- <app> [args]]

  Options
    --wait         Wait for the app to exit
    --background   Do not bring the app to the foreground (macOS only)
    --extension    File extension for when stdin file type cannot be detected

  Examples
    $ summon https://sindresorhus.com
    $ summon https://sindresorhus.com -- firefox
    $ summon https://sindresorhus.com -- 'google chrome' --incognito
    $ summon unicorn.png
    $ cat unicorn.png | summon
    $ echo '<h1>Unicorns!</h1>' | summon --extension=html
```

## Options

| Flag | Type | Default | Description |
| --- | --- | --- | --- |
| `--wait` | boolean | `false` | Wait for the opened app to exit before returning. Useful when `summon` is used as an editor (e.g. `GIT_EDITOR`). |
| `--background` | boolean | `false` | Open the app without bringing it to the foreground. **macOS only.** |
| `--extension` | string | auto | File extension to use for piped stdin when the type can't be auto-detected. |
| `-- <app> [args]` | — | — | Everything after `--` selects a specific app and passes arguments to it. |

## How it works

`summon` is a thin, dependable layer on top of the battle-tested [`open`](https://github.com/sindresorhus/open) library. It has two modes depending on whether you give it an argument or pipe data in.

```
                    ┌──────────────────────────┐
                    │        summon <arg>       │
                    └────────────┬─────────────┘
                                 │
                 argument given? │
             ┌───────────────────┴────────────────────┐
            YES                                        NO (stdin)
             │                                          │
             ▼                                          ▼
   ┌──────────────────┐                    ┌──────────────────────────┐
   │ open(arg, opts)  │                    │ buffer stdin into memory │
   └────────┬─────────┘                    └────────────┬─────────────┘
            │                                            │
            │                              detect file type from bytes
            │                                            │
            │                              pick extension:
            │                              --extension → detected → "txt"
            │                                            │
            │                              write temp file (tempy)
            │                                            │
            │                                            ▼
            │                                 ┌────────────────────┐
            │                                 │ open(tempFile,opts)│
            │                                 └─────────┬──────────┘
            └───────────────┬───────────────────────────┘
                            ▼
              OS default handler launches the target
        (macOS: open · Windows: start · Linux: xdg-open)
```

**Direct mode** (`summon <file|url>`)
1. Parses flags and the positional target with [`meow`](https://github.com/sindresorhus/meow).
2. If you append `-- <app> [args]`, that app becomes the launcher and the extra args are forwarded to it.
3. Hands the target and options to `open`, which invokes the correct OS mechanism.

**Stdin mode** (`… | summon`)
1. Buffers the incoming stream into memory.
2. Inspects the leading bytes with [`file-type`](https://github.com/sindresorhus/file-type) to detect the format (magic-number sniffing — no reliance on a filename).
3. Chooses an extension in this priority order: your `--extension` value → the detected type → `txt` as a fallback.
4. Writes the buffer to a temporary file via [`tempy`](https://github.com/sindresorhus/tempy).
5. Opens that temp file with the default handler.

If no argument is given **and** stdin is an interactive terminal (nothing piped), `summon` exits with an error asking for a file or URL.

## Comparison

How `summon` stacks up against common alternatives:

| Capability | **summon** | `xdg-open` | `open` (macOS) | `start` (Windows) | shell `case` script |
| --- | :---: | :---: | :---: | :---: | :---: |
| Works on macOS | ✅ | ❌ | ✅ | ❌ | ⚠️ manual |
| Works on Windows | ✅ | ❌ | ❌ | ✅ | ⚠️ manual |
| Works on Linux | ✅ | ✅ | ❌ | ❌ | ⚠️ manual |
| Single identical command everywhere | ✅ | ❌ | ❌ | ❌ | ❌ |
| Open a URL | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Open a file / folder | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Choose a specific app + pass args | ✅ | ❌ | ⚠️ `-a` | ⚠️ awkward | ⚠️ |
| Read from stdin (pipe) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Auto-detect piped file type | ✅ | ❌ | ❌ | ❌ | ❌ |
| Wait for app to exit | ✅ `--wait` | ❌ | ⚠️ `-W` | ❌ | ❌ |
| Open without focus (background) | ✅ `--background` | ❌ | ⚠️ `-g` | ❌ | ❌ |
| Consistent argument escaping | ✅ | ❌ | ❌ | ❌ | ❌ |

✅ built-in · ⚠️ partial / manual / platform-specific · ❌ not available

## Efficiency

`summon` is designed to add as little overhead as possible on top of the native OS handler.

- **Direct mode does no disk I/O of its own.** For `summon <file|url>` there is no buffering, no temp file, and no copying — it parses arguments and immediately delegates to the OS. The perceived launch time is essentially the native `open`/`start`/`xdg-open` time plus Node startup.
- **Stdin mode is streamed then written once.** Piped data is consumed as a stream and written to exactly one temp file; there are no intermediate copies.
- **Detection reads only the header.** File-type detection inspects the leading bytes rather than scanning the whole payload, so it stays fast even for large inputs.
- **Small dependency footprint.** Four focused runtime dependencies (`meow`, `open`, `tempy`, `file-type`), all single-purpose and widely used.

**Relative cost per mode:**

| Path | Extra memory | Extra disk writes | Notes |
| --- | --- | --- | --- |
| `summon <url>` | negligible | none | pure delegation to the OS |
| `summon <file>` | negligible | none | pure delegation to the OS |
| `… \| summon` | ~size of piped data (buffered) | 1 temp file | needed so a real file exists to hand to the OS |

> Note: the figures above describe the tool's *architecture and relative overhead*, not benchmarked millisecond timings — actual launch latency is dominated by the target application and the OS, which `summon` cannot control.

## Platform support

| Platform | Underlying mechanism | Notes |
| --- | --- | --- |
| macOS | `open` | `--wait` and `--background` fully supported |
| Windows | `start` | `--background` is a no-op (macOS-only feature) |
| Linux | `xdg-open` (and desktop equivalents) | requires a desktop environment / `xdg-utils` |
| Android (Termux) | `termux-open` | via the `open` library's Termux support |

Node.js **22+** is required.

## Supported stdin file types

When you pipe data in, `summon` sniffs the format from the raw bytes and picks a matching extension automatically. This covers **100+ formats**, including:

- **Images** — PNG, JPEG, GIF, WebP, AVIF, HEIC, TIFF, BMP, SVG, ICO
- **Video** — MP4, MKV, WebM, MOV, AVI
- **Audio** — MP3, FLAC, WAV, OGG, AAC, M4A
- **Documents** — PDF
- **Archives** — ZIP, GZIP, TAR, 7z, RAR, XZ, ZSTD
- …and many more.

See the full list in the [`file-type` supported formats](https://github.com/sindresorhus/file-type#supported-file-types).

If a format can't be detected (e.g. plain text or a niche format), pass `--extension` so the temp file gets the right suffix:

```sh
echo '{"hello":"world"}' | summon --extension=json
```

## FAQ & troubleshooting

**`summon` opens nothing / errors on Linux.**
Make sure a desktop environment is present and `xdg-utils` is installed (`sudo apt install xdg-utils` on Debian/Ubuntu).

**Piped text opens as a `.txt` file even though it's something else.**
Plain text has no magic bytes to detect. Use `--extension` to force the correct type.

**`--background` does nothing on Windows/Linux.**
It's a macOS-only capability of the underlying opener.

**How do I use `summon` as my Git editor?**
Use wait mode so Git blocks until you close the file:

```sh
git config --global core.editor "summon --wait"
```

**Can I open a URL in a specific browser with flags?**
Yes — everything after `--` is the app and its arguments:

```sh
summon https://example.com -- 'google chrome' --incognito
```

## Related

- [open](https://github.com/sindresorhus/open) — the programmatic API that powers this CLI.

## Author

Built by **Aditya Pandey**.

## License

[MIT](license) © Aditya Pandey
