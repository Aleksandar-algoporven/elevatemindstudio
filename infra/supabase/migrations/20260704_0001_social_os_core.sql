create table if not exists brands (
  id text primary key,
  name text not null,
  domain text not null,
  tone text not null,
  autonomy_level integer not null default 1 check (autonomy_level between 0 and 4),
  prohibited_claims text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_drafts (
  id text primary key,
  title text not null,
  pillar text not null,
  channel text not null,
  approval_state text not null default 'draft',
  risk_level text not null default 'low',
  source_refs text[] not null default '{}',
  copy_text text not null,
  scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists channel_connections (
  id text primary key,
  channel text not null,
  handle text not null,
  status text not null default 'pending',
  scopes text[] not null default '{}',
  publishing_supported boolean not null default false,
  monitoring_supported boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_sources (
  id text primary key,
  name text not null,
  source_type text not null,
  status text not null default 'pending',
  url text,
  item_count integer not null default 0 check (item_count >= 0),
  last_ingested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inbox_messages (
  id text primary key,
  channel text not null,
  author text not null,
  text text not null,
  priority text not null default 'normal',
  sentiment text not null default 'neutral',
  suggested_reply text not null default '',
  needs_human boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists calendar_items (
  id bigserial primary key,
  day text not null unique,
  posts integer not null default 0 check (posts >= 0),
  focus text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approval_events (
  id bigserial primary key,
  draft_id text not null references content_drafts(id) on delete cascade,
  previous_state text not null,
  next_state text not null,
  reviewer text not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists social_account_connections (
  id text primary key,
  channel text not null,
  provider text not null,
  external_account_id text,
  display_name text,
  handle text,
  connection_status text not null default 'pending',
  scopes text[] not null default '{}',
  publishing_supported boolean not null default false,
  monitoring_supported boolean not null default false,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists billing_customers (
  id bigserial primary key,
  email text,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'pending',
  plan_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_brands_updated_at on brands;
create trigger set_brands_updated_at before update on brands
for each row execute function set_updated_at();

drop trigger if exists set_content_drafts_updated_at on content_drafts;
create trigger set_content_drafts_updated_at before update on content_drafts
for each row execute function set_updated_at();

drop trigger if exists set_channel_connections_updated_at on channel_connections;
create trigger set_channel_connections_updated_at before update on channel_connections
for each row execute function set_updated_at();

drop trigger if exists set_content_sources_updated_at on content_sources;
create trigger set_content_sources_updated_at before update on content_sources
for each row execute function set_updated_at();

drop trigger if exists set_inbox_messages_updated_at on inbox_messages;
create trigger set_inbox_messages_updated_at before update on inbox_messages
for each row execute function set_updated_at();

drop trigger if exists set_calendar_items_updated_at on calendar_items;
create trigger set_calendar_items_updated_at before update on calendar_items
for each row execute function set_updated_at();

drop trigger if exists set_social_account_connections_updated_at on social_account_connections;
create trigger set_social_account_connections_updated_at before update on social_account_connections
for each row execute function set_updated_at();

drop trigger if exists set_billing_customers_updated_at on billing_customers;
create trigger set_billing_customers_updated_at before update on billing_customers
for each row execute function set_updated_at();

alter table brands enable row level security;
alter table content_drafts enable row level security;
alter table channel_connections enable row level security;
alter table content_sources enable row level security;
alter table inbox_messages enable row level security;
alter table calendar_items enable row level security;
alter table approval_events enable row level security;
alter table social_account_connections enable row level security;
alter table billing_customers enable row level security;

insert into brands (id, name, domain, tone, autonomy_level, prohibited_claims)
values (
  'brand-algoproven',
  'AlgoProven',
  'algoproven.com',
  'Precise, evidence-backed, product-led, and operator-aware.',
  1,
  array[
    'guaranteed returns',
    'risk-free trading',
    'verified performance without source evidence'
  ]
)
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain,
  tone = excluded.tone,
  autonomy_level = excluded.autonomy_level,
  prohibited_claims = excluded.prohibited_claims;

insert into content_drafts (
  id, title, pillar, channel, approval_state, risk_level, source_refs, copy_text, scheduled_for
)
values
  (
    'draft-001',
    'Product truth from changelog',
    'Product truth',
    'linkedin',
    'needs_review',
    'medium',
    array['AlgoProven app changelog', 'Risk system notes'],
    'A useful product update is not a slogan. It is a traceable change users can inspect, test, and trust.',
    '2026-06-30T09:00:00Z'
  ),
  (
    'draft-002',
    'Founder build-in-public thread',
    'Founder/operator voice',
    'x',
    'draft',
    'low',
    array['Founder notes', 'Roadmap v1'],
    'Building trading infrastructure teaches the same lesson every week: the boring controls are what keep the exciting parts alive.',
    '2026-06-30T14:30:00Z'
  )
on conflict (id) do update set
  title = excluded.title,
  pillar = excluded.pillar,
  channel = excluded.channel,
  approval_state = excluded.approval_state,
  risk_level = excluded.risk_level,
  source_refs = excluded.source_refs,
  copy_text = excluded.copy_text,
  scheduled_for = excluded.scheduled_for;

insert into channel_connections (
  id, channel, handle, status, scopes, publishing_supported, monitoring_supported, notes
)
values
  (
    'channel-linkedin-company',
    'linkedin',
    'AlgoProven',
    'pending',
    array['profile', 'organization', 'ugc_posts', 'comments'],
    true,
    true,
    'Requires LinkedIn app review before fully automated organization publishing.'
  ),
  (
    'channel-x-brand',
    'x',
    '@algoproven',
    'pending',
    array['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
    true,
    true,
    'API tier and rate limits decide how much monitoring can be automated.'
  ),
  (
    'channel-instagram',
    'instagram',
    '@algoproven',
    'manual',
    array['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
    true,
    true,
    'Requires Meta Business account, connected Facebook Page, and app permissions.'
  ),
  (
    'channel-youtube',
    'youtube',
    '@algoproven',
    'pending',
    array['youtube.upload', 'youtube.readonly', 'youtube.force-ssl'],
    true,
    true,
    'Uploads and comment moderation are possible after Google OAuth verification.'
  ),
  (
    'channel-discord',
    'discord',
    'AlgoProven Discord',
    'ready',
    array['bot', 'applications.commands'],
    true,
    true,
    'Best first fully automated community channel because bot permissions are direct.'
  )
on conflict (id) do update set
  channel = excluded.channel,
  handle = excluded.handle,
  status = excluded.status,
  scopes = excluded.scopes,
  publishing_supported = excluded.publishing_supported,
  monitoring_supported = excluded.monitoring_supported,
  notes = excluded.notes;

insert into content_sources (id, name, source_type, status, url, item_count, last_ingested_at)
values
  (
    'source-site',
    'AlgoProven marketing site',
    'website',
    'ready',
    'https://www.algoproven.com',
    18,
    '2026-06-27T09:00:00Z'
  ),
  (
    'source-app',
    'AlgoProven app notes',
    'manual',
    'manual',
    'https://app.algoproven.com',
    7,
    '2026-06-26T18:30:00Z'
  ),
  (
    'source-platform-repo',
    'algoproven-platform repository',
    'repo',
    'pending',
    'https://github.com/Aleksandar-algoporven/algoproven-platform',
    0,
    null
  ),
  (
    'source-rulegate-repo',
    'algoproven-rulegate repository',
    'repo',
    'pending',
    'https://github.com/Aleksandar-algoporven/algoproven-rulegate',
    0,
    null
  )
on conflict (id) do update set
  name = excluded.name,
  source_type = excluded.source_type,
  status = excluded.status,
  url = excluded.url,
  item_count = excluded.item_count,
  last_ingested_at = excluded.last_ingested_at;

insert into inbox_messages (
  id, channel, author, text, priority, sentiment, suggested_reply, needs_human
)
values
  (
    'inbox-001',
    'linkedin',
    'Prop firm operator',
    'Can AlgoProven separate verified performance from marketing claims?',
    'high',
    'question',
    'Yes. The product direction is to keep claim language tied to traceable source evidence and review gates before publishing.',
    true
  ),
  (
    'inbox-002',
    'discord',
    'beta-user',
    'The approval workflow makes sense. Can we get weekly release notes?',
    'normal',
    'positive',
    'Good idea. We are shaping a weekly source-backed release note format for product, risk, and trust updates.',
    false
  )
on conflict (id) do update set
  channel = excluded.channel,
  author = excluded.author,
  text = excluded.text,
  priority = excluded.priority,
  sentiment = excluded.sentiment,
  suggested_reply = excluded.suggested_reply,
  needs_human = excluded.needs_human;

insert into calendar_items (day, posts, focus, sort_order)
values
  ('Mon', 3, 'Product truth', 1),
  ('Tue', 2, 'Founder voice', 2),
  ('Wed', 4, 'Education', 3),
  ('Thu', 2, 'Trust', 4),
  ('Fri', 1, 'Recap', 5)
on conflict (day) do update set
  posts = excluded.posts,
  focus = excluded.focus,
  sort_order = excluded.sort_order;
