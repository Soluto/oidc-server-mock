#!/usr/bin/env bash

set -e

SOURCE="https://github.com/DuendeSoftware/IdentityServer.Quickstart.UI/archive/main.zip"
curl -L -o ui.zip "$SOURCE"

unzip -d ui ui.zip

[[ -d Pages ]] || mkdir Pages
[[ -d wwwroot ]] || mkdir wwwroot

cp -r ./ui/IdentityServer.Quickstart.UI-main/Pages/* Pages
cp -r ./ui/IdentityServer.Quickstart.UI-main/wwwroot/* wwwroot

rm -rf ui ui.zip
