'use strict';

const dataBase = JSON.parse(localStorage.getItem('awito')) || []; // getting database with all cards from localStorage

// getting necessary elements
const
    modalAdd = document.querySelector('.modal__add'),
    addAd = document.querySelector('.add__ad'),
    modalBtnSubmit = document.querySelector('.modal__btn-submit'),
    modalSubmit = document.querySelector('.modal__submit'),
    catalog = document.querySelector('.catalog'),
    modalItem = document.querySelector('.modal__item'),
    modalItemContent = modalItem.querySelector('.modal__content'),
    modalBtnWarning = document.querySelector('.modal__btn-warning'),
    modalFileInput = document.querySelector('.modal__file-input'),
    modalFileBtn = document.querySelector('.modal__file-btn'),
    modalImageAdd = document.querySelector('.modal__image-add');

const textFileBtn = modalFileBtn.textContent; // default text of button in modalSubmit form
const srcModalImage = modalImageAdd.src; // default image in modalSubmit form

const elementsModalSubmit = [...modalSubmit.elements].filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit'); // getting elements of form in modalSubmit

const infoPhoto = {}; // photo's info

const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase)); // function for saving new card in localStorage

const checkForm = () => { // validation of the form
    const validForm = elementsModalSubmit.every(elem => elem.value);
    modalBtnSubmit.disabled = !validForm;
    modalBtnWarning.style.display = validForm ? 'none' : '';
}

const closeModal = event => { // closing modal window
    const target = event.target;
    if (target.closest('.modal__close') || target.classList.contains('modal') || event.code === 'Escape') { // click on cross | click on substrate | press esc
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModal);
        modalSubmit.reset(); // reseting form
        modalImageAdd.src = srcModalImage; // set image to default
        modalFileBtn.textContent = textFileBtn; // set btn to default
        checkForm(); // validation
    }
};

const renderCard = () => {
    catalog.textContent = '';
    dataBase.forEach((item, i) => { // array dataBase run & adding cards to catalog
        catalog.insertAdjacentHTML('beforeend', `
            <li class="card" data-id="${i}">
                <img class="card__image" src="data:image/jpeg;base64,${item.image}" alt="test">
                <div class="card__description">
                    <h3 class="card__header">${item.nameItem}</h3>
                    <div class="card__price">${item.costItem} ₽</div>
                </div>
            </li>
        `);
    });
};

const renderModalItem = card => { // rendering modalItem modal window
    const data = dataBase[card.dataset.id]; // identifying element in dataBase array, which contains info about pressed card
    modalItemContent.textContent = '';
    modalItemContent.insertAdjacentHTML('beforeend', `
        <div><img class="modal__image modal__image-item" src="data:image/jpeg;base64,${data.image}" alt="test"></div>
        <div class="modal__description">
            <h3 class="modal__header-item">${data.nameItem}</h3>
            <p>Состояние: <span class="modal__status-item">${data.status === 'new' ? 'Новый' : 'Б/у'}</span></p>
            <p>Описание:
                <span class="modal__description-item">${data.descriptionItem}</span>
            </p>
            <p>Цена: <span class="modal__cost-item">${data.costItem} ₽</span></p>
            <button class="btn">Купить</button>
        </div>
    `);
};

modalFileInput.addEventListener('change', event => { // adding functional to modalFileInput
    const target = event.target;

    const reader = new FileReader();
    
    const file = target.files[0];

    infoPhoto.filename = file.name; // setting name of file
    infoPhoto.size = file.size; // setting size of file

    reader.readAsBinaryString(file); // reading file as binary string

    reader.addEventListener('load', event => { // when file readed
        if (infoPhoto.size < 200000) { // checking if file is longer than 200 kB
            modalFileBtn.textContent = infoPhoto.filename;
            infoPhoto.base64 = btoa(event.target.result); // converting readed file to base64 format
            modalImageAdd.src = `data:image/jpeg;base64,${infoPhoto.base64}`;
        } else {
            modalFileBtn.textContent = 'файл не должен превышать 200кб';
            modalFileInput.value = '';
            checkForm();
        }
    });
});

modalSubmit.addEventListener('input', checkForm); // checking form every time the content of the form change

modalSubmit.addEventListener('submit', event => { // when clicked on submit button
    event.preventDefault(); // cancel default browser action
    const itemObj = {}; // object contains info of card
    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.value; // adding info from form
    }
    itemObj.image = infoPhoto.base64; // adding image
    dataBase.push(itemObj);
    closeModal({target: modalAdd}); // closing modal window
    saveDB(); // saving info in database
    renderCard(); // rendering cards anew
});

addAd.addEventListener('click', () => { // opening modal window
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;
    document.addEventListener('keydown', closeModal); // closing modal window if esc pressed
});

catalog.addEventListener('click', event => {
    const target = event.target;
    if (target.closest('.card')) { // opening modal window if clicked on card
        modalItem.classList.remove('hide');
        renderModalItem(target.closest('.card'));
        document.addEventListener('keydown', closeModal); // closing modal window if esc pressed
    }
});

modalAdd.addEventListener('click', closeModal); // closing modal window according to conditions
modalItem.addEventListener('click', closeModal); // closing modal window according to conditions

renderCard(); // rendering all cards when document loaded