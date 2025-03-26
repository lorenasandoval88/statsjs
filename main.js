const dataset = (await import("https://esm.sh/ml-dataset-iris"))
const { PCA} = await import("https://esm.sh/pca-js")
import * as pcaJS from "https://esm.sh/pca-js"
console.log("pcaJS",pcaJS)

console.log("PCA",PCA)

import { modules } from './modules/mypca.js'


const pcaData = {}// Declare global variable
pcaData.iris = dataset.getDataset()
pcaData.file = "none"
// Next: create a file input element
const loadFile = async () => {
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
            console.log("pcaData",pcaData)

            // console.log('main csv', csv)
            // console.log('json[headers]', json['headers'])
            // displayJson(json);

            const scores = await modules.calculatePca(json)
            console.log("main scores", scores)
            const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
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

function pcaPlot(data, labels) {
  // Perform PCA using a library like PCA-js or implement it manually
  const pca = new PCA(data); // Assuming you are using PCA-js
  console.log("pca",pca)
  const components = pca.getComponents(2); // Get the first two principal components

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
    xaxis: { title: 'Principal Component 1' },
    yaxis: { title: 'Principal Component 2' }
  };

  // Create the plot

  const pca_plot = document.createElement("div")
  pcaDiv.id = 'pca_plot'
  document.body.appendChild(pcaDiv);
  pcaDiv.append(document.createElement('br'));

  Plotly.newPlot('pca_plot', [trace], layout); // 'pca-plot' is the ID of the div where the plot will be rendered
}

// Example usage:
const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [2, 3, 4], [5, 6, 7]];
const labels = ['A', 'B', 'A', 'B', 'A'];

pcaPlot(data, labels);

loadFile()


export {
  loadFile,
  pcaData
}