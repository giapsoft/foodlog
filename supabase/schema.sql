-- FoodLog schema for Supabase (PostgreSQL)
-- Run in Supabase SQL Editor after creating project.

-- Units of measurement
CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Raw materials / ingredients
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-processed food sets
CREATE TABLE IF NOT EXISTS foods (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  serving_size_text TEXT NOT NULL DEFAULT '',
  standard_servings INTEGER NOT NULL DEFAULT 1 CHECK (standard_servings > 0),
  suggested_dish TEXT NOT NULL DEFAULT '',
  prep_description TEXT NOT NULL DEFAULT '',
  cutting_details TEXT NOT NULL DEFAULT '',
  main_image_url TEXT,
  other_image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ingredients per food set
CREATE TABLE IF NOT EXISTS food_details (
  id SERIAL PRIMARY KEY,
  food_id INTEGER NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materials(id),
  unit_id INTEGER NOT NULL REFERENCES units(id),
  quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  estimated_quantity_text TEXT NOT NULL DEFAULT '',
  UNIQUE (food_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_food_details_food_id ON food_details(food_id);
CREATE INDEX IF NOT EXISTS idx_foods_updated_at ON foods(updated_at DESC);

-- Auto-update updated_at on foods
CREATE OR REPLACE FUNCTION set_foods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_foods_updated_at ON foods;
CREATE TRIGGER trg_foods_updated_at
  BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION set_foods_updated_at();

-- Seed common units (safe to re-run)
INSERT INTO units (name) VALUES
  ('kg'), ('g'), ('lít'), ('ml'), ('muỗng canh'), ('muỗng cà phê'), ('củ'), ('bó'), ('quả'), ('lá'), ('nhánh'), ('trái'), ('nắm')
ON CONFLICT (name) DO NOTHING;

-- Row Level Security (public read/write for personal app — tighten if needed)
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read units" ON units FOR SELECT USING (true);
CREATE POLICY "Allow public insert units" ON units FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read materials" ON materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert materials" ON materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read foods" ON foods FOR SELECT USING (true);
CREATE POLICY "Allow public insert foods" ON foods FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update foods" ON foods FOR UPDATE USING (true);
CREATE POLICY "Allow public delete foods" ON foods FOR DELETE USING (true);

CREATE POLICY "Allow public read food_details" ON food_details FOR SELECT USING (true);
CREATE POLICY "Allow public insert food_details" ON food_details FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update food_details" ON food_details FOR UPDATE USING (true);
CREATE POLICY "Allow public delete food_details" ON food_details FOR DELETE USING (true);

-- Storage bucket: create "food-media" in Supabase Dashboard → Storage
-- Set bucket to public, add policy:
--   SELECT: true for all
--   INSERT: true for all (or restrict by auth later)
