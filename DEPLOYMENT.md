# TagWeaver Pro - Deployment Guide

## Production Build

### 1. Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 2. Preview Production Build Locally

```bash
npm run preview
```

Opens the production build at `http://localhost:4173`

---

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Custom Domain** (Optional):
   - Go to Vercel Dashboard → Settings → Domains
   - Add `tagweaverpro.com` or your domain

**Vercel Config** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Environment Variables**:
   - Go to Site Settings → Build & Deploy → Environment
   - Add Supabase credentials

**Netlify Config** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub**:
   - Repository Settings → Pages
   - Source: `gh-pages` branch

**Note**: Add `base: '/repository-name/'` to `vite.config.ts` if not using custom domain.

---

### Option 4: Self-Hosted (VPS/Server)

1. **Build**:
   ```bash
   npm run build
   ```

2. **Upload `dist/` folder** to your server

3. **Nginx Config**:
   ```nginx
   server {
       listen 80;
       server_name tagweaverpro.com;
       root /var/www/tagweaver-pro/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Gzip compression
       gzip on;
       gzip_types text/css application/javascript application/json;
   }
   ```

4. **SSL Certificate** (Let's Encrypt):
   ```bash
   sudo certbot --nginx -d tagweaverpro.com
   ```

---

## Environment Variables

Create `.env.production`:

```env
VITE_SUPABASE_URL=https://zzwrhfnzcetzfbczxcqd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env` files to Git!

---

## Pre-Deployment Checklist

- [x] Update app name to "TagWeaver Pro"
- [x] Configure Supabase authentication
- [x] Test all features (upload, process, download, export)
- [x] Test free/basic/pro tier limits
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Add favicon and og-image
- [ ] Configure custom domain (optional)
- [ ] Setup analytics (Google Analytics, Plausible, etc.)
- [ ] Setup error tracking (Sentry, LogRocket, etc.)

---

## Post-Deployment

### 1. Configure Supabase for Production

- **Authentication** → **URL Configuration**
  - Add your production URL to "Site URL"
  - Add to "Redirect URLs"

### 2. Monitor Performance

- Check Lighthouse score
- Monitor Supabase usage
- Track user registrations

### 3. Backup Strategy

- Export Supabase database regularly
- Keep `.env` files secure

---

## Recommended: Vercel Deployment

**Fastest setup**:

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel dashboard
# 4. Done! Your app is live
```

**Advantages**:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on Git push
- ✅ Free tier available
- ✅ Easy custom domain setup

---

## Support

For issues or questions:
- Check Supabase logs: https://supabase.com/dashboard/project/zzwrhfnzcetzfbczxcqd/logs
- Review build logs in your deployment platform
