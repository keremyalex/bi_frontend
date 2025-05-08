# 📊 Mini BI Frontend (React + Plotly + TailwindCSS)

Este proyecto React se conecta a una base de datos PostgreSQL a través de una API construida con FastAPI, permitiendo al usuario:

- Conectarse a una base de datos.
- Visualizar tablas y sus columnas.
- Generar gráficos de barras, líneas o tortas con Plotly.
- Consultar en lenguaje natural usando OpenAI y graficar los resultados.
- Exportar los datos a CSV.
- Ver el diagrama relacional de las tablas con React Flow.

---

## 🚀 Tecnologías

- React 18+
- Vite
- Tailwind CSS
- Axios
- Plotly.js
- React Flow
- React Toastify
- Papaparse + FileSaver.js

---

## ⚙️ Requisitos

- Node.js 16 o superior
- Tener el backend corriendo en `http://localhost:8000`

---

## 📦 Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/keremyalex/bi_frontend.git
cd bi_frontend

# 2. Instala las dependencias
npm install

# 3. Ejecución
npm run dev