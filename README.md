# MCP as a Service (MCP-aaS)

A platform that allows users to launch and use Model Context Protocol (MCP) tools without installing them locally.

## Project Overview

MCP-aaS is a cloud-based platform that provides:
- On-demand access to MCP tools
- User authentication and tool management
- WebSocket connections to tools
- Simple interface for discovering and launching tools

## Repository Structure

This monorepo contains:
- `frontend/`: React-based frontend code
- `backend/`: Node.js/Express backend services
- `infrastructure/`: Terraform code for AWS deployment
- `shared/`: Shared libraries and utilities

## Development

### Prerequisites
- Node.js 18+
- Docker
- AWS CLI (for deployment)

### Setup
1. Clone the repository
2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd backend && npm install
```

### Running Locally
There are two ways to run the application locally:

#### Using npm scripts
```bash
# Start all services
npm start

# Start only the frontend
npm run start:frontend

# Start only the backend
npm run start:backend
```

#### Using Docker Compose
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down
```

## Deployment
See the documentation in the `infrastructure/` directory for deployment instructions.

The application is deployed using:
- GitHub Actions for CI/CD
- Docker containers
- AWS ECS (Elastic Container Service)
- Terraform for infrastructure as code

## Contributing
Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.