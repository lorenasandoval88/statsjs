const Plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
const localForage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'))
import { default as PCA } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
import {pca} from './modules/mypca.js'


//https://observablehq.com/@saehrimnir/dimensionality-reduction-drawings
//https://observablehq.com/@3e787c1af6c5a437/a-comparative-overview-of-dimension-reduction-methods
//https://codesandbox.io/p/sandbox/eloquent-shtern-cj5vr6?file=%2Fsrc%2FpcaUtils.js%3A28%2C14-28%2C19



// display pca div 
pca.loadPcaDiv()

