const Plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
const dataset = (await import("https://esm.sh/ml-dataset-iris"))
const localForage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'))
import { default as PCA } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
import {modules} from './modules/mypca.js'
//https://observablehq.com/@saehrimnir/dimensionality-reduction-drawings
//https://observablehq.com/@3e787c1af6c5a437/a-comparative-overview-of-dimension-reduction-methods
//https://codesandbox.io/p/sandbox/eloquent-shtern-cj5vr6?file=%2Fsrc%2FpcaUtils.js%3A28%2C14-28%2C19

// Example iris dataset:
const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisData = dataset.getDataset()
const irisDataNumbersOnly = irisData.map(x => (removeNonNumbers(x)))
const irisDataNamesOnly = irisData.map(x => (removeNumbers(x)))
console.log("PCA", PCA)
console.log("PCA", PCA.getEigenVectors(irisDataNumbersOnly))

console.log("Plotly", await Plotly)

// Declare global data variable 
const pcaData = {} 
pcaData.sampleData = {iris:irisData,irisNamesOnly: irisDataNamesOnly, irisNumbersOnly:irisDataNumbersOnly}
pcaData.file = "none loaded"
console.log("pcaData", pcaData)


function formatSampleData(data,headers) {
  const result = [];
  result.headers = headers;
  for (let i = 0; i < data.length; i++) {
    const obj = {};
    const currentLine = data[i]
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = convertToNumber(currentLine[j])
    }
    result.push(obj);
  }
  return result;
}

// load file and plot PCA
const loadPca = async () => {
  const pcaDiv1 = document.createElement("div")
  pcaDiv1.id = 'pcaDiv1'
  document.body.appendChild(pcaDiv1);
  pcaDiv1.append(document.createElement('br'));

  const pcaDiv2 = document.createElement("div")
  pcaDiv2.id = 'pcaDiv2'
  document.body.appendChild(pcaDiv2);
  pcaDiv2.append(document.createElement('br'));

  //sample data button 
  const sampleDataButton = document.createElement('button')
  sampleDataButton.id = 'sampleData'
  sampleDataButton.textContent = 'Load Sample Data'
  document.getElementById('pcaDiv1').appendChild(sampleDataButton);

  sampleDataButton.addEventListener('click', async function () {
    document.getElementById('pcaDiv2').innerHTML = '';

    const data = formatSampleData(irisData, irisLabels)
    const scores = await modules.calculatePca( data )
    //console.log("main scores", scores)
    const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
    // plot function
    modules.plotPCA('pcaDiv2',scores, groups)
  });


  // file input Button
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'
  fileInput.setAttribute('type', 'file')
  document.getElementById('pcaDiv1').appendChild(fileInput);

  fileInput.addEventListener('change', (event) => {
  document.getElementById('pcaDiv2').innerHTML = '';

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
            // //console.log('main matrix', matrix)
            matrix['headers'] = json['headers']
            pcaData.file = json
            //console.log("pcaData", pcaData)

            // //console.log('main load PCA csv', csv)
            const scores = await modules.calculatePca(json)
            //console.log("main scores", scores)
            const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
            // plot function
            modules.plotPCA('pcaDiv2',scores, groups)
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
  // myDiv.replaceWith(newDiv);
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
  // //console.log("lines", lines)
  const headers = lines[0].split(',');
  // //console.log("headers", headers)
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
  // //console.log("result", result)
  return result;
}

function removeNonNumbers(arr) {
  return arr.filter(element => typeof element === 'number');
}

function removeNumbers(arr) {
  return arr.filter(element => typeof element !== 'number');
}


async function pcaPlotlyPlot4(data) {
  //console.log("data", data)
  const deviationMatrix = PCA.computeDeviationMatrix(data);
  const eigenvectors = PCA.getEigenVectors(deviationMatrix);
  // const eigenvalues = PCA.computeEigenvalues(deviationMatrix);
  //console.log("eigenvectors", eigenvectors)

  const adjustedMatrix = PCA.computeAdjustedData(data, eigenvectors[0]);
  //console.log("adjustedMatrix------------------", adjustedMatrix)
  // Extract the first two principal components
  const pc1 = adjustedMatrix.map(row => row[0]);
  const pc2 = adjustedMatrix.map(row => row[1]);
  
  // Create a scatter plot using Plotly
  const trace = {
    x: pc1,
    y: pc2,
    mode: 'markers',
    type: 'scatter'
  };
  
  const layout = {
    title: 'PCA Results',
    xaxis: { title: 'Principal Component 1' },
    yaxis: { title: 'Principal Component 2' }
  };
    // Create the plot div
    const pca_plot4 = document.createElement("div")
    pca_plot4.id = 'pca_plot4'
    pca_plot4.style.width = 400 //"auto";
    pca_plot4.style.height = 400 //"auto";

    document.body.appendChild(pca_plot4);
  Plotly.newPlot('pca-pca_plot4', [trace], layout);
}
// pcaPlotlyPlot4(data)

// Assume 'data' is your dataset and 'labels' are the corresponding labels
// 'data' should be a 2D array where each row represents a sample and each column represents a feature
// 'labels' should be an array with the same length as the number of rows in 'data'
async function pcaPlotly3DPlot(data, labels) {

  var eigenvectors = PCA.getEigenVectors(data);
  // var first = PCA.computePercentageExplained(vectors,vectors[0])
  var topTwo = PCA.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = PCA.getExplainedVariance();

  // //console.log("vectors",vectors)
  // //console.log("first",first)
  //console.log("topTwo", topTwo)
  //console.log("eigenvectors", eigenvectors)
  //console.log("eigenvectors.map(row => row[0])", eigenvectors[0].vector)
  //console.log("eigenvectors.map(row => row[1])", eigenvectors[1].vector)

  const numComponents = 2
  const pcScores = data.map(row => {
    const transformedRow = [];
    for (let i = 0; i < numComponents; i++) {
      transformedRow.push(row.reduce((sum, val, idx) => sum + val * eigenvectors[idx][i], 0));
    }
    return transformedRow;
  });
  //console.log("pcScores", pcScores)
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
  //console.log("Plotly", Plotly)

  await Plotly.newPlot('pca_plot2', [trace3d], layout3d);
}

async function pcaPlotly2DPlot(data, labels) {
  var eigenvectors = PCA.getEigenVectors(data);
  // var first = PCA.computePercentageExplained(vectors,vectors[0])
  var topTwo = PCA.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = PCA.getExplainedVariance();

  // //console.log("vectors",vectors)
  // //console.log("first",first)
  //console.log("topTwo", topTwo)
  //console.log("eigenvectors", eigenvectors)
  //console.log("eigenvectors.map(row => row[0])", eigenvectors[0].vector)
  //console.log("eigenvectors.map(row => row[1])", eigenvectors[1].vector)

  const numComponents = 2
  const pcScores = data.map(row => {
    const transformedRow = [];
    for (let i = 0; i < numComponents; i++) {
      transformedRow.push(row.reduce((sum, val, idx) => sum + val * eigenvectors[idx][i], 0));
    }
    return transformedRow;
  });
  //console.log("pcScores", pcScores)
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

console.log("irisLabels", irisLabels)
console.log("irisDataNumbersOnly", irisDataNumbersOnly)
console.log("labels ", irisLabels)
// console.log("pcaData.sampleData", pcaData.sampleData.irisNumbersOnly)

await pcaPlotly3DPlot(pcaData.sampleData.irisNumbersOnly, irisLabels);
await pcaPlotly2DPlot(pcaData.sampleData.irisNumbersOnly, irisLabels);

// await pcaPlotly2DPlot(data, labels);

loadPca()

export {
  loadPca, pcaData
}