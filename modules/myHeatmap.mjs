console.log("heatmap.mjs loaded") 
//https://observablehq.com/@saehrimnir/dimensionality-reduction-drawings
//https://observablehq.com/@3e787c1af6c5a437/a-comparative-overview-of-dimension-reduction-methods
//https://codesandbox.io/p/sandbox/eloquent-shtern-cj5vr6?file=%2Fsrc%2FpcaUtils.js%3A28%2C14-28%2C19

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
    npm_pca, npm_pcajs, Plotly, d3, d3tip, ml_dataset_iris, localforage 
  } from '../imports.js'

  // Example iris dataset:
const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisColumnNames = "sepal_length,sepal_width,petal_length,petal_width,species\n"
const irisData = ml_dataset_iris.getDataset()
const irisDataNums = ml_dataset_iris.getNumbers()

const ir = irisData.map((row) =>
   row.reduce((acc, curr, index) => {
    acc[irisLabels[index]] = curr;
    return acc;
  }, {})
 )

const csv = irisColumnNames + irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')

// Declare global data variable for myheatmap
const heatmap = {
  data:{}
}
heatmap.data.iris = {}
heatmap.data.iris.json = ir
heatmap.data.iris.csv = csv// irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
heatmap.data.file = "none loaded"
// console.log("heatmap object:",heatmap)


// auxiliary function to convert a matrix to a data array
const buildData = async function(matrix)  {
  let array = []
  d3.range(matrix.length).map((d) => {
    const o = d3.range(matrix[0].length).map((t) => ({
      t: t,
      n: d,
      value: matrix[d][t]
    }))
    array = [...array,...o]
  })
  return array
}




const heatmap_plot = async function (options = {}){
  // console.log("heatmap options", options)

  const {
    divid: divid = "",

    matrix: matrix = irisDataNums,//"no matrix provided",
    rownames: rownames = irisData.map((d,idx) => d[4]+idx),//d3.range(matrix.length),// irisData.map((d) => d[irisLabels[0]]),
    colnames: colnames = irisLabels.slice(0, -1),
    dt: height = 1200,
    width: width = 400,
    color: color = "red", //"#d62728",
  } =  options

  const color_scale = d3.scaleLinear()
  .domain([0, 8])
  .range(['#fff', `${color}`])

 const margin = ({ 
    top: 53,
    bottom: 10,
    left: 45,
    right: 10
  });


    // index of the rows based on cluster hierarchy
    const svg = d3
      .create("svg")
     
   // interactive labels
    const tooltip = d3tip()
      .style('border', 'solid 2px black')
      .style('background-color', 'white')
      .style('border-radius', '6px')
      .style('float', 'left')
      .style('font-family', 'monospace')
      .style("font-size", '10px')
      .html((event, d) => `
        <div style='float: right'>
           val:${d.value.toFixed(0)} <br/>
             row:${rownames[d.n]}, col:${(colnames[d.t])} 
        </div>`)
      svg.call(tooltip)
     
     let y_scale = d3.scaleBand()
    .domain(rownames)
    .range([ 0, height-margin.top-margin.bottom])
     
    let x_scale = d3.scaleBand()
    .domain(colnames)
    .range([0, width-margin.left-margin.right])
  
  const txtLengths = d3.selectAll("text").nodes().map( n => n.getComputedTextLength())
  // console.log("txtLengths",txtLengths)
     
  const g = svg
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left+margin.right}, ${margin.top+margin.bottom})`)
     
  //create x axis
  const x_axis = g.append('g')
      .call(d3.axisTop(x_scale))
  x_axis.selectAll('.tick').selectAll('line').remove()
  x_axis.selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "1px")
    .attr("dy", "1.1em")
    .attr("transform", "rotate(-90)") 
     
  //create y  axes
  let y_axis = g.append('g')
    .call(d3.axisLeft(y_scale))
     
  y_axis.selectAll('.tick').selectAll('line').remove()
  y_axis.selectAll("text")
    .attr("dx", "7px")
    .attr("dy", "0.3em")
  
// console.log("y_axis", y_axis)
// console.log("x_axis", x_axis)
// console.log("buildData(matrix)", buildData(matrix))

   // create squares
   const gPoints = g.append("g").attr("class", "gPoints");
   gPoints.selectAll()
      .data(await buildData(matrix))
      .enter()
      .append('rect')
      .attr('x', (d) => x_scale(colnames[d.t]))
      .attr('y', (d) => y_scale(rownames[d.n]))
      .attr('width', width/matrix[0].length)
      .attr('height', height/matrix.length)
      .attr('fill', (d) => color_scale(d.value))
        // show the tooltip when "mouseover"
      .on('mouseover', tooltip.show)
        // Hide the tooltip when "mouseout"
        .on('mouseout', tooltip.hide) 
     
      // console.log("svg", svg.node())

    // Here we add the svg to the plot div
  // Check if the div was provided in the function call
  if (document.getElementById(divid)) {
  // console.log(`pcaPlot div provided in function parameters.`);
    const div = document.getElementById(divid)
    div.innerHTML = ""
    div.appendChild(svg.node())

  } else if (!document.getElementById("childDiv")) {
  // console.log(`pcaPlot div  NOT provided in function parameters or doesn't exist, creating div....`);
    const div = document.createElement("div")
    document.body.appendChild(div)
    div.appendChild(svg.node());
    }


    return svg.node()
  }

  // heatmap_plot({matrix: irisDataNums, divid: "myHeatmap"} )


  // heatmap.plot({matrix: irisDataNums} )


  export {
    heatmap_plot
  }