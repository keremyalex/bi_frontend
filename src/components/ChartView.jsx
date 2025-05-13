import Plot from 'react-plotly.js';

export default function ChartView({ datos, configuracion }) {
  const { columnaX, columnaY, operadorY, tipoGrafico } = configuracion;

  const getTitle = () => {
    if (operadorY === 'none') {
      return `${columnaY} vs ${columnaX}`;
    }
    return `${operadorY}(${columnaY}) por ${columnaX}`;
  };

  return (
      <div id="chart-container" className="w-full h-[500px]">
        <Plot
            data={[
              {
                x: datos.x,
                y: datos.y,
                type: tipoGrafico,
                mode: tipoGrafico === 'scatter' ? 'markers' : undefined,
                fill: tipoGrafico === 'area' ? 'tozeroy' : undefined,
              },
            ]}
            layout={{
              title: getTitle(),
              autosize: true,
              xaxis: {
                title: columnaX,
              },
              yaxis: {
                title: operadorY === 'none' ? columnaY : `${operadorY}(${columnaY})`,
              },
            }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
        />
      </div>
  );
}
