create type public.business_category as enum ('fast_food','fruit_veg','grocery','bakery','home_food','catering','delivery','other');
create type public.request_status as enum ('pending','accepted','declined');
create type public.opportunity_type as enum ('catering','event_supply','bulk_produce','delivery','supplier','workers','collaboration');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique,
  name text not null,
  owner_name text,
  category public.business_category not null default 'other',
  description text,
  phone text,
  whatsapp text,
  area text,
  hours text,
  delivery boolean not null default false,
  collection boolean not null default true,
  verified boolean not null default false,
  rating numeric(2,1) not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.businesses to anon, authenticated;
grant insert, update, delete on public.businesses to authenticated;
grant all on public.businesses to service_role;
alter table public.businesses enable row level security;
create policy "Anyone can view businesses" on public.businesses for select using (true);
create policy "Owners create their business" on public.businesses for insert to authenticated with check (auth.uid() = owner_id);
create policy "Owners update their business" on public.businesses for update to authenticated using (auth.uid() = owner_id);
create policy "Owners delete their business" on public.businesses for delete to authenticated using (auth.uid() = owner_id);

create table public.supply_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  unit text not null,
  price numeric(10,2) not null,
  min_order integer not null default 1,
  description text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.supply_listings to anon, authenticated;
grant insert, update, delete on public.supply_listings to authenticated;
grant all on public.supply_listings to service_role;
alter table public.supply_listings enable row level security;
create policy "Anyone can view listings" on public.supply_listings for select using (true);
create policy "Owners manage listings" on public.supply_listings for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create table public.supply_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.supply_listings(id) on delete cascade,
  buyer_business_id uuid not null references public.businesses(id) on delete cascade,
  quantity integer not null default 1,
  message text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.supply_requests to authenticated;
grant all on public.supply_requests to service_role;
alter table public.supply_requests enable row level security;
create policy "Buyer or seller can view requests" on public.supply_requests for select to authenticated using (
  exists (select 1 from public.businesses b where b.id = buyer_business_id and b.owner_id = auth.uid())
  or exists (select 1 from public.supply_listings l join public.businesses b on b.id = l.business_id where l.id = listing_id and b.owner_id = auth.uid()));
create policy "Buyer creates request" on public.supply_requests for insert to authenticated with check (
  exists (select 1 from public.businesses b where b.id = buyer_business_id and b.owner_id = auth.uid()));
create policy "Seller updates request" on public.supply_requests for update to authenticated using (
  exists (select 1 from public.supply_listings l join public.businesses b on b.id = l.business_id where l.id = listing_id and b.owner_id = auth.uid()));

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.opportunity_type not null default 'collaboration',
  title text not null,
  description text,
  budget numeric(10,2),
  event_date date,
  location text,
  open boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.opportunities to anon, authenticated;
grant insert, update, delete on public.opportunities to authenticated;
grant all on public.opportunities to service_role;
alter table public.opportunities enable row level security;
create policy "Anyone can view opportunities" on public.opportunities for select using (true);
create policy "Owners manage opportunities" on public.opportunities for all to authenticated
  using (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()))
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid()));

create table public.opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  applicant_business_id uuid not null references public.businesses(id) on delete cascade,
  message text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (opportunity_id, applicant_business_id)
);
grant select, insert, update on public.opportunity_applications to authenticated;
grant all on public.opportunity_applications to service_role;
alter table public.opportunity_applications enable row level security;
create policy "Applicant or poster can view" on public.opportunity_applications for select to authenticated using (
  exists (select 1 from public.businesses b where b.id = applicant_business_id and b.owner_id = auth.uid())
  or exists (select 1 from public.opportunities o join public.businesses b on b.id = o.business_id where o.id = opportunity_id and b.owner_id = auth.uid()));
create policy "Applicant applies" on public.opportunity_applications for insert to authenticated with check (
  exists (select 1 from public.businesses b where b.id = applicant_business_id and b.owner_id = auth.uid()));
create policy "Poster updates application" on public.opportunity_applications for update to authenticated using (
  exists (select 1 from public.opportunities o join public.businesses b on b.id = o.business_id where o.id = opportunity_id and b.owner_id = auth.uid()));

create table public.follows (
  follower_business_id uuid not null references public.businesses(id) on delete cascade,
  followed_business_id uuid not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_business_id, followed_business_id)
);
grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;
alter table public.follows enable row level security;
create policy "Anyone can view follows" on public.follows for select using (true);
create policy "Owner follows" on public.follows for insert to authenticated with check (
  exists (select 1 from public.businesses b where b.id = follower_business_id and b.owner_id = auth.uid()));
create policy "Owner unfollows" on public.follows for delete to authenticated using (
  exists (select 1 from public.businesses b where b.id = follower_business_id and b.owner_id = auth.uid()));

-- Demo businesses
insert into public.businesses (id, name, owner_name, category, description, phone, whatsapp, area, hours, delivery, verified, rating) values
('11111111-0000-0000-0000-000000000001','Mama''s Kitchen','Nomsa Dlamini','fast_food','Kotas, bunny chow and Saturday plates made with love since 2014.','0821234567','27821234567','Khayelitsha, Site C','07:00 – 20:00',true,true,4.8),
('11111111-0000-0000-0000-000000000002','Green Basket Fruits & Veg','Sipho Mthembu','fruit_veg','Fresh produce straight from the Epping market every morning. Bulk prices for vendors.','0837654321','27837654321','Khayelitsha, Harare','06:00 – 18:00',true,true,4.9),
('11111111-0000-0000-0000-000000000003','Siyakhula Bakery','Thandi Nkosi','bakery','Fresh bread, rolls and vetkoek baked twice a day.','0711112222','27711112222','Gugulethu','05:30 – 17:00',false,false,4.3),
('11111111-0000-0000-0000-000000000004','Ubuntu Tuck Shop','Lwazi Mokoena','grocery','Your corner spaza for airtime, bread, milk and daily essentials.','0723334444','27723334444','Nyanga','07:00 – 21:00',false,true,4.5),
('11111111-0000-0000-0000-000000000005','Kasi Wheels Delivery','Bongani Zulu','delivery','Scooter deliveries across the township. Multiple vendors, one trip.','0745556666','27745556666','Khayelitsha & surrounds','08:00 – 20:00',true,false,4.6);

insert into public.supply_listings (business_id, title, unit, price, min_order, description) values
('11111111-0000-0000-0000-000000000002','Tomatoes — Bulk Supply','10kg bag',150,2,'Firm, ripe tomatoes. Ideal for chakalaka and sauces.'),
('11111111-0000-0000-0000-000000000002','Potatoes','10kg pocket',95,3,'Good for chips. Delivered same day before 10am.'),
('11111111-0000-0000-0000-000000000002','Onions','7kg pocket',80,2,null),
('11111111-0000-0000-0000-000000000003','Bread rolls','Tray of 30',75,1,'Soft rolls for burgers and kotas.'),
('11111111-0000-0000-0000-000000000003','Quarter loaves for kota','Pack of 20',110,1,'Unsliced white quarters.');

insert into public.opportunities (business_id, type, title, description, budget, event_date, location) values
('11111111-0000-0000-0000-000000000001','catering','Need 100 lunch meals for a community event','Looking for two vendors to help cook and serve lunch plates at the youth day event.',5000,current_date + 10,'Site C Community Hall'),
('11111111-0000-0000-0000-000000000004','supplier','Looking for a fresh milk supplier','Need 40 litres of milk delivered three times a week.',null,null,'Nyanga'),
('11111111-0000-0000-0000-000000000005','delivery','Vendors wanted for shared Friday delivery run','Join our Friday evening run — split delivery costs with other vendors.',null,current_date + 4,'Khayelitsha');