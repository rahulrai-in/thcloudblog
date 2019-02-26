@echo off
cd /d %~dp0/Web
hugo server --buildDrafts
cmd.exe