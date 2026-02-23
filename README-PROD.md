Server de prueba con compresión y cabeceras

- Instalar dependencias:

```bash
npm install
```

- Iniciar servidor en el puerto 8080:

```bash
npm start
```

El servidor aplica `gzip`/`brotli` (si el cliente lo soporta) y establece `Cache-Control` para assets estáticos. Útil para probar mejoras de rendimiento antes de desplegar en producción.
