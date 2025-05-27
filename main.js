import {pca} from './modules/myPca.mjs'
import {dendogram} from './modules/myDendogram.mjs'
import {heatmap} from './modules/myHeatmap.mjs'





pca.loadUI({divid:"myPCA"})
// pca.loadUI()

// dendogram.plot()
dendogram.plot({divid:"myDendogram"})


heatmap.plot({divid: "myHeatmap"} )
