#!/usr/bin/env bash

set -euo pipefail

scriptdir=$(dirname "${BASH_SOURCE[0]}")
bucket="docs.expo.io"

aws s3 sync "${scriptdir}/out" "s3://${bucket}" --delete

aws s3 cp \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "public,max-age=31536000,immutable" \
  "s3://${bucket}/_next/static/" \
  "s3://${bucket}/_next/static/"

declare -A redirects # associative array variable

# usage:
# redicts[requests/for/this/path]=are/redirected/to/this/one

# Temporarily create a redirect for a page that Home links to
redirects[versions/latest/introduction/installation.html]=versions/latest/introduction/installation/
# useful link on twitter
redirects[versions/latest/guides/app-stores.html]=versions/latest/distribution/app-stores/
# Xdl caches
redirects[versions/latest/guides/offline-support.html]=versions/latest/guides/offline-support/
# xdl convert comment
redirects[versions/latest/sdk/]=versions/latest/sdk/overview/
# upgrading expo -> upgrading sdk walkthrough
redirects[versions/latest/workflow/upgrading-expo]=versions/latest/workflow/upgrading-expo-sdk-walkthrough/

for i in "${!redirects[@]}" # iterate over keys
do
  aws s3 cp \
    --metadata-directive REPLACE \
    --website-redirect "/${redirects[$i]}" \
    "${scriptdir}/out/404.html" \
    "s3://${bucket}/${i}"
done
