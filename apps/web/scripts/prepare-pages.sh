#!/usr/bin/env bash
# Turns the client build into what GitHub Pages serves.
#
#   scripts/prepare-pages.sh <build/client> <base path>
#
# With a base path (/verbarium/), the pre-render writes every page under
# build/client/verbarium/ and the SPA fallback at build/client/index.html. Pages
# serves the artifact root at the base path, so the whole pre-rendered tree is
# lifted to the root (every route gets its own index.html, not just the home
# page) and the fallback becomes 404.html for addresses that were not pre-rendered.
set -euo pipefail

artifact_directory="$1"
base_path="${2:-}"

if [[ -n "${base_path}" && "${base_path}" != "/" ]]; then
  cp "${artifact_directory}/index.html" "${artifact_directory}/404.html"
  cp -R "${artifact_directory}${base_path}/." "${artifact_directory}/"
  rm -r "${artifact_directory:?}${base_path}"
else
  cp "${artifact_directory}/__spa-fallback.html" "${artifact_directory}/404.html"
fi
