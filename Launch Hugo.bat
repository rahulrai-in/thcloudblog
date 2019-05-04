@echo off
cd /d %~dp0/blog
hugo.exe server --buildDrafts --disableFastRender --verbose
cmd.exe