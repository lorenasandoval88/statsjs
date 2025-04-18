// const { PCA} = await import("https://esm.sh/ml-pca");
// const dataset = (await import("https://esm.sh/ml-dataset-iris"))
// import { default as imports.PCAjs } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
// const Plotly = (await import('https://cdn.jsdelivr.net/npm/imports.Plotly.js-dist@3.0.1/+esm')).default
// const localForage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'))

// // import {PCA} from 'https://cdn.jsdelivr.net/npm/ml-pca@4.1.1/+esm'
// import * as imports.d3 from "https://cdn.skypack.dev/imports.d3@7"
// import { default as imports.d3tip} from 'https://esm.sh/imports.d3-tip';


import {
  otherFunctions
} from '../otherFunctions.js'
import {
  imports
} from '../imports.js'


// Example iris dataset:
const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisData = imports.iris.getDataset()
const irisDataNumbersOnly = irisData.map(x => (otherFunctions.removeNonNumbers(x)))
const irisDataNamesOnly = irisData.map(x => (otherFunctions.removeNumbers(x)))

// Declare global data variable 
const pcaData = {}
pcaData.iris = {
  data: irisData,
  colNames: irisLabels,
  categories: irisDataNamesOnly,
  dataNumbersOnly: irisDataNumbersOnly
}
pcaData.file = "none loaded"
console.log("pcaData", pcaData)

const pca = {}

pca.plotCount = 0

// PCA (scale, asDataframe, plotPCA)/////////////////////////////////////////////////////////
function formatIrisData(data, headers) {
  const result = [];
  result.headers = headers;
  for (let i = 0; i < data.length; i++) {
    const obj = {};
    const currentLine = data[i]
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = otherFunctions.convertStrToNumber(currentLine[j])
    }
    result.push(obj);
  }
  return result;
}

pca.calculatePca = async function (data) {
  console.log("mypca.js pca.calculatePca data", data)

  const numbersOnlyObjs = otherFunctions.removeNonNumberValues(data)
  console.log("numbersOnlyObjs", numbersOnlyObjs[0])
  const numbersOnlyArrs = (numbersOnlyObjs.map(Object.values))
  //  console.log('numbersOnlyArrs',numbersOnlyArrs[0])  

  const categories = (otherFunctions.removeNumberValues(data)).map(x => Object.values(x)).flat()
  //  console.log('categories',categories)  

  // const headers = Object.keys(data[0]).filter(key => !isNaN(data[0][key]))
  // // console.log('headers',headers)
  let scaledObjs = (await otherFunctions.scale(numbersOnlyObjs))
  let scaledArr = scaledObjs.map(Object.values)
  // console.log('scaledArr',scaledArr[0])  

  const pca = new imports.PCA(scaledArr, {
    center: true,
    scale: true
  })


  const scores = pca.predict(scaledArr)
    .toJSON()
    .map((row, rowIndex) => {
      const columns = Object.keys(data[rowIndex]);
      const rowObj = {
        group: data[rowIndex]['species'],
        name: "id_" + rowIndex //data[rowIndex]['id']
      };
      columns.forEach((column, colIndex) => {
        rowObj[`PC${colIndex + 1}`] = row[colIndex];
      });
      return rowObj;
    }).map(({
      PC1,
      PC2,
      group,
      name
    }) => ({
      PC1,
      PC2,
      group,
      name
    }))
  console.log("mypca.js pca.calculatePcascores", scores)

  return scores
}

function selectGroup(ctx, group, maxOpacity) {
  const groupElements = imports.d3.selectAll(".points")
    .filter(d => d.group !== group);

  const activeGroup = imports.d3.selectAll(".keyRects")
    .filter(d => d === group);

  const otherElements = imports.d3.selectAll(".points")
    .filter(d => d.group === group);

  const otherGroups = imports.d3.selectAll(".keyRects")
    .filter(d => d !== group);

  groupElements.transition().attr("opacity", 0.1);
  otherGroups.transition().attr("opacity", 0.1);

  otherElements.transition().attr("opacity", maxOpacity);
  activeGroup.transition().attr("opacity", maxOpacity);
}

pca.plotPCA = async function (scores, groups, div) {
  const color = imports.d3.scaleOrdinal(["#8C236A", "#4477AA", "#AA7744", "#117777", "#DD7788", "#77AADD", "#777711", "#AA4488", "#44AA77", "#AA4455"])
    .domain(groups)

  const width = 400
  const height = width / 1.5
  const fontFamily = 'monospace'
  const maxOpacity = 0.7
  const margin = ({
    top: 25,
    right: 90,
    bottom: 45,
    left: 45
  })
  const paddedMin = imports.d3.min(scores, d => d.PC1) - imports.d3.min(scores, d => d.PC1) * -0.10
  const paddedMax = imports.d3.max(scores, d => d.PC1) + imports.d3.max(scores, d => d.PC1) * 0.10
  const x = imports.d3.scaleLinear()
    .domain([paddedMin, paddedMax])
    .range([margin.left, width - margin.right])

  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom + 5})`)
    .call(imports.d3.axisBottom(x))
    .call(g => g.select(".domain").remove())
    .call(g => g.append("text")
      .attr("x", width - margin.left - 20)
      .attr("y", 15)
      // .attr("x", width - margin.right)
      //  .attr("y", -4)
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .text("PC1"))

  const y = imports.d3.scaleLinear()
    .domain(imports.d3.extent(scores, d => d.PC2))
    .range([height - margin.bottom, margin.top])

  const yAxis = g => g
    .attr("transform", `translate(${margin.left-5},0)`)
    .call(imports.d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", -margin.top)
      .attr("y", -margin.top)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("PC2"))

  const svg = imports.d3.create("svg")
  svg.id = "svgid"
  // const g = imports.d3.select(DOM.svg(width, height));

  // title
  svg.append("text")
    .attr("x", width / 2 - margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-family", "sans-serif")
    .text("PCA Plot");

  const g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
  // .attr('transform', `translate(${margin.left+margin.right}, ${margin.top+margin.bottom})`)

  g.append("g")
    .call(xAxis);

  g.append("g")
    .call(yAxis);

  g.append("rect")
    .attr("id", "background")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.top - margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("fill", "white")
    .on("click", d => {
      imports.d3.selectAll(".points, .keyRects").transition().attr("opacity", maxOpacity)
    })

  const gPoints = g.append("g").attr("class", "gPoints");

  const tooltip = imports.d3tip()
    .style('border', 'solid 2px navy')
    .style('background-color', 'white')
    .style('border-radius', '7px')
    // .style('float', 'left')
    .style('font-family', fontFamily)
    .style('width', '9%')
    .html((event, d) => `
          <div style='text-align: center'>
            name:${d.name} <br/>
            pc1:${d.PC1.toFixed(2)} <br/>
            pc2:${d.PC2.toFixed(2)}
          </div>`)

  // Apply tooltip to our SVG
  svg.call(tooltip)
  gPoints.selectAll()
  g.append("g")
    .style("isolation", "isolate")
    .selectAll("circle")
    .data(scores)
    .enter().append("circle")
    .attr("class", "points")
    .attr("cx", d => x(d.PC1))
    .attr("cy", d => y(d.PC2))
    .attr("fill", d => color(d.group))
    // .style("mix-blend-mode", blendingMode)
    .attr("opacity", 0.7)
    .attr("r", 4)
    .on('mouseover', tooltip.show)
    .on('mouseout', tooltip.hide)

  const key = g.append("g")
    .selectAll("rect")
    .data(groups)
  //  //console.log("key",key)
  key.enter().append("rect")
    .attr("class", "keyRects")
    .attr("x", width - margin.left - 50)
    .attr("y", (d, i) => i * 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => color(d))
    .on("click", (event, d) => {
      return selectGroup(this, d, maxOpacity)
    })

  key.enter().append("text")
    .attr("x", d => width - margin.left - 30)
    .attr("y", (d, i) => i * 20)
    .attr("dy", "0.7em")
    .text(d => `${d}`)
    .style("font-size", "11px")
    .on("click", (event, d) => {
      return selectGroup(this, d, maxOpacity)
    });


  if (document.getElementById(div)) {
    console.log(`div for pcaPlot provided in function parameters.`);
    div.appendChild(svg.node())

  } else if (document.getElementById("pcaPlotDiv")) {
    console.log(`div for pcaPlot exists.`);
    const div = document.getElementById("pcaPlotDiv")
    div.style.width = 400 + 'px' //"auto";
    // div.innerHTML(svg.node())
    svg.node().replaceWith(svg.node())

  } else {
    // Optionally, handle the case where the element doesn't exist
    console.log(`div for pcaPlot not found.`);
    const div = document.createElement("div")
    div.id = "pcaPlotDiv"
    div.style.width = 400 + 'px' //"auto";
    document.body.appendChild(div);
    div.appendChild(svg.node())
    //  document.getElementById('mainPcaDiv').appendChild(div);

  }

  return svg.node();
}

// load file and plot PCA
pca.loadPcaDiv = async (divId) => {

  let mainPcaDiv = document.getElementById(divId);
  if (mainPcaDiv !== null) {
    // The div with the specified ID exists
    console.log("PCA div exists!, creating PCA div");
    mainPcaDiv.id = 'mainPcaDiv'

  } else {
    // The div with the specified ID does not exist
    console.log("PCA div does not exist.");
    // create the div element here
    mainPcaDiv = document.createElement("div")
    mainPcaDiv.id = 'mainPcaDiv'
    document.body.appendChild(mainPcaDiv);
    // mainPcaDiv.append(document.createElement('br'));

  }

  // iris data button 
  const irisDataButton = document.createElement('button')
  irisDataButton.id = 'irisDataButton'
  irisDataButton.textContent = 'Load Iris Data'
  mainPcaDiv.appendChild(irisDataButton);
  
  // file input Button
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'
  fileInput.setAttribute('type', 'file')
  mainPcaDiv.appendChild(fileInput);
  mainPcaDiv.append(document.createElement('br'));
  mainPcaDiv.append(document.createElement('br'));


  // create textbox div
  const textBoxDiv = document.createElement("div")
  textBoxDiv.id = 'textBoxDiv'
  mainPcaDiv.appendChild(textBoxDiv);



  // event listener for load file data buttons
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
            console.log("csv", csv)
            const json = await otherFunctions.csvToJson(csv)
            console.log("json", json)
            const matrix = (json.map(Object.values))
            console.log("main json", json)
            // //console.log('main matrix', matrix)
            matrix['headers'] = json['headers']
            pcaData.file = json
            //console.log("pcaData", pcaData)

            // //console.log('main load PCA csv', csv)
            const scores = await pca.calculatePca(json)
            //console.log("main scores", scores)
            const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())

            // csv file textbox
            otherFunctions.textBox(csv, textBoxDiv)

            // plot function
            pca.plotPCA(scores, groups)

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

  // event listener for load iris data buttons
  document.getElementById('irisDataButton').addEventListener('click', async function () {
    const data = formatIrisData(irisData, irisLabels)
    const scores = await pca.calculatePca(data)
    const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())

    // plot function
    pca.plotPCA(scores, groups)

    //iris data as csv
    console.log("irisData", irisData)
    const csv2 = irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n');
    // console.log("csv2", csv2)

    // textbox div
    otherFunctions.textBox(csv2, textBoxDiv)
  });

  // add textbox div to mainPcaDiv 
  // document.getElementById('mainPcaDiv').appendChild(textBoxDiv);

  // Add the input element to the document body (or any other desired location)
  // myDiv.replaceWith(newDiv);
}

export {
  pca,
  pcaData

}

async function pcaPlotlyPlot4(data) {
  //console.log("data", data)
  const deviationMatrix = imports.PCAjs.computeDeviationMatrix(data);
  const eigenvectors = imports.PCAjs.getEigenVectors(deviationMatrix);
  // const eigenvalues = imports.PCAjs.computeEigenvalues(deviationMatrix);
  //console.log("eigenvectors", eigenvectors)

  const adjustedMatrix = imports.PCAjs.computeAdjustedData(data, eigenvectors[0]);
  //console.log("adjustedMatrix------------------", adjustedMatrix)
  // Extract the first two principal components
  const pc1 = adjustedMatrix.map(row => row[0]);
  const pc2 = adjustedMatrix.map(row => row[1]);

  // Create a scatter plot using imports.Plotly
  const trace = {
    x: pc1,
    y: pc2,
    mode: 'markers',
    type: 'scatter'
  };

  const layout = {
    title: 'PCA Results',
    xaxis: {
      title: 'Principal Component 1'
    },
    yaxis: {
      title: 'Principal Component 2'
    }
  };
  // Create the plot div
  const pca_plot4 = document.createElement("div")
  pca_plot4.id = 'pca_plot4'
  // pca_plot4.style.width = 400 //"auto";
  pca_plot4.style.height = 400 //"auto";

  document.body.appendChild(pca_plot4);
  imports.Plotly.newPlot('pca-pca_plot4', [trace], layout);
}

// Assume 'data' is your dataset and 'labels' are the corresponding labels
// 'data' should be a 2D array where each row represents a iris and each column represents a feature
// 'labels' should be an array with the same length as the number of rows in 'data'
async function pcaPlotly3DPlot(data, labels) {

  var eigenvectors = imports.PCAjs.getEigenVectors(data);
  // var first = imports.PCAjs.computePercentageExplained(vectors,vectors[0])
  var topTwo = imports.PCAjs.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = imports.PCAjs.getExplainedVariance();

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
  //console.log("imports.Plotly", imports.Plotly)

  await imports.Plotly.newPlot('pca_plot2', [trace3d], layout3d);
}

async function pcaPlotly2DPlot(data, labels) {
  var eigenvectors = imports.PCAjs.getEigenVectors(data);
  // var first = imports.PCAjs.computePercentageExplained(vectors,vectors[0])
  var topTwo = imports.PCAjs.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = imports.PCAjs.getExplainedVariance();

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
  await imports.Plotly.newPlot('pca_plot3', [trace3d], layout2d);
}
// pcaPlotlyPlot4(data)
// await pcaPlotly3DPlot(pcaData.irisData.irisNumbersOnly, irisLabels);
// await pcaPlotly2DPlot(pcaData.irisData.irisNumbersOnly, irisLabels);
// await pcaPlotly2DPlot(data, labels);