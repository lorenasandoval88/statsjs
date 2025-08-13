// console.log("dendogram.mjs loaded")
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
    localforage,
    hclust,
    dist,
    distance
} from '../imports.js'

// Declare global data variable for dendogram including iris data
const hclustDt = { data: {}}
const divNum = 1
hclustDt.data.divNum = divNum


//Get iris data from localforage or from built-in file
hclustDt.data.iris = {}
hclustDt.data.iris.json = await localforage.getItem("irisJSON")
hclustDt.data.iris.csv = await localforage.getItem("irisCSV") //csv// irisData.map(row => row.map(item => (typeof item === 'string' && item.indexOf(',') >= 0) ? `"${item}"`: String(item)).join(',')).join('\n')
hclustDt.data.file = "none loaded"
hclustDt.data.iris.values = hclustDt.data.iris.json.map(obj => Object.values(obj));
hclustDt.data.iris.numbers = hclustDt.data.iris.values.map(row => row.slice(0, -1)) // remove species column
hclustDt.data.iris.features = Object.keys(hclustDt.data.iris.json[0]).slice(0, -1)
console.log("hclustDt hclustDt.data.divNum:", hclustDt.data.divNum)
console.log("hclustDt object:", hclustDt)

function getRandomSubset(array, subsetSize) {
    if(subsetSize > array.length){
      return "Subset size cannot exceed array length";
    }
  
    const shuffled = [...array].sort(() => 0.5 - Math.random());
   // console.log("shuffled", shuffled.slice(0, subsetSize))
    return shuffled.slice(0, subsetSize);
  }


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
const hclust_UI = async function (options = {}) {
    console.log("RUNNING hclust_UI()-------------------------------");
    console.log("hclust UI div num", hclustDt.data.divNum)

  const {
    divid: divid = "",
    //todo: add textbox opyions, height width color etc
  } = options

  let div = document.getElementById(divid);
    if (document.getElementById(divid)) {
    // The div with the specified ID exists, updating...
    console.log("hclust_UI() div ID provided, loading div:", div);
    // div.id = 'loadUI'

  } else {
    console.log("hclust_UI() div NOT provided. creating div...", div);
    // create the div element here
    div = document.createElement("div")
    div.id = 'loadUI' + (hclustDt.data.divNum)
    div.style.alignContent = "center"
    document.body.appendChild(div);
    console.log("hclust_UI() div NOT provided. creating div...", div);
  }

  // iris data button 
  const irisDataButton = document.createElement('button')
  irisDataButton.id = 'irisDataButton'+(hclustDt.data.divNum)
  irisDataButton.textContent = 'Load Iris Data'
  div.appendChild(irisDataButton);
  console.log("hclustUI: irisDataButton:", document.getElementById(irisDataButton.id))

  // file input Button
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'+(hclustDt.data.divNum)
  fileInput.setAttribute('type', 'file')
  div.appendChild(fileInput);
  div.append(document.createElement('br'));
  div.append(document.createElement('br'));



  // create plot div
  const plotDiv = document.createElement("div")
  plotDiv.id = 'hcplotDiv'+(hclustDt.data.divNum)//'hcplotDiv'
  div.appendChild(plotDiv);
  console.log("hclustUI: plotDiv:", document.getElementById(plotDiv.id))

  // create textbox div
  const textBoxDiv = document.createElement("div")
  textBoxDiv.id = 'textBoxDiv'+(hclustDt.data.divNum)
  textBoxDiv.style.alignContent = "center"
  div.appendChild(textBoxDiv);
  console.log("hclustUI: textBoxDiv:", document.getElementById(textBoxDiv.id))

  // event listener for load file data buttons
  fileInput.addEventListener('change', (event) => {
  
      console.log(hclustDt.data.divNum,"fileInput button clicked!")
  
      const files = event.target.files;
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const file = event.target.files[0]
          if (file) {
            const reader = new FileReader();
  
            reader.onload = async function (e) {
              const csv = e.target.result;
              const json = await csvToJson(csv)
  
              console.log("hclustDt.data.divNum", hclustDt.data.divNum)
  
              const matrix = (json.map(Object.values))
              matrix['headers'] = json['headers']
  
              hclustDt.data.file = []
              hclustDt.data.file.json = json
              hclustDt.data.file.csv = csv
  
              // hclust plot and text box
            hclust_plot({
            matrix:  hclustDt.data.file.json.map(obj => Object.values(obj)).map(row => row.slice(0, -1)),//numbers only, no species,
            rownames:  hclustDt.data.file.json.map(obj => Object.values(obj)).map((d, idx) => d[4] + idx),
            colnames:   Object.keys(hclustDt.data.file.json[0]).slice(0, -1),
            divid: plotDiv.id,
            clusterCols: false,
            clusterRows: false
        })              
            // textBox({text: csv, divid: textBoxDiv.id})
       
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
      document.getElementById(irisDataButton.id).addEventListener('click', async function () {
       // cluster row button 
        const rowClusterButton = document.createElement('button')
        rowClusterButton.id = 'rowCluster'+(hclustDt.data.divNum)
        rowClusterButton.textContent = 'Cluster by Rows'
        div.appendChild(rowClusterButton);
        console.log("hclustUI: rowCluster:", document.getElementById(rowClusterButton.id))

        // cluster col Button
        const colClusterButton = document.createElement('button')
        colClusterButton.id = 'colCluster'+(hclustDt.data.divNum)
        colClusterButton.textContent = 'Cluster by Columns'
        div.appendChild(colClusterButton);
        div.append(document.createElement('br'));
        div.append(document.createElement('br'));

        console.log(hclustDt.data.divNum,plotDiv,plotDiv.id,"load iris data button clicked!")
    
         // hclust plot and text box
        hclust_plot({
            matrix:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map(row => row.slice(0, -1)),//numbers only, no species,
            rownames:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map((d, idx) => d[4] + idx),
            colnames:   Object.keys(hclustDt.data.iris.json[0]).slice(0, -1),
            divid: plotDiv.id, 
            clusterCols: false,
            clusterRows: false

        })
        // textBox({ text: hclustDt.data.iris.csv, divid: textBoxDiv.id})

        document.getElementById(rowClusterButton.id).addEventListener('click', async function () {
        console.log(document.getElementById('rowCluster'+(hclustDt.data.divNum)))
 
        hclust_plot({
                    matrix:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map(row => row.slice(0, -1)),//numbers only, no species,
                    rownames:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map((d, idx) => d[4] + idx),
                    colnames:   Object.keys(hclustDt.data.iris.json[0]).slice(0, -1),
                    divid: plotDiv.id, 
                    clusterCols: false,
                    clusterRows: true
                })
      })

        document.getElementById(colClusterButton.id).addEventListener('click', async function () {
        console.log(document.getElementById('colCluster'+(hclustDt.data.divNum)))
 
        hclust_plot({
                    matrix:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map(row => row.slice(0, -1)),//numbers only, no species,
                    rownames:  hclustDt.data.iris.json.map(obj => Object.values(obj)).map((d, idx) => d[4] + idx),
                    colnames:   Object.keys(hclustDt.data.iris.json[0]).slice(0, -1),
                    divid: plotDiv.id, 
                    clusterCols: true,
                    clusterRows: false
                })
      })
    
      });

      console.log(`rowCluster${(hclustDt.data.divNum)}`)

      console.log(document.getElementById(`rowCluster${(hclustDt.data.divNum)}`))


        hclustDt.data.divNum += 1

}
//-----------------------------------------------------------------------------------


const hclust_plot = async function (options = {}) {
      console.log("RUNNING hclust_plot()-------------------------------")

    const {
        divid: divid = "",
        matrix: matrix = hclustDt.data.iris.numbers,//numbers only, no species,
        rownames: rownames = hclustDt.data.iris.values.map((d, idx) => d[4] + idx),
        colnames: colnames = hclustDt.data.iris.features,
        width: width = 400,
        height: height = 1200,
        // dendograms
        clusterCols: clusterCols = true,
        clusterRows: clusterRows = true,
        clusteringDistanceRows: clusteringDistanceRows = "euclidean",
        clusteringDistanceCols: clusteringDistanceCols = "euclidean",
        clusteringMethodCols: clusteringMethodCols = "complete",
        clusteringMethodRows: clusteringMethodRows = "complete",
        marginTop: marginTop = clusterCols ? 85 : 70,
        marginLeft: marginLeft = clusterRows ? 250 : 70,
        colPadding: colPadding = clusterCols ? 12 : 0, 
        rowPadding: rowPadding = clusterRows ? 75 : 0,
        dendogram_font: dendogram_font = "10px",
        // topdendogram color
        colDendoColor: colDendoColor = "blue",
        // bottomdendogram color
        rowDendoColor: rowDendoColor = "red",
        // heatmap color
        heatmapColor: heatmapColor = "green",
        heatmapColorScale: heatmapColorScale = [0, 8],
        // hover tooltip
        tooltip_decimal: tooltip_decimal = 2,
        tooltip_fontFamily: tooltip_fontFamily = 'monospace',
        tooltip_fontSize: tooltip_fontSize = '12px',
    } = options;

          console.log(divid,"RUNNING hclust_plot()-------------------------------")

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
// console.log("colHclustTree", colHclustTree)


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
        .style("font-size", dendogram_font);

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
        .style("font-size", dendogram_font)
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
        .style('font-family', tooltip_fontFamily)
        .html((event, d) => `
        <div style='float: right'>
           value:${d.value.toFixed(tooltip_decimal)} <br/>
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
    .style('font-family', tooltip_fontFamily)
    .style('font-size', tooltip_fontSize)
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
        const div = document.getElementById(divid)
        // document.body.appendChild(div)
        div.innerHTML = ""
        div.appendChild(svg.node())
        console.log(`hclust div provided in function parameters.`,div,divid);


    } else if (!document.getElementById("childDiv")) {
       console.log(`hclust div  NOT provided in function parameters or doesn't exist, creating div....`);
       const div = document.createElement("div")
        document.body.appendChild(div)
        div.appendChild(svg.node());
        console.log("hclust div", div.id, div) 
    
    }
   // console.log("svg", svg.node())

    return svg.node()
}

// dendogram.plot({divid:"myDendogram"})
// dendogram.plot()

export {
    hclust_plot,
    hclust_UI,
}
