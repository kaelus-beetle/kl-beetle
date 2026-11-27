# KL BEETLE website

Next.js + Supabase starter for the KL BEETLE breeder site.

## 1. Supabase environment variables

Create a `.env.local` file in the project root (copy `.env.example`) and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your Publishable key)

Never put a Supabase Secret/service_role key in this project.

## 2. Supabase setup

The project assumes these tables already exist:

### products
`id` (primary key), `created_at` (timestamptz default now), `title` (text), `description` (text), `price` (text), `image_url` (text), `category` (text), `is_sold` (bool default false).

### visitors
`id`, `visited_at`, `page`, `device`, `browser`, `os`, `visitor_id`.

### site_settings
`id`, `setting_key`, `setting_value`, `updated_at`.

Create a Supabase Auth user for the site administrator in Authentication → Users. Use an email address and a strong unique password. Do not hardcode admin credentials.

## 3. Row Level Security

Run `supabase/policies.sql` in Supabase SQL Editor after checking that the table and column names match. The policies are a starting point; the administrator account is any authenticated Supabase user, so do not create public signups for this project.

## 4. Run locally

Install Node.js LTS, then in this folder run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 5. Deploy to Vercel

Push this folder to the GitHub repository, then import that repository in Vercel. Add the two environment variables from `.env.local` in Vercel Project Settings → Environment Variables, then redeploy.

## Notes / current scope

- Public pages: Home, ABOUT, SHOP.
- Admin page: `/admin` with Supabase email/password login, product create, mark sold/available, delete, and image upload to `kl-beetle-images`.
- The visitors and site_settings tables are prepared in Supabase but the admin dashboard does not yet include visitor analytics or gallery/hero image editing. Those should be added after the first deployment and tested with the actual database policies.
- Hero and feature panels currently use CSS placeholders/remote image styling. Replace with approved high-resolution beetle photos before launch.
- This starter is not a finished production release. Configure RLS and test admin/public access before sharing the site.
