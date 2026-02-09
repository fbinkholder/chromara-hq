# CHROMARA HQ - DEPLOYMENT CHECKLIST

Print this out or keep it open while you deploy!

---

## BEFORE YOU START
- [ ] Coffee/tea ready ☕
- [ ] 30 minutes of uninterrupted time
- [ ] Code editor open (VS Code recommended)
- [ ] Terminal ready

---

## STEP 1: DATABASE SETUP (5 min)
- [ ] Go to Supabase: https://supabase.com/dashboard/project/oumfcljsrffhswboeolq
- [ ] Click "SQL Editor"
- [ ] Click "New Query"
- [ ] Copy ALL of `database-schema.sql`
- [ ] Paste into SQL editor
- [ ] Click "Run"
- [ ] See "Success" message ✅
- [ ] Click "Table Editor"
- [ ] Verify 5 tables exist (pages, outreach_contacts, content_ideas, platform_strategies, agent_logs)

---

## STEP 2: LOCAL SETUP (5 min)
- [ ] Open terminal
- [ ] `cd chromara-hq`
- [ ] `npm install` (wait 2-3 minutes)
- [ ] `npm run dev`
- [ ] Open http://localhost:3000
- [ ] See Chromara HQ login screen 🎨

---

## STEP 3: CREATE ACCOUNT (3 min)
- [ ] Click "Create New Account"
- [ ] Email: faith@chromarabeauty.com
- [ ] Password: [choose strong password]
- [ ] Click "Create New Account"
- [ ] Check email inbox
- [ ] Click confirmation link
- [ ] Go back to http://localhost:3000
- [ ] Login with email + password
- [ ] See dashboard ✅

---

## STEP 4: GITHUB PUSH (5 min)
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial Chromara HQ setup"`
- [ ] `git remote add origin https://github.com/fbinkholder/chromara-hq.git`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`
- [ ] Go to https://github.com/fbinkholder/chromara-hq
- [ ] Verify all files are there ✅

---

## STEP 5: VERCEL DEPLOY (10 min)
- [ ] Go to https://vercel.com
- [ ] Click "Add New..." → "Project"
- [ ] Import "chromara-hq" repo
- [ ] Click "Deploy" (Vercel auto-detects Next.js)
- [ ] Add 5 environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` = https://oumfcljsrffhswboeolq.supabase.co
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [from .env.local]
  - [ ] `RESEND_API_KEY` = [from .env.local]
  - [ ] `APOLLO_API_KEY` = [from .env.local]
  - [ ] `NEXT_PUBLIC_APP_URL` = [leave blank for now]
- [ ] Click "Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] See "Congratulations!" 🎉
- [ ] Copy your live URL

---

## STEP 6: UPDATE & REDEPLOY (2 min)
- [ ] In Vercel, go to Settings → Environment Variables
- [ ] Edit `NEXT_PUBLIC_APP_URL`
- [ ] Paste your live URL
- [ ] Click "Save"
- [ ] Click "Redeploy" (top right)
- [ ] Wait 1 minute

---

## STEP 7: TEST LIVE SITE (2 min)
- [ ] Open your live URL
- [ ] Login with email + password
- [ ] See dashboard ✅
- [ ] Click through sidebar sections
- [ ] Everything works! 🚀

---

## YOU'RE LIVE! 🎉

**Live URL:** ______________________________

**Login:** faith@chromarabeauty.com

**Password:** ______________________________

---

## WHAT YOU BUILT TODAY

✅ Custom operations HQ with Chromara branding
✅ Secure authentication
✅ Database with 5 tables
✅ Dashboard with metrics
✅ 30-day sprint tracker
✅ Foundation for AI agents
✅ Fully responsive design
✅ Live on the internet

---

## WHAT'S NEXT

**Tuesday:** Partnership outreach pages
**Wednesday:** Research Agent
**Thursday:** Social Media Agent
**Friday:** Outreach Agent
**Weekend:** First agent run!

---

## TROUBLESHOOTING

**Problem:** Can't login
**Solution:** Did you click email confirmation link?

**Problem:** Database error
**Solution:** Did you run database-schema.sql?

**Problem:** Vercel build failed
**Solution:** Check all 5 environment variables are set

**Problem:** Page not found
**Solution:** Make sure all files are pushed to GitHub

---

**Questions?** Just ask me and I'll debug with you!

**Celebrate!** You just built and deployed a custom SaaS platform in 30 minutes. 🎊
