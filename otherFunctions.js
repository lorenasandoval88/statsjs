const otherFunctions = {}

otherFunctions.csvToJson = async function (csv) {
  const lines = csv.split(/\r?\n/);
  // //console.log("lines", lines)
  const headers = lines[0].split(',');
  // //console.log("headers", headers)
  const result = [];
  result.headers = headers;

  for (let i = 1; i < lines.length - 1; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = otherFunctions.convertStrToNumber(currentLine[j])
    }
    result.push(obj);
  }
  // //console.log("result", result)
  return result;
}

otherFunctions.convertStrToNumber = function (str) {
  // Check if the string is empty or null
  if (isNaN(str)) {
    return str; // It's a letter or other non-numeric character, return the original string
  } else {
    return Number(str); // It's a number (or can be converted to one), so convert it
  }
}

otherFunctions.removeNonNumbers = function (arr) {
  return arr.filter(element => typeof element === 'number');
}

otherFunctions.removeNumbers = function (arr) {
  return arr.filter(element => typeof element !== 'number');
}

otherFunctions.removeNonNumberValues = function (ob) {
  return ob.map(obj => {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === 'number') {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  });
}

otherFunctions.removeNumberValues = function (ob) {
  return ob.map(obj => {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] !== 'number') {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  });
}

otherFunctions.asDataFrame = function (value) {
  //  //console.log("value",value)
  // check if value is array of objects (aoo)
  if (value === undefined || value === null)
    throw new Error("No data passed to function.");
  if (
    !Array.isArray(value) ||
    typeof value[0] !== "object" ||
    value[0] === null
  ) {
    throw new Error("First argument must be an array of objects");
  }

  const aoo = value;
  // columns: if parsed using d3, the aoo will already have a columns prop
  // -> create it otherwise
  if (!value.columns) {
    const set = new Set();
    for (const row of aoo) {
      for (const key of Object.keys(row)) set.add(key);
    }
    aoo.columns = [...set];
  }
  // create getters and setters for columns
  aoo.columns.forEach((column) => {
    if (!Object.getOwnPropertyDescriptor(aoo, column)) {
      Object.defineProperty(aoo, column, {
        get: function () {
          return this.map((row) => row[column]);
        },
        set: function (array) {
          if (!array) {
            throw new Error(`No data passed to set ${column} column.`);
          }
          if (array.length !== this.length) {
            throw new Error(
              `Data length (${array.length}) different from column ${column} length (${this.length}).`
            );
          }
          this.forEach((row, index) => (row[column] = array[index]));
        }
      });
    }
  });
  return aoo;
}

otherFunctions.scale = async function (Objects) {
  //console.log("function info:",pca.scale.toString())
 //Standardization (Z-score transformation)
 //Subtract the mean (μ) from each data point (x)
 //Divide each result by the standard deviation (σ)
 const clone = JSON.parse(JSON.stringify(Objects));
 const df = otherFunctions.asDataFrame(clone);
 df.columns.forEach((column) => {
   const values = df[column];
   const mean = d3.mean(values);
   const sd = d3.deviation(values);
   df[column] = values.map((v) => {
     if (v !== null && v !== undefined) {
       return (v - mean) / sd;
     }
     return v;
   });
 });
 return df;
}

export {
  otherFunctions
}