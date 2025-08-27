import {pca_plot, pca_UI} from './modules/myPca.mjs'
import {hclust_plot} from './modules/myHclust.mjs'
import {hclust_UI} from './modules/myHclust.mjs'
import {heatmap_plot} from './modules/myHeatmap.mjs'
import {csvToJson} from './otherFunctions.js'
import {d3} from './imports.js'





// pca_UI({divid:"modalDiv"})


// hclust_plot({divid:"myHclust"})
// hclust_plot({})
hclust_UI({divid:"myHclust"})
// hclust_UI()

heatmap_plot({divid: "myHeatmap"} )


//PCA plots
pca_UI({divid:"myPCA"})

// pca_plot()
// pca_plot()
// pca_UI()
// pca_UI()

// heatmap_plot()

