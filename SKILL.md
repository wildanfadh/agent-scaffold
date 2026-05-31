# Skill: agent-scaffold

## Purpose

Generate a standardized .agent/ directory structure for AI-assisted software projects. Provides agent role definitions, coding rules, task tracking, and domain knowledge organization.

## Scope

- Workspace-scoped: runs in the target project root
- Creates .agent/ directory with all subdirectories and template files
- Interactive prompts to customize templates for the project's tech stack

## When to Use

Trigger this skill when:
- User wants to set up AI agent infrastructure in a new project
- User asks to "create .agent folder", "set up agent rules", "add agent tasks"
- User mentions organizing AI assistant conventions
- User wants task tracking for AI coding sessions

## Step-by-step Workflow

### 1. Gather Project Context

Ask the user:
1. **Framework**: What framework does this project use? (Laravel, CodeIgniter, Next.js, Express, Django, Rails, Generic/Other)
2. **Commit language**: Bahasa Indonesia or English?
3. **Testing approach**: PHPUnit, Jest, Pytest, Manual QA, None yet
4. **Need Coordinator?**: Yes (multi-agent orchestration) or No (single agent)
5. **Project name**: Human-readable name for the project

### 2. Generate Directory Structure

Create the following structure in the project root:

`
.agent/
├── README.md
├── agents/
│   ├── coordinator.md        (only if Coordinator = Yes)
│   ├── fullstack-engineer.md
│   ├── qa-qc-engineer.md
│   └── test-engineer.md
├── instructions/
│   ├── README.md
│   └── developer.md
├── rules/
│   ├── core-rules.md
│   └── database.md
├── tasks/
│   ├── README.md
│   ├── tasks.md
│   └── locks/                (directory, empty)
├── knowledge/
│   └── README.md
└── logs/
    └── CHANGELOG_TEMPLATE.md
`

### 3. Adapt Templates

Customize each template based on user answers:

**rules/core-rules.md:**
- Add framework-specific conventions (naming, structure, patterns)
- Include indentation, charset, formatting rules
- Add security rules (no secrets, CSRF, validation)

**rules/database.md:**
- Keep database policy separate from general workflow instructions
- Document approval expectations and restricted operations

**instructions/developer.md:**
- Add framework-specific build commands and debugging notes
- Include a framework-specific project structure starter section

**agents/*.md:**
- Replace {project-name} with actual project name
- Set framework context in role descriptions
- Include testing context where the template already supports it

**tasks/tasks.md:**
- Initialize with empty task table
- Include status legend
- Add task guidelines

### 4. Verify

- Check all files are created
- Confirm .agent/README.md exists as entry point
- Ensure locks/ directory exists (empty)
- Print summary of created files

## Template Variables

Replace these placeholders in templates:

| Variable | Source |
|----------|--------|
| {project-name} | User input |
| {framework} | User input |
| {commit-language} | User input (ID/EN) |
| {testing-approach} | User input |
| {date} | Current date (YYYY-MM-DD) |

## Output

After completion, print:

`
.agent/ directory created successfully!

Created:
  .agent/README.md
  .agent/agents/ (4 files)
  .agent/instructions/ (2 files)
  .agent/rules/ (2 files)
  .agent/tasks/ (2 files + locks/)
  .agent/knowledge/README.md
  .agent/logs/CHANGELOG_TEMPLATE.md

Next steps:
  1. Read .agent/README.md to understand the structure
  2. Customize .agent/rules/core-rules.md with project-specific conventions
  3. Add domain knowledge to .agent/knowledge/
  4. Create tasks in .agent/tasks/tasks.md
`

## Constraints

- NEVER overwrite existing .agent/ directory without user confirmation
- NEVER modify files outside .agent/
- NEVER include secrets or credentials in templates
- If .agent/ already exists, offer overwrite or skip

## CLI Notes

- The CLI supports both interactive and non-interactive usage.
- If all required values are provided as flags, generation can run without prompts.
- If only some values are provided, the CLI prompts for the remaining answers.

## Example Prompts

- "Create a .agent folder for my Laravel project"
- "Set up agent rules for this project"
- "I want to organize AI agent conventions"
- "Generate task tracking for my coding sessions"
