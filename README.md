# agent-scaffold

> Generate a standardized .agent/ directory for AI-assisted software projects.

**Bahasa Indonesia:** Buat direktori .agent/ yang terstandarisasi untuk project yang menggunakan AI coding assistant.

## What is .agent/?

The .agent/ directory is a centralized location for all AI agent-related files in a project. It provides:

- **Agent definitions** — Specialist roles (Coordinator, Fullstack, QA/QC, Test)
- **Rules** — Coding conventions that agents MUST follow
- **Instructions** — Session workflows and operational guidelines
- **Tasks** — Task tracking with status, locks, and assignment
- **Knowledge** — Domain context and business references
- **Logs** — Per-module change documentation

## Quick Start

### Option 1: npx (CLI)

`ash
npx agent-scaffold
`

### Option 2: opencode Skill

`ash
opencode skill install agent-scaffold
`

Then in your project:

`
Use the agent-scaffold skill to create the .agent/ directory
`

## Features

| Feature | Description |
|---------|-------------|
| **Interactive Setup** | Prompts for framework, language, testing approach |
| **Adaptive Templates** | Rules adjust based on your tech stack |
| **4 Agent Roles** | Coordinator, Fullstack Engineer, QA/QC, Test Engineer |
| **Task Tracking** | Markdown-based task queue with lock files |
| **Bilingual** | Templates in Bahasa Indonesia + English |
| **Framework Support** | Laravel, CodeIgniter, Next.js, Express, and generic |

## Generated Structure

`
.agent/
├── README.md                 # Entry point & quick reference
├── agents/                   # Agent role definitions
│   ├── coordinator.md        # Task orchestrator
│   ├── fullstack-engineer.md # Coding agent
│   ├── qa-qc-engineer.md     # QA/QC agent
│   └── test-engineer.md      # Test automation agent
├── instructions/             # Operational guidelines
│   ├── README.md             # Session workflow
│   ├── developer.md          # Developer instructions
│   └── DB_CHANGE_POLICY.md   # Database change policy
├── rules/                    # Coding conventions (MUST follow)
│   └── core-rules.md
├── tasks/                    # Task tracking
│   ├── README.md             # Task system docs
│   ├── tasks.md              # Central task queue
│   └── locks/                # Lock files for concurrency
├── knowledge/                # Domain knowledge
│   └── README.md
└── logs/                     # Per-module change logs
    └── CHANGELOG_TEMPLATE.md
`

## Workflow

1. **On session start** → Agent reads .agent/instructions/README.md
2. **Before coding** → Agent reads .agent/rules/core-rules.md
3. **When working** → Agent updates .agent/tasks/tasks.md
4. **After changes** → Agent logs to .agent/logs/{module}_changes.md

## Why Use This?

| Problem | Solution |
|---------|----------|
| AI forgets conventions | Rules persist across sessions |
| No task continuity | Task file survives session restarts |
| Inconsistent code quality | Enforced rules per project |
| No change documentation | Automatic changelog per module |
| Multi-agent conflicts | Lock files prevent concurrent edits |

## License

MIT
