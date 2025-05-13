import { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "./DataTable";
import ChartView from "./ChartView";
import { toast } from "react-toastify";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import apiService from "../services/api.js";


export default function CombinedTableViewer({ dbConfig, tablas }) {
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [tablasMarcadas, setTablasMarcadas] = useState([]);
  const [datos, setDatos] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [mostrarVisualizacion, setMostrarVisualizacion] = useState(false);
  const [mostrarGrafico, setMostrarGrafico] = useState(false);
  const [cargandoGrafico, setCargandoGrafico] = useState(false);
  const [datosGrafico, setDatosGrafico] = useState(null);
  const [configuracionGrafico, setConfiguracionGrafico] = useState({
    columnaX: '',
    columnaY: '',
    operadorY: 'none',
    tipoGrafico: 'bar'
  });

  const operadoresAgregacion = [
    { value: 'none', label: 'Sin agregación' },
    { value: 'SUM', label: 'SUM' },
    { value: 'COUNT', label: 'COUNT' },
    { value: 'AVG', label: 'AVG' },
    { value: 'MAX', label: 'MAX' },
    { value: 'MIN', label: 'MIN' }
  ];

  useEffect(() => {
    if (tablaSeleccionada) {
      cargarVistaPrevia(tablaSeleccionada);
    }
  }, [tablaSeleccionada]);

  const cargarVistaPrevia = async (tabla) => {
    try {
      const res = await axios.post("http://localhost:8000/ver_datos", {
        ...dbConfig,
        tablas: [tabla],
      });
      setColumnas(res.data.columnas);
      setDatos(res.data.datos);
    } catch (err) {
      toast.error("Error al cargar vista previa");
      console.error(err);
    }
  };

  const toggleCheckbox = (tabla) => {
    setTablasMarcadas((prev) =>
        prev.includes(tabla)
            ? prev.filter((t) => t !== tabla)
            : [...prev, tabla]
    );
  };

  const cargarDatos = async () => {
    if (tablasMarcadas.length === 0) {
      toast.error("Selecciona al menos una tabla para continuar");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/ver_datos_combinados", {
        ...dbConfig,
        tablas: tablasMarcadas,
      });
      console.log("Datos combinados:", res.data);
      setColumnas(res.data.columnas);
      setDatos(res.data.datos);
      setMostrarVisualizacion(true);
      setMostrarGrafico(false);
      setDatosGrafico(null);
      setConfiguracionGrafico({
        columnaX: '',
        columnaY: '',
        operadorY: 'none',
        tipoGrafico: 'bar'
      });
    } catch (err) {
      toast.error("Error al cargar los datos combinados");
      console.error(err);
    }
  };

  const handleConfiguracionChange = (e) => {
    const { name, value } = e.target;
    setConfiguracionGrafico(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generarGrafico = async () => {
    if (datos.length === 0 || columnas.length === 0) {
      toast.error("No hay datos para graficar");
      return;
    }
    if (!configuracionGrafico.columnaX || !configuracionGrafico.columnaY) {
      toast.error("Selecciona las columnas para el gráfico");
      return;
    }

    setCargandoGrafico(true);
    console.log("Datos enviados al servidor:", {
      ...dbConfig,
      tablas: tablasMarcadas,
      configuracion: configuracionGrafico
    });

    try {
      const res = await axios.post("http://localhost:8000/generar_grafico", {
        ...dbConfig,
        tablas: tablasMarcadas,
        configuracion: configuracionGrafico
      });

      setDatosGrafico(res.data);
      setMostrarGrafico(true);
    } catch (err) {
      toast.error("Error al generar el gráfico");
      console.error(err);
    } finally {
      setCargandoGrafico(false);
    }
  };

  const exportarDatos = async () => {
    if (datos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    try {
      await apiService.exportarCSV(dbConfig, tablasMarcadas, datos);
      toast.success("Datos exportados exitosamente");
    } catch (error) {
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

  const exportarDiagrama = async () => {
    if (!mostrarGrafico || !datosGrafico) {
      toast.error("No hay gráfico para exportar");
      return;
    }

    try {
      await apiService.exportarDiagramaPDF('chart-container');
      toast.success("Diagrama exportado exitosamente");
    } catch (error) {
      toast.error("Error al exportar diagrama");
      console.error(error);
    }
  };


  return (
      <div className="bg-white text-black p-4 rounded shadow mt-8 grid grid-cols-5 gap-6">
        <div className="col-span-1 border-r pr-4">
          <h4 className="text-md font-bold mb-3">Tablas</h4>
          <div className="flex flex-col gap-2">
            {tablas.map((tabla) => (
                <div key={tabla} className="flex items-center gap-2">
                  <input
                      type="checkbox"
                      checked={tablasMarcadas.includes(tabla)}
                      onChange={() => toggleCheckbox(tabla)}
                  />
                  <button
                      onClick={() => setTablaSeleccionada(tabla)}
                      className={`text-left px-3 py-1 rounded w-full text-sm ${
                          tablaSeleccionada === tabla
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300"
                      }`}
                  >
                    {tabla}
                  </button>
                </div>
            ))}
          </div>

          <button
              onClick={cargarDatos}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Cargar datos
          </button>
        </div>

        <div className="col-span-4">
          {tablaSeleccionada && (
              <>
                <h3 className="text-lg font-semibold mb-2 text-center">
                  Vista previa de <span className="text-blue-600">{tablaSeleccionada}</span>
                </h3>
                <DataTable columnas={columnas} filas={datos} />
              </>
          )}

          {mostrarVisualizacion && (
              <>
                <h4 className="text-lg font-semibold my-4 text-center">Visualización de datos</h4>

                <div className="mb-4 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Columna Eje X
                      </label>
                      <select
                          name="columnaX"
                          value={configuracionGrafico.columnaX}
                          onChange={handleConfiguracionChange}
                          className="w-full p-2 border rounded"
                      >
                        <option value="">Selecciona columna</option>
                        {columnas.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Columna Eje Y
                      </label>
                      <select
                          name="columnaY"
                          value={configuracionGrafico.columnaY}
                          onChange={handleConfiguracionChange}
                          className="w-full p-2 border rounded"
                      >
                        <option value="">Selecciona columna</option>
                        {columnas.map(col => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Operador Eje Y
                      </label>
                      <select
                          name="operadorY"
                          value={configuracionGrafico.operadorY}
                          onChange={handleConfiguracionChange}
                          className="w-full p-2 border rounded"
                      >
                        {operadoresAgregacion.map(op => (
                            <option key={op.value} value={op.value}>
                              {op.label}
                            </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Gráfico
                      </label>
                      <select
                          name="tipoGrafico"
                          value={configuracionGrafico.tipoGrafico}
                          onChange={handleConfiguracionChange}
                          className="w-full p-2 border rounded"
                      >
                        <option value="bar">Barras</option>
                        <option value="line">Líneas</option>
                        <option value="scatter">Dispersión</option>
                        <option value="pie">Circular</option>
                        <option value="area">Área</option>
                      </select>
                    </div>
                  </div>

                  {configuracionGrafico.operadorY !== 'none' && (
                      <div className="text-sm text-gray-600 italic mt-2">
                        Se {configuracionGrafico.operadorY === 'COUNT' ? 'contarán' : 'agregarán'} los valores de {configuracionGrafico.columnaY} agrupados por {configuracionGrafico.columnaX}
                      </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                        onClick={generarGrafico}
                        disabled={cargandoGrafico}
                        className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded
                    ${cargandoGrafico ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {cargandoGrafico ? 'Generando...' : 'Generar gráfico'}
                    </button>
                  </div>
                </div>

                {mostrarGrafico && datosGrafico && (
                    <div className="mt-4">
                      <ChartView
                          datos={datosGrafico}
                          configuracion={configuracionGrafico}
                      />
                      <div className="flex justify-center gap-4 mt-4">
                        <button
                            onClick={exportarDatos}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Exportar Datos CSV
                        </button>

                        {mostrarGrafico && datosGrafico && (
                            <button
                                onClick={exportarDiagrama}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                            >
                              Exportar Gráfico PDF
                            </button>
                        )}
                      </div>

                    </div>

                )}
              </>
          )}
        </div>
      </div>
  );
}
