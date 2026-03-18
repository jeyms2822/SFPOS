# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deployment

Deploy to GitHub Pages with one command:

1. Make sure your local branch is up to date.
2. Run `npm run deploy`.

This command builds the app with the correct base path and publishes the `dist` folder to the `gh-pages` branch.

## Realtime Multi-Device Sync

By default, this POS stores data in each browser's local storage only.
To sync rename/delete/update changes across different devices in near realtime, configure Supabase.

1. Copy `.env.example` to `.env`.
2. Set values for:
	 1. `VITE_SUPABASE_URL`
	 2. `VITE_SUPABASE_ANON_KEY`
	 3. `VITE_POS_STORE_ID` (same value for all devices sharing one store)
3. In Supabase SQL Editor, run this SQL:

```sql
create table if not exists public.pos_sync_state (
	store_id text primary key,
	products jsonb not null default '[]'::jsonb,
	transactions jsonb not null default '[]'::jsonb,
	updated_at timestamptz not null default timezone('utc', now())
);

alter table public.pos_sync_state enable row level security;

drop policy if exists "Public can read pos sync" on public.pos_sync_state;
create policy "Public can read pos sync"
	on public.pos_sync_state
	for select
	to anon, authenticated
	using (true);

drop policy if exists "Public can write pos sync" on public.pos_sync_state;
create policy "Public can write pos sync"
	on public.pos_sync_state
	for insert
	to anon, authenticated
	with check (true);

drop policy if exists "Public can update pos sync" on public.pos_sync_state;
create policy "Public can update pos sync"
	on public.pos_sync_state
	for update
	to anon, authenticated
	using (true)
	with check (true);
```

4. Enable Realtime for the `pos_sync_state` table in Supabase.
5. Rebuild/deploy the app (`npm run deploy`).

After setup, changes to products and transactions are synced across devices that use the same store id.
