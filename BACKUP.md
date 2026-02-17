# Chromara HQ – Backup & where your data lives

## Your project in two parts

### 1. **Code (the app itself)**  
- **Where:** Your repo (e.g. `chromara-hq` on GitHub).  
- **Backup:** Push to GitHub regularly so the codebase is in the cloud.  
  - `git push origin main`  
- If you lose your laptop, clone the repo and you have the full project again.

### 2. **Data (everything you create in the app)**  
- **Where:** Split between **Supabase (cloud)** and **browser localStorage (this device only)**.  
- **Backup:** See below.

---

## Data already in the cloud (Supabase)

These are stored in Supabase and survive clearing the browser, new devices, and (with Supabase’s own backups) disasters:

| Area | Tables / storage |
|------|-------------------|
| **Auth** | Who’s logged in (Supabase Auth) |
| **Home dashboard** | (Todos are still localStorage – use Backup to cloud to save them) |
| **Marketing** | `content_calendar`, `campaigns`, `ambassadors`, `kpis` |
| **Competitive intel** | `market_intelligence`, `patent_filings` |
| **Content & social** | `content_ideas`, `hashtag_library`, `keyword_library`, `platform_strategies`, `social_posts` |
| **Campaigns** | `campaigns` |
| **Partnerships / Agents** | `outreach_contacts`, `sent_emails` |
| **Ops → Content Review** | `content_review_assets`, `content_review_comments` |
| **Uploads** | Storage bucket `chromara-assets` |

So: **most of your “real” data is already in the cloud** in Supabase.

---

## Data only on this device (localStorage)

These live only in your browser until you run **“Backup to cloud”**:

| Where in the app | What’s stored locally |
|------------------|------------------------|
| **Home dashboard** | Todo list (`chromara-todos`) |
| **Agents hub** | Activity log, schedule |
| **Engineering** (all 4 pages) | Status cards, updates, timeline, docs; systems/roadmap/tech stack; components/specs; initiatives/R&D |
| **Reference** (Coding, Marketing, Design, etc.) | Resource links, prompts, image-gen resources |
| **Personal → Files** | File list and metadata |

If you clear site data or switch browsers/devices, this data is gone **unless** you’ve backed it up (see below).

---

## How to back up the entire project

### Code  
- Push to GitHub regularly:  
  `git add . && git commit -m "Update" && git push origin main`

### Data in Supabase  
- Already in the cloud.  
- Optional: Supabase Dashboard → Database → use exports, or enable Pro backups if you want point-in-time recovery.

### Data in localStorage (Backup to cloud)  
1. Run the backup schema once in Supabase (if you haven’t):  
   - Open **Supabase → SQL Editor**, run the contents of **`supabase/backup_schema.sql`**.
2. In the app, open the **Home dashboard**.
3. Use the **“Back up my data”** card: click **“Backup to cloud”**.  
   - This saves a snapshot of all Chromara localStorage (todos, engineering, reference, agents, personal files, etc.) into Supabase under your user.
4. To get it back on this device or another: click **“Restore from cloud”**.  
   - This overwrites current localStorage with the last backup. Reload the app to see restored data.

So: **“Backup to cloud” = save a copy of everything (including localStorage) to Supabase. “Restore from cloud” = replace this device’s localStorage with that saved copy.**

---

## One-time SQL to enable backup

Run this in **Supabase → SQL Editor** (once per project):

- **`supabase/backup_schema.sql`** – creates `user_cloud_backup` and RLS so only you can read/write your backup.

After that, the Backup/Restore buttons on the Home dashboard will work.

---

## Summary

| What | Where it lives | How to back up |
|------|----------------|----------------|
| **Code** | Git repo (e.g. GitHub) | `git push` regularly |
| **Supabase data** | Cloud (Supabase) | Already backed up there; optional DB exports/Pro backups |
| **localStorage data** | This browser only | Use **“Backup to cloud”** on the Home dashboard |

Doing **Git push** + **“Backup to cloud”** periodically gives you a full backup of the entire project (code + all app data).
