import {pca_plot, pca_UI} from './modules/myPca.mjs'
import {hclust_plot} from './modules/myDendogram.mjs'
import {heatmap_plot} from './modules/myHeatmap.mjs'
import {csvToJson} from './otherFunctions.js'
import {d3} from './imports.js'





// pca_UI({divid:"modalDiv"})


hclust_plot({divid:"myDendogram"})


heatmap_plot({divid: "myHeatmap"} )


//PCA plots
pca_UI({divid:"myPCA"})

// pca_plot()
// pca_plot()
// pca_UI()
// pca_UI()

// heatmap_plot()

