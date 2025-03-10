# Claude Directives

## Directive Loading Protocol

1. On project initialization, first check for a file named `CLAUDE.md` in the project root
2. If found, load and apply those directives with higher priority
3. For any areas not covered by project-specific directives, apply these common directives
4. Check the project's primary language/framework and load the appropriate language-specific directives:
   - For Python projects, load `python-directives.md`
   - For other languages, fallback to generic directives
5. Check for a `CLAUDE.global.md` symlink that points to the project's CLAUDE.md file

## Global CLAUDE.md Symlink
- Projects should create a symlink called `CLAUDE.global.md` in the root directory that points to the project's `CLAUDE.md` file
- This allows for easier discovery of the CLAUDE.md file when navigating the repository
- Create with: `ln -s CLAUDE.md CLAUDE.global.md`

## Code Analysis Approach
- Always read project README.md first for context
- Prioritize maintainability and readability in suggestions
- Follow the existing code style when suggesting changes

## Project Documentation
- Use consistent formatting for documentation generation
- Document public APIs thoroughly
- Generate examples that align with existing usage patterns

## GitHub Workflow Directives

### Branch Management
- Create a new branch from latest main for each feature/fix
- Use descriptive branch names that follow project conventions
- Keep branches focused on a single feature or fix

### Commit Standards
- Format commit messages as: `[TYPE]: Short description (max 50 chars)`
- Valid types: `FEAT`, `FIX`, `DOCS`, `STYLE`, `REFACTOR`, `TEST`, `CHORE`
- Include detailed body when needed
- Reference issue numbers where applicable: `Fixes #123`

### PR Management
- Create clear PR titles and descriptions
- Monitor PR build status after submission
- Address review comments promptly
- If any workflow checks fail, fix the issues and push updates to the branch
- Once all checks pass, request a review

### Comment Response Protocol
- Monitor PR for comments containing `@claude`
- When addressed:
  1. Read the full PR thread for context
  2. Understand requested changes
  3. Make appropriate code revisions
  4. Run all local validation again
  5. Push fixes as a new commit
  6. Respond in the PR explaining changes made
