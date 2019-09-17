import App from './App.svelte';
import { WIDGET_STYLE_PATH } from './config';
let wrapper = document.createElement('div');
wrapper.id = 'sellet-wrapper';
document.body.append(wrapper);


let style = document.createElement('link');
style.href = WIDGET_STYLE_PATH;
style.rel = 'stylesheet';
document.head.append(style);


var app = new App({
	target: document.getElementById('sellet-wrapper')
});

export default app;