#!/usr/bin/env node

/**
 * agent-scaffold CLI
 * Generate a standardized .agent/ directory for AI-assisted projects
 */

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const generator = require('../src/generator');
const {
  DEFAULTS,
  SUPPORTED_FRAMEWORKS,
  SUPPORTED_COMMIT_LANGUAGES,
  SUPPORTED_TESTING_APPROACHES,
  getFrameworkPrompt,
} = require('../src/config');

if (require.main === module) {
  main();
}

function runGenerator(targetDir, optionAnswers) {
  if (!optionAnswers.quiet && !optionAnswers.outputJson) {
    console.log('\nagent-scaffold - Generate .agent/ directory\n');
  }

  if (isNonInteractive(optionAnswers)) {
    generate(normalizeAnswers(optionAnswers), targetDir);
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const questions = [
    { key: 'projectName', question: 'Project name: ', default: DEFAULTS.projectName },
    { key: 'framework', question: getFrameworkPrompt(), default: DEFAULTS.framework },
    { key: 'commitLanguage', question: `Commit message language (${SUPPORTED_COMMIT_LANGUAGES.join('/')}): `, default: DEFAULTS.commitLanguage },
    { key: 'testingApproach', question: `Testing approach (${SUPPORTED_TESTING_APPROACHES.join('/')}): `, default: DEFAULTS.testingApproach },
    { key: 'needCoordinator', question: 'Need Coordinator agent for multi-agent orchestration? (y/n): ', default: 'n' }
  ];

  const answers = { ...optionAnswers };
  const remainingQuestions = questions.filter(q => answers[q.key] === undefined);
  let currentQuestion = 0;

  function askNext() {
    if (currentQuestion >= remainingQuestions.length) {
      rl.close();
      generate(normalizeAnswers(answers), targetDir);
      return;
    }

    const q = remainingQuestions[currentQuestion];
    rl.question(q.question, (answer) => {
      answers[q.key] = answer.trim() || q.default;
      currentQuestion++;
      askNext();
    });
  }

  askNext();
}

function generate(answers, targetDir) {
  if (!answers.quiet && !answers.outputJson) {
    console.log('\nGenerating .agent/ directory...\n');
  }
  
  try {
    const result = generator.generate(targetDir, answers);
    if (answers.outputJson) {
      process.stdout.write(JSON.stringify({
        success: true,
        targetDir,
        agentDir: path.join(targetDir, '.agent'),
        files: result.files,
        nextSteps: [
          'Read .agent/README.md to understand the structure',
          'Customize .agent/rules/core-rules.md with project-specific conventions',
          'Add domain knowledge to .agent/knowledge/',
          'Create tasks in .agent/tasks/tasks.md'
        ]
      }, null, 2) + '\n');
      return;
    }

    if (answers.quiet) {
      return;
    }

    console.log('.agent/ directory created successfully!\n');
    console.log('Created:');
    result.files.forEach(f => console.log('  ' + f));
    console.log('\nNext steps:');
    console.log('  1. Read .agent/README.md to understand the structure');
    console.log('  2. Customize .agent/rules/core-rules.md with project-specific conventions');
    console.log('  3. Add domain knowledge to .agent/knowledge/');
    console.log('  4. Create tasks in .agent/tasks/tasks.md\n');
  } catch (error) {
    if (answers.outputJson) {
      process.stderr.write(JSON.stringify({
        success: false,
        error: error.message,
      }, null, 2) + '\n');
      process.exit(1);
    }

    console.error('Error generating .agent/ directory: ' + error.message);
    process.exit(1);
  }
}

function main() {
  const cli = parseArgs(process.argv.slice(2));
  const targetDir = cli.targetDir || process.cwd();
  const agentDir = path.join(targetDir, '.agent');

  if (fs.existsSync(agentDir) && !cli.options.overwrite) {
    console.log('\nWarning: .agent/ directory already exists at:');
    console.log('   ' + agentDir + '\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Do you want to overwrite? (y/N): ', (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        cli.options.overwrite = true;
        runGenerator(targetDir, cli.options);
      } else {
        console.log('Aborted. No changes made.');
        process.exit(0);
      }
    });
    return;
  }

  runGenerator(targetDir, cli.options);
}

function parseArgs(argv) {
  const options = {};
  let targetDir;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      if (!targetDir) {
        targetDir = arg;
        continue;
      }

      throw new Error('Unexpected positional argument: ' + arg);
    }

    const [flag, inlineValue] = arg.split('=', 2);
    const nextValue = inlineValue !== undefined ? inlineValue : argv[i + 1];

    switch (flag) {
      case '--project-name':
        options.projectName = requireValue(flag, nextValue, inlineValue);
        if (inlineValue === undefined) i++;
        break;
      case '--framework':
        options.framework = requireValue(flag, nextValue, inlineValue);
        if (inlineValue === undefined) i++;
        break;
      case '--commit-language':
        options.commitLanguage = requireValue(flag, nextValue, inlineValue);
        if (inlineValue === undefined) i++;
        break;
      case '--testing-approach':
        options.testingApproach = requireValue(flag, nextValue, inlineValue);
        if (inlineValue === undefined) i++;
        break;
      case '--coordinator':
        options.needCoordinator = true;
        break;
      case '--no-coordinator':
        options.needCoordinator = false;
        break;
      case '--overwrite':
      case '--yes':
        options.overwrite = true;
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--output-json':
        options.outputJson = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
      default:
        throw new Error('Unknown option: ' + flag + '. Run --help to see supported flags.');
    }
  }

  validateOptions(options);
  return { targetDir, options };
}

function requireValue(flag, nextValue, inlineValue) {
  if (inlineValue !== undefined) {
    return inlineValue;
  }

  if (nextValue === undefined || nextValue.startsWith('--')) {
    throw new Error('Missing value for ' + flag + '. Run --help to see usage.');
  }

  return nextValue;
}

function normalizeAnswers(answers) {
  return {
    projectName: answers.projectName || DEFAULTS.projectName,
    framework: answers.framework || DEFAULTS.framework,
    commitLanguage: answers.commitLanguage || DEFAULTS.commitLanguage,
    testingApproach: answers.testingApproach || DEFAULTS.testingApproach,
    needCoordinator: normalizeBooleanAnswer(answers.needCoordinator, DEFAULTS.needCoordinator),
    overwrite: Boolean(answers.overwrite),
    quiet: Boolean(answers.quiet),
    outputJson: Boolean(answers.outputJson),
  };
}

function normalizeBooleanAnswer(value, fallback) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value.toLowerCase() === 'y' || value.toLowerCase() === 'yes' || value.toLowerCase() === 'true';
  }

  return fallback;
}

function isNonInteractive(options) {
  return options.projectName !== undefined
    && options.framework !== undefined
    && options.commitLanguage !== undefined
    && options.testingApproach !== undefined
    && options.needCoordinator !== undefined;
}

function validateOptions(options) {
  if (options.framework && !SUPPORTED_FRAMEWORKS.includes(options.framework)) {
    throw new Error('Unsupported framework: ' + options.framework + '. Supported values: ' + SUPPORTED_FRAMEWORKS.join(', '));
  }

  if (options.commitLanguage && !SUPPORTED_COMMIT_LANGUAGES.includes(options.commitLanguage)) {
    throw new Error('Unsupported commit language: ' + options.commitLanguage + '. Supported values: ' + SUPPORTED_COMMIT_LANGUAGES.join(', '));
  }

  if (options.testingApproach && !SUPPORTED_TESTING_APPROACHES.includes(options.testingApproach)) {
    throw new Error('Unsupported testing approach: ' + options.testingApproach + '. Supported values: ' + SUPPORTED_TESTING_APPROACHES.join(', '));
  }
}

function printHelp() {
  console.log('Usage: agent-scaffold [target-dir] [options]');
  console.log('');
  console.log('Options:');
  console.log('  --project-name <name>');
  console.log('  --framework <' + SUPPORTED_FRAMEWORKS.join('|') + '>');
  console.log('  --commit-language <' + SUPPORTED_COMMIT_LANGUAGES.join('|') + '>');
  console.log('  --testing-approach <' + SUPPORTED_TESTING_APPROACHES.join('|') + '>');
  console.log('  --coordinator');
  console.log('  --no-coordinator');
  console.log('  --overwrite');
  console.log('  --yes');
  console.log('  --quiet');
  console.log('  --output-json');
  console.log('  --help');
}

module.exports = {
  main,
  parseArgs,
  normalizeAnswers,
  validateOptions,
};
