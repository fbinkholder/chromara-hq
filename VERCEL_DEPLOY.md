# Deploy Chromara HQ to Vercel (GitHub)

## 1. Push your code to GitHub

In the project folder, run:

```bash
# Add GitHub remote (only needed once)
git remote add origin https://github.com/fbinkholder/chromara-hq.git

# Stage all changes (.env.local is gitignored)
git add .
git commit -m "Prepare for Vercel deploy: glass-input fix, Apollo API"

# Push to GitHub
git push -u origin main
```

If GitHub asks for auth, use a [Personal Access Token](https://github.com/settings/tokens) or SSH.

---

## 2. Deploy with Vercel

1. **Sign in**  
   Go to [vercel.com](https://vercel.com) and sign in with **GitHub**.

2. **Import project**  
   - Click **Add New…** → **Project**.  
   - Select **Import Git Repository** and choose **fbinkholder/chromara-hq**.  
   - If you don’t see it, click **Configure GitHub App** and grant Vercel access to the repo.

3. **Configure project**  
   - **Framework Preset:** Vercel should detect **Next.js**.  
   - **Root Directory:** leave as `.` (project root).  
   - **Build Command:** `next build` (default).  
   - **Output Directory:** leave default.  
   - Click **Deploy**.

4. **Add environment variables**  
   After the first deploy, go to your project → **Settings** → **Environment Variables**.  
   Add the same variables you have in `.env.local` (e.g. Supabase URL/anon key, Resend, Apollo, etc.) for **Production** (and Preview if you use it).  
   Never commit `.env.local`; Vercel uses the values you set in the dashboard.

5. **Redeploy**  
   After saving env vars, go to **Deployments** → … on the latest deployment → **Redeploy** so the build uses the new variables.

---

## 3. After deploy

- Your app will be at `https://chromara-hq-xxx.vercel.app` (or your custom domain).  
- Every push to `main` will trigger a new deployment.  
- Check **Deployments** and **Functions** (for API routes like `/api/apollo/search`) if something fails.

Repo: [github.com/fbinkholder/chromara-hq](https://github.com/fbinkholder/chromara-hq)
