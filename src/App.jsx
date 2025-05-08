import { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import PlotlyChart from "./components/PlotlyChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    try {
      const res = await axios.get("http://localhost:8000/consulta-join", {
        params: {
          db_url: dbUrl,
          columna_x: columnaXFull,
          columna_y: columnaYFull
        }
      });
      setDatos(res.data);
      toast.success("✅ Gráfico generado con joins");
    } catch (error) {
      toast.error("Error al generar gráfico con joins");
    }
  };

  const exportarCSV = () => {
    if (!datos || datos.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }
    const csv = unparse(datos);
    // Agrega BOM para UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    // Fecha y hora actual para el nombre del archivo
    const fecha = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const nombreArchivo = `datos-grafico-${fecha}.csv`;
    saveAs(blob, nombreArchivo);
  };

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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition mt-4"
            onClick={generarGraficoJoin}
            disabled={!columnaXFull || !columnaYFull}
          >
            Generar gráfico con JOIN
          </button>
        </div>
      )}

      {datos.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📈 Resultado</h2>
          <PlotlyChart
            xData={datos.map(d => d.x)}
            yData={datos.map(d => d.y)}
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

      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
}

export default App;
