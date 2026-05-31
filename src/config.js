const SUPPORTED_FRAMEWORKS = [
  'laravel',
  'codeigniter',
  'nextjs',
  'express',
  'django',
  'rails',
  'generic'
];

const DEFAULTS = {
  projectName: 'my-project',
  framework: 'generic',
  commitLanguage: 'en',
  testingApproach: 'manual',
  needCoordinator: false,
  overwrite: false,
};

const SUPPORTED_COMMIT_LANGUAGES = ['id', 'en'];
const SUPPORTED_TESTING_APPROACHES = ['phpunit', 'jest', 'pytest', 'manual', 'none'];

function getFrameworkPrompt() {
  return `Framework (${SUPPORTED_FRAMEWORKS.join('/')}): `;
}

module.exports = {
  DEFAULTS,
  SUPPORTED_FRAMEWORKS,
  SUPPORTED_COMMIT_LANGUAGES,
  SUPPORTED_TESTING_APPROACHES,
  getFrameworkPrompt,
};
