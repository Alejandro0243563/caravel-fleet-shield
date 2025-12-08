-- Crear perfiles para usuarios existentes que no tienen perfil
INSERT INTO public.profiles (user_id, telefono, phone, role, fecha_registro)
SELECT 
  u.id,
  u.phone,
  u.phone,
  'cliente',
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;