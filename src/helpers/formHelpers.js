//import { each } from 'lodash'

const { Object } = window;
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

export function setForm( form ) {
    if (!window.localStorage) return
    Object.keys(form).map((k) => {
        var v = form[k];
        window.localStorage.setItem(k, v);
    });
    return form
}

export function getForm( form ) {
    if ((form.name && form.phone) || !window.localStorage) return form;
    Object.keys(form).map((k) => {
        var v = form[k];
        form[k] = window.localStorage.getItem(k);
    })
    return form;
}

export function getFormErrors(formData) {
    var errors = [];
    if (!formData.name) errors.push('Не заполнено имя');
    if (!formData.phone) errors.push('Не заполнен телефон');
    if (!formData.selltype) errors.push('Не задан тип продажи');
    if (!formData.cost) errors.push('Не задано цена');
    if (!formData.offer) errors.push('Не задан оффер');
    if (!formData.title) errors.push('Не задан название товара');
    return errors;
}