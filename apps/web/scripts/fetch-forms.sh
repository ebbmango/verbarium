#!/usr/bin/env bash
# Copies the historical-form pictures that are not kept in this public repo
# (the 小學堂 traces, public/forms/sinica-*.svg) from the private repo
# hanzi-old-forms, cloned beside verbarium (or wherever FORMS_REPO_DIR points).
set -euo pipefail

here="$(cd "$(dirname "$0")/.." && pwd)"
source_dir="${FORMS_REPO_DIR:-$here/../../../hanzi-old-forms}"

if [ ! -d "$source_dir" ]; then
  echo "No hanzi-old-forms at $source_dir. Clone it beside verbarium: gh repo clone ebbmango/hanzi-old-forms" >&2
  exit 1
fi

mkdir -p "$here/public/forms"
rm -f "$here/public/forms"/sinica-*.svg
cp "$source_dir"/sinica-*.svg "$here/public/forms/"
echo "Copied $(ls "$source_dir"/sinica-*.svg | wc -l | tr -d ' ') pictures from $source_dir into public/forms."
