#!/usr/bin/env bash
# Build the iOS app for Simulator (CI / agent friendly). Exits non-zero on failure.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/ios/App"
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
exec xcodebuild \
  -workspace App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  build
