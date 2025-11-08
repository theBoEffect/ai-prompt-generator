# Changelog

All notable changes to Prompt-o-matic will be documented in this file.

## [Unreleased]

### Changed
- Migrated from npm to Yarn package manager
- Condensed README.md from 324 to 90 lines, moved detailed docs to separate files
- Updated Dockerfile to use Yarn
- Added favicon support

### Added
- `.yarnrc.yml` configuration for node_modules mode
- `public/` directory with favicon.png and logo.png
- Cloud Run deployment example in README

---

## How to Use This File

When making changes, add them under `[Unreleased]` in the appropriate category:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security fixes

When releasing a version, move items from `[Unreleased]` to a new version section with date.
