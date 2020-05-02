const addRowButton = document.getElementById('add_row_button');
const removeRowButton = document.getElementById('remove_row_button');
const clearFormButton = document.getElementById('clear_form_button');
const settingsLink = document.getElementById('settings_link');
const teamForm = document.getElementById('team_form');
let rowsToCreateOnInitialization = 0;
// Modal Elements
const modal = document.getElementById('modal');
const modalCloseIcon = document.getElementById('modal_close_icon');
const loadRosterButton = document.getElementById('load_roster');
const saveRosterButton = document.getElementById('save_roster');

window.onload = () => {
	/* chrome.storage.sync.clear(() => {

      }) */
 
      chrome.storage.sync.get('rowsToCreate', (result) => {
          if(result.rowsToCreate === undefined) {
            rowsToCreateOnInitialization = 0;
            console.log('Upon opening, you have 0 extra rows to create');
          }
          else {
            rowsToCreateOnInitialization = result.rowsToCreate
            console.log(`Upon opening, we have ${rowsToCreateOnInitialization} extra rows to create`)
            let inputElementArray = createInputRows(rowsToCreateOnInitialization)
            addInputRowsToForm(inputElementArray);
          }
      })

      loadRoster();
 }

addRowButton.addEventListener("click", () => {
    console.log(`Before adding the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`)
    rowsToCreateOnInitialization += 1;
    console.log(`We now have ${rowsToCreateOnInitialization} rows to create`)

    let inputElementArray = createInputRows(1)
    addInputRowsToForm(inputElementArray)
    setRowsToCreateInChromeStorage(rowsToCreateOnInitialization)
})

removeRowButton.addEventListener("click", () => {
    const minimumNumberOfFormElements = 7;

    if(teamForm.childElementCount <= minimumNumberOfFormElements) {
        alert('Cannot have less than 1 row')
    }
    else {
        console.log(`Before removing the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`)
        rowsToCreateOnInitialization -= 1;
        console.log(`We now have ${rowsToCreateOnInitialization} rows to create`)
        removeRowFromForm();
        setRowsToCreateInChromeStorage(rowsToCreateOnInitialization)
    }
})

teamForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!validFormInput()) {
        alert('form input is invalid')
    } else {
        const formData = new FormData(teamForm)
        let response = await postFormData(formData);
        console.log(response)

        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.getElementById('meetName').value;
        document.body.append(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url)
    }
})

clearFormButton.addEventListener('click', () => {
    document.getElementById('meetName').value = "";
    teamForm.childNodes.forEach(node => {
        node.value = "";
    })
})

async function postFormData(formData) {
    console.log(formData)
        const response = await fetch('http://localhost:3000/api/report', {
            method: 'POST',
            body: formData,
        });
    
       return await response.blob();
}

let createInputRows = (numberOfRowsToCreate) => {
        let inputElementArray = [];

        for(let i = 0; i < numberOfRowsToCreate; i++) {
            let nameInput = document.createElement('INPUT')
            let timeInput = document.createElement('INPUT')
            let placeInput = document.createElement('INPUT')
            nameInput.setAttribute("class", "form-input form-input-name")
            timeInput.setAttribute("class", "form-input form-input-time")
            placeInput.setAttribute("class", "form-input form-input-place")
            nameInput.setAttribute("name", "name[]")
            timeInput.setAttribute("name", "time[]")
            placeInput.setAttribute("name", "place[]")
            nameInput.setAttribute("type", "text")
            timeInput.setAttribute("type", "text")
            placeInput.setAttribute("type", "text")
            inputElementArray.push(nameInput);
            inputElementArray.push(timeInput);
            inputElementArray.push(placeInput);
        }

        return inputElementArray;
}

let addInputRowsToForm = (inputElementArray) => {
	inputElementArray.forEach((element) => teamForm.appendChild(element));
};

let removeRowFromForm = () => {
	for (let i = 0; i < 3; i++) {
		teamForm.removeChild(teamForm.lastChild);
	}
};

let setRowsToCreateInChromeStorage = (rowsToCreateOnInitialization) => {
	chrome.storage.sync.set(
		{ rowsToCreate: rowsToCreateOnInitialization },
		() => {
			console.log(
				'Extra row value set in storage: ' + rowsToCreateOnInitialization
			);
		}
	);
};

// Settings modal related functionality below this point

settingsLink.addEventListener('click', openModal);
modalCloseIcon.addEventListener('click', closeModal);
window.addEventListener('click', clickOutside);
modal.addEventListener('animationend', changeModalDisplay);

saveRosterButton.addEventListener('click', () => {
    let names = []
    teamForm.childNodes.forEach(node => {
        if(node.name == 'name[]') {
            names.push(node.value)
        } 
        else {
            
        }
    })
    let roster = createRosterObjects(names)

    chrome.storage.sync.set({'roster': roster}, () => {
        console.log(`Set roster in storage`)
    })

    alert('Team Roster Saved!')

})

function openModal() {
	modal.style.display = 'block';
}

function closeModal() {
	modal.style.animationName = 'modalFadeOut';
}

function clickOutside(e) {
	if (e.target == modal) {
		modal.style.animationName = 'modalFadeOut';
	}
}

function changeModalDisplay(e) {
	if (e.target.style.animationName == 'modalFadeOut') {
		e.target.style.display = 'none';
		e.target.style.animationName = 'modalFadeIn';
	}
}

let createRosterObjects = (names) => {
    let roster = []
    for(let i = 0; i < names.length; i++) {
        roster.push({name: names[i]})
    }
    return roster;
}

let fillNameInputsWithRoster = (nameInputElements, roster) => {
    for(let i = 0; i < roster.length; i++) {
        nameInputElements[i].value = roster[i].name;
    }
}

let loadRoster = () => {
    chrome.storage.sync.get('roster', (result) => {
        if(result.roster === undefined || result.roster.length == 0) {
            return;
        } else {
            let nameInputElements = document.getElementsByName('name[]');
            if(nameInputElements.length < result.roster.length) {
                let rowsToCreate = result.roster.length - nameInputElements.length;
                rowsToCreateOnInitialization += rowsToCreate;
                setRowsToCreateInChromeStorage(rowsToCreateOnInitialization)
                addInputRowsToForm(createInputRows(rowsToCreate));
                fillNameInputsWithRoster(nameInputElements, result.roster)
            } else {
                fillNameInputsWithRoster(nameInputElements, result.roster)
            }
        }
    })
}

let validFormInput = () => {
    let formInputs = document.getElementsByClassName('form-input');
    console.log(formInputs)
    let testsPassed = 0;

    if(!fieldIsEmpty(formInputs)) {
        testsPassed += 1;
    }

    if(testsPassed === 1) {
        return true;
    }

}

let fieldIsEmpty = (formInputs) => {
    console.log(typeof(formInputs))
    for(let i = 0; i < formInputs.length; i++) {
        if(formInputs[i].value == "") {
            return true
        }
    }

    return false;
}
