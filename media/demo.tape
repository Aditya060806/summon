# VHS tape for the summon demo GIF.
# Install VHS: https://github.com/charmbracelet/vhs
# Then run from the repo root:  vhs media/demo.tape
# Output: media/demo.gif

Output media/demo.gif

Set Shell "bash"
Set FontSize 20
Set Width 1000
Set Height 600
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 60ms

# Use dry-run so the recording never launches real apps.
Type "# One command, everything opens — here's a dry-run preview"
Enter
Sleep 800ms

Type "summon github.com report.pdf https://news.ycombinator.com --dry-run"
Enter
Sleep 1500ms

Type "# Bare domains get https:// automatically. Now a web search:"
Enter
Sleep 600ms
Type "summon -s 'how to center a div' --dry-run"
Enter
Sleep 1500ms

Type "# Save and reuse bookmarks"
Enter
Sleep 400ms
Type "summon https://docs.example.com --save docs"
Enter
Sleep 900ms
Type "summon @docs --dry-run"
Enter
Sleep 1500ms

Type "# Pipe anything in — summon detects the type"
Enter
Sleep 400ms
Type "cat photo.png | summon --dry-run"
Enter
Sleep 2000ms
