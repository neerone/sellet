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

export function getFormErrors(formData) {
    var errors = [];
    if (!formData.name) errors.push('Не заполнено имя');
    if (!formData.phone) errors.push('Не заполнен телефон');
    if (!formData.selltype) errors.push('Не задан тип продажи "<input type="hidden" name="sell_type" value="sell"/>"');
    if (!formData.cost) errors.push('Не задано цена  "<input type="hidden" name="title" value="Название товара"/>"');
    if (!formData.offer) errors.push('Не задан оффер "<input type="hidden" name="offer" value="Offer_Name"/>"');
    if (!formData.title) errors.push('Не задан название товара "<input type="hidden" name="cost" value="цена"/>"');
    return errors;
}