#!/usr/bin/env node

/**
 * agent-scaffold CLI
 * Generate a standardized .agent/ directory for AI-assisted projects
 */

const path = require('path');
const fs = require('fs');
const generator = require('../src/generator');

const targetDir = process.argv[2] || process.cwd();
const agentDir = path.join(targetDir, '.agent');

if (fs.existsSync(agentDir)) {
  console.log('\nWarning: .agent/ directory already exists at:');
  console.log('   ' + agentDir + '\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Do you want to overwrite? (y/N): ', (answer) => {
    rl.close();
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      runGenerator(targetDir);
    } else {
      console.log('Aborted. No changes made.');
      process.exit(0);
    }
  });
} else {
  runGenerator(targetDir);
}

function runGenerator(targetDir) {
  console.log('\nagent-scaffold - Generate .agent/ directory\n');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const questions = [
    { key: 'projectName', question: 'Project name / Nama project: ', default: 'my-project' },
    { key: 'framework', question: 'Framework (laravel/codeigniter/nextjs/express/django/rails/generic): ', default: 'generic' },
    { key: 'commitLanguage', question: 'Commit message language (id/en): ', default: 'en' },
    { key: 'testingApproach', question: 'Testing approach (phpunit/jest/pytest/manual/none): ', default: 'manual' },
    { key: 'needCoordinator', question: 'Need Coordinator agent for multi-agent orchestration? (y/n): ', default: 'n' }
  ];

  const answers = {};
  let currentQuestion = 0;

  function askNext() {
    if (currentQuestion >= questions.length) {
      rl.close();
      answers.projectName = answers.projectName || 'my-project';
      answers.framework = answers.framework || 'generic';
      answers.commitLanguage = answers.commitLanguage || 'en';
      answers.testingApproach = answers.testingApproach || 'manual';
      answers.needCoordinator = answers.needCoordinator.toLowerCase() === 'y' || answers.needCoordinator.toLowerCase() === 'yes';
      generate(answers, targetDir);
      return;
    }

    const q = questions[currentQuestion];
    rl.question(q.question, (answer) => {
      answers[q.key] = answer.trim() || q.default;
      currentQuestion++;
      askNext();
    });
  }

  askNext();
}

function generate(answers, targetDir) {
  console.log('\nGenerating .agent/ directory...\n');
  
  try {
    const result = generator.generate(targetDir, answers);
    console.log('.agent/ directory created successfully!\n');
    console.log('Created:');
    result.files.forEach(f => console.log('  ' + f));
    console.log('\nNext steps:');
    console.log('  1. Read .agent/README.md to understand the structure');
    console.log('  2. Customize .agent/rules/core-rules.md with project-specific conventions');
    console.log('  3. Add domain knowledge to .agent/knowledge/');
    console.log('  4. Create tasks in .agent/tasks/tasks.md\n');
  } catch (error) {
    console.error('Error generating .agent/ directory: ' + error.message);
    process.exit(1);
  }
}