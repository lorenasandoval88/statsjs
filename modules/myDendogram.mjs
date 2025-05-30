console.log("dendogram.mjs loaded")
// TODO: automate row and column dendo padding based on labels length
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
    npm_pca,
    npm_pcajs,
    Plotly,
    d3,
    d3tip,
    ml_dataset_iris,
    localForage,
    hclust,
    dist,
    distance
} from '../imports.js'




function getRandomSubset(array, subsetSize) {
    if(subsetSize > array.length){
      return "Subset size cannot exceed array length";
    }
  
    const shuffled = [...array].sort(() => 0.5 - Math.random());
   // console.log("shuffled", shuffled.slice(0, subsetSize))
    return shuffled.slice(0, subsetSize);
  }
  
  
  // Example iris dataset:
  const irisLabels = ["sepal_length", "sepal_width", "petal_length", "petal_width", "species"]
  const irisColumnNames = "sepal_length,sepal_width,petal_length,petal_width,species\n"
//   const irisData = getRandomSubset(ml_dataset_iris.getDataset(), 20)
// const irisDataNums = getRandomSubset(ml_dataset_iris.getNumbers(), 20)
const irisData = ml_dataset_iris.getDataset()
const irisDataNums = ml_dataset_iris.getNumbers()


const ir = irisData.map((row) =>
    row.reduce((acc, curr, index) => {
        acc[irisLabels[index]] = curr;
        return acc;
    }, {})
)

const csv = irisColumnNames + irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"` : String(item)).join(',')).join('\n')

// Declare global data variable for myheatmap
const dendogram = {
    data: {}
}
dendogram.data.iris = {}
dendogram.data.iris.json = ir
dendogram.data.iris.csv = csv // irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
dendogram.data.file = "none loaded"
console.log("heatmap object:", dendogram)


// heatmap auxiliary functions, convert a matrix to a data array
const buildData = async function (matrix) {
    let array = []
    d3.range(matrix.length).map((d) => {
        const o = d3.range(matrix[0].length).map((t) => ({
            t: t,
            n: d,
            value: matrix[d][t]
        }))
        array = [...array, ...o]
    })
    return array
}

const transpose = m => m[0].map((x, i) => m.map(x => x[i]))



// trim label lengths if they are greater than 8 characters
function trimText(idx, arr) {
    return idx.map(e => {
        if (arr[e].length > 12) {
            return arr[e].slice(0, 6) + "..." + arr[e].slice(-3)// truncate to 13 characters
        } else {
            return arr[e]
        }
    })
}

//-----------------------------------------------------------------------------------



const hclust_plot = async function (options = {}) {
    const {
        divid: divid = "",
        matrix: matrix = irisDataNums, //numbers only, no species,
        // rownames: rownames = irisData.map((d, idx) => d[4] + idx), //d3.range(matrix.length),// irisData.map((d) => d[irisLabels[0]]),
        rownames: rownames = irisData.map((d, idx) => d[4] + idx),
        // rownames: rownames = irisData.map((d, idx) =>  idx),
        colnames: colnames = irisLabels.slice(0, -1),
        width: width = 400,
        height: height = 1200,
        // dendograms
        clusterCols: clusterCols = true,
        clusterRows: clusterRows = true,
        clusteringDistanceRows: clusteringDistanceRows = "euclidean",
        clusteringDistanceCols: clusteringDistanceCols = "euclidean",
        clusteringMethodCols: clusteringMethodCols = "complete",
        clusteringMethodRows: clusteringMethodRows = "complete",
        marginTop: marginTop = clusterCols ? 110 : 10,
        marginLeft: marginLeft = clusterRows ? 250 : 30,
        colPadding: colPadding = clusterCols ? 25 : 0, 
        rowPadding: rowPadding = clusterRows ? 75 : 0,
        // topdendogram color
        colDendoColor: colDendoColor = "blue",
        // bottomdendogram color
        rowDendoColor: rowDendoColor = "red",
        // heatmap color
        heatmapColor: heatmapColor = "green",
        heatmapColorScale: heatmapColorScale = [0, 8],
        // hover tooltip
        decimal: decimal = 2,
        fontFamily: fontFamily = 'monospace'
    } = options;

   // console.log("dendogram options", options)
    const margin = ({
        top: marginTop,
        bottom: 0,
        left: marginLeft,
        right: 0
    })
    const svg = d3.create("svg")

    const data = matrix //matrix.data ? matrix.data: matrix
     // console.log("dendo data ***", data)
     // console.log("dendo rownames ***", rownames)
     // console.log("dendo colnames ***", colnames)

    // Heatmap--------------------
    const colHclustTree = new hclust.agnes(dist(transpose(data), distance[clusteringDistanceCols]), {
        method: clusteringMethodCols,
        isDistanceMatrix: true
    })
    const root = d3.hierarchy(colHclustTree)
    const clusterLayout = d3.cluster()
    clusterLayout(root)
console.log("colHclustTree", colHclustTree)


    const rowHclustTree2 = new hclust.agnes(dist(data, distance[clusteringDistanceRows]), {
        method: clusteringMethodRows,
        isDistanceMatrix: true
    })
    const root2 = d3.hierarchy(rowHclustTree2)


    const clusterLayout2 = d3.cluster()
    clusterLayout2(root2)

    let colIdx = clusterCols ? root.leaves().map(x => x.data.index) : d3.range(data[0].length) //col clust
   // console.log("colIdx", colIdx)
    let rowIdx = clusterRows ? root2.leaves().map(x => x.data.index) : d3.range(data.length) //row clust
    //  // console.log("rowIdx",rowIdx)
    const newMatrix2 = transpose(colIdx.map(i => transpose(rowIdx.map(e => data[e]))[i]))
   // console.log("newMatrix2",newMatrix2)
   // console.log("buildData",buildData(newMatrix2))

    // if labels (truncated length) are not provided, indices are used
    let colNames2 = colnames ? trimText(colIdx, colnames) : Array.from(new Array(data[0].length), (x, i) => i + 1)
   // console.log("colNames",colnames)
   // console.log("colNames2",colNames2)

    let rowNames2 = rownames ? trimText(rowIdx, rownames) : Array.from(new Array(data[0].length), (x, i) => i + 1) //rownames.map((x,i) => x + rowIdx[i])//
    // let rowNames2 = rowIdx//rownames ? trimText(rowIdx, rownames) : Array.from(new Array(data[0].length), (x, i) => i + 1) //rownames.map((x,i) => x + rowIdx[i])//

   // console.log("rowNames2",rowNames2)

    // max x and y label lengths to be used in dendogram heights
    const colNames2Lengths = d3.max(colNames2.map(e => e.length))
    const rowNames2Lengths = d3.max(rowNames2.map(e => String(e).length))
   // console.log("rowNames2Lengths",rowNames2Lengths)


    const color_scale = d3.scaleLinear()
        .domain(heatmapColorScale)
        .range(['#fff', `${heatmapColor}`])

    let x_scale = d3.scaleBand()
        .domain(colNames2)
        .range([0, width - margin.left - margin.right])

    let y_scale = d3.scaleBand()
        .domain(rowNames2)
        // .domain(rownames)
        .range([0, height - margin.top])

   // console.log("y_scale",y_scale)


    const g = svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        // move the entire graph down and right to accomodate labels
        .attr('transform', `translate(${margin.left+margin.right}, ${margin.top+margin.bottom})`)
   // console.log("rowNames3-----------------------------")

    //text x axis
    const xAxis = g.append('g')
        .call(d3.axisTop(x_scale))
        .style("font-size", "10px");

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
        .style("font-size", "10px")
        .attr("id", "ya")

    yAxis.selectAll('.tick').selectAll('line').remove()
    yAxis.selectAll("text")
        .attr("dx", "2px")
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
   // console.log("rowNames4-----------------------------")


    const heatMapData = await buildData(newMatrix2)
    // Apply tooltip to our SVG
    svg.call(tooltip)
    gPoints.selectAll()
        .data(heatMapData)
        .enter()
        .append('rect')
        .attr('x', (d) => x_scale(colNames2[d.t]))
        .attr('y', (d) => y_scale(rowNames2[d.n]))
        .attr('width', width / data[0].length)
        .attr('height', height / data.length)
        .attr('fill', (d) => color_scale(d.value))
        .on('mouseover', tooltip.show)
        .on('mouseout', tooltip.hide)


   // console.log("rowNames5-----------------------------")

    // Top dendogram---------------------------------

    const dendoTooltip = d3tip()
    .style('border', 'solid 3px black')
    .style('background-color', 'white')
    .style('border-radius', '9px')
    .style('float', 'left')
    .style('font-family', 'monospace')
    .html((event, d) => `
<div style='float: right'>
   Height:${d.source.data.height.toFixed(3)} <br/>
</div>`)



if (clusterCols== true){

    function transformY(data) {
       // console.log("height",height,colPadding)
        const ht = colPadding//height-500//-innerHeight;
        return ht - (data.data.height / colMaxHeight) * ht;
      }
    
    function colElbow(d) { // H = width, V = height
        const path = (
            "M" + 
            d.source.x + 
            "," +
            //(height - (d.source.data.height / colMaxHeight) * height) +
            transformY(d.source) +
            "H" + 
            d.target.x +
            "V" + 
            // (height - (d.target.data.height / colMaxHeight) * height)
            transformY(d.target)
        )
        //// console.log("path", path)
        return path
    }
    

    //// console.log(root.links()) 
    
      const colMaxHeight = root.data.height-colPadding+5//-25; // col leaf height/length
    
      const allNodes = root.descendants().reverse()
      const leafs = allNodes.filter(d => !d.children)
          leafs.sort((a,b) => a.x - b.x)
      const leafHeight = (width-margin.left)/ leafs.length// spacing between leaves
          leafs.forEach((d,i) => d.x = i*leafHeight + leafHeight/2)
      
      allNodes.forEach(node => {
        if (node.children) {
          node.x = d3.mean(node.children, d => d.x)
        }})
    

    // Apply tooltip to our SVG
      svg.call(dendoTooltip)
    // dendo columns
      root.links().forEach((link,i) => {
      svg
          .append("path")
          .attr("class", "link")
          .attr("stroke", link.source.color || `${colDendoColor}`)
          .attr("stroke-width", `${3}px`)
          .attr("fill", 'none')
          .attr("transform", `translate(${margin.left}, ${colPadding})`)
          .attr("d", colElbow(link,colMaxHeight,margin.top,colNames2Lengths))
          .on('mouseover', dendoTooltip.show)
          // Hide the tooltip when "mouseout"
          .on('mouseout', dendoTooltip.hide)
        })
      }
             
      
    // bottom/row dendogram----------------------

    if (clusterRows == true) {

        function rowElbow(d) { // H = width, V = height
            const path = (
                "M" + 
                transformX(d.source)+ 
                "," +
                d.source.x +
                "V" + 
                d.target.x +
                "H" + 
                transformX(d.target)
            )
            //  // console.log("path",path)
            return path
        }
        
        function transformX(data) { // row dendogram height
            const height2 = margin.left - rowPadding;//padding = 60  
            // const height2 = margin.left - (rowLen+10);
            return height2 - (data.data.height / rowMaxHeight) * height2
        }

        const rowMaxHeight = root2.data.height+2;
        const clusterLayout2 = d3.cluster()
        clusterLayout2(root2)

        const allNodes2 = root2.descendants().reverse()
        const leafs2 = allNodes2.filter(d => !d.children)
        leafs2.sort((a, b) => a.x - b.x)
        const leafHeight2 = (height - margin.top) / leafs2.length
        leafs2.forEach((d, i) => d.x = i * leafHeight2 + leafHeight2 / 2)

        allNodes2.forEach(node => {
            if (node.children) {
                node.x = d3.mean(node.children, d => d.x)
            }
        })

        // Apply tooltip to our SVG
        svg.call(dendoTooltip)


        //  // console.log(root2.links()) 
        root2.links().forEach((link, i) => {
            svg
                .append("path")
                .attr("class", "link")
                .attr("stroke", link.source.color || `${rowDendoColor}`)
                .attr("stroke-width", `${3}px`)
                .attr("fill", 'none')
                .attr(`transform`, `translate(${rowNames2Lengths},${margin.top})`)
                .attr("d", rowElbow(link, rowMaxHeight, margin.left, rowNames2Lengths))
                .on('mouseover', dendoTooltip.show)
                // Hide the tooltip when "mouseout"
                .on('mouseout', dendoTooltip.hide)
        })
        svg.selectAll('path')
            .data(root2.links())
    }

   // console.log("rowNames6-----------------------------")

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
   // console.log("svg", svg.node())

    return svg.node()
}

// dendogram.plot({divid:"myDendogram"})
// dendogram.plot()

export {
    hclust_plot,
}
