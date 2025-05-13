# Mini BI

Mini BI es una aplicación web moderna para el análisis y visualización de datos, desarrollada con React y Vite. Permite conectarse a bases de datos, generar visualizaciones interactivas y exportar los resultados.

## Requisitos Previos

- Node.js (versión 16.0 o superior)
- npm (incluido con Node.js)
- Una base de datos (por el momento solo postgres )

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/keremyalex/bi_frontend.git
   cd bi_frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

## Configuración

1. **Variables de entorno**
    - Ingresar los datos del backend en services/api.js:

2. **Configuración de la base de datos**
    - La aplicación solicitará los detalles de conexión en la interfaz de usuario:
        - Host
        - Puerto
        - Nombre de la base de datos
        - Usuario
        - Contraseña

## Ejecución

1. **Iniciar en modo desarrollo**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:5173`

2. **Construir para producción**
   ```bash
   npm run build
   ```

3. **Previsualizar la versión de producción**
   ```bash
   npm run preview
   ```

## Características Principales

- 📊 Visualización interactiva de datos
- 🔄 Conexión en tiempo real con bases de datos
- 📱 Interfaz responsive y moderna
- 📥 Exportación de datos a CSV
- 📄 Exportación de gráficos a PDF
- 🎨 Personalización de visualizaciones
- 📈 Múltiples tipos de gráficos disponibles

## Uso Básico

1. **Conexión a la base de datos**
    - Ingresar las credenciales de conexión en la pantalla inicial
    - Verificar la conexión exitosa

2. **Selección de datos**
    - Elegir las tablas deseadas
    - Seleccionar campos para visualización
    - Aplicar filtros si es necesario

3. **Visualización**
    - Seleccionar el tipo de gráfico
    - Personalizar la visualización
    - Exportar resultados según necesidad

## Resolución de Problemas

Si encuentras algún problema durante la instalación o ejecución:

1. Verifica que todas las dependencias estén instaladas:
   ```bash
   npm install
   ```

2. Limpia la caché de npm:
   ```bash
   npm cache clean --force
   ```

3. Si hay problemas con las dependencias:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Tecnologías Utilizadas

- React 19.1.0
- Vite 6.3.5
- TailwindCSS 4.1.6
- Material-UI 7.1.0
- React Router DOM 7.6.0
- Axios 1.9.0
- Plotly.js 3.0.1
- Y otras dependencias listadas en `package.json`

## Soporte

Para reportar problemas o sugerir mejoras, por favor crear un issue en:
https://github.com/keremyalex/bi_frontend/issues

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.