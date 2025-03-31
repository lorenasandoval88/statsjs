// const Plotly =   (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/plotly.min.js'))
// const plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
// import * as Plotly from 'https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/plotly.min.js'
// const Plotly = (await import("https://cdn.plot.ly/plotly-latest.min.js"))
const Plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist/+esm')).default
const dataset = (await import("https://esm.sh/ml-dataset-iris"))
const localForage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'))
// const PCA = await import("https://esm.sh/pca-js")
// import PCA from "https://esm.sh/pca-js"
// import {PCA} from 'https://cdn.jsdelivr.net/npm/ml-pca@4.1.1/+esm'

// import * as PCA from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
import {  default as PCA } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.2/+esm'
const PCA2 = (await import("https://esm.sh/pca-js")).default

// Example usage:
const data = [
  [40, 50, 60],
  [50, 70, 60],
  [80, 70, 90],
  [50, 60, 80]
]
const labels = ['A', 'B', 'A', 'B', 'A'];

const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisData = dataset.getDataset()

console.log("PCA", PCA)
console.log("PCA2", PCA2)
console.log("Plotly", await Plotly)
console.log("dataset", dataset)

console.log("dataset", dataset.getDataset())

console.log("Plotly", await Plotly)

// console.log("new PCA2",new PCA2())

// console.log("PCA",new PCA(data))

import {
  modules
} from './modules/mypca.js'

// Declare global data variable 
const pcaData = {} 
pcaData.iris = dataset.getDataset()
pcaData.file = "none"

// load file and plot PCA
const loadPca = async () => {
  //sample data button element
  const sampleData = document.createElement('button')
  sampleData.id = 'sampleData'
  sampleData.textContent = 'Load Sample Data'
  // Add an event listener
  sampleData.addEventListener('click', function () {
    alert('Button clicked!');
  });
  document.body.appendChild(sampleData);

  // file input element
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'
  fileInput.setAttribute('type', 'file')
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader();

          reader.onload = async function (e) {
            const csv = e.target.result;
            const json = csvToJson(csv)
            const matrix = (json.map(Object.values))
            console.log("main json", json)
            // console.log('main matrix', matrix)
            matrix['headers'] = json['headers']
            pcaData.file = matrix
            console.log("pcaData", pcaData)

            // console.log('main load PCA csv', csv)


            const scores = await modules.calculatePca(json)
            console.log("main scores", scores)
            const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
            // plot function
            modules.plotPCA(scores, groups)
          };
          reader.onerror = function () {
            displayError('Error reading the file.');
          };
          reader.readAsText(file);
        }
      };
      reader.readAsText(file); // Read as text, other options are readAsArrayBuffer, readAsDataURL
    }
  });
  // Add the input element to the document body (or any other desired location)
  document.body.appendChild(fileInput);
}


function convertToNumber(str) {
  if (isNaN(str)) {
    return str; // It's a letter or other non-numeric character, return the original string
  } else {
    return Number(str); // It's a number (or can be converted to one), so convert it
  }
}

function csvToJson(csv) {
  const lines = csv.split(/\r?\n/);
  // console.log("lines", lines)
  const headers = lines[0].split(',');
  // console.log("headers", headers)
  const result = [];
  result.headers = headers;

  for (let i = 1; i < lines.length - 1; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = convertToNumber(currentLine[j])
    }
    result.push(obj);
  }
  // console.log("result", result)
  return result;
}

// Assume 'data' is your dataset and 'labels' are the corresponding labels
// 'data' should be a 2D array where each row represents a sample and each column represents a feature
// 'labels' should be an array with the same length as the number of rows in 'data'
async function pcaPlotlyPlot2(data, labels) {

  var eigenvectors = PCA.getEigenVectors(data);
  // var first = PCA.computePercentageExplained(vectors,vectors[0])
  var topTwo = PCA.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = PCA.getExplainedVariance();

  // console.log("vectors",vectors)
  // console.log("first",first)
  console.log("topTwo", topTwo)
  console.log("eigenvectors", eigenvectors)
  console.log("eigenvectors.map(row => row[0])", eigenvectors[0].vector)
  console.log("eigenvectors.map(row => row[1])", eigenvectors[1].vector)

  const numComponents = 2
  const pcScores = data.map(row => {
    const transformedRow = [];
    for (let i = 0; i < numComponents; i++) {
      transformedRow.push(row.reduce((sum, val, idx) => sum + val * eigenvectors[idx][i], 0));
    }
    return transformedRow;
  });
  console.log("pcScores", pcScores)
  const pc1 = eigenvectors[0].vector //eigenvectors.map(row => row[0]);
  const pc2 = eigenvectors[1].vector //eigenvectors.map(row => row[1]);
  // For 3D plot
  const pc3 = eigenvectors[2].vector //pcScores.map(row => row[2]);

  const trace3d = {
    x: pc1,
    y: pc2,
    z: pc3,
    mode: 'markers',
    type: 'scatter3d',
    marker: {
      size: 4,
      opacity: 0.8
    }
  };

  const layout3d = {
    margin: {
      l: 20,
      r: 0,
      b: 50,
      t: 110
    },
    title: '3D PCA Plot',
    scene: {
      xaxis: {
        title: 'Principal Component 1'
      },
      yaxis: {
        title: 'Principal Component 2'
      },
      zaxis: {
        title: 'Principal Component 3'
      }
    }
  };
  // Create the plot div
  const pca_plot2 = document.createElement("div")
  pca_plot2.id = 'pca_plot2'
  pca_plot2.style.width = 400 //"auto";
  pca_plot2.style.height = 400 //"auto";

  document.body.appendChild(pca_plot2);
  // pca_plot2.append(document.createElement('br'));
  console.log("Plotly", Plotly)

  await Plotly.newPlot('pca_plot2', [trace3d], layout3d);
}

async function pcaPlotlyPlot3(data, labels) {
  var eigenvectors = PCA.getEigenVectors(data);
  // var first = PCA.computePercentageExplained(vectors,vectors[0])
  var topTwo = PCA.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = PCA.getExplainedVariance();

  // console.log("vectors",vectors)
  // console.log("first",first)
  console.log("topTwo", topTwo)
  console.log("eigenvectors", eigenvectors)
  console.log("eigenvectors.map(row => row[0])", eigenvectors[0].vector)
  console.log("eigenvectors.map(row => row[1])", eigenvectors[1].vector)

  const numComponents = 2
  const pcScores = data.map(row => {
    const transformedRow = [];
    for (let i = 0; i < numComponents; i++) {
      transformedRow.push(row.reduce((sum, val, idx) => sum + val * eigenvectors[idx][i], 0));
    }
    return transformedRow;
  });
  console.log("pcScores", pcScores)
  const pc1 = eigenvectors[0].vector //eigenvectors.map(row => row[0]);
  const pc2 = eigenvectors[1].vector //eigenvectors.map(row => row[1]);
  // For 3D plot
  // const pc3 = eigenvectors[2].vector//pcScores.map(row => row[2]);

  const trace3d = {
    x: pc1,
    y: pc2,
    // z: pc3,
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 4,
      opacity: 0.8
    }
  };

  const layout2d = {
    // margin: {
    //   l: 150,
    //   r: 70,
    //   b: 150,
    //   t: 50
    // },
    title: {
      text: '3D PCA Plot',
      x: 0.5,
      xanchor: 'center'
    },
    scene: {
      xaxis: {
        title: 'PC1',
        titlefont: {
          color: 'red',
          family: 'Arial, Open Sans',
          size: 12
        }
      },
      yaxis: {
        title: 'PC2'
      },
      // zaxis: { title: 'Principal Component 3' }
    }
  };
  // Create the plot div
  const pca_plot3 = document.createElement("div")
  pca_plot3.id = 'pca_plot3'
  // pca_plot3.style.width = 400//"auto";
  // pca_plot3.style.height = 400//"auto";

  document.body.appendChild(pca_plot3);
  // pca_plot2.append(document.createElement('br'));
  await Plotly.newPlot('pca_plot3', [trace3d], layout2d);
}


function pcaPlotlyPlot(data, labels) {
  console.log("data", data)
  // console.log("pca",pca)
  console.log("pca", PCA.getComponents())

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

// // Example usage:
// const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [2, 3, 4], [5, 6, 7]];
// const labels = ['A', 'B', 'A', 'B', 'A'];

await pcaPlotlyPlot2(data, labels);
await pcaPlotlyPlot3(data, labels);

// pcaPlotlyPlot2(data, labels);

loadPca()


export {
  loadPca,
  pcaData
}