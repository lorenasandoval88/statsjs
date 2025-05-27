import {pca_UI} from './modules/myPca.mjs'
import {dendogram} from './modules/myDendogram.mjs'
import {heatmap} from './modules/myHeatmap.mjs'





pca_UI({divid:"myPCA"})
// pca.loadUI()

// dendogram.plot()
dendogram.plot({divid:"myDendogram"})


heatmap.plot({divid: "myHeatmap"} )
