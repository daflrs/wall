# wall

A 2008-style Facebook Wall rebuilt with modern tools: visitors write on Dangie Flores's wall, attach a photo, and every post appears for everyone instantly.

**Live site using Vercel:** [wall-steel-psi.vercel.app](https://wall-steel-psi.vercel.app/)

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Button, Input, Textarea, Skeleton, Sonner)
- **Supabase**: Postgres, Realtime, Storage

## Features

- Post with your name, up to **280 characters**, and an optional photo (JPG/PNG/GIF/WebP, max 5MB)
- Live character counter with a progress ring that turns amber near the limit and red at it
- **Share** is disabled until there's a name and some text or a photo. Ctrl/Cmd + Enter also shares.
- Live feed, newest first: new posts appear for every visitor without refreshing (Supabase Realtime)
- Loading skeletons, upload/sharing states, friendly error toasts, retry on feed errors, and a "Live" connection badge
- Responsive layout: sidebar on desktop, compact profile header on mobile
- Gentle animations: posts cascade in, new posts pop in with a soft highlight. Respects reduced-motion settings.

## Limits are enforced in the UI and the database

| Rule | UI | Database |
| --- | --- | --- |
| Message ≤ 280 chars | `maxLength` + counter | `check (char_length(body) <= 280)` |
| Name required, ≤ 50 chars | required input | `not null` + length check |
| Post not empty | Share disabled | `posts_has_content` check |
| Photo ≤ 5MB, images only | validated before upload | bucket `file_size_limit` + `allowed_mime_types` |

Row Level Security allows anyone to **read** and **create** posts, but not edit or delete them.

## Run locally

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
2. Create `.env.local` (see `.env.example`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```
3. `npm install` then `npm run dev`, and open http://localhost:3000.

## Deploy (Vercel)

Import the GitHub repo in Vercel, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under **Environment Variables**, and deploy.

## Project map

```
app/
  layout.tsx            font, metadata, toast container
  page.tsx              page shell: header, sidebar, wall
  wall-animations.css   post animations
components/wall/
  profile-sidebar.tsx   profile card (initials avatar, networks, city)
  wall-main.tsx         connects composer + feed, shows a setup notice if env vars are missing
  composer.tsx          name, message, photo, Share (upload → insert)
  char-counter.tsx      280-character ring + text
  photo-picker.tsx      click or drag-and-drop photo with preview
  post-feed.tsx         loading / error / empty / list states, Live badge
  post-item.tsx         one post with relative time and lazy photo
hooks/
  use-posts.ts          initial fetch + realtime subscription, de-duplicated
  use-saved-name.ts     remembers the visitor's name in localStorage
  use-now.ts            keeps "5m" timestamps fresh
lib/
  supabase.ts           Supabase client
  constants.ts          limits shared by the UI
  profile.ts            wall owner details
  format.ts             relative time + friendly error messages
supabase/schema.sql     database, security, realtime and storage setup
```

## Decisions

- **No login.** It's a public wall, so `user_id` stays empty and visitors type a name, which their browser remembers.
- **Extra columns** (`author_name`, `image_url`) are added with `alter table`, so the required `create table` SQL stays exactly as given.
- **Legacy anon key**, as the brief specifies. Supabase is retiring legacy keys in 2027, and the new publishable key can be swapped into the same variable without code changes.
- Posts are fetched in the browser so the feed can show a loading state and stay in sync with the realtime subscription.
