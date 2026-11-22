-- users.gender is chosen once at signup and can never be changed (owner decision, 2026-11-22).
-- Corrections are made by the owner through a reviewed script that temporarily disables this trigger.
CREATE FUNCTION "users_gender_immutable"() RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW."gender" IS DISTINCT FROM OLD."gender" THEN
    RAISE EXCEPTION 'users.gender cannot be changed after creation'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION "users_gender_immutable"() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER "users_gender_immutable"
BEFORE UPDATE OF "gender" ON "users"
FOR EACH ROW
EXECUTE FUNCTION "users_gender_immutable"();
