// const Plotly =   (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/plotly.min.js'))
// const plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
// import * as Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/plotly.min.js'
// const Plotly = (await import("https://cdn.plot.ly/plotly-latest.min.js"))
// const PCA = await import("https://esm.sh/pca-js")
// const PCA2 = (await import("https://esm.sh/pca-js")).default
// import PCA from "https://esm.sh/pca-js"
// import {PCA} from 'https://cdn.jsdelivr.net/npm/ml-pca@4.1.1/+esm'
// import * as PCA from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'

async function pcaPlotlyPlot(data, labels) {
  //console.log("data", data)
  // //console.log("pca",pca)
  //console.log("pca", PCA.getComponents())

  // Perform PCA using a library like PCA-js or implement it manually
  const pca = new PCA(); // Assuming you are using PCA-js
  const components = PCA.getComponents(data); // Get the first two principal components

  // Prepare data for Plotly
  const trace = {
    x: components.map(c => c[0]),
    y: components.map(c => c[1]),
    mode: 'markers',
    type: 'scatter',
    text: labels, // Optional: Add labels to data points
    marker: {
      size: 8,
      color: labels.map(label => (label === 'A' ? 'blue' : (label === 'B' ? 'red' : 'green'))) // Example coloring based on labels
    }
  };

  const layout = {
    title: 'PCA Plot',
    xaxis: {
      title: 'Principal Component 1'
    },
    yaxis: {
      title: 'Principal Component 2'
    }
  };

  // Create the plot div
  const pca_plot = document.createElement("div")
  pcaDiv.id = 'pca_plot'
  document.body.appendChild(pcaDiv);
  pcaDiv.append(document.createElement('br'));

  Plotly.newPlot('pca_plot', [trace], layout); // 'pca-plot' is the ID of the div where the plot will be rendered
}
