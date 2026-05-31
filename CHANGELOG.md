# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05-31

### Added
- Added basic automated tests for generator output and overwrite behavior.
- Added framework-specific developer instructions for Laravel, CodeIgniter, Next.js, Express, Django, Rails, and Generic projects.
- Added centralized CLI configuration for supported frameworks, defaults, and validation.
- Added non-interactive CLI flags for project name, framework, commit language, testing approach, coordinator mode, and overwrite behavior.
- Added automation-friendly CLI modes with `--quiet` and `--output-json`.
- Added end-to-end CLI integration tests for help text, JSON output, and quiet mode.

### Changed
- Standardized generated instruction templates to English.
- Cleaned corrupted template content and fixed invalid Markdown blocks.
- Aligned overwrite behavior with the CLI prompt by fully replacing the existing `.agent/` directory when confirmed.
- Improved CLI validation errors to suggest valid values and usage help.
- Updated README and skill documentation to reflect current generator and CLI behavior.

### Fixed
- Fixed unresolved template placeholders in generated output.
- Fixed stale scaffold files remaining after overwrite.
- Fixed CLI import side effects during test execution.
