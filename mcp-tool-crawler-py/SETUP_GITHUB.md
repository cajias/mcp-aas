# Setting Up GitHub Issues and PR

This document provides instructions on how to create the GitHub issues and pull request for the MCP Tool Crawler project.

## Prerequisites

1. You need a GitHub Personal Access Token with the following scopes:
   - `repo` (full control of repositories)

2. Install requirements:
   ```bash
   pip install requests
   ```

## Usage

### Run the Script with Dry Run First

To see the issues that will be created without actually creating them:

```bash
cd /path/to/mcp-tool-crawler-py
python scripts/create_github_issues.py --dry-run
```

### Create GitHub Issues and PR

To create the issues and PR:

```bash
cd /path/to/mcp-tool-crawler-py
python scripts/create_github_issues.py --token YOUR_GITHUB_TOKEN --repo owner/repo
```

Or set environment variables:

```bash
export GITHUB_TOKEN=YOUR_GITHUB_TOKEN
export GITHUB_REPO=owner/repo
python scripts/create_github_issues.py
```

### Additional Options

```
--issues-file PATH   Path to issues markdown file (default: github_issues.md)
--pr-file PATH       Path to PR description file (default: pr_description.md)
--base-branch NAME   Base branch for the PR (default: main)
--head-branch NAME   Head branch for the PR (default: feature/initial-project-setup)
```

## What the Script Does

1. Parses the issues from `github_issues.md`
2. Creates GitHub issues via the API
3. Updates the PR description with actual issue numbers
4. Creates a pull request
5. Links the PR to the relevant issues

## Manual Steps

If you prefer to create issues manually:

1. Create each issue from the `github_issues.md` file
2. Create a PR using the content from `pr_description.md`
3. Update issue numbers in the PR description
4. Link the PR to issues by commenting on them

## Notes

- The script rate-limits itself to avoid GitHub API limitations
- If you encounter errors, check the response details in the output
- After creating issues, you can delete `github_issues.md` and `pr_description.md` as they're just templates