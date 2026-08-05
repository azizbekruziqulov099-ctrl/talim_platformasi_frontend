-- SamTM Ta'lim: repetitor rejasi, o'qituvchi kvotasi va 25 o'rinlik guruh.
-- 001 hamda mavjud asosiy jadvallardan keyin bajariladi. Qayta bajarish xavfsiz.
BEGIN;
SET LOCAL search_path = public, pg_temp;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '15min';
SET LOCAL TIME ZONE 'Asia/Tashkent';
SELECT pg_advisory_xact_lock(74125, 20260808);

DO $$
BEGIN
  IF to_regclass('public.users') IS NULL
     OR to_regclass('public.togaraklar') IS NULL
     OR to_regclass('public.togarak_azolar') IS NULL THEN
    RAISE EXCEPTION 'Avval asosiy users, togaraklar va togarak_azolar jadvallarini yarating';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS topik_mavzu_rejalari (
  id SERIAL PRIMARY KEY,
  nomi TEXT NOT NULL,
  sinf TEXT NOT NULL,
  fan TEXT NOT NULL,
  guruh_turi TEXT NOT NULL DEFAULT 'sinf',
  yaratgan_user_id BIGINT REFERENCES users(user_id),
  yaratilgan_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE topik_mavzu_rejalari
  ADD COLUMN IF NOT EXISTS guruh_turi TEXT NOT NULL DEFAULT 'sinf';

UPDATE topik_mavzu_rejalari
SET guruh_turi='sinf'
WHERE guruh_turi IS NULL
   OR guruh_turi NOT IN ('sinf','guruh','grupa','repetitor');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='topik_mavzu_rejalari'::regclass
      AND conname='ck_topik_reja_guruh_turi'
  ) THEN
    ALTER TABLE topik_mavzu_rejalari
      ADD CONSTRAINT ck_topik_reja_guruh_turi
      CHECK (guruh_turi IN ('sinf','guruh','grupa','repetitor'));
  END IF;
END $$;

-- Oldingi NULL yoki 25 dan katta guruhlar endi yozuvdagi raqamga emas,
-- haqiqiy qat'iy chegaraga ega bo'ladi.
ALTER TABLE togaraklar
  ADD COLUMN IF NOT EXISTS max_talaba INTEGER NOT NULL DEFAULT 25;

UPDATE togaraklar
SET max_talaba=25
WHERE max_talaba IS NULL OR max_talaba<1 OR max_talaba>25;

ALTER TABLE togaraklar ALTER COLUMN max_talaba SET DEFAULT 25;
ALTER TABLE togaraklar ALTER COLUMN max_talaba SET NOT NULL;

ALTER TABLE togaraklar
  ADD COLUMN IF NOT EXISTS guruh_turi TEXT NOT NULL DEFAULT 'togarak';

ALTER TABLE togarak_azolar
  ADD COLUMN IF NOT EXISTS tasdiqlangan BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE togaraklar
SET guruh_turi='togarak'
WHERE guruh_turi NOT IN ('togarak','repetitor');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='togaraklar'::regclass
      AND conname='ck_togarak_max_25'
  ) THEN
    ALTER TABLE togaraklar
      ADD CONSTRAINT ck_togarak_max_25 CHECK (max_talaba BETWEEN 1 AND 25);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='togaraklar'::regclass
      AND conname='ck_togarak_guruh_turi'
  ) THEN
    ALTER TABLE togaraklar
      ADD CONSTRAINT ck_togarak_guruh_turi
      CHECK (guruh_turi IN ('togarak','repetitor'));
  END IF;
END $$;

-- Takror faol a'zoliklar o'chirilmaydi: eng eski yozuv saqlanib, qolganlari
-- nofaol qilinadi. Shundan keyin parallel qo'shilish ham takror yoza olmaydi.
WITH takrorlar AS (
  SELECT id,
         ROW_NUMBER() OVER(
           PARTITION BY togarak_id,user_id
           ORDER BY tasdiqlangan DESC,id
         ) AS rn
  FROM togarak_azolar
  WHERE aktiv=TRUE
)
UPDATE togarak_azolar a
SET aktiv=FALSE
FROM takrorlar t
WHERE a.id=t.id AND t.rn>1;

CREATE UNIQUE INDEX IF NOT EXISTS uq_togarak_azo_active
  ON togarak_azolar(togarak_id,user_id) WHERE aktiv=TRUE;

CREATE OR REPLACE FUNCTION samtm_togarak_25_orin_himoyasi()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  sigim INTEGER;
  joriy INTEGER;
BEGIN
  IF NEW.aktiv IS DISTINCT FROM TRUE OR NEW.tasdiqlangan IS DISTINCT FROM TRUE THEN
    RETURN NEW;
  END IF;

  SELECT LEAST(COALESCE(max_talaba,25),25)
  INTO sigim
  FROM togaraklar
  WHERE id=NEW.togarak_id AND aktiv=TRUE
  FOR UPDATE;

  IF sigim IS NULL THEN
    RAISE EXCEPTION 'Faol togarak topilmadi' USING ERRCODE='23514';
  END IF;

  SELECT COUNT(*) INTO joriy
  FROM togarak_azolar
  WHERE togarak_id=NEW.togarak_id
    AND aktiv=TRUE AND tasdiqlangan=TRUE
    AND id IS DISTINCT FROM NEW.id;

  IF joriy>=sigim THEN
    RAISE EXCEPTION 'Togarak sigimi toldi: %/%',joriy,sigim
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_togarak_25_orin ON togarak_azolar;
CREATE TRIGGER trg_togarak_25_orin
BEFORE INSERT OR UPDATE OF togarak_id,aktiv,tasdiqlangan
ON togarak_azolar
FOR EACH ROW EXECUTE FUNCTION samtm_togarak_25_orin_himoyasi();

CREATE INDEX IF NOT EXISTS ix_togarak_teacher_active
  ON togaraklar(teacher_id,id) WHERE aktiv=TRUE;

INSERT INTO app_schema_migrations(version,description)
VALUES(
  '013_teacher_repetitor_limits',
  'Repetitor reja turi, bitta bepul togarak va 25 orinlik qatʼiy limit'
)
ON CONFLICT(version) DO UPDATE SET description=EXCLUDED.description;
COMMIT;
