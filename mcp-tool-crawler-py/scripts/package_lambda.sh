#!/bin/bash
set -e

# Detect if we're running in Poetry environment
IS_POETRY=0
if [ -n "$POETRY_ACTIVE" ]; then
    IS_POETRY=1
    echo "Poetry environment detected."
fi

# Set up environment
if [ $IS_POETRY -eq 0 ]; then
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate

    # Install dependencies
    if [ -f "pyproject.toml" ]; then
        echo "Using Poetry for dependency installation..."
        # If poetry is installed but not active, use it to install deps
        if command -v poetry &> /dev/null; then
            poetry install
        else
            pip install -r requirements.txt
        fi
    else
        pip install -r requirements.txt
    fi
fi

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
    if [ -f "pyproject.toml" ] && command -v poetry &> /dev/null; then
        echo "Using Poetry to export dependencies..."
        poetry export -f requirements.txt --without-hashes -o lambda_packages/poetry_requirements.txt
        pip install -r lambda_packages/poetry_requirements.txt -t "$PACKAGE_DIR/" --no-deps
    else
        pip install -r requirements.txt -t "$PACKAGE_DIR/" --no-deps
    fi
    
    # Create the zip file
    cd "$PACKAGE_DIR"
    zip -r "../${func}.zip" .
    cd ../../
    
    echo "Created lambda_packages/${func}.zip"
done

echo "All Lambda functions packaged successfully!"

# Deactivate virtual environment only if we're not in Poetry
if [ $IS_POETRY -eq 0 ]; then
    deactivate
fi