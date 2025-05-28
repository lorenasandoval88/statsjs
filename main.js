import {pca_UI} from './modules/myPca.mjs'
import {dendogram} from './modules/myDendogram.mjs'
import {heatmap} from './modules/myHeatmap.mjs'





pca_UI({divid:"myPCA"})


dendogram.plot({divid:"myDendogram"})


heatmap.plot({divid: "myHeatmap"} )
