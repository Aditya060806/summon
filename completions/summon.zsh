#compdef summon
# summon zsh completion
# Install: place this file in a directory on your $fpath (named `_summon`),
# or source it from your ~/.zshrc.

_summon() {
	local -a flags
	flags=(
		'--wait[Wait for the app to exit]'
		'-w[Wait for the app to exit]'
		'--background[Do not bring the app to the foreground (macOS)]'
		'--extension[File extension for stdin]:extension:'
		'--dry-run[Print what would be opened]'
		'-n[Print what would be opened]'
		'--search[Treat input as a search query]'
		'-s[Treat input as a search query]'
		'--clipboard[Open URL/path from the clipboard]'
		'-c[Open URL/path from the clipboard]'
		'--reveal[Reveal file/folder in file manager]'
		'-r[Reveal file/folder in file manager]'
		'--recent[Pick from recently opened items]'
		'--save[Save target as a bookmark]:name:'
		'--remove-bookmark[Remove a bookmark]:name:_summon_bookmarks'
		'--bookmarks[List saved bookmarks]'
		'--help[Show help]'
		'--version[Show version]'
	)

	_arguments -s $flags '*:target:_files'
}

_summon_bookmarks() {
	local -a names
	names=(${(f)"$(summon --bookmarks 2>/dev/null | awk '{print $1}')"})
	compadd -a names
}

_summon "$@"
