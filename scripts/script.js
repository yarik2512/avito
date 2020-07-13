'use strict';

const dataBase = JSON.parse(localStorage.getItem('awito')) || [];
let counter = dataBase.length;

const
    modalAdd = document.querySelector('.modal__add'),
    addAd = document.querySelector('.add__ad'),
    modalBtnSubmit = document.querySelector('.modal__btn-submit'),
    modalSubmit = document.querySelector('.modal__submit'),
    catalog = document.querySelector('.catalog'),
    modalItem = document.querySelector('.modal__item'),
    modalItemBuy = modalItem.querySelector('.btn'),
    modalBtnWarning = document.querySelector('.modal__btn-warning'),
    modalFileInput = document.querySelector('.modal__file-input'),
    modalFileBtn = document.querySelector('.modal__file-btn'),
    modalImageAdd = document.querySelector('.modal__image-add'),
    modalImageItem = document.querySelector('.modal__image-item'),
    modalHeaderItem = document.querySelector('.modal__header-item'),
    modalStatusItem = document.querySelector('.modal__status-item'),
    modalDescriptionItem = document.querySelector('.modal__description-item'),
    modalCostItem = document.querySelector('.modal__cost-item'),
    searchInput = document.querySelector('.search__input'),
    menuContainer = document.querySelector('.menu__container'),
    priceFilterInputMin = document.querySelector('.price-filter__input-min'),
    priceFilterInputMax = document.querySelector('.price-filter__input-max'),
    priceFilterRange = document.querySelector('.price-filter__range'),
    priceFilterSliderMin = document.querySelector('.price-filter__slider-min'),
    priceFilterSliderMax = document.querySelector('.price-filter__slider-max'),
    priceFilterBtnReset = document.querySelector('.price-filter__btn-reset');

const textFileBtn = modalFileBtn.textContent;
const srcModalImage = modalImageAdd.src;

const elementsModalSubmit = [...modalSubmit.elements].filter(elem => elem.tagName !== 'BUTTON' && elem.type !== 'submit');

const infoPhoto = {};

const saveDB = () => localStorage.setItem('awito', JSON.stringify(dataBase));

const checkForm = () => {
    const validForm = elementsModalSubmit.every(elem => elem.value);
    modalBtnSubmit.disabled = !validForm;
    modalBtnWarning.style.display = validForm ? 'none' : '';
}

const closeModal = event => {
    const target = event.target;
    if (target.closest('.modal__close') || target.classList.contains('modal') || event.code === 'Escape') {
        modalAdd.classList.add('hide');
        modalItem.classList.add('hide');
        document.removeEventListener('keydown', closeModal);
        modalSubmit.reset();
        modalImageAdd.src = srcModalImage;
        modalFileBtn.textContent = textFileBtn;
        checkForm();
    }
};

const renderCard = (DB = dataBase) => {
    catalog.textContent = '';
    DB.forEach(item => {
        catalog.insertAdjacentHTML('beforeend', `
            <li class="card" data-id="${item.id}">
                <img class="card__image" src="data:image/${!item.imageExt || item.imageExt === 'jpg' ? 'jpeg' : item.imageExt};base64,${item.image}" alt="test">
                <div class="card__description">
                    <h3 class="card__header">${item.nameItem}</h3>
                    <div class="card__price">${item.costItem} ₽</div>
                </div>
            </li>
        `);
    });
};

const renderCategories = () => {
    const categories = new Set();
    dataBase.forEach(elem => categories.add(elem.category));
    menuContainer.textContent = '';
    [...categories].forEach(item => {
        menuContainer.insertAdjacentHTML('beforeend', `
            <li class="menu__link">
                <a href="#" data-category="${item}">${item[0].toUpperCase() + item.substring(1).toLowerCase()}</a>
            </li>
        `);
    });
};

const deleteCard = card => {
    const id = +card.dataset.id;
    for (let i = 0; i < dataBase.length; i++) {
        const item = dataBase[i];
        if (item.id === id) {
            dataBase.splice(i, 1);
            i--;
        } else if (item.id > id) {
            item.id--;
        }
    }
    counter--;
    saveDB();
    renderCategories();
    renderCard();
}

const getMaxPrice = () => {
    let max = 0;
    dataBase.forEach(item => +item.costItem > max ? max = +item.costItem : '');
    return max;
}

const filter = () => {
    const valueSearch = searchInput.value.trim().toLowerCase();
    const valuePriceMax = priceFilterInputMax.value;
    const valuePriceMin = priceFilterInputMin.value;
    const category = document.querySelector('.menu__link.active')?.firstElementChild.dataset.category;

    if (valueSearch.length > 2) {
        const result = dataBase.filter(item => 
            (item.nameItem.toLowerCase().includes(valueSearch) ||
            item.descriptionItem.toLowerCase().includes(valueSearch)) &&
            +item.costItem >= valuePriceMin &&
            +item.costItem <= valuePriceMax &&
            (category ? item.category === category : true));
        renderCard(result);
    } else {
        const result = dataBase.filter(
            item => +item.costItem >= valuePriceMin && 
            +item.costItem <= valuePriceMax &&
            (category ? item.category === category : true));
        renderCard(result);
    }
};

searchInput.addEventListener('input', filter);
priceFilterInputMax.addEventListener('input', filter);
priceFilterInputMin.addEventListener('input', filter);

priceFilterBtnReset.addEventListener('click', event => {
    event.preventDefault();
    priceFilterInputMin.value = 0;
    priceFilterInputMax.value = getMaxPrice();
    filter();
});

modalFileInput.addEventListener('change', event => {
    const target = event.target;
    const reader = new FileReader();
    const file = target.files[0];

    infoPhoto.filename = file.name;
    infoPhoto.fileExt = infoPhoto.filename.substring(infoPhoto.filename.lastIndexOf('.') + 1);
    infoPhoto.size = file.size;

    reader.readAsBinaryString(file);

    reader.addEventListener('load', event => {
        if (infoPhoto.size < 200000) {
            modalFileBtn.textContent = infoPhoto.filename;
            infoPhoto.base64 = btoa(event.target.result);
            modalImageAdd.src = `data:image/${infoPhoto.fileExt === 'jpg' ? 'jpeg' : infoPhoto.fileExt};base64,${infoPhoto.base64}`;
        } else {
            modalFileBtn.textContent = 'файл не должен превышать 200кб';
            modalFileInput.value = '';
            checkForm();
        }
    });
});

modalSubmit.addEventListener('input', checkForm);

modalSubmit.addEventListener('submit', event => {
    event.preventDefault();
    const itemObj = {};
    for (const elem of elementsModalSubmit) {
        itemObj[elem.name] = elem.name === 'category' ? elem.value.trim().toLowerCase() : elem.value.trim();
    }
    itemObj.id = counter++;
    itemObj.image = infoPhoto.base64;
    itemObj.imageExt = infoPhoto.fileExt;
    dataBase.push(itemObj);
    closeModal({
        target: modalAdd
    });
    saveDB();
    priceFilterInputMax.value = getMaxPrice();
    renderCategories();
    renderCard();
});

addAd.addEventListener('click', () => {
    modalAdd.classList.remove('hide');
    modalBtnSubmit.disabled = true;
    document.addEventListener('keydown', closeModal);
});

catalog.addEventListener('click', event => {
    const target = event.target;
    const card = target.closest('.card');

    if (card) {
        const item = dataBase.find(obj => obj.id === parseInt(card.dataset.id));

        modalItem.dataset.id = item.id;
        modalImageItem.src = `data:image/${!item.imageExt || item.imageExt === 'jpg' ? 'jpeg' : item.imageExt};base64,${item.image}`;
        modalHeaderItem.textContent = item.nameItem;
        modalStatusItem.textContent = item.status === 'new' ? 'Новый' : 'Б/у';
        modalDescriptionItem.textContent = item.descriptionItem;
        modalCostItem.textContent = item.costItem + ' ₽';
        modalItem.classList.remove('hide');
        document.addEventListener('keydown', closeModal);
    }
});

menuContainer.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName === 'A') {
        document.querySelectorAll('.menu__link').forEach(item => item !== target.closest('.menu__link') ? item.classList.remove('active') : item.classList.toggle('active'));
        filter();
    }
});

modalItemBuy.addEventListener('click', event => {
    const card = event.target.closest('.modal__item');
    deleteCard(card);
    closeModal({target: modalItem});
});

modalAdd.addEventListener('click', closeModal);
modalItem.addEventListener('click', closeModal);

renderCard();
renderCategories();

priceFilterInputMax.value = getMaxPrice();