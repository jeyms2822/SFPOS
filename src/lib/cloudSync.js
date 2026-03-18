import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const STORE_ID = import.meta.env.VITE_POS_STORE_ID || 'sipup-main';
const TABLE_NAME = 'pos_sync_state';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    })
  : null;

export const CLOUD_SYNC_SQL = `
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
`;

export function isCloudSyncEnabled() {
  return Boolean(supabase);
}

export function getStoreId() {
  return STORE_ID;
}

function normalizeCloudState(row) {
  return {
    products: Array.isArray(row?.products) ? row.products : [],
    transactions: Array.isArray(row?.transactions) ? row.transactions : [],
    updatedAt: row?.updated_at || null,
  };
}

export async function pullCloudState() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('products, transactions, updated_at')
    .eq('store_id', STORE_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return normalizeCloudState(data);
}

export async function pushCloudState({ products, transactions }) {
  if (!supabase) return null;

  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert({
      store_id: STORE_ID,
      products,
      transactions,
      updated_at: updatedAt,
    });

  if (error) throw error;
  return updatedAt;
}

export function subscribeCloudState(onChange) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel(`pos-sync-${STORE_ID}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `store_id=eq.${STORE_ID}`,
      },
      (payload) => {
        if (!payload?.new) return;
        onChange(normalizeCloudState(payload.new));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
