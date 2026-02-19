# Changelog

All notable changes to Sales Room are documented in this file.

## [Unreleased]

### Added
- Vitest test suite setup (in progress)

## [0.5.0] - 2026-02-17

### Fixed
- **Race condition prevention** - Concurrent message processing guard prevents duplicate submissions
- Enhanced error handling with ApiError typing
- Input validation improvements
- Security hardening throughout the app

## [0.4.0] - 2026-02-16

### Added
- Performance optimizations for deal queries and chat rendering
- Security utilities module (`src/utils/security.ts`)
- Performance monitoring utilities (`src/utils/performance.ts`)
- Custom error types (`src/types/errors.ts`)

### Fixed
- All ESLint errors resolved (53 fixes)
- Type safety improvements across components

## [0.3.0] - 2026-02-12

### Added
- **Monaco design aesthetic** - Sleek, modern UI styling
- Slack routing for human handoff
- Vercel deployment optimization

### Fixed
- Root base path for Vercel deployment
- Removed prospect-facing qualification display (internal only)

## [0.2.0] - 2026-02-10

### Added
- Company enrichment component
- Transcript viewing and management
- Guided prompts for conversation starters
- Mobile-responsive design

## [0.1.0] - 2026-02-05

### Added
- Initial release
- AI-powered sales chat interface
- Real-time chat with typing indicators
- Connect integration for human handoff
- Brand customization support

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.5.0 | 2026-02-17 | Race condition fix, security |
| 0.4.0 | 2026-02-16 | Performance, ESLint cleanup |
| 0.3.0 | 2026-02-12 | Monaco design, Vercel |
| 0.2.0 | 2026-02-10 | Enrichment, transcripts |
| 0.1.0 | 2026-02-05 | Initial release |
