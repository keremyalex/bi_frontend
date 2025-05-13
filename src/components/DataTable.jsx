import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

export default function DataTable({ columnas, filas }) {
  // Convertir las columnas del backend a formato de DataGrid
  const columnasFormateadas = columnas.map((col) => {
    // Separar la primera parte como tabla y el resto como columna
    const [tabla, ...restoParts] = col.includes('.') ? col.split('.') : col.split('_');
    const campo = restoParts.join('_');

    return {
      field: col,
      headerName: `${tabla}.${campo}`.toUpperCase(),
      width: 150,
    };
  });

  // Asegurar que cada fila tenga un id
  const filasConId = filas.map((fila, index) => ({
    id: index,
    ...fila,
  }));

  return (
      <Box sx={{ height: 400, width: "100%", bgcolor: "white", borderRadius: 2, p: 2 }}>
        <DataGrid
            rows={filasConId}
            columns={columnasFormateadas}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
  );
}