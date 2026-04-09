-- Align the live Supabase table with the ARCHI-TECH editorial frontend.
-- Safe to run multiple times thanks to IF NOT EXISTS.

alter table public.portfolio_profile
add column if not exists brand_name text not null default '';

alter table public.portfolio_profile
add column if not exists software_role text not null default '';

alter table public.portfolio_profile
add column if not exists software_headline text not null default '';

alter table public.portfolio_profile
add column if not exists software_intro text not null default '';

alter table public.portfolio_profile
add column if not exists software_about_title text not null default '';

alter table public.portfolio_profile
add column if not exists software_about_body text not null default '';

alter table public.portfolio_profile
add column if not exists software_photo_url text not null default '';

alter table public.portfolio_profile
add column if not exists software_version text not null default '';

alter table public.portfolio_profile
add column if not exists contact_email text not null default '';

alter table public.portfolio_profile
add column if not exists contact_title text not null default '';

alter table public.portfolio_profile
add column if not exists contact_description text not null default '';

alter table public.portfolio_profile
add column if not exists contact_location_label text not null default '';

alter table public.portfolio_profile
add column if not exists contact_availability text not null default '';

alter table public.portfolio_profile
add column if not exists contact_linkedin_url text not null default '';

alter table public.portfolio_profile
add column if not exists contact_github_url text not null default '';

alter table public.portfolio_profile
add column if not exists contact_resume_url text not null default '';

alter table public.portfolio_profile
add column if not exists civil_role text not null default '';

alter table public.portfolio_profile
add column if not exists civil_headline text not null default '';

alter table public.portfolio_profile
add column if not exists civil_intro text not null default '';

alter table public.portfolio_profile
add column if not exists civil_philosophy text not null default '';

alter table public.portfolio_profile
add column if not exists civil_focus text not null default '';

alter table public.portfolio_profile
add column if not exists civil_certification text not null default '';

alter table public.portfolio_profile
add column if not exists civil_certification_note text not null default '';

alter table public.portfolio_profile
add column if not exists civil_base text not null default '';

alter table public.portfolio_profile
add column if not exists civil_specialty text not null default '';

alter table public.portfolio_profile
add column if not exists civil_photo_url text not null default '';

notify pgrst, 'reload schema';
