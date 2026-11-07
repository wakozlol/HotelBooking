# Shared services

Isolate integrations used across features, including the browser Supabase client configured only with the public URL and publishable/anon key. Feature-specific data operations should remain with their feature; never expose service-role keys.
