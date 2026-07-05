# summon PowerShell completion
# Install: add this line to your PowerShell profile ($PROFILE):
#   . /path/to/summon/completions/summon.ps1

Register-ArgumentCompleter -Native -CommandName summon -ScriptBlock {
	param($wordToComplete, $commandAst, $cursorPosition)

	$flags = @(
		'--wait', '--background', '--extension', '--dry-run', '--search',
		'--clipboard', '--reveal', '--recent', '--save', '--remove-bookmark',
		'--bookmarks', '--help', '--version'
	)

	if ($wordToComplete -like '--*') {
		$flags | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
			[System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_)
		}
		return
	}

	# Bookmark completion after `@`.
	if ($wordToComplete -like '@*') {
		$prefix = $wordToComplete.TrimStart('@')
		(summon --bookmarks 2>$null) | ForEach-Object {
			($_ -split '\s+', 2)[0].Trim()
		} | Where-Object { $_ -like "$prefix*" } | ForEach-Object {
			[System.Management.Automation.CompletionResult]::new("@$_", "@$_", 'ParameterValue', "@$_")
		}
	}
}
