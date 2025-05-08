import Plot from 'react-plotly.js';

export default function PlotlyChart({ xData, yData, type = "bar", title = "Gráfico BI" }) {
  let data;

  if (type === "pie") {
    data = [{
      type: "pie",
      labels: xData,
      values: yData,
      textinfo: "label+percent",
      hoverinfo: "label+value+percent",
    }];
  } else if (type === "line") {
    data = [{
      x: xData,
      y: yData,
      type: "scatter",
      mode: "lines+markers",
      marker: { color: 'blue' }
    }];
  } else {
    data = [{
      x: xData,
      y: yData,
      type, // bar, etc.
      marker: { color: 'blue' }
    }];
  }

  return (
    <Plot
      data={data}
      layout={{
        title,
        margin: { t: 50, l: 40, r: 40, b: 40 },
      }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}
