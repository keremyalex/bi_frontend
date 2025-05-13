import { Handle, Position } from '@xyflow/react';

export default function CustomNode({ data }) {
  return (
    <div className="bg-white text-black border border-blue-400 rounded shadow p-2 text-xs w-48">
      <div className="font-bold text-center mb-1">{data.label}</div>
      <ul className="list-disc pl-4">
        {data.columnas.map((col) => (
          <li key={col}>{col}</li>
        ))}
      </ul>

      {/* Handles necesarios para dibujar conexiones */}
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
}
