// Requiere: npm install @xyflow/react axios react-toastify
import React, { useCallback, useEffect, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function DatabaseDiagram({ dbUrl }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const cargarTablasYRelaciones = async () => {
    try {
      const resTablas = await axios.get("http://localhost:8000/tablas", {
        params: { db_url: dbUrl },
      });

      const tablas = resTablas.data.tablas;

      const detalles = await Promise.all(
        tablas.map(async (tabla) => {
          try {
            const resCol = await axios.get("http://localhost:8000/columnas", {
              params: { db_url: dbUrl, tabla },
            });
            return { tabla, columnas: resCol.data.columnas };
          } catch {
            return { tabla, columnas: [] };
          }
        })
      );

      const resRelaciones = await axios.get("http://localhost:8000/relaciones", {
        params: { db_url: dbUrl },
      });

      const relaciones = resRelaciones.data.relaciones;

      const nodos = detalles.map((det, i) => ({
        id: det.tabla,
        data: {
          label: (
            <div>
              <strong>{det.tabla}</strong>
              <ul className="text-xs mt-1">
                {det.columnas.map((col, idx) => (
                  <li key={idx} className="text-gray-700 font-mono">
                    {col.name} <span className="text-gray-400">({col.type})</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        },
        position: { x: (i % 5) * 250, y: Math.floor(i / 5) * 200 },
        style: {
          padding: 10,
          border: "1px solid #888",
          borderRadius: 10,
          backgroundColor: "#fff",
          width: 220,
        },
      }));

      const edges = relaciones.map((rel, i) => ({
        id: `e${i}`,
        source: rel.tabla_origen,
        target: rel.tabla_referida,
        label: `${rel.columna_origen} → ${rel.columna_referida}`,
        type: "default",
        animated: true,
        style: { stroke: "#555" },
        labelStyle: { fontSize: 12 },
      }));

      setNodes(nodos);
      setEdges(edges);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar el diagrama relacional");
    }
  };

  useEffect(() => {
    if (dbUrl) {
      cargarTablasYRelaciones();
    }
  }, [dbUrl]);

  return (
    <div style={{ height: "600px", borderRadius: 10, background: "#f9f9f9" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}