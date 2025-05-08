import { useState, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import PlotlyChart from "./components/PlotlyChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatabaseDiagram from "./components/DatabaseDiagram";

function App() {
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [dbname, setDbname] = useState("");
  const [dbUrl, setDbUrl] = useState("");

  const [tabla, setTabla] = useState("");
  const [columnas, setColumnas] = useState([]);
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [datos, setDatos] = useState([]);
  const [tablasConColumnas, setTablasConColumnas] = useState([]);
  const [todasColumnas, setTodasColumnas] = useState([]);
  const [columnaXFull, setColumnaXFull] = useState("");
  const [columnaYFull, setColumnaYFull] = useState("");
  const [tipoGrafico, setTipoGrafico] = useState("bar");
  const [pregunta, setPregunta] = useState("");
  const [sqlGenerado, setSqlGenerado] = useState("");

  const [respuestaAI, setRespuestaAI] = useState([]);
  

  const conectar = async () => {
    const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbname}`;
    try {
      const res = await axios.get("http://localhost:8000/probar-conexion", {
        params: { db_url: url },
      });
      toast.success("✅ Conexión exitosa a la base de datos");
      setDbUrl(url);
      await cargarTodasLasColumnas(url);
    } catch (error) {
      toast.error("❌ Error al conectar: " + (error.response?.data?.detail || error.message));
    }
  };

  const cargarTodasLasColumnas = async (url) => {
    try {
      const res = await axios.get("http://localhost:8000/tablas", {
        params: { db_url: url },
      });
      const tablas = res.data.tablas;

      const colsPorTabla = await Promise.all(
        tablas.map(async (tabla) => {
          try {
            const resCol = await axios.get("http://localhost:8000/columnas", {
              params: { db_url: url, tabla },
            });
            return resCol.data.columnas.map(col => ({
              nombre: `${tabla}.${col.name}`,
              tabla,
              campo: col.name,
              tipo: col.type
            }));
          } catch {
            return [];
          }
        })
      );

      setTodasColumnas(colsPorTabla.flat());
      toast.success("📋 Columnas de todas las tablas cargadas");
    } catch {
      toast.error("❌ Error al cargar columnas");
    }
  };

  const generarGraficoJoin = async () => {
    if (!columnaXFull || !columnaYFull) {
      toast.error("Debe seleccionar tanto la columna X como la columna Y");
      return;
    }

    try {
      const res = await axios.get("http://localhost:8000/consulta-join", {
        params: {
          db_url: dbUrl,
          columna_x: columnaXFull,
          columna_y: columnaYFull
        }
      });
      if (!res.data || res.data.length === 0) {
        toast.error("❌ No se encontraron datos para generar el gráfico");
        setDatos([]);
        return;
      }
      setDatos(res.data);
      setTipoGrafico("bar"); // gráfico por defecto
      toast.success("✅ Gráfico generado con joins");
    } catch (error) {
      toast.error("Error al generar gráfico con joins");
    }
  };

  const generarGraficoDesdePregunta = async () => {
    if (!pregunta || !dbUrl) {
      toast.error("Debe escribir una pregunta y estar conectado a la base de datos");
      return;
    }
    try {
      const res = await axios.get("http://localhost:8000/generar-consulta", {
        params: { db_url: dbUrl, pregunta }
      });
      if (!res.data.datos || res.data.datos.length === 0) {
        toast.error("La consulta no devolvió resultados");
        return;
      }
      setDatos(res.data.datos);
      setSqlGenerado(res.data.sql);
      setColumnaXFull(res.data.columnas[0]);
      setColumnaYFull(res.data.columnas[1]);
      setTipoGrafico("bar");
      toast.success("✅ Gráfico generado desde lenguaje natural");
    } catch (error) {
      toast.error("Error al generar gráfico: " + (error.response?.data?.detail || error.message));
    }
  };

  const generarDesdeAI = async (pregunta) => {
    try {
      const res = await axios.get("http://localhost:8000/generar-consulta", {
        params: { db_url: dbUrl, pregunta }
      });
      setSqlGenerado(res.data.sql);
      setRespuestaAI(res.data.datos);
      toast.success("🧠 Consulta generada por IA");
    } catch (error) {
      toast.error("Error al generar gráfico: " + (error.response?.data?.detail || error.message));
    }
  };

  const exportarCSV = () => {
    if (!datos || datos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    const csv = unparse(datos);
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const fecha = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const nombreArchivo = `datos-grafico-${fecha}.csv`;
    saveAs(blob, nombreArchivo);
  };

  useEffect(() => {
    // Aquí se podría añadir lógica adicional si el tipo de gráfico requiere condiciones especiales
  }, [tipoGrafico]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">📊 Mini BI con React + Plotly</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-2">1. Conexión a PostgreSQL</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input className="input" placeholder="Host" value={host} onChange={e => setHost(e.target.value)} />
          <input className="input" placeholder="Puerto" value={port} onChange={e => setPort(e.target.value)} />
          <input className="input" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} />
          <input className="input" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
          <input className="input col-span-2" placeholder="Base de datos" value={dbname} onChange={e => setDbname(e.target.value)} />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          onClick={conectar}
          disabled={!host || !port || !user || !password || !dbname}
        >
          Conectar
        </button>
      </div>
      {dbUrl && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4 mt-6">
          <h2 className="text-xl font-semibold">📡 Diagrama de Relaciones</h2>
          <DatabaseDiagram dbUrl={dbUrl} />
        </div>
      )}

      {todasColumnas.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">🔄 Gráfico cruzando tablas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Columna X</label>
              <select
                className="input w-full"
                value={columnaXFull}
                onChange={e => setColumnaXFull(e.target.value)}
              >
                <option value="">Selecciona columna</option>
                {todasColumnas.map((col, i) => (
                  <option key={i} value={col.nombre}>{col.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Columna Y (numérica)</label>
              <select
                className="input w-full"
                value={columnaYFull}
                onChange={e => setColumnaYFull(e.target.value)}
              >
                <option value="">Selecciona columna</option>
                {todasColumnas
                  .filter(col => col.tipo.toLowerCase().includes("int") || col.tipo.toLowerCase().includes("decimal"))
                  .map((col, i) => (
                    <option key={i} value={col.nombre}>{col.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mt-4 disabled:opacity-50"
            onClick={generarGraficoJoin}
            disabled={!columnaXFull || !columnaYFull}
          >
            Generar gráfico con JOIN
          </button>
        </div>
      )}

      {datos.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">📈 Resultado</h2>
            <select
              className="input"
              value={tipoGrafico}
              onChange={(e) => setTipoGrafico(e.target.value)}
            >
              <option value="bar">📊 Barras</option>
              <option value="line">📈 Líneas</option>
              <option value="pie">🥧 Torta</option>
            </select>
          </div>
          <PlotlyChart
            xData={datos.map(d => d.x)}
            yData={datos.map(d => d.y)}
            type={tipoGrafico}
            title={`Gráfico de ${columnaYFull} por ${columnaXFull}`}
          />
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition mt-4"
            onClick={exportarCSV}
          >
            📥 Exportar a CSV
          </button>
        </div>
      )}

      {/* {dbUrl && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">💬 Pregunta en lenguaje natural</h2>
          <input
            className="input w-full"
            placeholder="Ej: ¿Cuál es el total de ventas por mes?"
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            onClick={generarGraficoDesdePregunta}
            disabled={!pregunta}
          >
            Generar gráfico desde texto
          </button>
        </div>
      )} */}
  {dbUrl && (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">🧠 Consulta con OpenAI</h2>
      <input
        type="text"
        className="input w-full"
        placeholder="Ej: Total de ventas por empleado"
        onKeyDown={(e) => {
          if (e.key === "Enter") generarDesdeAI(e.target.value);
        }}
      />
    </div>
  )}

  {sqlGenerado && (
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">📄 Consulta SQL generada</h3>
        <pre className="bg-gray-100 p-4 rounded font-mono overflow-x-auto text-sm">
          {sqlGenerado}
        </pre>
    
        {respuestaAI.length > 0 && (
          <PlotlyChart
            xData={respuestaAI.map(d => Object.values(d)[0])}
            yData={respuestaAI.map(d => Object.values(d)[1])}
            title="Gráfico generado por IA"
          />
        )}
      </div>
    )}


      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );


}

export default App;
