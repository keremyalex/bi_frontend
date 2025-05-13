import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import DatabaseSelector from "./components/DatabaseSelector";
import CombinedTableViewer from "./components/CombinedTableViewer";
import RelationDiagram from "./components/RelationDiagram";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [dbConfig, setDbConfig] = useState(null);
  const [tablas, setTablas] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("dbConfig");
    if (saved) {
      const config = JSON.parse(saved);
      axios
        .post("http://localhost:8000/listar_tablas", config)
        .then((res) => {
          setDbConfig(config);
          setTablas(res.data.tablas);
          if (!toast.isActive("restore-toast")) {
            toast.success("Conexión restaurada automáticamente", {
              toastId: "restore-toast",
            });
          }
        })
        .catch((err) => {
          console.error("No se pudo restaurar la conexión:", err);
          localStorage.removeItem("dbConfig");
          toast.error("Error al restaurar conexión");
        });
    }
  }, []);


  const handleConnection = (config, tablas) => {
    setDbConfig(config);
    setTablas(tablas);
    localStorage.setItem("dbConfig", JSON.stringify(config));
  };


  const cerrarConexion = () => {
    localStorage.removeItem("dbConfig");
    setDbConfig(null);
    setTablas([]);
    toast.info("Conexión cerrada");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-20">
      <h1 className="text-3xl font-bold text-center pb-10">📊 Mini BI</h1>
      {!dbConfig ? (
        <DatabaseSelector onConnectionSuccess={handleConnection} />
      ) : (
        <div className="w-full max-w-screen-lg mx-auto mt-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-center w-full">
              Tablas disponibles
            </h2>
            <button
              onClick={cerrarConexion}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm absolute top-4 right-4"
            >
              Cerrar conexión
            </button>
          </div>

          {/* <TableRelations dbConfig={dbConfig} /> */}

          <RelationDiagram dbConfig={dbConfig} />

          <CombinedTableViewer dbConfig={dbConfig} tablas={tablas} />

        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
