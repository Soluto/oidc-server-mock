#!/usr/bin/env bash

set -e

TAG="6.3.0"

git clone -n --depth=1 --filter=tree:0 \
  -b is-7.2.2 --single-branch \
  https://github.com/DuendeSoftware/products
cd products
git sparse-checkout set --no-cone /identity-server/hosts/main
git checkout

cd -

[[ -d Pages ]] || mkdir Pages
[[ -d wwwroot ]] || mkdir wwwroot

cp -r ./products/identity-server/hosts/main/Pages/* Pages
cp -r ./products/identity-server/hosts/main/wwwroot/* wwwroot

rm -rf products
