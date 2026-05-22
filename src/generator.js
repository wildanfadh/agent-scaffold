const path = require('path');
const fs = require('fs');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function generate(targetDir, answers) {
  const agentDir = path.join(targetDir, '.agent');
  const createdFiles = [];

  const vars = {
    '{project-name}': answers.projectName || 'my-project',
    '{framework}': answers.framework || 'generic',
    '{commit-language}': answers.commitLanguage || 'en',
    '{testing-approach}': answers.testingApproach || 'manual',
    '{date}': new Date().toISOString().split('T')[0]
  };

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
    'instructions/DB_CHANGE_POLICY.md',
    'rules/core-rules.md',
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
        /## 1\. Architecture.*?\n/g,
        '## 1. Architecture / Arsitektur\n\n### ' + answers.framework.toUpperCase() + ' Specific Rules\n\n' + additionalRules + '\n\n'
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

module.exports = { generate, getFrameworkRules };
