-- Seed initial community spaces
insert into public.spaces (
  name,
  type,
  capacity,
  description,
  operating_hours_start,
  operating_hours_end,
  rules,
  is_active,
  image_url
) values
  (
    'Cancha de Fútbol Principal',
    'deportivo',
    22,
    'Cancha de césped sintético con iluminación y graderías para encuentros deportivos comunitarios.',
    '07:00',
    '22:00',
    array[
      'Usar guayos o calzado deportivo apropiado',
      'Reservas máximas de 2 horas continuas',
      'Llevar los implementos deportivos personales',
      'Mantener hidratación fuera de la cancha'
    ],
    true,
    'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg'
  ),
  (
    'Salón Social Aurora',
    'social',
    120,
    'Salón cerrado con aire acondicionado, sonido y cocina auxiliar para eventos sociales y reuniones.',
    '10:00',
    '23:00',
    array[
      'Solicitar inventario de mobiliario con anticipación',
      'Dejar el salón limpio y ordenado al finalizar',
      'No superar el aforo permitido',
      'Respetar el horario máximo de música amplificada'
    ],
    true,
    'https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg'
  ),
  (
    'Zona BBQ Los Pinos',
    'bbq',
    32,
    'Área abierta con parrillas, kiosko cubierto y zona verde ideal para encuentros familiares.',
    '08:00',
    '20:00',
    array[
      'Llevar carbón y utensilios personales',
      'No dejar residuos de comida o brasas encendidas',
      'Respetar a los residentes colindantes con volumen moderado',
      'Apagar luces y equipos al retirarse'
    ],
    true,
    'https://images.pexels.com/photos/1260968/pexels-photo-1260968.jpeg'
  ),
  (
    'Sala de Coworking Horizonte',
    'coworking',
    24,
    'Sala equipada con mesas colaborativas, Wi-Fi empresarial y cabinas para videollamadas.',
    '07:00',
    '21:00',
    array[
      'Respetar las zonas silenciosas designadas',
      'No consumir alimentos calientes dentro de la sala',
      'Reportar cualquier daño en equipos de inmediato',
      'Utilizar audífonos para reuniones virtuales'
    ],
    true,
    'https://images.pexels.com/photos/3182770/pexels-photo-3182770.jpeg'
  ),
  (
    'Gimnasio al Aire Libre Vitalia',
    'deportivo',
    18,
    'Circuito de entrenamiento con máquinas hidráulicas y zona de estiramiento en exteriores.',
    '06:00',
    '20:00',
    array[
      'Usar toalla personal en cada estación',
      'Limpiar el equipo después de usarlo',
      'No ocupar las máquinas por más de 20 minutos consecutivos',
      'No dejar pertenencias personales sin supervisión'
    ],
    true,
    'https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg'
  );
