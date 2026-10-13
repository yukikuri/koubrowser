@echo off
rem change current directory to bat directory.
cd /d %~dp0

rem run http server
rem target public folder path is current directory
rem --yes is install package quetion answer yes
npx --yes serve ./ -p 8080
