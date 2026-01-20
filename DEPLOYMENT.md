# Deployment Guide - Forge OS Documentation

This guide explains how to deploy the Forge OS documentation to GitHub Pages.

## Prerequisites

- GitHub repository with the Forge OS codebase
- Node.js 20 or higher installed locally (for testing)
- GitHub Pages enabled in repository settings

## Quick Start

The documentation is automatically deployed when you push changes to the `master` branch.

### First-Time Setup

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **GitHub Actions**
   - Save the settings

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Add documentation"
   git push origin master
   ```

3. **Monitor deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the "Deploy Documentation" workflow
   - Once complete, visit: `https://yourusername.github.io/forge_os/`

That's it! Your documentation is now live.

## Local Development

### Install Dependencies

```bash
cd docus
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your documentation.

### Build for Production

```bash
npm run build
```

The static site will be generated in `docus/.output/public/`

## Making Changes

### Edit Documentation

1. Navigate to `docus/content/`
2. Edit markdown files as needed
3. Test locally with `npm run dev`
4. Commit and push changes

```bash
git add docus/content/
git commit -m "Update documentation"
git push origin master
```

### Add New Pages

1. Create a new `.md` file in `docus/content/`
2. Add frontmatter with title and description
3. Write your content in Markdown
4. Commit and push

Example:
```markdown
---
seo:
  title: My New Page
  description: Description of my page
---

# My New Page

Content here...
```

## Automatic Deployment

The documentation deploys automatically when:

- You push changes to the `master` branch
- Changes are in the `docus/**` directory
- The `.github/workflows/deploy-docs.yml` file is modified

### Workflow Triggers

```yaml
on:
  push:
    branches:
      - master
    paths:
      - 'docus/**'
```

You can also trigger deployment manually:

1. Go to **Actions** → **Deploy Documentation**
2. Click **Run workflow**
3. Select `master` branch
4. Click **Run workflow**

## GitHub Pages Configuration

### Repository Settings

Your repository must have these settings:

1. **GitHub Pages enabled** (Settings → Pages)
2. **Source set to GitHub Actions**
3. **Workflow permissions** (Settings → Actions → General):
   - Read and write permissions enabled
   - Allow GitHub Actions to create and approve pull requests

### Base URL Configuration

The documentation uses a base URL of `/forge_os/` for GitHub Pages.

This is configured in `docus/nuxt.config.ts`:
```typescript
app: {
  baseURL: process.env.NODE_ENV === 'production' ? '/forge_os/' : '/',
  buildAssetsDir: '/_nuxt/'
}
```

The workflow sets `NODE_ENV=production` during build, which automatically activates the base URL.

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to `docus/public/`
2. Configure DNS settings for your domain
3. Update GitHub Pages settings

## Troubleshooting

### Build Fails

**Problem**: Workflow fails during build step

**Solutions:**
- Check the Actions tab for error logs
- Verify `package.json` has all dependencies
- Ensure `package-lock.json` is committed
- Test build locally: `npm run build`

### 404 Errors on GitHub Pages

**Problem**: Pages show 404 errors

**Solutions:**
- Verify GitHub Pages is enabled
- Check that workflow completed successfully
- Wait a few minutes for DNS propagation
- Ensure base URL is set correctly

### Styles Not Loading

**Problem**: Page loads but has no styling

**Solutions:**
- Check browser console for 404 errors
- Verify `NUXT_APP_BASE_URL` is set correctly
- Clear browser cache
- Check that CSS files are in build output

### Outdated Content

**Problem**: Changes don't appear on live site

**Solutions:**
- Hard refresh browser (Ctrl+Shift+R)
- Clear GitHub Pages cache
- Check workflow ran successfully
- Verify changes were committed to `master`

## Monitoring Deployments

### Check Deployment Status

1. Go to **Actions** tab
2. Find the latest "Deploy Documentation" run
3. Check each step for success/failure
4. View logs for detailed information

### Deployment URL

Once deployed, your documentation is available at:

```
https://yourusername.github.io/forge_os/
```

Replace `yourusername` with your GitHub username or organization name.

## Rollback

To rollback to a previous version:

1. Find the commit with the working version
2. Revert or reset to that commit
3. Push to master

```bash
# Option 1: Revert specific commit
git revert <commit-hash>
git push origin master

# Option 2: Reset to specific commit (use with caution)
git reset --hard <commit-hash>
git push origin master --force
```

## Performance Tips

### Optimize Build Time

- Keep `node_modules` cached (workflow does this automatically)
- Minimize dependencies in `package.json`
- Use static images when possible

### Optimize Page Load

- Compress images before adding to documentation
- Keep markdown files focused and concise
- Use relative links for internal pages

## Directory Structure

```
forge_os/
├── .github/
│   ├── workflows/
│   │   └── deploy-docs.yml       # Deployment workflow
│   └── README.md                 # Workflow documentation
├── docus/
│   ├── content/                  # Documentation files
│   ├── public/                   # Static assets
│   ├── .gitignore               # Git ignore rules
│   ├── nuxt.config.ts           # Nuxt configuration
│   ├── package.json             # Dependencies
│   └── package-lock.json        # Locked dependencies
└── DEPLOYMENT.md                # This file
```

## Support

If you encounter issues:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review [Docus documentation](https://docus.com)
3. Check [Nuxt documentation](https://nuxt.com)
4. Review workflow logs in the Actions tab

## Summary

✅ **Setup**: Enable GitHub Pages, set source to GitHub Actions  
✅ **Develop**: Edit files in `docus/content/`, test with `npm run dev`  
✅ **Deploy**: Push to master, workflow runs automatically  
✅ **Monitor**: Check Actions tab for deployment status  
✅ **Access**: Visit `https://yourusername.github.io/forge_os/`  

Your documentation is now live and will update automatically with every push! 🚀
