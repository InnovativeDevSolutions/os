# GitHub Actions Setup

This directory contains GitHub Actions workflows for the Forge OS project.

## Workflows

### `deploy-docs.yml` - Documentation Deployment

Automatically builds and deploys the Docus documentation site to GitHub Pages.

**Triggers:**
- Push to `master` branch with changes in `docus/**`
- Manual workflow dispatch

**What it does:**
1. Checks out the repository
2. Sets up Node.js 20
3. Installs dependencies from `docus/package.json`
4. Builds the static site with `npm run build`
5. Uploads the build artifact
6. Deploys to GitHub Pages

## GitHub Pages Setup

To enable GitHub Pages for this repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Source", select **GitHub Actions**
4. The documentation will be available at: `https://yourusername.github.io/forge_os/`

## Environment Variables

The workflow uses the following environment variable:

- `NUXT_APP_BASE_URL`: Set to `/forge_os/` for GitHub Pages deployment

## Testing Locally

To test the documentation locally before deploying:

```bash
cd docus
npm install
npm run dev
```

To build the static site locally:

```bash
cd docus
npm run build
```

The output will be in `docus/.output/public/`

## Troubleshooting

### Build Fails

- Check that `package-lock.json` exists in the `docus/` directory
- Verify all dependencies are listed in `package.json`
- Check Node.js version compatibility (workflow uses Node 20)

### Pages Not Deploying

- Ensure GitHub Pages is enabled in repository settings
- Check that the workflow has write permissions
- Verify the `pages` environment exists in repository settings

### Links Not Working

- Check that `NUXT_APP_BASE_URL` is set correctly in the workflow
- Verify `nuxt.config.ts` is using the base URL properly
- Ensure all internal links use relative paths

## Manual Deployment

You can manually trigger the deployment:

1. Go to **Actions** tab in your repository
2. Click on **Deploy Documentation** workflow
3. Click **Run workflow**
4. Select the `master` branch
5. Click **Run workflow**

## Development Workflow

1. Make changes to documentation in `docus/content/`
2. Test locally with `npm run dev`
3. Commit and push to `master` branch
4. GitHub Actions will automatically build and deploy
5. Check deployment status in the Actions tab
6. Visit your GitHub Pages URL to see the changes
