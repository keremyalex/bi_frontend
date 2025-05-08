import Plot from 'react-plotly.js';

export default function PlotlyChart({ xData, yData, type = "bar", title = "Gráfico BI" }) {
  return (
    <Plot
      data={[{
        x: xData,
        y: yData,
        type,
        marker: { color: 'blue' }
      }]}
      layout={{ title }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}
