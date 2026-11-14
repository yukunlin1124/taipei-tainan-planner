#!/bin/sh
# Opens the planner in the default browser (Linux counterpart of "Open planner.bat").
cd "$(dirname "$0")" || exit 1
exec xdg-open "site/index.html" >/dev/null 2>&1
