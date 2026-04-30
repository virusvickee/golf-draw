-- ============================================================================
-- Fix RLS policies for public tables (charities, draws, contributions)
-- ============================================================================

-- Fix charities table (public read)
DROP POLICY IF EXISTS "charities_public_read" ON charities;
DROP POLICY IF EXISTS "charities_public_select" ON charities;

CREATE POLICY "charities_public_read"
ON charities FOR SELECT
USING (true);

-- Fix draws table (public read published)
DROP POLICY IF EXISTS "draws_public_read" ON draws;
DROP POLICY IF EXISTS "draws_public_select_published" ON draws;

CREATE POLICY "draws_public_read"
ON draws FOR SELECT
USING (status = 'published');

-- Fix contributions (public read for totals)
DROP POLICY IF EXISTS "contributions_public_read" ON contributions;

CREATE POLICY "contributions_public_read"
ON contributions FOR SELECT
USING (true);
