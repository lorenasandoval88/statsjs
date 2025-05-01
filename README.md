# Welcome to statsJs!


Multivariate statistical visualization (clustering, correlation, heatmaps, etc) in JavaScript. 

live at: https://lorenasandoval88.github.io/statsjs

### Loading statsJs PCA User Interface:

`sdk = await import("https://lorenasandoval88.github.io/statsjs/sdk.js")`


`sdk.pca.UI()`

### Loading statsJs PCA plot only:

`sdk.plotPCA( {colors: ["#8C236A", "#4477AA"]} )`

    options can include the following options (order is irrelevant):
    {
        divId: "as a string", 
        colors: [...],
        data: data in JSON format,
        height: 100,
        width: 400,
        }

        
Further documentation can be found on the [wiki](https://github.com/lorenasandoval88/statsJs/wiki).
