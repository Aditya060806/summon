require "language/node"

# Homebrew formula for summon-open.
#
# Install directly from this file:
#   brew install --formula https://raw.githubusercontent.com/Aditya060806/summon/main/dist/homebrew/summon-open.rb
#
# Or host it in a tap (e.g. Aditya060806/homebrew-tap) and:
#   brew install Aditya060806/tap/summon-open
class SummonOpen < Formula
  desc "Open URLs, files, folders, and apps from one cross-platform command"
  homepage "https://github.com/Aditya060806/summon"
  url "https://registry.npmjs.org/summon-open/-/summon-open-1.1.0.tgz"
  sha256 "68442a11b3069ba31acac882dbab67799b1459b991d354f3064fb4253c270386"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_match version.to_s, shell_output("#{bin}/summon --version")
  end
end
