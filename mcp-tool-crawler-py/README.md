# MCP Tool Crawler

A Python-based service for discovering, crawling, and cataloging Machine Context Protocol (MCP) tools from various sources. The crawler leverages AWS Step Functions and AI-powered code generation to automatically extract MCP tools from diverse sources.

## Project Overview

The MCP Tool Crawler aims to build a comprehensive catalog of Machine Context Protocol (MCP) tools by automatically discovering and extracting information from various sources including GitHub repositories, awesome lists, and websites.

Key features:
- Automated crawling of GitHub awesome lists and repositories
- AI-powered crawler generation for unknown websites
- Deduplication and standardization of tool information
- Persistent storage in S3 for accessibility
- Step Functions workflow for reliability and monitoring

## Architecture

The system uses a serverless architecture with the following components:

![MCP Tool Crawler Architecture](docs/images/architecture.png)

1. **AWS Step Functions**: Orchestrates the entire workflow
2. **Lambda Functions**: Executes each step of the workflow
3. **DynamoDB**: Stores sources, crawler strategies, and metadata
4. **S3**: Stores the consolidated tool catalog
5. **OpenAI**: Generates custom crawlers for unknown websites

### Detailed Component Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                       AWS Step Functions                        │
└───────────────────────────────┬────────────────────────────────┘
                                │
            ┌──────────────────┬┴┬──────────────────┐
            │                  │  │                  │
┌───────────▼──────────┐┌─────▼──▼─────┐┌───────────▼──────────┐
│  Source Management   ││   Crawler    ││  Catalog Processing   │
│      Lambda          ││   Lambda     ││       Lambda          │
└─────────┬───────────┘└──────┬───────┘└───────────┬───────────┘
          │                    │                    │
┌─────────▼───────────┐┌──────▼───────┐┌───────────▼───────────┐
│     DynamoDB        ││    OpenAI    ││         S3            │
│ (Sources & Crawlers)││    API       ││   (Tool Catalog)      │
└─────────────────────┘└──────────────┘└─────────────────────────┘
```

### Workflow Overview

The system follows a multi-step workflow managed by AWS Step Functions:

![MCP Tool Crawler Workflow](docs/images/workflow.png)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Initialize      │     │ Get Sources     │     │ Map Sources     │
│ Sources         ├────►│ To Crawl        ├────►│ To Process      │
└─────────────────┘     └─────────────────┘     └───────┬─────────┘
                                                        │
                                                        ▼
                                         ┌─────────────────────────┐
                                         │ Check Crawler Strategy  │
                                         └───────────┬─────────────┘
                                                     │
                      ┌────────────────────┬────────┴────────┬────────────────────┐
                      │                    │                 │                     │
               ┌──────▼─────┐   ┌─────────▼────────┐   ┌────▼──────┐        ┌─────▼────┐
               │ Known      │   │  Generate        │   │  Execute  │        │  Record  │
               │ Crawler    │   │  Crawler         │   │  Crawler  │───────►│  Result  │
               └──────┬─────┘   └─────────┬────────┘   └───────────┘        └──────────┘
                      │                   │
                      └───────────────────┘

┌─────────────────┐                               
│ Process         │                                    
│ Catalog         │◄────────────────────────── (After all sources processed)
└─────────────┬───┘                                    
              │                                         
              ▼                                        
┌─────────────────────┐                               
│ Notification        │                               
└─────────────────────┘
```

### AI Crawler Generation Process

For websites without a predefined crawler:

1. The system analyzes the website structure using OpenAI
2. A custom Python crawler is dynamically generated 
3. The generated code is executed in a secure sandbox
4. Results are processed and added to the catalog

![AI Crawler Generation](docs/images/ai-crawler-generation.png)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Fetch       │     │  Generate    │     │  Validate    │     │  Execute     │
│  Website     ├────►│  Crawler     ├────►│  Generated   ├────►│  in Sandbox  │
│  Content     │     │  with AI     │     │  Code        │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                       │
                                                                       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Save        │     │  Process     │     │  Extract     │     │  Clean &     │
│  to Catalog  │◄────┤  Results     │◄────┤  MCP Tools   │◄────┤  Filter Data │
│              │     │              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Components

### Sources & Crawlers

- **Sources**: Represent locations where MCP tools can be found (GitHub repos, websites, etc.)
- **Crawlers**: Components responsible for extracting tools from sources
- **Crawler Strategies**: AI-generated code to extract tools from specific websites

### Lambda Functions

| Function | Description |
|----------|-------------|
| Source Manager | Initializes and manages sources in DynamoDB |
| Crawler Generator | Uses OpenAI to generate custom crawlers |
| Known Crawler Runner | Runs built-in crawlers (GitHub, RSS, etc.) |
| Generated Crawler Runner | Safely executes AI-generated crawlers |
| Catalog Processor | Deduplicates and updates the master catalog |

### Crawler Types

1. **GitHub Awesome List Crawler**: Extracts tools from markdown-based awesome lists
2. **GitHub Repository Crawler**: Extracts information about MCP-related GitHub repos
3. **AI-Generated Crawler**: Dynamic crawlers for websites without a predefined crawler
4. **RSS Feed Crawler**: Extracts tools from RSS feeds (planned)

## Development

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/mcp-tool-crawler.git
cd mcp-tool-crawler

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env file with your settings
```

### Running Locally

```bash
# Initialize sources
python -m src.cli init

# List all sources
python -m src.cli list

# Add a new source
python -m src.cli add "https://github.com/example/awesome-mcp-tools" --name "Example Tools"

# Crawl a specific source
python -m src.cli crawl --id "source-123456"

# Crawl all sources
python -m src.cli crawl --all

# Crawl all sources with specific concurrency
python -m src.cli crawl --all --concurrency 3
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_github_crawler.py

# Run with coverage
pytest --cov=src
```

## Deployment

### Packaging Lambda Functions

```bash
# Package Lambda functions
./scripts/package_lambda.sh
```

### Deploying with Terraform

```bash
# Initialize Terraform
cd infrastructure/terraform
terraform init

# Plan the deployment
terraform plan -var-file=environments/dev.tfvars

# Apply the deployment
terraform apply -var-file=environments/dev.tfvars
```

## Security Considerations

- **Sandboxing**: AI-generated code is executed in a restricted sandbox using RestrictedPython
- **Input Validation**: All user inputs and API responses are validated
- **IAM Best Practices**: Least privilege access for all AWS services
- **Rate Limiting**: API throttling for external dependencies
- **Logging & Monitoring**: Comprehensive logging and monitoring

## Future Enhancements

- **Advanced Deduplication**: ML-based similarity detection for tools
- **Web UI**: Management interface for sources and tools
- **Additional Sources**: Support for more types of sources
- **Enhanced Metadata**: Extract and normalize more tool metadata
- **CI/CD Pipeline**: Automated testing and deployment