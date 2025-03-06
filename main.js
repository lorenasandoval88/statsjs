import { pca } from './modules/mypca.js'

const sdk = {}
// Next: create a file input element
sdk.plot = () => {
const fileInput = document.createElement('input')
fileInput.setAttribute('type', 'file')
fileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const file = event.target.files[0]
      if (file) {
          const reader = new FileReader();
  
          reader.onload = function(e) {
              const csv = e.target.result;
              const json = csvToJson(csv)
              const matrix = (json.map( Object.values ))
              matrix['headers'] = json['headers']
              // console.log('json[headers]',json['headers'])
              // console.log('matrix',matrix)
              // console.log('pca',PCA)
  
      
              // displayJson(json);
              const scores = pca.calculatePca(json)
              const groups = [...new Set(scores.map( d => d.group))]//.values()//.sort())
              pca.plotPCA(scores, groups)
          };
          reader.onerror = function() {
              displayError('Error reading the file.');
          };
  
          reader.readAsText(file);
      }
    };
    reader.readAsText(file); // Read as text, other options are readAsArrayBuffer, readAsDataURL
  }
});
// Add the input element to the document body (or any other desired location)
document.body.appendChild(fileInput);
}
// Add an event listener to handle file selection
// fileInput.addEventListener('change', (event) => {

//     const file = event.target.files[0]
//     if (file) {
//         const reader = new FileReader();

//         reader.onload = function(e) {
//             const csv = e.target.result;
//             const json = csvToJson(csv)
//             const matrix = (json.map( Object.values ))
//             matrix['headers'] = json['headers']
//             // console.log('json[headers]',json['headers'])
//             // console.log('matrix',matrix)
//             // console.log('pca',PCA)

    
//             // displayJson(json);
//             const scores = CalculatePca(json)
//             const groups = [...new Set(scores.map( d => d.group))]//.values()//.sort())
//             const results = plotPCA(scores, groups)
//         };
//         reader.onerror = function() {
//             displayError('Error reading the file.');
//         };

//         reader.readAsText(file);
//     }
   

// });

function convertToNumber(str) {
  if (isNaN(str)) {
    return str; // It's a letter or other non-numeric character, return the original string
  } else {
    return Number(str); // It's a number (or can be converted to one), so convert it
  }
}

  function csvToJson(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    const result = [];
    result.headers = headers;

    for (let i = 1; i < lines.length-1; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');


        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = convertToNumber(currentLine[j])
            obj['id'] = 'id'+i
        }
        result.push(obj);
    }
    return result;
}
sdk.plot()

export { sdk}