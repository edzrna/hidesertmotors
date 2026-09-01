-- Color interior y horas de motor.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS interior_color TEXT NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS engine_hours   INTEGER;
