# Deployment Guide for Healiofy

## Vercel Deployment Checklist

This project is optimized for deployment on Vercel. Follow these steps to ensure a successful deployment:

### Before Deployment

1. ✅ Added `vercel.json` with proper MIME type configurations
2. ✅ Updated `public/_headers` with comprehensive MIME type definitions
3. ✅ Added `public/_redirects` for SPA routing
4. ✅ Optimized `vite.config.ts` for Vercel compatibility

### Environment Variables

Make sure the following environment variables are properly set in your Vercel project:

- `VITE_API_URL` - URL to your backend API

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure the project settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add necessary environment variables
4. Deploy!

### Post-Deployment Verification

After deployment, verify the following:

1. Check that JavaScript files are properly served with `Content-Type: application/javascript`
2. Verify that navigation works properly for deep links (SPA routing)
3. Confirm that the offline mode works properly with service workers
4. Test appointment cancellation functionality with network toggled off

### Troubleshooting

If you encounter MIME type issues:

1. Check the Network tab in browser DevTools to identify which files have incorrect MIME types
2. Verify that the content-type headers in `vercel.json` match your file types
3. For persistent issues, consider adding specific routes in `vercel.json`

## Database Synchronization

The app includes offline-first functionality with database synchronization for appointment changes:

- Changes made offline are stored in localStorage
- When connection is restored, changes are automatically synchronized with the database
- Sync status indicators show pending changes and sync progress

## Additional Deployment Platforms

### Netlify

If deploying to Netlify instead:

1. Use the existing `public/_redirects` file for SPA routing
2. Create a `netlify.toml` file for additional configuration if needed
3. Environment variables should be configured in the Netlify dashboard

### AWS Amplify

If deploying to AWS Amplify:

1. Use the existing Vite configuration
2. Create an `amplify.yml` file if needed for build settings
3. Configure rewrites and redirects in the Amplify console 