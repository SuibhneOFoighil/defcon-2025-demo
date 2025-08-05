# Commit

Intelligently reviews staged changes, creates a commit message, and executes the commit.

## Instructions

### 1. Initial Analysis
- Run `git status` and `git diff --staged` in parallel to understand what's being committed
- Use TodoWrite to create a plan for reviewing all modified files
- Mark each file as a separate todo item for systematic tracking

### 2. Parallel File Review
- Use Task tool to spawn parallel agents for reviewing different files/components
- Each agent should:
  - Read and analyze assigned files
  - Understand the purpose and impact of changes
  - Identify connections to other components
  - Note any architectural or design decisions
- Mark each file review todo as completed when finished

### 3. Synthesize Commit Message
Create a commit message following these principles:
- **Conventional format**: `type: brief description`
- **Focus on "why"** not "what" - explain the purpose/benefit
- **Be concise** but descriptive
- **No attribution** to Claude or AI assistance
- **Include key additions** in bullet points for major features

Example format:
```
feat: Add user authentication system

Introduces secure login functionality with JWT tokens and role-based access control.

Key additions:
- OAuth integration with GitHub and Google providers
- Protected route middleware for admin features
- User session management with automatic refresh
- Role-based permission system for different user types
```

### 4. Execute Commit
- Add any unstaged modifications to already-staged files using `git add`
- Execute commit using HEREDOC format for proper message formatting:
  ```bash
  git commit -m "$(cat <<'EOF'
  [commit message here]
  EOF
  )"
  ```
- DO NOT ATTRIBUTE THE COMMIT TO CLAUDE OR AI ASSISTANCE

### 5. Handle Pre-commit Hook Failures
If the commit fails due to pre-commit hooks:
- **Analyze error output** to identify the specific issues
- **Fix common problems automatically**:
  - TypeScript `any` types → use proper type annotations
  - ESLint errors → apply automatic fixes where possible
  - Formatting issues → run formatters
- **Re-stage fixed files** with `git add`
- **Retry commit once** with the same message
- **Report status** - success or remaining manual fixes needed

### 6. Completion
- Run `git status` to confirm commit succeeded
- Report the commit hash and summary to user
- Note any remaining issues that need manual attention

## Usage

```
/commit
```

The command will automatically execute all steps without requiring user approval for the commit message.