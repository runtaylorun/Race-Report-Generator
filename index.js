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
		if (result.rowsToCreate === undefined) {
			rowsToCreateOnInitialization = 0;
			console.log('Upon opening, you have 0 extra rows to create');
		} else {
			rowsToCreateOnInitialization = result.rowsToCreate;
			console.log(
				`Upon opening, we have ${rowsToCreateOnInitialization} extra rows to create`
			);
			let inputElementArray = createInputRows(rowsToCreateOnInitialization);
			addInputRowsToForm(inputElementArray);
		}
	});
};

addRowButton.addEventListener('click', () => {
	console.log(
		`Before adding the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`
	);
	rowsToCreateOnInitialization += 1;
	console.log(`We now have ${rowsToCreateOnInitialization} rows to create`);

	let inputElementArray = createInputRows(1);
	addInputRowsToForm(inputElementArray);
	setRowsToCreateInChromeStorage(rowsToCreateOnInitialization);
});

removeRowButton.addEventListener('click', () => {
	const minimumNumberOfFormElements = 6;

	if (teamForm.childElementCount <= minimumNumberOfFormElements) {
		alert('Cannot have less than 1 row');
	} else {
		console.log(
			`Before removing the extra row, we currently have ${rowsToCreateOnInitialization} rows to create`
		);
		rowsToCreateOnInitialization -= 1;
		console.log(`We now have ${rowsToCreateOnInitialization} rows to create`);
		removeRowFromForm();
		setRowsToCreateInChromeStorage(rowsToCreateOnInitialization);
	}
});

teamForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const formData = new FormData(teamForm);
	let response = await postFormData(formData);

	let url = window.URL.createObjectURL(response);
	let a = document.createElement('a');
	a.href = url;
	a.download = 'RaceReport.xlsx';
	a.click();
	a.remove();
	window.URL.revokeObjectURL(url);
});

clearFormButton.addEventListener('click', () => {
	teamForm.childNodes.forEach((node) => {
		node.value = '';
	});
});

async function postFormData(formData) {
	const rawResponse = await fetch('http://10.0.1.61:3000/api/report', {
		method: 'POST',
		body: formData,
	});

	return await rawResponse.blob();
}

let createInputRows = (numberOfRowsToCreate) => {
	let inputElementArray = [];

	for (let i = 0; i < numberOfRowsToCreate; i++) {
		let nameInput = document.createElement('INPUT');
		let gradeInput = document.createElement('INPUT');
		let timeInput = document.createElement('INPUT');
		nameInput.setAttribute('name', 'name[]');
		gradeInput.setAttribute('name', 'grade[]');
		timeInput.setAttribute('name', 'time[]');
		nameInput.setAttribute('type', 'text');
		gradeInput.setAttribute('type', 'text');
		timeInput.setAttribute('type', 'text');
		inputElementArray.push(nameInput);
		inputElementArray.push(gradeInput);
		inputElementArray.push(timeInput);
	}

	return inputElementArray;
};

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
	let names = [];
	let grades = [];
	teamForm.childNodes.forEach((node) => {
		if (node.name == 'name[]') {
			names.push(node.value);
		} else if (node.name == 'grade[]') {
			grades.push(node.value);
		} else {
		}
	});
	let roster = createRosterObjects(names, grades);

	chrome.storage.sync.set({ roster: roster }, () => {
		console.log(`Set roster in storage`);
	});
});

loadRosterButton.addEventListener('click', () => {
	chrome.storage.sync.get('roster', (result) => {
		let nameInputElements = document.getElementsByName('name[]');
		let gradeInputElements = document.getElementsByName('grade[]');
		for (let i = 0; i < result.roster.length; i++) {
			nameInputElements[i].value = result.roster[i].name;
			gradeInputElements[i].value = result.roster[i].grade;
		}
	});
});

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

let createRosterObjects = (names, grades) => {
	let roster = [];
	for (let i = 0; i < names.length; i++) {
		roster.push({ name: names[i], grade: grades[i] });
	}
	return roster;
};
