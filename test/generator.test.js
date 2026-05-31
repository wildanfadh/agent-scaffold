const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const { execFileSync } = require('child_process');

const { generate } = require('../src/generator');
const { parseArgs, normalizeAnswers } = require('../bin/agent-scaffold');
const { SUPPORTED_FRAMEWORKS } = require('../src/config');
const CLI_PATH = path.join(__dirname, '..', 'bin', 'agent-scaffold.js');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'agent-scaffold-'));
}

function readFile(root, relativePath) {
  return fs.readFileSync(path.join(root, '.agent', relativePath), 'utf8');
}

function run() {
  testGeneratesCleanTemplates();
  testGeneratesExpectedFileInventory();
  testReplacesKeyPlaceholdersAndInjectsFrameworkRules();
  testFrameworkSpecificDeveloperInstructions();
  testInjectsFrameworkRulesForAllSupportedFrameworks();
  testCliParsesNonInteractiveOptions();
  testCliNormalizesAnswers();
  testCliParsesAutomationFlags();
  testCliValidationErrorsAreHelpful();
  testCliHelpOutput();
  testCliJsonOutput();
  testCliQuietOutput();
  testOverwriteRemovesStaleFiles();
  console.log('All tests passed');
}

function listFiles(root, currentDir = path.join(root, '.agent')) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name);
    const relativePath = path.relative(path.join(root, '.agent'), absolutePath);

    if (entry.isDirectory()) {
      files.push(relativePath + '/');
      files.push(...listFiles(root, absolutePath));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

function testGeneratesCleanTemplates() {
  const root = makeTempDir();

  generate(root, {
    projectName: 'Demo App',
    framework: 'nextjs',
    commitLanguage: 'id',
    testingApproach: 'jest',
    needCoordinator: true,
    overwrite: false,
  });

  const readme = readFile(root, 'README.md');
  const developer = readFile(root, 'instructions/developer.md');
  const changelog = readFile(root, 'logs/CHANGELOG_TEMPLATE.md');
  const instructions = readFile(root, 'instructions/README.md');
  const knowledge = readFile(root, 'knowledge/README.md');

  assert.ok(readme.includes('agents/'));
  assert.ok(readme.includes('rules/core-rules.md'));
  assert.ok(readme.includes('tasks/tasks.md'));
  assert.ok(!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(readme));
  assert.ok(readme.includes('Central location for AI agent documentation'));

  assert.ok(developer.includes('```bash'));
  assert.ok(!developer.includes('{date}'));
  assert.ok(developer.includes('npm run dev'));
  assert.ok(!developer.includes('{build-commands}'));
  assert.ok(!developer.includes('{project-structure}'));
  assert.ok(!developer.includes('{debug-notes}'));

  assert.ok(changelog.includes('## Module: module_name'));
  assert.ok(!changelog.includes('{module-name}'));

  assert.ok(instructions.includes('# Agent Instructions'));
  assert.ok(!instructions.includes('Instruksi'));

  assert.ok(knowledge.includes('# Knowledge'));
  assert.ok(!knowledge.includes('Pengetahuan'));
}

function testGeneratesExpectedFileInventory() {
  const root = makeTempDir();

  generate(root, {
    projectName: 'Inventory App',
    framework: 'generic',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: false,
    overwrite: false,
  });

  const files = listFiles(root);

  assert.deepStrictEqual(files, [
    'README.md',
    'agents/',
    'agents/fullstack-engineer.md',
    'agents/qa-qc-engineer.md',
    'agents/test-engineer.md',
    'instructions/',
    'instructions/README.md',
    'instructions/developer.md',
    'knowledge/',
    'knowledge/README.md',
    'logs/',
    'logs/CHANGELOG_TEMPLATE.md',
    'rules/',
    'rules/core-rules.md',
    'rules/database.md',
    'tasks/',
    'tasks/README.md',
    'tasks/locks/',
    'tasks/tasks.md',
  ]);
}

function testReplacesKeyPlaceholdersAndInjectsFrameworkRules() {
  const root = makeTempDir();

  generate(root, {
    projectName: 'Rules App',
    framework: 'nextjs',
    commitLanguage: 'id',
    testingApproach: 'jest',
    needCoordinator: true,
    overwrite: false,
  });

  const fullstack = readFile(root, 'agents/fullstack-engineer.md');
  const databaseRules = readFile(root, 'rules/database.md');
  const rules = readFile(root, 'rules/core-rules.md');
  const testEngineer = readFile(root, 'agents/test-engineer.md');

  assert.ok(fullstack.includes('# Fullstack Engineer — Rules App'));
  assert.ok(databaseRules.includes('**Project: Rules App**'));
  assert.ok(databaseRules.includes('# Database Rules'));
  assert.ok(testEngineer.includes('- **Testing Approach**: jest'));
  assert.ok(rules.includes('### NEXTJS Specific Rules'));
  assert.ok(rules.includes('- Use App Router conventions (app/ directory)'));
  assert.ok(rules.includes('- Commit messages in: **id**'));
}

function testFrameworkSpecificDeveloperInstructions() {
  const nextRoot = makeTempDir();
  const laravelRoot = makeTempDir();
  const genericRoot = makeTempDir();

  generate(nextRoot, {
    projectName: 'Next App',
    framework: 'nextjs',
    commitLanguage: 'en',
    testingApproach: 'jest',
    needCoordinator: false,
    overwrite: false,
  });

  generate(laravelRoot, {
    projectName: 'Laravel App',
    framework: 'laravel',
    commitLanguage: 'en',
    testingApproach: 'phpunit',
    needCoordinator: false,
    overwrite: false,
  });

  generate(genericRoot, {
    projectName: 'Generic App',
    framework: 'generic',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: false,
    overwrite: false,
  });

  const nextDeveloper = readFile(nextRoot, 'instructions/developer.md');
  const laravelDeveloper = readFile(laravelRoot, 'instructions/developer.md');
  const genericDeveloper = readFile(genericRoot, 'instructions/developer.md');

  assert.ok(nextDeveloper.includes('npm run dev'));
  assert.ok(nextDeveloper.includes('app/                  # App Router routes and layouts'));

  assert.ok(laravelDeveloper.includes('php artisan serve'));
  assert.ok(laravelDeveloper.includes('vendor/bin/pint'));
  assert.ok(laravelDeveloper.includes('routes/'));

  assert.ok(genericDeveloper.includes('Update these commands to match the project toolchain'));
  assert.ok(genericDeveloper.includes('Document the project-specific debugging workflow here'));
}

function testInjectsFrameworkRulesForAllSupportedFrameworks() {
  const cases = {
    laravel: 'Repository Pattern: Interface -> Repository -> Controller',
    codeigniter: 'Controllers extend SW_Controller (custom base controller)',
    nextjs: 'Use App Router conventions (app/ directory)',
    express: 'Use Joi or Zod for request validation',
    django: 'Follow Django MTV pattern: Models, Templates, Views',
    rails: 'Use strong parameters in controllers',
  };

  for (const framework of SUPPORTED_FRAMEWORKS) {
    if (framework === 'generic') {
      continue;
    }

    const root = makeTempDir();

    generate(root, {
      projectName: 'Matrix App',
      framework,
      commitLanguage: 'en',
      testingApproach: 'manual',
      needCoordinator: false,
      overwrite: false,
    });

    const rules = readFile(root, 'rules/core-rules.md');
    assert.ok(rules.includes(`### ${framework.toUpperCase()} Specific Rules`));
    assert.ok(rules.includes(cases[framework]));
  }
}

function testCliParsesNonInteractiveOptions() {
  const parsed = parseArgs([
    'demo-project',
    '--project-name', 'Demo App',
    '--framework', 'nextjs',
    '--commit-language', 'id',
    '--testing-approach', 'jest',
    '--coordinator',
    '--overwrite',
  ]);

  assert.strictEqual(parsed.targetDir, 'demo-project');
  assert.deepStrictEqual(parsed.options, {
    projectName: 'Demo App',
    framework: 'nextjs',
    commitLanguage: 'id',
    testingApproach: 'jest',
    needCoordinator: true,
    overwrite: true,
  });
}

function testCliNormalizesAnswers() {
  const answers = normalizeAnswers({
    projectName: 'My App',
    framework: 'rails',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: 'yes',
    overwrite: true,
  });

  assert.deepStrictEqual(answers, {
    projectName: 'My App',
    framework: 'rails',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: true,
    overwrite: true,
    quiet: false,
    outputJson: false,
  });
}

function testCliParsesAutomationFlags() {
  const parsed = parseArgs([
    '--project-name=Automation App',
    '--framework=express',
    '--commit-language=en',
    '--testing-approach=manual',
    '--no-coordinator',
    '--quiet',
    '--output-json',
    '--yes',
  ]);

  assert.deepStrictEqual(parsed.options, {
    projectName: 'Automation App',
    framework: 'express',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: false,
    quiet: true,
    outputJson: true,
    overwrite: true,
  });
}

function testCliValidationErrorsAreHelpful() {
  assert.throws(
    () => parseArgs(['--framework', 'phoenix']),
    /Unsupported framework: phoenix\. Supported values:/
  );

  assert.throws(
    () => parseArgs(['--project-name']),
    /Missing value for --project-name\. Run --help to see usage\./
  );

  assert.throws(
    () => parseArgs(['--unknown-flag']),
    /Unknown option: --unknown-flag\. Run --help to see supported flags\./
  );
}

function testCliHelpOutput() {
  const output = execFileSync(process.execPath, [CLI_PATH, '--help'], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });

  assert.ok(output.includes('Usage: agent-scaffold [target-dir] [options]'));
  assert.ok(output.includes('--output-json'));
  assert.ok(output.includes('--quiet'));
}

function testCliJsonOutput() {
  const root = makeTempDir();
  const output = execFileSync(process.execPath, [
    CLI_PATH,
    root,
    '--project-name', 'Json App',
    '--framework', 'express',
    '--commit-language', 'en',
    '--testing-approach', 'manual',
    '--no-coordinator',
    '--overwrite',
    '--output-json',
  ], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });

  const parsed = JSON.parse(output);
  assert.strictEqual(parsed.success, true);
  assert.strictEqual(parsed.targetDir, root);
  assert.strictEqual(parsed.agentDir, path.join(root, '.agent'));
  assert.ok(parsed.files.includes('.agent/instructions/developer.md'));
  assert.ok(parsed.files.includes('.agent/rules/database.md'));
  assert.ok(parsed.nextSteps.includes('Create tasks in .agent/tasks/tasks.md'));
}

function testCliQuietOutput() {
  const root = makeTempDir();
  const output = execFileSync(process.execPath, [
    CLI_PATH,
    root,
    '--project-name', 'Quiet App',
    '--framework', 'django',
    '--commit-language', 'en',
    '--testing-approach', 'pytest',
    '--no-coordinator',
    '--overwrite',
    '--quiet',
  ], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  });

  assert.strictEqual(output, '');
  assert.ok(fs.existsSync(path.join(root, '.agent', 'instructions', 'developer.md')));
}

function testOverwriteRemovesStaleFiles() {
  const root = makeTempDir();

  generate(root, {
    projectName: 'Demo App',
    framework: 'generic',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: true,
    overwrite: false,
  });

  const staleFile = path.join(root, '.agent', 'stale.md');
  fs.writeFileSync(staleFile, 'stale', 'utf8');
  assert.ok(fs.existsSync(staleFile));

  generate(root, {
    projectName: 'Demo App',
    framework: 'generic',
    commitLanguage: 'en',
    testingApproach: 'manual',
    needCoordinator: false,
    overwrite: true,
  });

  assert.ok(!fs.existsSync(staleFile));
  assert.ok(!fs.existsSync(path.join(root, '.agent', 'agents', 'coordinator.md')));
}

run();
