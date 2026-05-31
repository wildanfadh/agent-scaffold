const path = require('path');
const fs = require('fs');
const { DEFAULTS } = require('./config');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function generate(targetDir, answers) {
  const agentDir = path.join(targetDir, '.agent');
  const createdFiles = [];

  if (answers.overwrite && fs.existsSync(agentDir)) {
    fs.rmSync(agentDir, { recursive: true, force: true });
  }

  const vars = {
    '{project-name}': answers.projectName || DEFAULTS.projectName,
    '{framework}': answers.framework || DEFAULTS.framework,
    '{commit-language}': answers.commitLanguage || DEFAULTS.commitLanguage,
    '{testing-approach}': answers.testingApproach || DEFAULTS.testingApproach,
    '{date}': new Date().toISOString().split('T')[0]
  };

  const developerInstructions = getFrameworkDeveloperInstructions(answers.framework || DEFAULTS.framework);
  vars['{build-commands}'] = developerInstructions.buildCommands;
  vars['{project-structure}'] = developerInstructions.projectStructure;
  vars['{debug-notes}'] = developerInstructions.debugNotes;

  const structure = [
    { type: 'dir', path: 'agents' },
    { type: 'dir', path: 'instructions' },
    { type: 'dir', path: 'rules' },
    { type: 'dir', path: 'tasks' },
    { type: 'dir', path: 'tasks/locks' },
    { type: 'dir', path: 'knowledge' },
    { type: 'dir', path: 'logs' },
  ];

  const files = [
    'README.md',
    'agents/coordinator.md',
    'agents/fullstack-engineer.md',
    'agents/qa-qc-engineer.md',
    'agents/test-engineer.md',
    'instructions/README.md',
    'instructions/developer.md',
    'rules/core-rules.md',
    'rules/database.md',
    'tasks/README.md',
    'tasks/tasks.md',
    'knowledge/README.md',
    'logs/CHANGELOG_TEMPLATE.md',
  ];

  if (!answers.needCoordinator) {
    const idx = files.indexOf('agents/coordinator.md');
    if (idx > -1) {
      files.splice(idx, 1);
    }
  }

  structure.forEach(item => {
    const dirPath = path.join(agentDir, item.path);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  files.forEach(file => {
    const srcPath = path.join(TEMPLATES_DIR, file);
    const destPath = path.join(agentDir, file);

    if (!fs.existsSync(srcPath)) {
      console.warn('  Warning: Template not found: ' + srcPath);
      return;
    }

    let content = fs.readFileSync(srcPath, 'utf8');

    Object.keys(vars).forEach(key => {
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      content = content.replace(regex, vars[key]);
    });

    const parentDir = path.dirname(destPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(destPath, content, 'utf8');
    createdFiles.push('.agent/' + file);
  });

  if (answers.framework !== 'generic') {
    const rulesPath = path.join(agentDir, 'rules', 'core-rules.md');
    let additionalRules = getFrameworkRules(answers.framework);
    
    if (additionalRules && fs.existsSync(rulesPath)) {
      let content = fs.readFileSync(rulesPath, 'utf8');
      content = content.replace(
        /## 1\. Architecture\n\n/g,
        '## 1. Architecture\n\n### ' + answers.framework.toUpperCase() + ' Specific Rules\n\n' + additionalRules + '\n\n'
      );
      fs.writeFileSync(rulesPath, content, 'utf8');
    }
  }

  return { files: createdFiles };
}

function getFrameworkRules(framework) {
  const rules = {
    laravel: '- Use Repository Pattern: Interface -> Repository -> Controller\n- Bind repositories in app/Providers/RepositoryServiceProvider.php\n- AJAX controllers return JSON using AjaxResponserTrait\n- All write operations wrapped in database transactions\n- Run vendor/bin/pint before completing any task\n- FormRequest classes for validation, never inline in controllers\n- Migrations: new tables in database/migrations/, updates in database/migrations/updates/',

    codeigniter: '- Controllers extend SW_Controller (custom base controller)\n- Models extend SW_Model (custom base model)\n- Views use v_ prefix, Models use M_ prefix\n- Always call $this->auth->check_auth() in admin controllers\n- Use parameterized queries - NEVER concatenate user input into SQL\n- Prefer Active Record over raw SQL\n- 4 spaces indentation (no tabs)\n- Every PHP file starts with defined(BASEPATH) check',

    nextjs: '- Use App Router conventions (app/ directory)\n- Server Components by default, mark Client Components with "use client"\n- Use TypeScript for all new files\n- API routes in app/api/ with Route Handlers\n- Use Server Actions for form mutations where possible\n- Styling: Tailwind CSS with shadcn/ui components\n- Run npm run lint and npm run typecheck before completing tasks',

    express: '- Use MVC pattern: controllers, models, routes separated\n- Async/await with proper error handling middleware\n- Use Joi or Zod for request validation\n- Database queries in repository/service layer, not in controllers\n- Use environment variables for configuration (dotenv)\n- Run linter (eslint) before completing any task',

    django: '- Follow Django MTV pattern: Models, Templates, Views\n- Use class-based views where appropriate\n- Forms for validation, never trust request.POST directly\n- Use Django ORM, never raw SQL unless necessary\n- Run python manage.py check and python manage.py test before completing tasks\n- Migrations: always run makemigrations after model changes',

    rails: '- Follow Rails conventions: MVC pattern\n- Use strong parameters in controllers\n- Model validations, never trust params directly\n- Use ActiveRecord queries, avoid raw SQL\n- Run rails lint and rails test before completing tasks\n- Migrations: always create new migration, never modify existing ones'
  };

  return rules[framework] || '';
}

function getFrameworkDeveloperInstructions(framework) {
  const instructions = {
    laravel: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        'composer install',
        '',
        '# Run locally',
        'php artisan serve',
        '',
        '# Lint and test',
        'vendor/bin/pint',
        'php artisan test',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'app/',
        '  Http/Controllers/   # HTTP controllers',
        '  Models/             # Eloquent models',
        '  Services/           # Business logic services',
        'database/',
        '  migrations/         # Database migrations',
        '  seeders/            # Seed data',
        'resources/',
        '  views/              # Blade templates',
        'routes/',
        '  web.php             # Web routes',
        '  api.php             # API routes',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Useful debugging commands',
        'php artisan route:list',
        'php artisan tinker',
        '',
        '# Check logs',
        'tail -f storage/logs/laravel.log',
        '```'
      ].join('\n')
    },
    codeigniter: {
      buildCommands: [
        '```bash',
        '# Install dependencies if Composer is used',
        'composer install',
        '',
        '# Run locally (adjust to the project bootstrap)',
        'php -S localhost:8000 -t public',
        '',
        '# Run tests or syntax checks if configured',
        'phpunit',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'application/',
        '  controllers/        # HTTP controllers',
        '  models/             # Data access models',
        '  views/              # Rendered templates',
        'system/               # Framework internals',
        'public/               # Public web root when present',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Check application logs',
        'tail -f application/logs/log-*.php',
        '',
        '# Inspect routes and bootstrap configuration manually',
        '# because project layouts vary between CodeIgniter installations',
        '```'
      ].join('\n')
    },
    nextjs: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        'npm install',
        '',
        '# Run locally',
        'npm run dev',
        '',
        '# Lint, type-check, and test',
        'npm run lint',
        'npm run typecheck',
        'npm test',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'app/                  # App Router routes and layouts',
        'components/           # Shared UI components',
        'lib/                  # Shared utilities and integrations',
        'public/               # Static assets',
        'styles/               # Global styling when present',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Inspect the production build locally',
        'npm run build',
        'npm run start',
        '',
        '# Watch server and browser errors in the terminal and browser console',
        '```'
      ].join('\n')
    },
    express: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        'npm install',
        '',
        '# Run locally (adjust to the actual project scripts)',
        'npm run dev',
        '',
        '# Lint and test',
        'npm run lint',
        'npm test',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'src/',
        '  controllers/        # Route handlers',
        '  services/           # Business logic',
        '  repositories/       # Data access',
        '  routes/             # Route registration',
        '  middleware/         # Express middleware',
        'tests/                # Automated tests',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Run with verbose logging if the project supports it',
        'DEBUG=* npm run dev',
        '',
        '# Inspect request logs and unhandled promise rejections in the terminal',
        '```'
      ].join('\n')
    },
    django: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        'pip install -r requirements.txt',
        '',
        '# Run locally',
        'python manage.py runserver',
        '',
        '# Run checks and tests',
        'python manage.py check',
        'python manage.py test',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'project_name/         # Project settings and root URLs',
        'apps/                 # Django apps when grouped explicitly',
        'templates/            # Shared templates',
        'static/               # Static assets',
        'manage.py             # Django entry point',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Validate project configuration',
        'python manage.py check',
        '',
        '# Open a Django shell for quick inspection',
        'python manage.py shell',
        '```'
      ].join('\n')
    },
    rails: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        'bundle install',
        '',
        '# Run locally',
        'bin/rails server',
        '',
        '# Lint and test',
        'bin/rubocop',
        'bin/rails test',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'app/',
        '  controllers/        # Rails controllers',
        '  models/             # ActiveRecord models',
        '  views/              # Templates and partials',
        'config/               # Environment and routing configuration',
        'db/                   # Migrations and schema',
        'test/                 # Rails test suite',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Inspect routes and environment state',
        'bin/rails routes',
        'bin/rails console',
        '',
        '# Review development logs',
        'tail -f log/development.log',
        '```'
      ].join('\n')
    },
    generic: {
      buildCommands: [
        '```bash',
        '# Install dependencies',
        '# Update these commands to match the project toolchain',
        '',
        '# Run locally',
        '# Add the local development command used by this project',
        '',
        '# Lint and test',
        '# Add the lint and test commands used by this project',
        '```'
      ].join('\n'),
      projectStructure: [
        '```',
        'src/                  # Main application code',
        'tests/                # Automated tests',
        'docs/                 # Supporting project documentation',
        'scripts/              # Local helper scripts when present',
        '```'
      ].join('\n'),
      debugNotes: [
        '```bash',
        '# Document the project-specific debugging workflow here',
        '# Example: log files, local services, and health checks',
        '```'
      ].join('\n')
    }
  };

  return instructions[framework] || instructions.generic;
}

module.exports = { generate, getFrameworkRules, getFrameworkDeveloperInstructions };
