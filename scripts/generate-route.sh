#!/bin/bash

# Check if an argument is provided
if [ -z "$1" ]; then
  echo "Please provide a base name for the folder and files."
  exit 1
fi

# Set the base name from the argument
BASENAME=$1

# cd ..
cd src/modules

# Create the folder
mkdir -p "$BASENAME"

cd "$BASENAME"

# Create the four files in the folder
touch "${BASENAME}.controller.ts"
touch "${BASENAME}.route.ts"
touch "${BASENAME}.schema.ts"
touch "${BASENAME}.services.ts"

echo Folder and files created successfully.
echo To make this route work, Make sure you add the route in 'src\helpers\register-routes.ts'
