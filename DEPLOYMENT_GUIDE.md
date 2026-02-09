# CHROMARA HQ - DEPLOYMENT GUIDE
## Get This Live in 30 Minutes

Follow these steps exactly. Don't skip any!

---

## STEP 1: Download & Setup (5 minutes)

### 1.1 Download the Code
The code is ready in `/home/claude/chromara-hq/`. 

**If you're using Claude Code:**
All files are already in the computer environment.

**To get them to your local machine:**
Copy the entire `chromara-hq` folder to your local computer.

### 1.2 Open in Your Code Editor
```bash
cd chromara-hq
code .  # Opens in VS Code (or use your preferred editor)
```

### 1.3 Install Dependencies
```bash
npm install
```

This will install all packages. Takes 2-3 minutes.

---

## STEP 2: Set Up Database (5 minutes)

### 2.1 Go to Supabase SQL Editor
1. Open: https://supabase.com/dashboard/project/oumfcljsrffhswboeolq
2. Click **"SQL Editor"** in left sidebar
3. Click **"New Query"**

### 2.2 Run the Database Schema
1. Open the file `database-schema.sql` in your code editor
2. Copy ALL the code (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **"Run"** (bottom right corner)
5. Wait for green "Success" message

**You should see:**
```
Success. No rows returned
```

This means all tables were created successfully!

### 2.3 Verify Tables Were Created
1. In Supabase, click **"Table Editor"** (left sidebar)
2. You should see these tables:
   - pages
   - outreach_contacts
   - content_ideas
   - platform_strategies
   - agent_logs

If you see all 5 tables, you're good! ✅

---

## STEP 3: Test Locally (5 minutes)

### 3.1 Start Development Server
```bash
npm run dev
```

### 3.2 Open in Browser
Go to: http://localhost:3000

You should see the beautiful Chromara HQ login screen with glassmorphic design!

### 3.3 Create Your Account
1. Click **"Create New Account"**
2. Email: `faith@chromarabeauty.com`
3. Password: (choose a strong password)
4. Click **"Create New Account"**

### 3.4 Confirm Email
1. Check your email inbox
2. Look for email from Supabase
3. Click the confirmation link
4. **IMPORTANT:** After clicking, go BACK to http://localhost:3000
5. Enter your email and password
6. Click **"Sign In"**

### 3.5 You're In!
You should now see:
- Chromara HQ dashboard
- Sidebar with navigation
- Home dashboard with metrics
- 30-day sprint tracker
- Agent activity feed

**If you see all of this, your local setup works perfectly!** ✅

---

## STEP 4: Push to GitHub (5 minutes)

### 4.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial Chromara HQ setup with AI agents"
```

### 4.2 Push to Your Repo
```bash
git remote add origin https://github.com/fbinkholder/chromara-hq.git
git branch -M main
git push -u origin main
```

**Check GitHub:**
Go to https://github.com/fbinkholder/chromara-hq
You should see all your files!

---

## STEP 5: Deploy to Vercel (10 minutes)

### 5.1 Go to Vercel
1. Open: https://vercel.com
2. Sign in (you already have an account)
3. Click **"Add New..."** → **"Project"**

### 5.2 Import GitHub Repo
1. Find "chromara-hq" in the list
2. Click **"Import"**

### 5.3 Configure Project
Vercel will auto-detect Next.js. Leave these as default:
- Framework Preset: Next.js ✅
- Root Directory: ./
- Build Command: (auto)
- Output Directory: (auto)

### 5.4 Add Environment Variables
**CRITICAL:** Click **"Environment Variables"** and add these:

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://oumfcljsrffhswboeolq.supabase.co`

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91bWZjbGpzcmZmaHN3Ym9lb2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODkxNjYsImV4cCI6MjA4NjA2NTE2Nn0.hNg7qNBm0LbFDRaYzD85ZOwcsG7FdpsdlZ7_mk2uEl8`

**Variable 3:**
- Name: `RESEND_API_KEY`
- Value: `re_NBYXtusP_M7xNUdnAW4GDpedpMwewPEDP`

**Variable 4:**
- Name: `APOLLO_API_KEY`
- Value: `PyiKKiHKvyIzWY-ECN5lrw`

**Variable 5:**
- Name: `NEXT_PUBLIC_APP_URL`
- Value: Leave blank for now (we'll update after deployment)

### 5.5 Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Watch the build logs (it's fun!)
4. When you see "Congratulations!" with confetti, you're LIVE! 🎉

### 5.6 Get Your Live URL
Vercel will give you a URL like:
```
https://chromara-hq.vercel.app
```

**Copy this URL!**

### 5.7 Update Environment Variable
1. In Vercel, go to your project
2. Click **"Settings"** → **"Environment Variables"**
3. Find `NEXT_PUBLIC_APP_URL`
4. Click **"Edit"**
5. Paste your live URL: `https://chromara-hq.vercel.app`
6. Click **"Save"**
7. Click **"Redeploy"** (top right)

---

## STEP 6: Test Live Site (2 minutes)

### 6.1 Open Your Live URL
Go to: `https://chromara-hq.vercel.app`

### 6.2 Login
Use the same email/password you created earlier.

### 6.3 You're Live!
Your Chromara HQ is now live on the internet! 🚀

---

## TROUBLESHOOTING

### "Can't connect to database"
- Did you run `database-schema.sql` in Supabase?
- Check environment variables in Vercel settings

### "Invalid login"
- Did you click the email confirmation link?
- Check spam folder for Supabase email

### "Build failed"
- Check Vercel build logs for specific error
- Make sure all 5 environment variables are set correctly

### "Page not found"
- Make sure you pushed all files to GitHub
- Check that Vercel is connected to the right repo

---

## NEXT STEPS (This Week)

**Tuesday:** I'll build the Partnership Outreach pages
**Wednesday:** I'll build the Research Agent
**Thursday:** I'll build the Social Media Agent
**Friday:** I'll build the Outreach Agent
**Weekend:** First agent run! 🤖

---

## YOU DID IT! 🎉

Your custom Chromara HQ is now live with:
- ✅ Beautiful glassmorphic UI with your branding
- ✅ Secure authentication
- ✅ Database ready for all your data
- ✅ Foundation for AI agents
- ✅ Fully responsive (works on phone)
- ✅ Ready to scale

**Bookmark your live URL and start exploring!**

Questions? Just ask me and I'll help debug.

---

*Built in one conversation with Claude Code*
*Deployed faster than ordering pizza 🍕*
