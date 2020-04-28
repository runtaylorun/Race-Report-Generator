const addRowButton = document.getElementById('add_row_button');
const removeRowButton = document.getElementById('remove_row_button');
const teamForm = document.getElementById('team_form');
const submitButton = document.getElementById('submit_form_button')
const minimumNumberOfFormElements = 6;
let rowsToCreateOnInitialization = 0
// Modal Elements 
const settingsLink = document.getElementById('settings_link')
const modal = document.getElementById('modal')
const modalCloseIcon = document.getElementById('modal_close_icon')
const loadRosterButton = document.getElementById('load_roster')
const saveRosterButton = document.getElementById('save_roster')

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

// Settings modal related functionality below this point

settingsLink.addEventListener('click', openModal);
modalCloseIcon.addEventListener('click', closeModal);
window.addEventListener('click', clickOutside)
modal.addEventListener('animationend', changeModalDisplay)
saveRosterButton.addEventListener('click', () => {
    let names = []
    let grades = []
    teamForm.childNodes.forEach(node => {
        if(node.name == 'name[]') {
            names.push(node.value)
        } 
        else if (node.name = 'grade[]') {
            grades.push(node.value)
        }
    })
    createRosterObjects(names, grades)
})

function openModal() {
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.animationName = 'modalFadeOut';
}

function clickOutside(e) {
    if(e.target == modal) {
        modal.style.animationName = 'modalFadeOut'
    }
}

function changeModalDisplay(e) {
    if(e.target.style.animationName == 'modalFadeOut') {
        e.target.style.display = 'none';
        e.target.style.animationName = 'modalFadeIn'
    }
}

let createRosterObjects = (names, grades) => {
    let roster = []
    for(let i = 0; i < names.length; i++) {
        roster.push({name: names[i], grade: grades[i]})
    }
    console.log(roster)
}