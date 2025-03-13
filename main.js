import {
  pcaModules
} from './modules/mypca.js'

const pcaData = {}// Declare global variable


// Next: create a file input element
const pca = () => {
  const fileInput = document.createElement('input')
  fileInput.id = 'fileInput'
  fileInput.setAttribute('type', 'file')
  fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader();

          reader.onload = function (e) {
            const csv = e.target.result;
            const json = csvToJson(csv)
            const matrix = (json.map(Object.values))
            matrix['headers'] = json['headers']
            pcaData.file = matrix
            // console.log('main csv', csv)
            // console.log('json[headers]', json['headers'])
            // console.log("main json", json)
            // console.log('main matrix', matrix)
            // displayJson(json);

            const scores = pcaModules.calculatePca(json)
            const groups = [...new Set(scores.map(d => d.group))] //.values()//.sort())
            // console.log("main scores", scores)
            pcaModules.plotPCA(scores, groups)
          };
          reader.onerror = function () {
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



function convertToNumber(str) {
  if (isNaN(str)) {
    return str; // It's a letter or other non-numeric character, return the original string
  } else {
    return Number(str); // It's a number (or can be converted to one), so convert it
  }
}

function csvToJson(csv) {
  const lines = csv.split(/\r?\n/);
  // console.log("lines", lines)
  const headers = lines[0].split(',');
  // console.log("headers", headers)
  const result = [];
  result.headers = headers;

  for (let i = 1; i < lines.length - 1; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');


    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = convertToNumber(currentLine[j])
      obj['id'] = 'id' + i
    }
    result.push(obj);
  }
  // console.log("result", result)
  return result;
}
pca()

export {
  pca,
  pcaData
}