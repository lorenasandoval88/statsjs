const { PCA} = await import("https://esm.sh/ml-pca");
const dataset = (await import("https://esm.sh/ml-dataset-iris"))
import { default as PCAjs } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
const Plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
const localForage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/dist/localforage.min.js'))
// import {PCA} from 'https://cdn.jsdelivr.net/npm/ml-pca@4.1.1/+esm'
import * as d3 from "https://cdn.skypack.dev/d3@7"
import { default as d3tip} from 'https://esm.sh/d3-tip';


// console.log("Plotly", Plotly)
// console.log("PCA", PCA)

// const imports = {}

// imports.d3 = d3
// imports.d3tip = d3tip
// imports.Plotly = Plotly
// imports.PCA = PCA
// imports.PCAjs = PCAjs
// imports.iris = dataset
// imports.localForage = localForage

// export { imports };
export { PCA, PCAjs, Plotly, d3, d3tip, dataset, localForage };