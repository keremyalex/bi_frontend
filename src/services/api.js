import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

// Configuración base de axios
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Funciones de la API
export const apiService = {
    // Listar tablas disponibles
    listarTablas: async (dbConfig) => {
        try {
            const response = await api.post('/listar_tablas', dbConfig);
            return response.data;
        } catch (error) {
            throw new Error('Error al listar tablas: ' + error.message);
        }
    },

    // Ver datos de una tabla
    verDatos: async (dbConfig, tablas) => {
        try {
            const response = await api.post('/ver_datos', {
                ...dbConfig,
                tablas: tablas,
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al cargar datos: ' + error.message);
        }
    },

    // Ver datos combinados de múltiples tablas
    verDatosCombinados: async (dbConfig, tablas) => {
        try {
            const response = await api.post('/ver_datos_combinados', {
                ...dbConfig,
                tablas: tablas,
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al cargar datos combinados: ' + error.message);
        }
    },

    // Generar gráfico
    generarGrafico: async (dbConfig, tablas, configuracion) => {
        try {
            const response = await api.post('/generar_grafico', {
                ...dbConfig,
                tablas: tablas,
                configuracion: configuracion,
            });
            return response.data;
        } catch (error) {
            throw new Error('Error al generar gráfico: ' + error.message);
        }
    },

    exportarCSV: async (dbConfig, tablas, datos) => {
        try {
            const csvContent = "data:text/csv;charset=utf-8," +
                // Crear encabezados
                Object.keys(datos[0]).join(",") + "\n" +
                // Crear filas
                datos.map(row => Object.values(row).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `datos_${tablas.join("_")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            return true;
        } catch (error) {
            throw new Error('Error al exportar CSV: ' + error.message);
        }
    },

    // Exportar diagrama a PDF (usando html2canvas y jsPDF)
    exportarDiagramaPDF: async (elementId) => {
        try {
            const { default: html2canvas } = await import('html2canvas');
            const { default: jsPDF } = await import('jspdf');

            const element = document.getElementById(elementId);
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' para landscape
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('diagrama.pdf');

            return true;
        } catch (error) {
            throw new Error('Error al exportar PDF: ' + error.message);
        }
    }

};

export default apiService;