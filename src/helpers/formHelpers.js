import { getKeys } from './helpers'
import { localStoragePrefix } from '../config.js'

export var cart = [];
export function formToJSON( form ) {
	var obj = {};
	var elements = form.querySelectorAll( "input, select, textarea" );
	for( var i = 0; i < elements.length; ++i ) {
		var element = elements[i];
		var name = element.name;
		var value = element.value;

		if( name ) {
			obj[ name ] = value;
		}
	}
	return obj
}

export function formFromDataAttributes(buttonNode) {
    var attrs = buttonNode.attributes;
	var obj = {};

    for(var i = attrs.length - 1; i >= 0; i--) {
        let attrName = attrs[i].name

        if (attrName.includes('data-')) {
            obj[attrName.replace('data-', '')] = attrs[i].value
        }
    }
    return obj
}

export function setForm( form ) {
    if (!window.localStorage) return
    getKeys(form).map((k) => {
        var v = form[k];
        window.localStorage.setItem(localStoragePrefix + k, v);

    });
    cart.push(window.localStorage._sellet_title)
    console.log(cart)
    return form
}

export function getForm( form ) {
    if (!window.localStorage) return form;
    getKeys(form).map((k) => {
        var v = form[k];
        form[k] = window.localStorage.getItem(localStoragePrefix + k);

    })
    return form;
}

export function makeFormData(form) {
    var formData = new FormData();
    if (!window.localStorage) return
    getKeys(form).map((k) => {
        var v = form[k];
        formData.append(k, v);
    });
    return formData
}

function getPhoneError(phone) {
    if (!phone || phone.length === 0) return 'Телефон обязателен к заполнению';
    if (phone.length <= 3) return 'Неверно заполнен телефон';
    const digits = phone.match(/\d/g)
    if (!digits || !digits.length) return 'Неверный формат телефона'
    if (digits.length <= 9) return 'Неверный формат телефона'
    if (digits.length > 12) return 'Неверный формат телефона'
}

function getNameError(name) {
    if (!name || name.length === 0) return 'Не заполнено имя'
    if (name.length < 2) return 'Некорректно заполнено имя'
    const digits = name.match(/\d/g)
    if (digits && digits.length) return 'Имя не должно содержать цифр'
}

export function getFormErrors(formData) {
    var errors = {};
    if (!formData.selltype) console.warn('Не задан тип продажи');
    if (!formData.cost) console.warn('Не задано цена');
    if (!formData.offer) console.warn('Не задан оффер');
    if (!formData.title) console.warn('Не задан название товара');

    const phoneError = getPhoneError(formData.phone);
    if (phoneError) errors.phone  = phoneError;

    const nameError = getNameError(formData.name);
    if (nameError) errors.name  = nameError;

    if (!formData.agree) errors.agree = 'Требуется согласие';
    return errors;
}

