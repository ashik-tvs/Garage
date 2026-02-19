@echo off
echo Clearing all caches...

REM Clear webpack cache
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo Webpack cache cleared
)

REM Clear ESLint cache
if exist ".eslintcache" (
    del /f /q ".eslintcache"
    echo ESLint cache cleared
)

REM Clear build folder
if exist "build" (
    rmdir /s /q "build"
    echo Build folder cleared
)

echo.
echo All caches cleared! Now restart your dev server with: npm start
pause
