Preparar el proyecto para compilar como app Android con Capacitor

1) Preparar los assets web

  npm run build:web

Esto crea/actualiza la carpeta `www` con los ficheros del proyecto.

2) Inicializar Capacitor (solo la primera vez)

  npm run cap:init

3) Añadir la plataforma Android

  npm run cap:add:android

4) Sincronizar cambios web y abrir Android Studio

  npm run cap:sync
  npm run cap:open:android

Desde Android Studio puedes compilar el APK (`Build > Build Bundle(s) / APK(s) > Build APK(s)`).

Notas:
- Este repo es una PWA estática; el `build:web` copia el contenido del repo a `www`. Revisa `www` antes de compilar.
- Para firmar y publicar el APK usa las herramientas habituales de Android Studio.
- Si quieres compilar totalmente desde móvil (Termux) házmelo saber, lo documentamos aparte.
