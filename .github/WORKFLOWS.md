# GitHub Actions Setup

This repository uses GitHub Actions for continuous integration and automated releases, replacing the manual `semantic-release` workflow that was configured in `.releaserc.json`.

## Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on:

- Pull requests to `main`
- Pushes to non-main branches

Steps:

1. Lint the code (`npm run lint`)
2. Check formatting (`npm run format-check`)
3. Build the project (`npm run build`)

### Release Workflow (`.github/workflows/release.yml`)

Runs on:

- Pushes to `main` branch

Steps:

1. Analyzes commits using semantic-release to determine the next version
2. Updates version in `docker-compose.yml` and `docker-compose.dev.yml`
3. Generates/updates `CHANGELOG.md`
4. Commits changes back to the repository
5. Creates a GitHub release with release notes
6. Builds and pushes Docker images to Docker Hub with version tag and `latest` tag

## Required Secrets

To enable the release workflow, the following secrets must be configured in the repository settings:

### `GH_PAT` (Optional but Recommended)

- **Description**: GitHub Personal Access Token with `contents:write` permission
- **Purpose**: Allows the workflow to push commits back to the repository (for changelog and version updates)
- **Fallback**: If not set, falls back to `GITHUB_TOKEN` (automatically provided by GitHub)
- **How to create**:
  1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Generate new token with `repo` scope
  3. Add to repository secrets as `GH_PAT`

### `DOCKER_USERNAME` (Required)

- **Description**: Docker Hub username
- **Purpose**: Authenticate with Docker Hub to push images
- **Example**: `billos`

### `DOCKER_PASSWORD` (Required)

- **Description**: Docker Hub password or access token
- **Purpose**: Authenticate with Docker Hub to push images
- **How to create**: Use your Docker Hub password or create an access token at https://hub.docker.com/settings/security

## Semantic Release Configuration

The semantic release behavior is still controlled by `.releaserc.json`, which defines:

- Branch configuration (`main` only)
- Plugins used for commit analysis, changelog generation, git commits, GitHub releases, and Docker builds
- Version format and commit message templates

## Commit Message Format

To trigger releases, follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `fix:` - Patch release (0.0.x)
- `feat:` - Minor release (0.x.0)
- `BREAKING CHANGE:` or `!` - Major release (x.0.0)

Example:

```
feat: add new notification priority mapping

This adds support for custom priority levels in Gotify notifications.
```

## Migration from Manual Releases

Previously, releases were triggered manually using:

```bash
npm run release        # Run semantic-release
npm run release:dry    # Dry run to preview changes
```

Now, releases happen automatically on push to `main`, based on the commit messages since the last release.
