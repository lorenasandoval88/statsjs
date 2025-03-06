

// Next: create a file input element
const fileInput = document.createElement('input')
fileInput.setAttribute('type', 'file')
fileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      // Process the file content here
    //   console.log(`File: ${file.name}, Content: ${content}`);
    };
    reader.readAsText(file); // Read as text, other options are readAsArrayBuffer, readAsDataURL
  }
});

// Add the input element to the document body (or any other desired location)
document.body.appendChild(fileInput);

// Add an event listener to handle file selection
// fileInput.addEventListener('change', (event) => {
//     const files = event.target.files;
//     if (files.length > 0) {
//       // Handle the selected files
//       console.log('Selected files:', files);
//     }
//   });