# summon bash completion
# Install: source this file from your ~/.bashrc, e.g.
#   source /path/to/summon/completions/summon.bash

_summon_completions() {
	local cur prev flags
	cur="${COMP_WORDS[COMP_CWORD]}"
	prev="${COMP_WORDS[COMP_CWORD-1]}"

	flags="--wait --background --extension --dry-run --search --clipboard --reveal --recent --save --remove-bookmark --bookmarks --help --version"

	# Complete bookmark names after `@`.
	if [[ "$cur" == @* ]]; then
		local names
		names=$(summon --bookmarks 2>/dev/null | awk '{print "@"$1}')
		COMPREPLY=($(compgen -W "$names" -- "$cur"))
		return 0
	fi

	# Complete bookmark names for --remove-bookmark.
	if [[ "$prev" == "--remove-bookmark" ]]; then
		local names
		names=$(summon --bookmarks 2>/dev/null | awk '{print $1}')
		COMPREPLY=($(compgen -W "$names" -- "$cur"))
		return 0
	fi

	if [[ "$cur" == -* ]]; then
		COMPREPLY=($(compgen -W "$flags" -- "$cur"))
		return 0
	fi

	# Default to file completion.
	COMPREPLY=($(compgen -f -- "$cur"))
}

complete -F _summon_completions summon
