// console.log("imports.js loaded")

import { PCA as npm_pca } from "https://esm.sh/ml-pca"
const ml_dataset_iris = (await import("https://esm.sh/ml-dataset-iris"))
import { default as npm_pcajs } from 'https://cdn.jsdelivr.net/npm/pca-js@1.0.1/+esm'
const Plotly = (await import('https://cdn.jsdelivr.net/npm/plotly.js-dist@3.0.1/+esm')).default
const localforage = (await import('https://cdn.jsdelivr.net/npm/localforage@1.10.0/+esm')).default
// import {PCA} from 'https://cdn.jsdelivr.net/npm/ml-pca@4.1.1/+esm'
import * as d3 from "https://cdn.skypack.dev/d3@7"
import { default as d3tip} from 'https://esm.sh/d3-tip';
const hclust = (await import("https://cdn.skypack.dev/ml-hclust@3.1.0?min"))
// const dist = (await import("https://bundle.run/ml-distance-matrix@2.0.1"))
import {default as dist} from "https://esm.sh/ml-distance-matrix"
const distance = (await import("https://cdn.skypack.dev/ml-distance@3.0.0?min")).distance

// import {csvToJson } from './otherFunctions.js'
// load the iris data file stored on github and save to local storage


// Create a localForage instance for the "users" store
const clustjs_DB = localforage.createInstance({
  name: "clustjs_DB",
  storeName: 'iris', // Think of this as your "users" table
  description: 'Stores iris data' 
});


// console.log(clustjs_DB.getItem("irisJSON"))


// retreive built-in iris dataset as csv and JSON

      let irisCSV
      let irisJSON

      const getIris = async function () {
          const csvToJson = (await import('./otherFunctions.js')).csvToJson
          // console.log("csvToJson", csvToJson)
          // const JSON = await csvToJson(irisCSV)

          if (await localforage.getItem("irisJSON") === null) {

              await fetch('./sampleData/iris.csv')
                  .then(response => response.text())
                  .then(async response => {
                      irisCSV = response ;// await csvToJson(response)
                      irisJSON =await csvToJson(irisCSV)
                      console.log("irisJSON", irisJSON)
                  })
              // irisJSON = await csvToJson(irisCSV);
              localforage.setItem("irisJSON", irisJSON);
              localforage.setItem("irisCSV", irisCSV);

              console.log(`irisJSON saved in localStorage.`);
          } else {
              console.log(`iris already exists in localStorage`);
          }
      }

      await getIris()

      export {
          irisCSV,
          irisJSON,
          npm_pca,
          npm_pcajs,
          Plotly,
          d3,
          d3tip,
          ml_dataset_iris,
          localforage,
          hclust,
          dist,
          distance
      };