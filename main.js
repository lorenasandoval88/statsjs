import {pca_UI} from './modules/myPca.mjs'
import {hclust_plot} from './modules/myDendogram.mjs'
import {heatmap_plot} from './modules/myHeatmap.mjs'





pca_UI({divid:"myPCA"})


hclust_plot({divid:"myDendogram"})


heatmap_plot({divid: "myHeatmap"} )
