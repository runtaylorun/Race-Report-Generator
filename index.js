let addRowButton = document.getElementById('addRow');
let removeRowButton = document.getElementById('removeRow');
const teamForm = document.getElementById('teamForm');
let submitButton = document.getElementById('submit')
const minimumNumberOfFormElements = 6;
let rowsToCreateOnInitialization = 0

 window.onload = () => {
      /* chrome.storage.sync.clear(() => {

      }) */

      chrome.storage.sync.get('rowsToCreate', (result) => {
          if(result.rowsToCreate === 0 || result.rowsToCreate === undefined) {
            rowsToCreateOnInitialization = 0;
            console.log('Upon opening, you have 0 extra rows to create');
          }
          else {
            rowsToCreateOnInitialization = result.rowsToCreate
            console.log(`Upon opening, we have ${rowsToCreateOnInitialization} extra rows to create`)
            let inputElementArray = []
            inputElementArray = createInputRows(inputElementArray, rowsToCreateOnInitialization)
            inputElementArray.forEach(element => teamForm.appendChild(element))
          }
          
      })
 }

addRowButton.addEventListener("click", () => {
    let inputElementArray = []
    console.log(`Before adding the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`)
    rowsToCreateOnInitialization += 1;
    console.log(`We now have ${rowsToCreateOnInitialization} rows to create`)
    inputElementArray = createInputRows(inputElementArray, 1)

    inputElementArray.forEach(element => teamForm.appendChild(element))
    chrome.storage.sync.set({'rowsToCreate': rowsToCreateOnInitialization}, () => {
        console.log(`Extra row value set in storage: ${rowsToCreateOnInitialization}`)
    })
})

removeRowButton.addEventListener("click", () => {
    if(teamForm.childElementCount <= minimumNumberOfFormElements) {
        alert('Cannot have less than 1 row')
    }
    else {
        console.log(`Before removing the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`)
        rowsToCreateOnInitialization -= 1;
        console.log(`We now have ${rowsToCreateOnInitialization} rows to create`)
        for(let i = 0; i < 3; i++) {
            teamForm.removeChild(teamForm.lastChild)
        }

        chrome.storage.sync.set({'rowsToCreate': rowsToCreateOnInitialization}, () => {
            console.log('Extra row value set in storage: ' + rowsToCreateOnInitialization)
        })
    }
})

teamForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(teamForm)
    let response = await postData(formData);

    download(response);

    // Send form data to api
    // wait for api to respond with txt file or excel file
    //download txt file on the client
})

async function postData(formData) {
    console.log(formData)
        const response = await fetch('http://localhost:3000/api/report', {
            method: 'POST',
            body: formData
        });
    
       return await response.blob();
}

let createInputRows = (inputElementArray, numberOfRowsToCreate) => {
        for(let i = 0; i < numberOfRowsToCreate; i++) {
            let nameInput = document.createElement('INPUT')
            let gradeInput = document.createElement('INPUT')
            let timeInput = document.createElement('INPUT')
            nameInput.setAttribute("name", "name[]")
            gradeInput.setAttribute("name", "grade[]")
            timeInput.setAttribute("name", "time[]")
            nameInput.setAttribute("type", "text")
            gradeInput.setAttribute("type", "text")
            timeInput.setAttribute("type", "text")
            inputElementArray.push(nameInput);
            inputElementArray.push(gradeInput);
            inputElementArray.push(timeInput);
        }

        return inputElementArray;
}