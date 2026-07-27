@echo off
echo Testing DevTools CLI commands...
echo.

echo [1] Testing: cli.bat --help
"D:\DevCache\微信web开发者工具\cli.bat" --help 2>&1
echo.

echo [2] Testing: cli.bat build
"D:\DevCache\微信web开发者工具\cli.bat" build 2>&1
echo.

echo [3] Testing: cli.bat auto
"D:\DevCache\微信web开发者工具\cli.bat" auto --help 2>&1
echo.

echo [4] Testing: cli.bat project
"D:\DevCache\微信web开发者工具\cli.bat" project 2>&1
echo.

echo [5] Testing: cli.bat npm
"D:\DevCache\微信web开发者工具\cli.bat" npm --help 2>&1
echo.

echo Done.
