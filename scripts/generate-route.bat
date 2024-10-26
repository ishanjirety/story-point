@echo off
REM Check if an argument is provided
IF "%~1"=="" (
    echo Please provide a base name for the folder and files.
    exit /b 1
)

REM Set the base name from the argument
SET BASENAME=%~1

REM Create the folder
cd ..
cd src/modules

mkdir "%BASENAME%"

cd "%BASENAME%"

REM Create the four files in the folder
type nul > "%BASENAME%.controller.ts"
type nul > "%BASENAME%.route.ts"
type nul > "%BASENAME%.schema.ts"
type nul > "%BASENAME%.services.ts"

echo Folder and files created successfully.
echo To make this route work, Make sure you add the route in 'src\utils\register-routes.ts'