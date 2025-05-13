import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import CustomNode from './CustomNode';

export default function RelationDiagram({ dbConfig }) {
  const [relaciones, setRelaciones] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    const cargarRelaciones = async () => {
      try {
        const res = await axios.post('http://localhost:8000/relaciones', dbConfig);
        setRelaciones(res.data);
      } catch (err) {
        console.error("Error al cargar relaciones:", err);
      }
    };

    if (dbConfig) cargarRelaciones();
  }, [dbConfig]);

  useEffect(() => {
    if (!relaciones) return;

    const newNodes = Object.keys(relaciones).map((tabla, i) => ({
      id: tabla,
      type: 'custom',
      data: {
        label: tabla,
        columnas: relaciones[tabla].columnas,
      },
      position: {
        x: 100 + (i % 4) * 250,
        y: Math.floor(i / 4) * 180,
      },
    }));

    const newEdges = [];
    for (const [tabla, info] of Object.entries(relaciones)) {
      info.foraneas.forEach((fk, i) => {
        newEdges.push({
          id: `${tabla}->${fk.referencia_tabla}-${i}`,
          source: tabla,
          target: fk.referencia_tabla,
          animated: true,
          label: `${tabla}.${fk.columna} → ${fk.referencia_tabla}.${fk.referencia_columna}`,
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [relaciones]);

  return (
    <div style={{ height: 500 }} className="bg-white text-black p-4 rounded shadow mt-6">
      <h3 className="text-lg font-bold mb-2 text-center">Diagrama de relaciones</h3>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        fitView
        nodeTypes={nodeTypes}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
