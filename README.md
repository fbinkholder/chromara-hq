# CHROMARA HQ - AI-Powered Operations Platform

Your custom operations headquarters with AI agents for partnership outreach, competitive intelligence, content management, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (already created)
- Vercel account (for deployment)
- API keys (you already have these)

### 1. Database Setup (5 minutes)

1. Go to your Supabase project: https://supabase.com/dashboard/project/oumfcljsrffhswboeolq
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `database-schema.sql`
5. Paste into the SQL editor
6. Click "Run" (bottom right)
7. Wait for "Success" message

**That's it!** Your database is now set up with all tables and security policies.

### 2. Install Dependencies (2 minutes)

```bash
cd chromara-hq
npm install
```

### 3. Run Locally (1 minute)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 4. Create Your Account

1. Click "Create New Account"
2. Enter your email: faith@chromarabeauty.com
3. Enter a password
4. Check your email for confirmation link
5. Click the link to verify
6. Go back to http://localhost:3000 and login

**You're in!** 🎉

## 📦 Deployment to Vercel (10 minutes)

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub (if not already done):
   ```bash
   git add .
   git commit -m "Initial Chromara HQ setup"
   git push origin main
   ```

2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repo: `chromara-hq`
5. Vercel will detect Next.js automatically
6. Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://oumfcljsrffhswboeolq.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[your anon key from .env.local]`
   - `RESEND_API_KEY` = `[your Resend key]`
   - `APOLLO_API_KEY` = `[your Apollo key]`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Done! Your live URL: `https://chromara-hq.vercel.app`

### Option 2: Deploy via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Follow the prompts and Vercel will deploy automatically.

## 🏗️ Project Structure

```
chromara-hq/
├── app/
│   ├── dashboard/          # Main dashboard pages
│   │   ├── page.tsx        # Home dashboard
│   │   ├── partnerships/   # Partnership outreach (coming soon)
│   │   ├── content/        # Content & social (coming soon)
│   │   ├── personal/       # Personal workspace (coming soon)
│   │   └── ...
│   ├── globals.css         # Chromara branding styles
│   └── layout.tsx          # Root layout
├── components/             # Reusable components (we'll add more)
├── lib/
│   └── supabase.ts         # Supabase client & types
├── public/                 # Static assets
├── database-schema.sql     # Database setup script
├── .env.local              # Environment variables (DON'T commit this)
└── package.json            # Dependencies
```

## 🎨 Chromara Branding

The platform uses your brand colors and glassmorphic design:

- **Purple**: `#8B5CF6`
- **Pink**: `#EC4899`
- **Blue**: `#3B82F6`
- **Lavender**: `#C4B5FD`
- **Glass effect**: Backdrop blur with white/10 opacity
- **Gradients**: Purple to pink

All components use `glass-card`, `glass-button`, and `glass-input` classes.

## 🤖 AI Agents (Coming This Week)

### Research Agent (Sunday mornings)
- COSMAX monitoring
- USPTO patent search
- Industry news aggregation
- Consumer insights scraping
- Trend detection
- Competitor analysis

### Social Media Agent
- Schedule posts (X/Twitter + blog)
- Track performance (all platforms)
- Analytics dashboard
- Engagement metrics

### Outreach Agent
- Find contacts via Apollo.io
- Write personalized emails
- Auto follow-ups (Day 3, 7, 14)
- Track responses
- Suggest replies

## 📋 Database Schema

All tables are automatically created when you run `database-schema.sql`:

- **pages** - All your docs, notes, brain dumps
- **outreach_contacts** - Partnership outreach tracker
- **content_ideas** - Content ideas bank with filters
- **platform_strategies** - Strategy per platform
- **agent_logs** - Audit trail of all agent actions

Row-level security enabled - only you can see your data.

## ☁️ Backup your entire project

**Code:** Push to GitHub regularly (`git push`) so your repo is in the cloud.

**Data:** Most data (campaigns, content, contacts, Content Review, etc.) already lives in Supabase. The rest (todos, Engineering boards, Reference links, etc.) is stored in your browser until you back it up.

- **Back up everything:** Open the **Home dashboard** and use **"Backup to cloud"** to save a snapshot of all Chromara data (including localStorage) to Supabase. Use **"Restore from cloud"** on any device to get it back.
- **One-time setup:** Run `supabase/backup_schema.sql` in the Supabase SQL Editor once so the backup table exists.
- **Full details:** See **[BACKUP.md](./BACKUP.md)** for what lives where and how to avoid losing data.

## 🔒 Security

- **Supabase Auth**: Industry-standard authentication
- **Row Level Security**: Each user can only access their own data
- **Environment variables**: API keys never exposed in code
- **HTTPS**: All traffic encrypted (automatic on Vercel)

## 🛠️ Development Workflow

### Adding New Pages

1. Create file in `app/dashboard/[section]/page.tsx`
2. Import components from `/components`
3. Use Supabase client for data
4. Style with Chromara classes

### Adding AI Agent Logic

Agents will live in `/app/api/agents/` as serverless functions. We'll build these together this week.

## 📱 Mobile Support

Fully responsive! Sidebar collapses to hamburger menu on mobile.

## 🐛 Troubleshooting

**"Can't connect to database"**
- Check that you ran `database-schema.sql` in Supabase
- Verify environment variables are correct

**"Auth error"**
- Make sure you clicked the email confirmation link
- Check your email spam folder

**"Build failed on Vercel"**
- Check that all environment variables are set
- Make sure you pushed all files to GitHub

## 📞 Need Help?

- Check Supabase dashboard for database issues
- Check Vercel dashboard for deployment logs
- All environment variables are in `.env.local` (keep this file secret!)

## ⚡ Next Steps (This Week)

1. **Today**: Deploy to Vercel, create account, explore dashboard
2. **Tuesday**: Build partnership outreach pages
3. **Wednesday**: Build Research Agent
4. **Thursday**: Build Social Media Agent
5. **Friday**: Build Outreach Agent
6. **Weekend**: First agent run!

---

**Built with ❤️ using Claude Code**
**Designed for Chromara's mission to revolutionize personalized beauty**
