import { 
    // pca,
    pca_plot, 
    pca_UI
  } from './modules/myPca.mjs'

  import { 
    heatmap,
  } from './modules/myHeatmap.mjs'

import{
    npm_pca, 
    npm_pcajs, 
    Plotly, 
    d3, 
    d3tip, 
    ml_dataset_iris, 
    localForage
  } from './imports.js'


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
  } from './otherFunctions.js'



export {
    heatmap,
    // pca,
    pca_plot, 
    pca_UI,

    npm_pca, 
    npm_pcajs, 
    Plotly, 
    d3, 
    d3tip, 
    ml_dataset_iris, 
    localForage,

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
}