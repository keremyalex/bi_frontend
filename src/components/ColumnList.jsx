export default function ColumnList({ columnas }) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Columnas:</h3>
      <ul className="list-disc pl-6">
        {columnas.map((col) => (
          <li key={col.nombre}>
            <strong>{col.nombre}</strong> — {col.tipo}
          </li>
        ))}
      </ul>
    </div>
  );
}
