console.log("mypca.mjs loaded") 
  

// TODO: limit textbox rows to 500
import {
  csvToJson,
  convertStrToNumber,
  removeNonNumbers,
  removeNumbers,
  removeNonNumberValues,
  removeNumberValues,
  asDataFrame,
  scale,
  createTableFromCSV,
  textBox
} from '../otherFunctions.js'
import {
  npm_pca, npm_pcajs, Plotly, d3, d3tip, ml_dataset_iris, localForage 
} from '../imports.js'


// Example iris dataset:
const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisColumnNames = "sepal_length,sepal_width,petal_length,petal_width,species\n"
const irisData = ml_dataset_iris.getDataset()

const ir = irisData.map((row) =>
   row.reduce((acc, curr, index) => {
    acc[irisLabels[index]] = curr;
    return acc;
  }, {})
 )
// ir.headers = irisLabels

const csv = irisColumnNames + irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
// Declare global data variable for pca
const pca = {
  data:{}
}
pca.data.iris = {}
pca.data.iris.json = ir
pca.data.iris.csv = csv// irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
pca.data.file = "none loaded"
console.log("pca object:",pca)




// PCA (scale, asDataframe, plotPCA)/////////////////////////////////////////////////////////
function formatIrisData(data, headers) {
  const result = [];
  result.headers = headers;
  for (let i = 0; i < data.length; i++) {
    const obj = {};
    const currentLine = data[i]
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = convertStrToNumber(currentLine[j])
    }
    result.push(obj);
  }
  return result;
}

pca.getScores = async function (data) {
  console.log("running pca.getScores()-------------------------------")

  const numbersOnlyObjs = removeNonNumberValues(data)
  // console.log("numbersOnlyObjs", numbersOnlyObjs[0])
  const numbersOnlyArrs = (numbersOnlyObjs.map(Object.values))
  //  console.log('numbersOnlyArrs',numbersOnlyArrs[0])  

  const categories = (removeNumberValues(data)).map(x => Object.values(x)).flat()
  //  console.log('categories',categories)  

  // const headers = Object.keys(data[0]).filter(key => !isNaN(data[0][key]))
  // // console.log('headers',headers)
  let scaledObjs = (await scale(numbersOnlyObjs))
  let scaledArr = scaledObjs.map(Object.values)
  // console.log('scaledArr',scaledArr[0])  

  const pca = new npm_pca(scaledArr, {
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
  console.log("PCA1 and PC2 - getScores() (1st row):", scores[0])

  return scores
}

function selectGroup(ctx, group, maxOpacity) {
  const groupElements = d3.selectAll(".points")
    .filter(d => d.group !== group);

  const activeGroup = d3.selectAll(".keyRects")
    .filter(d => d === group);

  const otherElements = d3.selectAll(".points")
    .filter(d => d.group === group);

  const otherGroups = d3.selectAll(".keyRects")
    .filter(d => d !== group);

  groupElements.transition().attr("opacity", 0.1);
  otherGroups.transition().attr("opacity", 0.1);

  otherElements.transition().attr("opacity", maxOpacity);
  activeGroup.transition().attr("opacity", maxOpacity);
}






const pca_plot = async function ( options = {} ) {
console.log("running pca_plot()-------------------------------")
  // const data = formatIrisData(irisData, irisLabels)
  // const scores = await pca.getScores(data)
  // const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())


  const {
    divid: divid = "",
    data: data = formatIrisData(irisData, irisLabels),
    width: width = 400,
    height: height = 200,
    colors: colors = ["red", "blue", "green", "orange", "purple", "pink", "yellow"],
  } = options;

  //TODO calcscores

  // console.log(" data - pca_plot() (1st row):", data[0])
  const scores = await pca.getScores(data)
  const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
  const color = d3.scaleOrdinal(colors).domain(groups)


  const fontFamily = 'monospace'
  const maxOpacity = 0.7
  const margin = ({
    top: 25,
    right: 90,
    bottom: 45,
    left: 45
  })
  const paddedMin = d3.min(scores, d => d.PC1) - d3.min(scores, d => d.PC1) * -0.10
  const paddedMax = d3.max(scores, d => d.PC1) + d3.max(scores, d => d.PC1) * 0.10
  const x = d3.scaleLinear()
    .domain([paddedMin, paddedMax])
    .range([margin.left, width - margin.right])

  const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom + 5})`)
    .call(d3.axisBottom(x))
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

  const y = d3.scaleLinear()
    .domain(d3.extent(scores, d => d.PC2))
    .range([height - margin.bottom, margin.top])

  const yAxis = g => g
    .attr("transform", `translate(${margin.left-5},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
      .attr("x", -margin.top)
      .attr("y", -margin.top)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("PC2"))

  const svg = d3.create("svg")
  svg.id = "svgid"
  // const g = d3.select(DOM.svg(width, height));

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
      d3.selectAll(".points, .keyRects").transition().attr("opacity", maxOpacity)
    })

  const gPoints = g.append("g").attr("class", "gPoints");

  const tooltip = d3tip()
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

    
  // Here we add the svg to the plot div
  // Check if the div was provided in the function call
    if (document.getElementById(divid)) {
    console.log(`pcaPlot div provided in function parameters.`);
    const div = document.getElementById(divid)
    div.innerHTML = ""
    div.appendChild(svg.node())

  } else if (!document.getElementById("childDiv")) {
    console.log(`pcaPlot div  NOT provided in function parameters or doesn't exist, creating div....`);
    const div = document.createElement("div")
    document.body.appendChild(div)
    div.appendChild(svg.node());
    }

  return svg.node();
}









// load file and plot PCA
const pca_UI = async (options = {}) => {
  console.log("running pca_UI()-------------------------------");
// console.log("pca_UI options", options)

  const {
    divid: divid = "",
    //todo: add textbox opyions, height width color etc
  } = options

  // console.log("pca_UI divid", divid)
  // console.log("pca_UI div", document.getElementById(divid))

  let div = document.getElementById(divid);
  if (document.getElementById(divid) ) {
    // The div with the specified ID exists, updating...
    console.log("div ID provided in pca_UI(), loading div");
    // div.id = 'loadUI'

  } else {
    console.log(" div NOT found in parameters. creating div...");
    // create the div element here
    div = document.createElement("div")
    div.id = 'loadUI'
    div.style.alignContent = "center"
    document.body.appendChild(div);
  }

  // iris data button 
  const irisDataButton = document.createElement('button')
  irisDataButton.id = 'irisDataButton'
  irisDataButton.textContent = 'Load Iris Data'
  div.appendChild(irisDataButton);
  
  // file input Button
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'
  fileInput.setAttribute('type', 'file')
  div.appendChild(fileInput);
  div.append(document.createElement('br'));
  div.append(document.createElement('br'));

  // create plot div
  const plotDiv = document.createElement("div")
  plotDiv.id = 'plotDiv'
  div.appendChild(plotDiv);

  // create textbox div
  const textBoxDiv = document.createElement("div")
  textBoxDiv.id = 'textBoxDiv'
  textBoxDiv.style.alignContent = "left"

  div.appendChild(textBoxDiv);

  // event listener for load file data buttons
  fileInput.addEventListener('change', (event) => {
    console.log("fileInput button clicked!")
    const files = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader();

          reader.onload = async function (e) {
            const csv = e.target.result;
            // console.log("csv", csv)
            const json = await csvToJson(csv)
            // console.log("json", json)

            // plot function
            pca_plot({data: json, divid: "plotDiv"})

            const matrix = (json.map(Object.values))
            console.log("main json", json)
            // //console.log('main matrix', matrix)
            matrix['headers'] = json['headers']

            pca.data.file = []
            pca.data.file.json = json
            pca.data.file.csv = csv

            console.log("pca.data", pca)
            textBox( {text: pca.data.file.csv, divid: "textBoxDiv"})
            // //console.log('main load PCA csv', csv)
            // const scores = await pca.getScores(json)
            // console.log("main scores", scores)

     
            // csv file textbox
            // textBox(csv)

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

  // event listener for load iris data button
  document.getElementById('irisDataButton').addEventListener('click', async function () {

    console.log(" button clicked!")

    const data = formatIrisData(irisData, irisLabels)
    const scores = await pca.getScores(data)
    const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())

    // plot function
    pca_plot({ divid: "plotDiv"})

    //convert iris data to csv
    // const irisCsv = irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n');

    // textbox div
    textBox({text: pca.data.iris.csv, divid: "textBoxDiv"})
  });

}

export {
  // pca
  pca_plot, 
  pca_UI
}




























async function pcaPlotlyPlot4(data) {
  //console.log("data", data)
  const deviationMatrix = npm_pcajs.computeDeviationMatrix(data);
  const eigenvectors = npm_pcajs.getEigenVectors(deviationMatrix);
  // const eigenvalues = npm_pcajs.computeEigenvalues(deviationMatrix);
  //console.log("eigenvectors", eigenvectors)

  const adjustedMatrix = npm_pcajs.computeAdjustedData(data, eigenvectors[0]);
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
  Plotly.newPlot('pca-pca_plot4', [trace], layout);
}

// Assume 'data' is your dataset and 'labels' are the corresponding labels
// 'data' should be a 2D array where each row represents a iris and each column represents a feature
// 'labels' should be an array with the same length as the number of rows in 'data'
async function pcaPlotly3DPlot(data, labels) {

  var eigenvectors = imports.npm_pcajs.getEigenVectors(data);
  // var first = imports.npm_pcajs.computePercentageExplained(vectors,vectors[0])
  var topTwo = imports.npm_pcajs.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = imports.npm_pcajs.getExplainedVariance();

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
  var eigenvectors = imports.npm_pcajs.getEigenVectors(data);
  // var first = imports.npm_pcajs.computePercentageExplained(vectors,vectors[0])
  var topTwo = imports.npm_pcajs.computePercentageExplained(eigenvectors, eigenvectors[0], eigenvectors[1])
  // // const explainedVariance = imports.npm_pcajs.getExplainedVariance();

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