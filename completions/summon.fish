# summon fish completion
# Install: copy to ~/.config/fish/completions/summon.fish

function __summon_bookmarks
	summon --bookmarks 2>/dev/null | string trim | string replace -r '\s.*' ''
end

complete -c summon -s w -l wait -d 'Wait for the app to exit'
complete -c summon -l background -d 'Do not bring the app to the foreground (macOS)'
complete -c summon -l extension -r -d 'File extension for stdin'
complete -c summon -s n -l dry-run -d 'Print what would be opened'
complete -c summon -s s -l search -d 'Treat input as a search query'
complete -c summon -s c -l clipboard -d 'Open URL/path from the clipboard'
complete -c summon -s r -l reveal -d 'Reveal file/folder in file manager'
complete -c summon -l recent -d 'Pick from recently opened items'
complete -c summon -l save -r -d 'Save target as a bookmark'
complete -c summon -l remove-bookmark -x -a '(__summon_bookmarks)' -d 'Remove a bookmark'
complete -c summon -l bookmarks -d 'List saved bookmarks'
complete -c summon -l help -d 'Show help'
complete -c summon -l version -d 'Show version'
