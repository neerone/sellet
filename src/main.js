import App from './App.svelte';

let wrapper = document.createElement('div');
wrapper.id = 'sellet-wrapper';
document.body.append(wrapper);


var app = new App({
	target: document.getElementById('sellet-wrapper')
});

export default app;