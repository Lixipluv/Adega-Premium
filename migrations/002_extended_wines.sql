-- Extended wine attributes for kiosk (run on existing DB)
ALTER TABLE wines ADD COLUMN IF NOT EXISTS sweetness_level TEXT DEFAULT 'seco';
ALTER TABLE wines ADD COLUMN IF NOT EXISTS body TEXT DEFAULT 'medio';
ALTER TABLE wines ADD COLUMN IF NOT EXISTS on_promotion BOOLEAN DEFAULT FALSE;
ALTER TABLE wines ADD COLUMN IF NOT EXISTS knowledge_level TEXT DEFAULT 'intermediario';
ALTER TABLE wines ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
ALTER TABLE wines ADD COLUMN IF NOT EXISTS food_pairings TEXT[] DEFAULT '{}';

INSERT INTO tags (slug, label) VALUES
  ('promocao', 'Promoção'),
  ('presente', 'Bom para presente'),
  ('custo-beneficio', 'Custo-benefício'),
  ('jantar', 'Ideal para jantar'),
  ('massa', 'Harmoniza com massas'),
  ('iniciante', 'Para iniciantes')
ON CONFLICT (slug) DO NOTHING;

-- Sample enrichment
UPDATE wines SET
  sweetness_level = 'seco',
  body = 'encorpado',
  knowledge_level = 'intermediario',
  food_pairings = ARRAY['carne', 'massa'],
  badges = ARRAY['jantar']
WHERE category = 'tinto' AND name ILIKE '%Malbec%';

UPDATE wines SET
  sweetness_level = 'seco',
  body = 'medio',
  food_pairings = ARRAY['massa', 'carne'],
  badges = ARRAY['custo-beneficio', 'jantar']
WHERE pairing_suggestions ILIKE '%massa%' OR pairing_suggestions ILIKE '%sugo%';

UPDATE wines SET on_promotion = TRUE, badges = array_append(COALESCE(badges, '{}'), 'promocao')
WHERE price_brl <= 120;

UPDATE wines SET badges = array_append(COALESCE(badges, '{}'), 'presente')
WHERE score_average >= 4.6;

UPDATE wines SET knowledge_level = 'iniciante', badges = array_append(COALESCE(badges, '{}'), 'custo-beneficio')
WHERE price_brl <= 150 AND category IN ('branco', 'rose', 'espumante');

UPDATE wines SET image_url = '/images/cat-espumante.jpg' WHERE category = 'espumante' AND (image_url IS NULL OR image_url = '');
