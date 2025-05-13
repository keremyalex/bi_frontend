import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function DatabaseSelector({ onConnectionSuccess }) {
  const [form, setForm] = useState({
    host: "localhost",
    port: "5432",
    user: "",
    password: "",
  });

  const [bases, setBases] = useState([]);
  const [dbname, setDbname] = useState("__none__");
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const listarBases = async () => {
    const camposVacios = Object.entries(form).filter(
      ([_, value]) => value.trim() === ""
    );
    if (camposVacios.length > 0) {
      toast.error("Completa todos los campos para listar las bases.");
      return;
    }

    try {
      setCargando(true);
      const response = await axios.post(
        "http://localhost:8000/listar_bases",
        form
      );
      setBases(response.data.bases);
      toast.success("Bases de datos encontradas.");
    } catch (err) {
      console.error(err);
      toast.error("Error al listar bases de datos.");
    } finally {
      setCargando(false);
    }
  };

  const handleConnect = async () => {
    if (dbname === "__none__") {
      toast.error("Selecciona una base de datos.");
      return;
    }

    const fullConfig = { ...form, dbname };

    try {
      const response = await axios.post(
        "http://localhost:8000/listar_tablas",
        fullConfig
      );
      localStorage.setItem("dbConfig", JSON.stringify(fullConfig));

      if (response.data.tablas.length === 0) {
        toast.warn("La base de datos no contiene tablas.");
      } else {
        toast.success("Conexión exitosa");
      }

      onConnectionSuccess(fullConfig, response.data.tablas);
    } catch (err) {
      toast.error("Error al conectar con la base de datos");
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow max-w-md mx-auto bg-white text-black">
      <h2 className="text-xl font-bold mb-4">Conectar a la Base de Datos</h2>
      <div className="space-y-3">
        {["host", "port", "user", "password"].map((field) => (
          <input
            key={field}
            name={field}
            type={field === "password" ? "password" : "text"}
            placeholder={field}
            value={form[field]}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        ))}

        <button
          onClick={listarBases}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded"
          disabled={cargando}
        >
          {cargando ? "Buscando..." : "Listar bases disponibles"}
        </button>

        {bases.length > 0 && (
          <>
            <select
              className="w-full p-2 border rounded"
              value={dbname}
              onChange={(e) => setDbname(e.target.value)} // Asegúrate de que esto actualice correctamente el estado
            >
              <option value="__none__" disabled>
                Selecciona una base
              </option>
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>

            <button
              onClick={handleConnect}
              disabled={dbname === "__none__"} // Verifica que esta condición sea correcta
              className={`w-full p-2 rounded mt-2 ${
                dbname === "__none__"
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Conectar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
