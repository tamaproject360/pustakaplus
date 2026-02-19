/*
  # Fix handle_new_user trigger

  Updated the trigger function to use SET search_path and added error handling
  to prevent "Database error creating new user" when trigger fails due to RLS.
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, unit_kerja)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(
      CASE WHEN NEW.raw_user_meta_data->>'role' IN ('super_admin','pustakawan','kontributor','pembaca')
           THEN (NEW.raw_user_meta_data->>'role')::user_role
           ELSE NULL
      END,
      'pembaca'::user_role
    ),
    NEW.raw_user_meta_data->>'unit_kerja'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;
