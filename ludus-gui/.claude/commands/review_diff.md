# Review Diff Command

Perform a comprehensive code review of the current git diff by analyzing all changed files and providing actionable recommendations.

## Initial Setup

When this command is invoked, respond with:
```
I'm ready to review your code changes. I'll analyze the git diff, read all modified files, and provide comprehensive code review feedback with specific recommendations.
```

Then immediately proceed with the review process.

## Instructions

### 1. **Create Todo List with All Changes**
   - Run `git diff` to see all current changes in tracked files
   - Run `git diff --name-only` to get list of modified files
   - Run `git status` to understand the current state and find untracked files
   - Run `git ls-files --others --exclude-standard` to get clean list of untracked files
   - Identify the scope and nature of changes (feature, bugfix, refactor, etc.)
   - Combine both modified and untracked files for complete review scope
   - **Create a TodoWrite with each file as a separate todo item** for systematic review tracking
   - Mark each todo as "pending" initially

### 2. **Get Complete Change Overview**
   - Use the todo list to ensure all files are covered
   - Mark each file todo as "in_progress" when starting its review

### 3. **Read All Changed and New Files in Parallel**
   - Use the combined file list (modified + untracked) to read all files simultaneously
   - For modified files: understand the nature of changes via git diff
   - For untracked files: read entire file content to understand new functionality
   - For each file, understand:
     - The purpose and functionality of the code
     - How the changes fit into the overall architecture
     - Dependencies and relationships with other components
     - Any potential impact on other parts of the system
   - **Mark each file todo as "completed" after finishing its review**

### 4. **Analyze Changes Systematically**
   For each modified and untracked file, evaluate:
   
   **Code Quality:**
   - Code clarity and readability
   - Adherence to project conventions and patterns
   - Proper error handling and edge cases
   - Performance implications
   - Security considerations

   **Architecture and Design:**
   - Consistency with existing patterns
   - Separation of concerns
   - Component responsibilities
   - API design and interfaces
   - Data flow and state management

   **Testing and Reliability:**
   - Test coverage for new/modified code
   - Edge case handling
   - Error scenarios and recovery
   - Backward compatibility
   - Integration points

   **Documentation and Maintainability:**
   - Code comments and documentation
   - Variable and function naming
   - Code organization and structure
   - Future maintainability

### 5. **Cross-File Impact Analysis**
   - Identify how changes in one file affect others
   - Check for breaking changes to public APIs
   - Verify consistency across related components
   - Look for potential integration issues
   - Consider deployment and migration impacts

### 6. **Synthesize Findings and Recommendations**
   
   Organize feedback into these categories:

   **🔴 Critical Issues** (Must fix before merge)
   - Security vulnerabilities
   - Breaking changes without proper handling
   - Logic errors or bugs
   - Performance regressions

   **🟡 Important Improvements** (Should address)
   - Code quality issues
   - Missing error handling
   - Inconsistency with project patterns
   - Missing tests for critical paths

   **🟢 Suggestions** (Nice to have)
   - Code clarity improvements
   - Performance optimizations
   - Better naming or organization
   - Additional documentation

   **✅ Positive Feedback**
   - Well-implemented features
   - Good architectural decisions
   - Excellent test coverage
   - Clear and maintainable code

### 7. **Provide Specific, Actionable Recommendations**
   
   For each issue or suggestion:
   - **File and Line Reference**: `path/to/file.ts:123`
   - **Issue Description**: Clear explanation of the problem
   - **Recommendation**: Specific action to take
   - **Code Example**: Show before/after if helpful
   - **Rationale**: Explain why this matters

   **Example Format**:
   ```
   📍 `components/ui/button.tsx:45-52`
   **Issue**: Missing error boundary for async operation
   **Recommendation**: Add try-catch block around the API call
   **Rationale**: Prevents unhandled promise rejections that could crash the component
   ```

### 8. **Generate Review Document**
   
   Create a comprehensive review document in `__agents__/reviews/` with:
   
   **Metadata Collection**:
   - Get current date and time with timezone: `date '+%Y-%m-%d %H:%M:%S %Z'`
   - Get git commit hash: `git log -1 --format=%H`
   - Get current branch: `git branch --show-current`
   - Get repository name: `basename $(git rev-parse --show-toplevel)`
   - Create filename: `__agents__/reviews/YYYY-MM-DD_HH-MM-SS_code-review.md`

   **Document Structure**:
   ```markdown
   ---
   date: [Current date and time with timezone in ISO format]
   reviewer: Claude
   git_commit: [Current commit hash]
   branch: [Current branch name]
   repository: [Repository name]
   review_type: "Code Review - Git Diff + Untracked Files"
   files_changed: [number]
   files_added: [number of untracked files]
   risk_level: [Low/Medium/High]
   merge_readiness: [Ready/Needs Work/Major Issues]
   ---

   # Code Review: [Brief Description]

   **Date**: [Current date and time with timezone]
   **Reviewer**: Claude
   **Git Commit**: [Current commit hash]
   **Branch**: [Current branch name]
   **Repository**: [Repository name]

   ## Change Summary
   [Brief overview of what was modified]

   ## Files Modified
   - `file1.ts` - [brief description of changes]
   - `file2.tsx` - [brief description of changes]

   ## Files Added (Untracked)
   - `newfile1.ts` - [brief description of new functionality]
   - `newfile2.tsx` - [brief description of new component]

   ## Review Findings

   ### 🔴 Critical Issues (Must fix before merge)
   [List critical issues with file:line references]

   ### 🟡 Important Improvements (Should address)
   [List important improvements with file:line references]

   ### 🟢 Suggestions (Nice to have)
   [List suggestions with file:line references]

   ### ✅ Positive Feedback
   [Highlight good practices and implementations]

   ## Overall Assessment
   - **Risk Level**: [Low/Medium/High]
   - **Merge Readiness**: [Ready/Needs Work/Major Issues]
   - **Testing Needs**: [What additional testing is recommended]
   - **Documentation Updates**: [Any docs that need updating]

   ## Recommendations Summary
   [Prioritized list of next steps]
   ```

## Review Focus Areas

### **Project-Specific Considerations**
- **TypeScript Compliance**: Ensure 100% type safety
- **Component Patterns**: Follow established React/Next.js patterns
- **API Integration**: Proper use of ludusClient and error handling
- **State Management**: Correct use of TanStack Query and React Context
- **UI Consistency**: Adherence to design system and Tailwind patterns
- **Testing Strategy**: Unit tests for logic, Storybook for components

### **Code Quality Checks**
- **Naming Conventions**: Descriptive, consistent naming
- **Function Size**: Keep functions focused and reasonably sized
- **Complexity**: Avoid overly complex logic
- **Dependencies**: Minimize and justify new dependencies
- **Performance**: Efficient algorithms and React patterns

### **Security Considerations**
- **Input Validation**: Proper sanitization and validation
- **API Security**: Secure API key usage and data handling
- **XSS Prevention**: Safe rendering of dynamic content
- **Authentication**: Proper session and permission handling

### **Accessibility and UX**
- **Keyboard Navigation**: Proper tab order and keyboard support
- **Screen Readers**: Appropriate ARIA labels and semantic HTML
- **Color Contrast**: Accessible color choices
- **Responsive Design**: Mobile and tablet compatibility

## Important Notes

- **Be Specific**: Always include file paths and line numbers
- **Be Constructive**: Focus on actionable improvements, not just criticism
- **Prioritize Impact**: Address high-impact issues first
- **Consider Context**: Understand the business requirements behind changes
- **Follow Patterns**: Ensure consistency with existing codebase patterns
- **Think Holistically**: Consider the entire user experience and system impact

The goal is to maintain high code quality while being supportive and educational for the developer making the changes.