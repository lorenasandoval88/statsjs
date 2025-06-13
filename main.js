import {pca_UI} from './modules/myPca.mjs'
import {hclust_plot} from './modules/myDendogram.mjs'
import {heatmap_plot} from './modules/myHeatmap.mjs'
import {csvToJson} from './otherFunctions.js'

// retreive built-in iris dataset
fetch('/sampleData/iris.csv')
.then(response => response.text())
.then(async data => console.log(await csvToJson(data)));

pca_UI({divid:"myPCA"})


hclust_plot({divid:"myDendogram"})


heatmap_plot({divid: "myHeatmap"} )
