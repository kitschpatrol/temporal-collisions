# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Maintenance

- Refresh development dependencies and GitHub Actions, including shared-config 8.14, tsdown, Vitest, Wrangler, and pnpm 12.16.1; remove obsolete release-age exemptions.
- Use pnpm-managed contributor skills and remove the separate `skills` CLI and `prepare` hook.
- Change automated dependency updates from a weekly to a monthly schedule.
- Pass `FLICKR_API_KEY` to dependency-update automation so its live Flickr tests have credentials.
- Correct the ESLint archive exclusion and allow ESLint 10 with `eslint-plugin-jsx-a11y`.
- Exclude loopback addresses from link checks and tolerate inputs containing no links.

## [1.0.4] - 2026-10-06

### Documentation

- Document that module usage requires the `FLICKR_API_KEY` environment variable and throws when it is missing.

### Maintenance

- Update contributor tooling to pnpm 12 and Vitest 5, refresh shared-config, tsdown, and Wrangler, remove unused Lodash typings, and declare Node.js `^24.16.0 || >=26.3.0`.
- Add install-time synchronization of contributor skills and rename the cleanup script to `clean-deep`.
- Add a weekly workflow for automated dependency-update pull requests.
- Tighten release tag matching, require release tags to belong to the default branch, and pin release and repository-metadata actions to commit SHAs.
- Improve website link checks with HTML sitemap discovery, pinned extraction tools, and support for `lychee.toml`.

## [1.0.3] - 2026-07-27

### Added

- Find recent Flickr photos from at least three distinct photographers, exclude unreliable capture timestamps, and return the largest collision group with photo URLs, titles, and search metadata.
- Configure the target date, search budget (15 seconds by default), and capture-time grouping (three-second buckets by default, or exact matching with `maxDistanceSeconds: 0`).
- Select image URLs using minimum width and height preferences, falling back to the largest available image.
- Export async `getTemporalCollisions()` as an ES module with TypeScript declarations; require `FLICKR_API_KEY` and report errors for missing credentials or searches without collisions.
- Serve a stateless Cloudflare API at `/api/temporal-collisions` with numeric/date query validation, JSON success/error responses, cross-origin access, and a 60-second search-budget cap.

### Documentation

- Provide HTTP request/response and module usage examples, explain the search-time cap and unpublished package status, and document the preserved 2009 PHP implementation.

### Maintenance

- Establish Node.js 24.16+, pnpm, tsdown builds, shared linting, Vitest integration tests, and cross-platform CI, link-checking, and release workflows.
- License the project under CC-BY-NC-SA-4.0.

[Unreleased]: https://github.com/kitschpatrol/temporal-collisions/compare/v1.0.4...HEAD
[1.0.3]: https://github.com/kitschpatrol/temporal-collisions/releases/tag/v1.0.3
[1.0.4]: https://github.com/kitschpatrol/temporal-collisions/compare/v1.0.3...v1.0.4
