#!/usr/bin/env python3
"""
Script to create GitHub issues and PR for the MCP Tool Crawler project.
This is a helper script and doesn't need to be included in the final project.

Usage:
    # Using Poetry (recommended)
    poetry run python scripts/create_github_issues.py --token YOUR_GITHUB_TOKEN --repo owner/repo
    
    # Using pip
    python scripts/create_github_issues.py --token YOUR_GITHUB_TOKEN --repo owner/repo

Requirements:
    # Using Poetry
    poetry add requests

    # Using pip
    pip install requests
"""

import argparse
import json
import os
import re
import requests
import time


def parse_issues_file(file_path):
    """Parse the issues markdown file and extract issue details."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Split the content by issue sections
    issue_sections = re.split(r'## Issue \d+:', content)[1:]
    
    issues = []
    for section in issue_sections:
        # Extract title
        title_match = re.search(r'\*\*Title\*\*: (.*)', section)
        title = title_match.group(1) if title_match else "Unknown Title"
        
        # Extract description
        desc_start = section.find('**Description**:')
        tasks_start = section.find('**Tasks**:')
        description = section[desc_start:tasks_start].replace('**Description**:', '').strip()
        
        # Extract tasks
        tasks_end = section.find('**Priority**:')
        tasks_text = section[tasks_start:tasks_end].replace('**Tasks**:', '').strip()
        tasks = [task.strip() for task in tasks_text.split('\n') if task.strip().startswith('-')]
        tasks_formatted = '\n'.join(tasks)
        
        # Extract priority
        priority_match = re.search(r'\*\*Priority\*\*: (.*)', section)
        priority = priority_match.group(1) if priority_match else "Medium"
        
        # Extract dependencies
        deps_match = re.search(r'\*\*Dependencies\*\*: (.*)', section)
        dependencies = deps_match.group(1) if deps_match else "None"
        
        # Extract labels
        labels_match = re.search(r'\*\*Labels\*\*: (.*)', section)
        labels_text = labels_match.group(1) if labels_match else ""
        labels = [label.strip() for label in labels_text.split(',')]
        
        # Create full description with tasks and metadata
        full_description = f"{description}\n\n## Tasks\n{tasks_formatted}\n\n## Metadata\n- **Priority**: {priority}\n- **Dependencies**: {dependencies}"
        
        issues.append({
            'title': title,
            'body': full_description,
            'labels': labels
        })
    
    return issues


def create_github_issues(token, repo, issues):
    """Create GitHub issues using the GitHub API."""
    url = f"https://api.github.com/repos/{repo}/issues"
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    issue_numbers = {}
    
    for i, issue in enumerate(issues):
        # Create the issue
        response = requests.post(url, headers=headers, json=issue)
        
        if response.status_code == 201:
            issue_data = response.json()
            issue_number = issue_data['number']
            issue_numbers[i+1] = issue_number  # Map issue index to GitHub issue number
            print(f"Created issue #{issue_number}: {issue['title']}")
        else:
            print(f"Failed to create issue: {issue['title']}")
            print(f"Response: {response.status_code} - {response.text}")
        
        # Sleep to avoid rate limiting
        time.sleep(1)
    
    return issue_numbers


def update_pr_description(token, repo, pr_file_path, issue_numbers):
    """Update the PR description with actual issue numbers."""
    with open(pr_file_path, 'r') as f:
        pr_content = f.read()
    
    # Replace issue placeholders with actual numbers
    for issue_idx, issue_num in issue_numbers.items():
        pr_content = pr_content.replace(f'#{issue_idx}', f'#{issue_num}')
    
    # Print the updated PR description
    print("\n--- Updated PR Description ---")
    print(pr_content)
    print("--- End of PR Description ---\n")


def create_pull_request(token, repo, pr_file_path, base_branch, head_branch, issue_numbers):
    """Create a pull request."""
    url = f"https://api.github.com/repos/{repo}/pulls"
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    # Read and update PR description
    with open(pr_file_path, 'r') as f:
        pr_content = f.read()
    
    # Extract title from PR description
    title_match = re.search(r'# (.*)', pr_content)
    title = title_match.group(1) if title_match else "Initial Project Setup for MCP Tool Crawler"
    
    # Replace issue placeholders with actual numbers
    for issue_idx, issue_num in issue_numbers.items():
        pr_content = pr_content.replace(f'#{issue_idx}', f'#{issue_num}')
    
    pr_data = {
        'title': title,
        'body': pr_content,
        'head': head_branch,
        'base': base_branch
    }
    
    response = requests.post(url, headers=headers, json=pr_data)
    
    if response.status_code == 201:
        pr_data = response.json()
        pr_number = pr_data['number']
        pr_url = pr_data['html_url']
        print(f"Created PR #{pr_number}: {title}")
        print(f"PR URL: {pr_url}")
        return pr_number
    else:
        print(f"Failed to create PR")
        print(f"Response: {response.status_code} - {response.text}")
        return None


def add_pr_to_issues(token, repo, pr_number, issue_numbers):
    """Link the PR to its related issues."""
    if not pr_number:
        return
    
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }
    
    for issue_idx, issue_num in issue_numbers.items():
        if issue_idx in [1, 2, 3, 4]:  # Only link to issues mentioned in PR description
            # Add a comment to link the PR
            url = f"https://api.github.com/repos/{repo}/issues/{issue_num}/comments"
            comment_data = {
                'body': f"This issue is being addressed in PR #{pr_number}"
            }
            
            response = requests.post(url, headers=headers, json=comment_data)
            
            if response.status_code == 201:
                print(f"Linked PR #{pr_number} to issue #{issue_num}")
            else:
                print(f"Failed to link PR to issue #{issue_num}")
                print(f"Response: {response.status_code} - {response.text}")
            
            # Sleep to avoid rate limiting
            time.sleep(1)


def main():
    parser = argparse.ArgumentParser(description='Create GitHub issues and PR for MCP Tool Crawler project')
    parser.add_argument('--token', help='GitHub personal access token')
    parser.add_argument('--repo', help='GitHub repository in format owner/repo')
    parser.add_argument('--issues-file', default='github_issues.md', help='Path to issues markdown file')
    parser.add_argument('--pr-file', default='pr_description.md', help='Path to PR description file')
    parser.add_argument('--base-branch', default='main', help='Base branch for the PR')
    parser.add_argument('--head-branch', default='feature/initial-project-setup', help='Head branch for the PR')
    parser.add_argument('--dry-run', action='store_true', help='Parse issues but do not create them')
    
    args = parser.parse_args()
    
    # Get token from args or environment
    token = args.token or os.environ.get('GITHUB_TOKEN')
    if not token and not args.dry_run:
        parser.error("GitHub token is required. Provide it via --token or GITHUB_TOKEN environment variable.")
    
    # Get repo from args or environment
    repo = args.repo or os.environ.get('GITHUB_REPO')
    if not repo and not args.dry_run:
        parser.error("GitHub repository is required. Provide it via --repo or GITHUB_REPO environment variable.")
    
    # Parse issues file
    issues = parse_issues_file(args.issues_file)
    print(f"Parsed {len(issues)} issues from {args.issues_file}")
    
    if args.dry_run:
        for i, issue in enumerate(issues):
            print(f"Issue {i+1}: {issue['title']}")
            print(f"Labels: {', '.join(issue['labels'])}")
            print(f"Body: {issue['body'][:100]}...")
            print()
        return
    
    # Create issues
    issue_numbers = create_github_issues(token, repo, issues)
    
    # Update PR description with actual issue numbers
    update_pr_description(token, repo, args.pr_file, issue_numbers)
    
    # Create PR
    pr_number = create_pull_request(token, repo, args.pr_file, args.base_branch, args.head_branch, issue_numbers)
    
    # Link PR to issues
    add_pr_to_issues(token, repo, pr_number, issue_numbers)


if __name__ == '__main__':
    main()