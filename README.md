<div align="center">

# agent-scaffold

**Generate a standardized .agent/ directory for AI-assisted software projects.**

</div>

---

## Table of Contents

- [What is .agent/?](#what-is-agent)
- [Installation](#installation)
- [Usage](#usage)
- [Output Structure](#output-structure)
- [Template Variables](#template-variables)
- [Framework Support](#framework-support)
- [Agent Workflow](#agent-workflow)
- [Why Use This?](#why-use-this)
- [License](#license)

---

## What is .agent/?

The .agent/ directory is the central configuration hub for AI coding assistants in your project. All rules, tasks, and business context live in one place -- no more agents forgetting conventions or losing task continuity between sessions.

| Directory | Purpose |
|-----------|---------|
| **agents/** | Specialist agent role definitions (Fullstack, QA/QC, Test, Coordinator) |
| **rules/** | Coding conventions that agents MUST follow |
| **instructions/** | Session workflow and operational guidelines |
| **tasks/** | Task tracking with status, locks, and assignment |
| **knowledge/** | Domain context and business references |
| **logs/** | Per-module change documentation |

---

## Installation

### Via npx (no install required)

```bash
npx agent-scaffold
```

### Via npm global

```bash
npm install -g agent-scaffold
agent-scaffold
```

### Via opencode Skill

```bash
opencode skill install agent-scaffold
```

Then in an opencode session:
> "Use the agent-scaffold skill to create the .agent/ directory"

---

## Usage

### 1. Run the CLI

```bash
# In your project root
npx agent-scaffold
```

### 2. Answer Interactive Prompts

```
agent-scaffold -- Generate .agent/ directory

Project name: My App
Framework (laravel/codeigniter/nextjs/express/django/rails/generic): laravel
Commit message language (id/en): en
Testing approach (phpunit/jest/pytest/manual/none): phpunit
Need Coordinator agent for multi-agent orchestration? (y/n): n
```

### 3. Done!

```
.agent/ directory created successfully!

Created:
  .agent/README.md
  .agent/agents/fullstack-engineer.md
  .agent/instructions/README.md
  .agent/rules/core-rules.md
  .agent/tasks/tasks.md
  .agent/knowledge/README.md
  .agent/logs/CHANGELOG_TEMPLATE.md

Next steps:
  1. Read .agent/README.md to understand the structure
  2. Customize .agent/rules/core-rules.md with project-specific conventions
  3. Add domain knowledge to .agent/knowledge/
  4. Create tasks in .agent/tasks/tasks.md
```

### CLI Options

```bash
# Specify target directory (default: current directory)
npx agent-scaffold /path/to/project
```

---

## Output Structure

```
.agent/
|-- README.md                      # Entry point and quick reference
|-- agents/                        # Agent role definitions
|   |-- coordinator.md             #   (optional) Task orchestrator
|   |-- fullstack-engineer.md      #   Main coding agent
|   |-- qa-qc-engineer.md          #   Quality assurance agent
|   |-- test-engineer.md           #   Test automation agent
|-- instructions/                  # Operational guidelines
|   |-- README.md                  #   Session workflow
|   |-- developer.md               #   Developer instructions and patterns
|   |-- DB_CHANGE_POLICY.md        #   Database change policy
|-- rules/                         # Coding conventions (MUST follow)
|   |-- core-rules.md              #   Naming, security, migrations, etc
|-- tasks/                         # Task tracking
|   |-- README.md                  #   Task system documentation
|   |-- tasks.md                   #   Central task queue and status
|   |-- locks/                     #   Lock files for concurrency
|-- knowledge/                     # Domain knowledge
|   |-- README.md                  #   Guide for knowledge directory
|-- logs/                          # Per-module change logs
    |-- CHANGELOG_TEMPLATE.md      #   Changelog template
```

---

## Template Variables

The following variables are replaced automatically during generation:

| Variable | Source | Example Output |
|----------|--------|---------------|
| `{project-name}` | User input | `My App` |
| `{framework}` | User input | `laravel` |
| `{commit-language}` | User input | `en` |
| `{testing-approach}` | User input | `phpunit` |
| `{date}` | Current date | `2026-05-22` |

---

## Framework Support

Each framework gets specific rules injected into `rules/core-rules.md`:

| Framework | Injected Rules |
|-----------|---------------|
| **Laravel** | Repository Pattern, Pint, FormRequest, migration paths |
| **CodeIgniter 3** | SW_Controller, SW_Model, Active Record, CI3 conventions |
| **Next.js** | App Router, Server/Client Components, TypeScript, Tailwind |
| **Express** | MVC pattern, Joi/Zod validation, error handling middleware |
| **Django** | MTV pattern, Class-based views, Django ORM, migrations |
| **Rails** | Strong params, ActiveRecord, Rails conventions |
| **Generic** | Standard template without framework-specific rules |

---

## Agent Workflow

The expected workflow for an AI coding assistant:

```
+---------------------------------------------+
|              SESSION START                  |
+---------------------------------------------+
|  1. Read .agent/instructions/README.md     |
|  2. Read .agent/rules/core-rules.md        |
|  3. Check .agent/tasks/tasks.md for tasks  |
+---------------------+-----------------------+
                      |
                      v
+---------------------------------------------+
|          WHEN WORKING ON TASK               |
+---------------------------------------------+
|  1. Update status to in_progress            |
|  2. Follow rules in core-rules.md           |
|  3. Log changes in logs/                    |
|  4. Use separate branch per task            |
+---------------------+-----------------------+
                      |
                      v
+---------------------------------------------+
|          BEFORE FINISHING SESSION           |
+---------------------------------------------+
|  1. Run linter / formatter                  |
|  2. Run relevant tests                      |
|  3. Update task status in tasks.md          |
|  4. Ensure all changes are logged           |
+---------------------------------------------+
```

---

## Why Use This?

| Problem | Solution |
|---------|----------|
| Agents forget project conventions | Rules persist in `rules/` across sessions |
| No task continuity | Task tracking in `tasks/` survives session restarts |
| Inconsistent code quality | Standardized, enforced coding rules |
| No change documentation | Module-level changelogs in `logs/` |
| Multi-agent conflicts | Lock files in `tasks/locks/` prevent concurrent edits |
| Language confusion | Bilingual templates (Indonesian + English) |

---

## License

MIT -- Free to use, modify, and distribute.

---

<p align="center">Built for developers everywhere.</p>
