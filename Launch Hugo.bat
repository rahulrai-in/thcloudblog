@echo off
cd /d %~dp0/blog
hugo.exe server --buildDrafts
cmd.exe