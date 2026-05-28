-- Adega Premium — schema + seed
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    UNIQUE (name, country)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL
);

CREATE TABLE wines (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    winery TEXT NOT NULL,
    region TEXT,
    country TEXT NOT NULL,
    grape_variety TEXT NOT NULL,
    vintage_year INT,
    price_brl NUMERIC(10, 2) NOT NULL,
    alcohol_pct NUMERIC(4, 2),
    tasting_notes TEXT,
    pairing_suggestions TEXT,
    score_average NUMERIC(3, 1) DEFAULT 0,
    stock_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    category TEXT DEFAULT 'tinto',
    sweetness_level TEXT DEFAULT 'seco',
    body TEXT DEFAULT 'medio',
    on_promotion BOOLEAN DEFAULT FALSE,
    knowledge_level TEXT DEFAULT 'intermediario',
    badges TEXT[] DEFAULT '{}',
    food_pairings TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    search_vector tsvector
);

CREATE INDEX wines_search_idx ON wines USING GIN (search_vector);
CREATE INDEX wines_country_idx ON wines (country);
CREATE INDEX wines_grape_idx ON wines (grape_variety);
CREATE INDEX wines_price_idx ON wines (price_brl);

CREATE OR REPLACE FUNCTION wines_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.name, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.winery, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.grape_variety, ''))), 'B') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.region, ''))), 'B') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.country, ''))), 'C') ||
        setweight(to_tsvector('simple', unaccent(coalesce(NEW.tasting_notes, ''))), 'D');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER wines_search_vector_trigger
BEFORE INSERT OR UPDATE ON wines
FOR EACH ROW EXECUTE FUNCTION wines_search_vector_update();

CREATE TABLE wine_tags (
    wine_id INT REFERENCES wines(id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (wine_id, tag_id)
);

CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    wine_id INT REFERENCES wines(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('label', 'vineyard', 'pour')),
    display_order INT DEFAULT 0
);

CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT,
    wine_id INT REFERENCES wines(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'qr_scan', 'detail_open')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX events_wine_idx ON events (wine_id, created_at);

-- Seed regions
INSERT INTO regions (name, country, description) VALUES
('Mendoza', 'Argentina', 'Região de altitude conhecida pelos Malbecs encorpados.'),
('Valle Central', 'Chile', 'Valle fértil produtor de Cabernet Sauvignon e Carmenère.'),
('Bordeaux', 'França', 'Berço dos blends clássicos de Cabernet e Merlot.'),
('Toscana', 'Itália', 'Lar dos Chianti e Brunello, baseados na uva Sangiovese.'),
('Douro', 'Portugal', 'Vales íngremes onde nasce o Vinho do Porto.'),
('Rioja', 'Espanha', 'Tradição em vinhos de Tempranillo envelhecidos em carvalho.'),
('Champagne', 'França', 'Região fria, referência mundial em espumantes.');

-- Seed tags
INSERT INTO tags (slug, label) VALUES
('encorpado', 'Encorpado'),
('leve', 'Leve'),
('frutado', 'Frutado'),
('seco', 'Seco'),
('doce', 'Doce'),
('premiado', 'Premiado'),
('reserva', 'Reserva'),
('organico', 'Orgânico'),
('promocao', 'Promoção'),
('presente', 'Bom para presente'),
('custo-beneficio', 'Custo-benefício'),
('jantar', 'Ideal para jantar'),
('massa', 'Harmoniza com massas'),
('iniciante', 'Para iniciantes');

-- Seed 20 wines
INSERT INTO wines (name, winery, region, country, grape_variety, vintage_year, price_brl, alcohol_pct, tasting_notes, pairing_suggestions, score_average, stock_available, image_url, category) VALUES
('Alamos Malbec', 'Bodega Catena Zapata', 'Mendoza', 'Argentina', 'Malbec', 2021, 129.90, 13.5, 'Vinho tinto encorpado e elegante, com aromas de frutas maduras, ameixas e sutis notas de baunilha e especiarias. Taninos macios e final persistente.', 'Ideal com carnes vermelhas, queijos curados, massas com molhos encorpados e pratos temperados.', 4.4, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Casillero del Diablo Cabernet Sauvignon', 'Concha y Toro', 'Valle Central', 'Chile', 'Cabernet Sauvignon', 2020, 89.90, 13.5, 'Tinto intenso com notas de cassis, pimenta preta e cedro. Estrutura firme e final marcante.', 'Carnes grelhadas, cordeiro assado e queijos maduros.', 4.2, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Trivento Reserve Malbec', 'Trivento', 'Mendoza', 'Argentina', 'Malbec', 2021, 109.90, 14.0, 'Aroma frutado de ameixa e cereja, taninos redondos e final aveludado.', 'Bife de chorizo, parrilla e empanadas.', 4.3, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Santa Carolina Reserva', 'Santa Carolina', 'Valle Central', 'Chile', 'Carmenère', 2020, 99.90, 13.5, 'Notas de pimentão maduro, frutas escuras e leves toques herbáceos.', 'Costela de porco, feijoada e queijos semi-curados.', 4.1, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Gran Reserva Cabernet Sauvignon', 'Viña San Pedro', 'Valle Central', 'Chile', 'Cabernet Sauvignon', 2019, 159.90, 14.0, 'Estrutura imponente, notas de tabaco, café e frutas negras maduras.', 'Filé mignon ao molho de vinho, cordeiro assado.', 4.5, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('D.V. Catena Malbec Malbec', 'Catena Zapata', 'Mendoza', 'Argentina', 'Malbec', 2019, 389.90, 14.0, 'Blend de Malbec de altitude. Profundo, especiado, com taninos densos e elegantes.', 'Carnes nobres, magret de pato, risotos encorpados.', 4.7, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Descubrí Gran Reserva', 'Bodegas Descubrí', 'Mendoza', 'Argentina', 'Malbec', 2018, 219.90, 14.5, 'Madeira nova, baunilha, frutas em compota e final longo.', 'Cortes maturados, costela bovina assada.', 4.4, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Luigi Bosca Malbec', 'Luigi Bosca', 'Mendoza', 'Argentina', 'Malbec', 2020, 179.90, 14.0, 'Frutado, especiado, com taninos redondos e final equilibrado.', 'Carnes assadas, queijo provolone, massas ao sugo.', 4.5, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Château Margaux Pavillon Rouge', 'Château Margaux', 'Bordeaux', 'França', 'Cabernet Sauvignon', 2018, 1199.90, 13.5, 'Elegância pura: violetas, grafite, cassis e taninos sedosos. Vinho de guarda.', 'Cordeiro, pato confitado, queijos finos.', 4.9, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Chianti Classico Riserva', 'Antinori', 'Toscana', 'Itália', 'Sangiovese', 2019, 289.90, 13.5, 'Cereja madura, couro, ervas mediterrâneas e acidez vibrante.', 'Massas ao sugo, ossobuco, pizza margherita.', 4.6, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Brunello di Montalcino', 'Castello Banfi', 'Toscana', 'Itália', 'Sangiovese', 2017, 699.90, 14.0, 'Profundo, com frutas escuras, alcatrão, especiarias e final muito longo.', 'Bistecca alla Fiorentina, javali, queijos maduros.', 4.8, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Quinta do Crasto Reserva', 'Quinta do Crasto', 'Douro', 'Portugal', 'Touriga Nacional', 2019, 249.90, 14.5, 'Frutas pretas, especiarias, eucalipto e taninos firmes.', 'Cabrito assado, bacalhau à lagareiro, queijo Serra.', 4.5, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Niepoort Vintage Port', 'Niepoort', 'Douro', 'Portugal', 'Touriga Nacional', 2017, 549.90, 20.0, 'Fortificado intenso, doce, com figos, chocolate e final muito persistente.', 'Sobremesas de chocolate, queijos azuis.', 4.7, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Marqués de Riscal Reserva', 'Marqués de Riscal', 'Rioja', 'Espanha', 'Tempranillo', 2018, 269.90, 14.0, 'Carvalho americano, baunilha, frutas vermelhas e final equilibrado.', 'Cordeiro, paella de carne, tapas.', 4.4, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('La Rioja Alta Gran Reserva 904', 'La Rioja Alta', 'Rioja', 'Espanha', 'Tempranillo', 2015, 599.90, 13.5, 'Complexo, com frutas secas, tabaco, couro e enorme elegância.', 'Carnes maturadas, queijos manchego envelhecido.', 4.8, TRUE, '/images/cat-tinto.jpg', 'tinto'),
('Cloudy Bay Sauvignon Blanc', 'Cloudy Bay', 'Toscana', 'Itália', 'Sauvignon Blanc', 2022, 329.90, 13.0, 'Cítrico, herbáceo, com notas de maracujá e final fresco e mineral.', 'Frutos do mar, ceviche, saladas com queijo de cabra.', 4.6, TRUE, '/images/cat-branco.jpg', 'branco'),
('Casa Silva Cool Coast Chardonnay', 'Casa Silva', 'Valle Central', 'Chile', 'Chardonnay', 2021, 149.90, 13.0, 'Notas de manteiga, frutas de caroço e final cremoso com leve mineralidade.', 'Peixes grelhados, risotos, frango ao molho branco.', 4.3, TRUE, '/images/cat-branco.jpg', 'branco'),
('Provence Rosé Côtes de Provence', 'Château d''Esclans', 'Bordeaux', 'França', 'Grenache', 2022, 219.90, 13.0, 'Rosé pálido, com aromas delicados de morango, melancia e flores brancas.', 'Saladas, sushi, peixes leves, queijos frescos.', 4.4, TRUE, '/images/cat-rose.jpg', 'rose'),
('Moët & Chandon Brut Impérial', 'Moët & Chandon', 'Champagne', 'França', 'Chardonnay', 2020, 459.90, 12.0, 'Espumante clássico, com pão fresco, maçã verde e perlage fina e persistente.', 'Aperitivos, frutos do mar, sobremesas leves.', 4.6, TRUE, '/images/cat-espumante.jpg', 'espumante'),
('Chandon Brut Argentina', 'Chandon', 'Mendoza', 'Argentina', 'Chardonnay', 2021, 119.90, 12.5, 'Espumante fresco e frutado, ótimo para celebrações.', 'Aperitivos, queijos leves, saladas.', 4.2, TRUE, '/images/cat-espumante.jpg', 'espumante');

UPDATE wines SET on_promotion = TRUE WHERE price_brl <= 120;
UPDATE wines SET food_pairings = ARRAY['massa', 'carne'], badges = ARRAY['custo-beneficio', 'jantar']
WHERE pairing_suggestions ILIKE '%massa%' OR pairing_suggestions ILIKE '%sugo%';
UPDATE wines SET badges = array_append(COALESCE(badges, '{}'), 'presente') WHERE score_average >= 4.6;
UPDATE wines SET knowledge_level = 'iniciante' WHERE price_brl <= 150 AND category IN ('branco', 'rose', 'espumante');

-- Wire some tags
INSERT INTO wine_tags (wine_id, tag_id)
SELECT w.id, t.id FROM wines w, tags t
WHERE (w.name ILIKE '%Reserva%' AND t.slug = 'reserva')
   OR (w.score_average >= 4.6 AND t.slug = 'premiado')
   OR (w.category = 'tinto' AND t.slug = 'seco')
   OR (w.category IN ('branco','rose','espumante') AND t.slug = 'leve');
