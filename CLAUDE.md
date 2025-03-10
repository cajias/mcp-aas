# Project-Specific Claude Directives

## Project Context
This is a Model Context Protocol as a Service (MCP-aaS) platform that allows users to launch and use MCP tools without installing them locally. It's a monorepo containing frontend, backend, and infrastructure code.

## Override: GitHub Interaction Guidelines
- For this project, also monitor issues labeled "needs-claude-review"
- When suggesting code changes, create concise PRs with clear descriptions

## Project-Specific Commands
- When I comment "generate test cases", analyze the current module and generate comprehensive tests
- When I comment "optimize performance", focus on identifying performance bottlenecks
- When I comment "generate documentation", create API or component documentation based on the code

## Special Tools and Dependencies
- WebSocket protocol for tool connections
- Authentication system using JWT/OAuth
- Docker/Kubernetes for containerization
- Infrastructure-as-code tools (Terraform/AWS CDK)

## Project Structure
- `frontend/` - React-based frontend code
- `backend/` - Node.js/Express backend services
- `infrastructure/` - Terraform/CDK code for AWS deployment
- `shared/` - Shared libraries and utilities

## Language Selection
This project is a full-stack JavaScript/TypeScript project. Frontend uses React, backend uses Node.js/Express.
