# Initial Project Setup for MCP Tool Crawler

## Description

This PR sets up the initial project structure and foundational components for the MCP Tool Crawler, a service for discovering and cataloging Machine Context Protocol (MCP) tools from various sources.

The primary goal of this PR is to establish a solid foundation for the project, including:

- Basic project structure and configuration
- Core data models and interfaces
- GitHub awesome list crawler implementation
- Storage services (S3 and local)
- Lambda function handlers
- CLI for local development
- Step Functions workflow definition

## Key Components Implemented

1. **Project Structure**:
   - Python package setup
   - Configuration handling
   - Logging configuration

2. **Models**:
   - Source model (for crawl sources)
   - MCPTool model (for discovered tools)
   - CrawlerStrategy model (for dynamic crawlers)
   - CrawlResult model (for crawl operation results)

3. **Storage**:
   - S3 storage implementation
   - Local file storage for development

4. **Crawlers**:
   - Base crawler class with common functionality
   - GitHub awesome list crawler implementation

5. **Lambda Functions**:
   - Source management Lambda
   - Crawler execution Lambda
   - Lambda packaging script

6. **Architecture**:
   - Step Functions workflow definition
   - README with architecture diagrams

## Related Issues

- Resolves #1: Create Project Structure & Setup
- Partially addresses #2: Implement Core Models and Schema
- Partially addresses #3: Create Storage Interface
- Partially addresses #4: Implement GitHub Awesome List Crawler

## Testing

This PR includes the basic structure, but actual tests will be added in subsequent PRs as part of Issue #12.

## Next Steps

After this PR is merged:
1. Complete the implementation of the GitHub crawler
2. Implement the OpenAI crawler generator
3. Set up proper DynamoDB integration
4. Create comprehensive testing

## Screenshots

(Architecture diagrams will be added in the documentation PR)

## Checklist

- [x] Project structure created
- [x] Core models implemented with validation
- [x] Base crawler class implemented
- [x] GitHub crawler initial implementation
- [x] Storage services implemented
- [x] Lambda handlers defined
- [x] Documentation started
- [ ] Tests added (coming in future PR)