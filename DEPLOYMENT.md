# GitHub Pages Deployment Checklist

## Pre-deployment Checklist

- [x] Vite build configuration is properly set up with `base: '/sret/'` (for GitHub Pages)
- [x] Custom domain is configured in CNAME file
- [x] CSS and JavaScript files are optimized
- [x] All scripts are using `type="module"`
- [x] 404 page is created
- [x] GitHub Actions workflow is set up
- [x] SEO meta tags are added
- [x] Favicon and site manifest are configured

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

The site will automatically deploy when you push to the main branch.

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Actions will automatically build and deploy your site.

### Method 2: Manual Deployment

If you need to deploy manually:

```bash
npm run deploy
```

This will build the site and deploy it to the `gh-pages` branch.

## Custom Domain Setup

1. Your CNAME file is set to: `sret.tr`
2. Make sure to configure your domain DNS settings:
   - Add an A record pointing to GitHub Pages IP addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or add a CNAME record pointing to `0xberkay.github.io`

## Post-Deployment Verification

After deployment, verify:

1. Site loads correctly at https://sret.tr
2. All JavaScript functionality works
3. Custom domain is properly configured
4. HTTPS is working
5. 404 page works for non-existent routes

## Troubleshooting

If you encounter issues:

1. Check GitHub Pages settings in your repository settings
2. Verify DNS configuration is correct
3. Check GitHub Actions logs for any build errors
4. Try a manual deployment with `npm run deploy`
