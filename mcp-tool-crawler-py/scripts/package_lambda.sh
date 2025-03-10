#!/bin/bash
set -e

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create packages directory if it doesn't exist
mkdir -p lambda_packages

# Define the Lambda functions to package
LAMBDA_FUNCTIONS=(
    "crawler_generator"
    "run_generated_crawler"
    "run_known_crawler"
    "source_manager"
    "catalog_processor"
)

# Package each Lambda function
for func in "${LAMBDA_FUNCTIONS[@]}"; do
    echo "Packaging $func Lambda function..."
    
    # Create temp directory for the package
    PACKAGE_DIR="lambda_packages/$func"
    rm -rf "$PACKAGE_DIR"
    mkdir -p "$PACKAGE_DIR"
    
    # Copy the source code
    cp -r src "$PACKAGE_DIR/"
    
    # Install dependencies into the package directory
    pip install -r requirements.txt -t "$PACKAGE_DIR/" --no-deps
    
    # Create the zip file
    cd "$PACKAGE_DIR"
    zip -r "../${func}.zip" .
    cd ../../
    
    echo "Created lambda_packages/${func}.zip"
done

echo "All Lambda functions packaged successfully!"

# Deactivate virtual environment
deactivate