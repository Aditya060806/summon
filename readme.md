# summon

> Open stuff like URLs, files, executables. Cross-platform.

## Install

```sh
npm install --global summon
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

The [following file types](https://github.com/sindresorhus/file-type#supported-file-types) are automagically detected when using stdin mode.

## Author

Built by Aditya Pandey.

## Related

- [open](https://github.com/sindresorhus/open) - API for this package
