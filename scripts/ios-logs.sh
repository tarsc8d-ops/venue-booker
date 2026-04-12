#!/usr/bin/env bash
# Stream Simulator / system logs useful for VenBook + Google Sign-In debugging.
# Run this in a terminal, then use the app in Simulator (tap Continue with Google).
# Stop with Ctrl+C.
#
# Note: zsh defines a builtin `log` — we must call /usr/bin/log.
set -euo pipefail

LOG_BIN=/usr/bin/log
if [[ ! -x "$LOG_BIN" ]]; then
  echo "Missing $LOG_BIN"
  exit 1
fi

BOOTED=$(xcrun simctl list devices | grep Booted | head -1 || true)
if [[ -z "${BOOTED}" ]]; then
  echo "No booted iOS Simulator. Open Simulator or run the app from Xcode first."
  exit 1
fi
echo "Booted device: $BOOTED"
echo "Streaming logs (VenBook, Capacitor, Google, WebKit errors). Ctrl+C to stop."
echo ""

# composedMessage is what unified logging uses for the visible text in many OS versions
exec "$LOG_BIN" stream \
  --style compact \
  --level debug \
  --predicate '(composedMessage CONTAINS[c] "VenBook") OR (composedMessage CONTAINS[c] "Capacitor") OR (composedMessage CONTAINS[c] "GoogleAuth") OR (composedMessage CONTAINS[c] "GIDSignIn") OR (composedMessage CONTAINS[c] "GoogleSignIn") OR (composedMessage CONTAINS[c] "oauth") OR (subsystem CONTAINS "com.venbook")'
