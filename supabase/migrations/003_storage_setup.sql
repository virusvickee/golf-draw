-- Create winner-proofs bucket in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('winner-proofs', 'winner-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for winner-proofs bucket
DROP POLICY IF EXISTS "Anyone can upload winner proofs" ON storage.objects;
CREATE POLICY "Anyone can upload winner proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'winner-proofs');

DROP POLICY IF EXISTS "Anyone can view winner proofs" ON storage.objects;
CREATE POLICY "Anyone can view winner proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'winner-proofs');
