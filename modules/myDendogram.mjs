console.log("dendogram.mjs loaded") 

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
    npm_pca, npm_pcajs, Plotly, d3, d3tip, dataset, localForage , hclust, dist, distance
  } from '../imports.js'


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
  
  const transpose = m => m[0].map((x,i) => m.map(x => x[i]))

  // trim label lengths if they are greater than 8 characters
  function trimText(idx,arr){
    return idx.map(e => { 
           if (arr[e].length>8){
               return arr[e].slice(0,8)
           } else{ return arr[e] }
         })
       }

  // Example iris dataset:
const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
const irisColumnNames = "sepal_length,sepal_width,petal_length,petal_width,species\n"
const irisData = dataset.getDataset()
const irisDataNums = dataset.getNumbers()

const ir = irisData.map((row) =>
   row.reduce((acc, curr, index) => {
    acc[irisLabels[index]] = curr;
    return acc;
  }, {})
 )

const csv = irisColumnNames + irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')

// Declare global data variable for myheatmap
const dendogram = {
  data:{}
}
dendogram.data.iris = {}
dendogram.data.iris.json = ir
dendogram.data.iris.csv = csv// irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
dendogram.data.file = "none loaded"
console.log("heatmap object:",dendogram)
//-----------------------------------------------------------------------------------



dendogram.plot =  function(options = {}){
    const {
      divid: divid = "",
      matrix: matrix = irisDataNums,//"no matrix provided",
      rownames: rownames = irisData.map((d,idx) => d[4]+idx),//d3.range(matrix.length),// irisData.map((d) => d[irisLabels[0]]),
      colnames: colnames = irisLabels.slice(0, -1),
      width: width = 300,
      height: height = 530,
      // dendograms
      clusterCols: clusterCols = false,
      clusterRows: clusterRows = false,
      clusteringDistanceRows: clusteringDistanceRows = "euclidean",
      clusteringDistanceCols: clusteringDistanceCols = "euclidean",
      clusteringMethodCols: clusteringMethodCols = "complete",
      clusteringMethodRows: clusteringMethodRows = "complete",
      marginTop: marginTop = clusterCols ? 80 : 30,
      marginLeft: marginLeft = clusterRows ? 120 : 30,
      colPadding: colPadding = clusterCols ? 20 : 0,
      rowPadding: rowPadding = clusterRows ? 20 : 0,
      // heatmap
      color: color = "red",
      colorScale: colorScale = [0,9],
      // hover tooltip
      decimal: decimal = 2,
      fontFamily: fontFamily= 'monospace'
    } = options;
    
  const margin = ({ top: marginTop,bottom:0,left:marginLeft,right:0})
  const svg = d3.create("svg")
  
  const data =  matrix.data ? matrix.data: matrix
  
  // Heatmap--------------------
  const colHclustTree = new hclust.agnes(dist(transpose(data), distance[clusteringDistanceCols]), {
    method:clusteringMethodCols,
    isDistanceMatrix: true})
  const root = d3.hierarchy(colHclustTree)
  const clusterLayout = d3.cluster()
  clusterLayout(root)
    
  const rowHclustTree2 = new hclust.agnes(dist(data, distance[clusteringDistanceRows]), {
          method: clusteringMethodRows,
          isDistanceMatrix: true})
  const root2 = d3.hierarchy(rowHclustTree2) 
    
  const clusterLayout2 = d3.cluster()
  clusterLayout2(root2)
  
  let colIdx = clusterCols ?  root.leaves().map(x=>x.data.index): d3.range(data[0].length)//col clust
  let rowIdx = clusterRows ?  root2.leaves().map(x=>x.data.index) : d3.range(data.length)//row clust
  console.log("rowIdx",rowIdx)
  const newMatrix2 = transpose(colIdx.map(i =>  transpose(rowIdx.map(e => data[e]))  [i]))
    
  // if labels (truncated length) are not provided, indices are used
  let colNames2 = colnames ? trimText(colIdx, colnames) : Array.from(new Array(data[0].length),(x,i)=> i + 1)
  let rowNames2 = colnames ? trimText(rowIdx, rownames) : Array.from(new Array(data[0].length),(x,i)=> i + 1)
  console.log("rowNames2",rowNames2)
  
  // max x and y label lengths to be used in dendogram heights
  const colNames2Lengths = d3.max(colNames2.map(e => e.length))
  const rowNames2Lengths = d3.max(rowNames2.map(e => e.length))
  
  const color_scale = d3.scaleLinear()
      .domain(colorScale)
      .range(['#fff', `${color}`])
    
  let x_scale = d3.scaleBand()
    .domain(colNames2)
    .range([0, width-margin.left-margin.right])
    
  let y_scale = d3.scaleBand()
    .domain(rowNames2)
    .range([ 0, height-margin.top])
  
  const g = svg
    .attr('width', width  )
    .attr('height', height )
    .append('g')
    // move the entire graph down and right to accomodate labels
    .attr('transform', `translate(${margin.left+margin.right}, ${margin.top+margin.bottom})`)
   
  //text x axis
  const xAxis = g.append('g')
     .call(d3.axisTop(x_scale))
   
  xAxis.selectAll('.tick').selectAll('line').remove()
  xAxis.selectAll("text")
    .style("text-anchor", "start")
    .attr("dx", "2px")
    .attr("dy", "1.1em")
    .attr("transform", "rotate(-90)")
    .attr("class", "xa") 
    
  //text y axis
    let yAxis = g.append('g')
      .call(d3.axisLeft(y_scale))
      .attr("id", "ya")
  
    yAxis.selectAll('.tick').selectAll('line').remove()
    yAxis.selectAll("text")
      .attr("dx", "7px")
      .attr("dy", "0.3em")
      .attr("class", "yaa")
    
  const gPoints = g.append("g").attr("class", "gPoints");
  
    const tooltip = d3tip()
      .style('border', 'solid 3px black')
      .style('background-color', 'white')
      .style('border-radius', '10px')
      .style('float', 'left')
      .style('font-family', fontFamily)
      .html((event, d) => `
        <div style='float: right'>
           value:${d.value.toFixed(decimal)} <br/>
           row:${rowNames2[d.n]}, col:${colNames2[d.t] } 
        </div>`)
     
  // Apply tooltip to our SVG
   svg.call(tooltip)
   gPoints.selectAll()
      .data(buildData(newMatrix2))
      .enter()
      .append('rect')
      .attr('x', (d) => x_scale(colNames2[d.t]))
      .attr('y', (d) => y_scale(rowNames2[d.n]))
      .attr('width', width/data[0].length)
      .attr('height', height/data.length)
      .attr('fill', (d) => color_scale(d.value))
      .on('mouseover', tooltip.show)
      .on('mouseout', tooltip.hide) 
    
    
     
  // bottom/row dendogram----------------------
  
  if (clusterRows== true){
      const dendoTooltip = d3tip()
      .style('border', 'solid 3px black')
      .style('background-color', 'white')
      .style('border-radius', '10px')
      .style('float', 'left')
      .style('font-family', 'monospace')
      .html((event, d) => `
        <div style='float: right'>
           Height:${d.source.data.height.toFixed(3)} <br/>
        </div>`)
    
        const rowMaxHeight = root2.data.height;
        const clusterLayout2 = d3.cluster()
        clusterLayout2(root2)
        
        const allNodes2 = root2.descendants().reverse()
        const leafs2 = allNodes2.filter(d => !d.children)
            leafs2.sort((a,b) => a.x - b.x)
        const leafHeight2 = (height-margin.top)/ leafs2.length 
            leafs2.forEach((d,i) => d.x = i*leafHeight2 + leafHeight2/2)
        
        allNodes2.forEach(node => {
          if (node.children) {
            node.x = d3.mean(node.children, d => d.x)
          }})
    
      // Apply tooltip to our SVG
     svg.call(dendoTooltip)
      console.log(root2.links()) 
      root2.links().forEach((link,i) => {
        svg
          .append("path")
          .attr("class", "link")
          .attr("stroke", link.source.color || "red")
          .attr("stroke-width", `${5}px`)
          .attr("fill", 'none')
          .attr("transform", `translate(7,${margin.top})`)
          .attr("d", rowElbow(link,rowMaxHeight,margin.left,rowNames2Lengths))
              .on('mouseover', dendoTooltip.show)
        // Hide the tooltip when "mouseout"
        .on('mouseout', dendoTooltip.hide) 
      })
     svg.selectAll('path')
      .data(root2.links())
    }

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
    console.log("svg", svg.node())

    return svg.node()
  }

dendogram.plot({divid:"myDendogram"})

export {
    dendogram,
}
