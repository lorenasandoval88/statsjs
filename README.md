# Welcome to statsJs!


Multivariate statistical visualization (clustering, correlation, heatmaps, etc) in JavaScript. 

live at: https://lorenasandoval88.github.io/statsjs

### Loading statsJs PCA User Interface:

`sdk = await import("https://lorenasandoval88.github.io/statsjs/sdk.js")`

### Loading the User Interface (UI):

`sdk.pca.UI()`

### Loading statsJs PCA plot only:

`sdk.pca.plot( {colors: ["#8C236A", "#4477AA"]} )`

    options can include the following (order is irrelevant):
    {
        divId: "as a string", 
        colors: [...list],
        data: data in JSON format,
        height: 100,
        width: 400
    }

### Loading statsJs textBox only:

`sdk.textBox( {text:  pca.data.iris.csv} )`

    options can include the following (order is irrelevant):
    {
        divId: "as a string", 
        text: data in csv or text format,
        height: 100,
        width: 400,
        border: "2px solid",
        color: "red"
    }
    
        
Further documentation can be found on the [wiki](https://github.com/lorenasandoval88/statsJs/wiki).
