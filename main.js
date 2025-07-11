import {pca_UI} from './modules/myPca.mjs'
import {hclust_plot} from './modules/myDendogram.mjs'
import {heatmap_plot} from './modules/myHeatmap.mjs'
import {csvToJson} from './otherFunctions.js'
import {d3} from './imports.js'





// pca_UI({divid:"modalDiv"})
pca_UI({divid:"myPCA"})


hclust_plot({divid:"myDendogram"})


heatmap_plot({divid: "myHeatmap"} )


// pca_UI()
heatmap_plot()

