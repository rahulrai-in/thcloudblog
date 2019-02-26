@echo off
cd /d %~dp0/blog
hugo server --buildDrafts
cmd.exe