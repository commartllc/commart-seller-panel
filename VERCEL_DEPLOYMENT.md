# Vercel Deployment Guide

This guide walks you through deploying the Commart Seller Panel to Vercel.

## Prerequisites

- A Vercel account (free tier works)
- GitHub repository with the project code
- Supabase project with tables configured
- n8n instance (optional)

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `commartllc/commart-seller-panel`
4. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In the Vercel project settings, add the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `N8N_WEBHOOK_PRODUCT_UPDATE` | n8n webhook URL for product events | No |
| `N8N_WEBHOOK_ORDER_UPDATE` | n8n webhook URL for order events | No |

### 3. Deploy

Click "Deploy" and wait for the build to complete.

## Environment Variables Setup

### Getting Supabase Credentials

1. Go to your Supabase dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### Setting Up n8n Webhooks

1. Create a new workflow in n8n
2. Add a Webhook trigger node
3. Copy the webhook URL
4. Use it for `N8N_WEBHOOK_PRODUCT_UPDATE` or `N8N_WEBHOOK_ORDER_UPDATE`

## Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed by Vercel

## Troubleshooting

### Build Fails

- Check that all environment variables are set correctly
- Verify TypeScript types are correct
- Check the build logs for specific errors

### Authentication Issues

- Ensure Supabase URL and keys are correct
- Add your Vercel domain to Supabase Auth → URL Configuration → Site URL
- Add redirect URLs in Supabase Auth settings

### Database Connection Issues

- Verify Supabase is not paused
- Check Row Level Security policies
- Ensure tables are created with correct schema

## Post-Deployment Checklist

- [ ] Verify login works
- [ ] Test product CRUD operations
- [ ] Confirm order status updates work
- [ ] Check finance page loads data
- [ ] Test store settings save correctly
- [ ] Verify n8n webhooks trigger (if configured)

## Automatic Deployments

Vercel automatically deploys when you push to the main branch. To disable:

1. Go to Project Settings → Git
2. Toggle off "Auto-Deploy"

## Preview Deployments

Pull requests automatically get preview deployments. Share the preview URL for testing before merging.

## Performance Optimization

The app is already optimized for Vercel with:

- Server-side rendering for initial page loads
- API routes for data fetching
- Automatic code splitting
- Image optimization

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Use Row Level Security in Supabase
- Validate all user input on the server
- Keep dependencies updated

## Support

For issues:
- Check Vercel deployment logs
- Review Supabase logs in the dashboard
- Open an issue on GitHub
