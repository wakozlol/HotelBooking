insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/svg+xml'])
on conflict (id) do nothing;
