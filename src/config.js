const isLocalhost = window.location.origin.includes('localhost')
const isLaravel = window.location.origin.includes('shopengine.test')
const redirectDelay = 1000;
const localStoragePrefix = '_sellet_'


let HOST = 'https://sellet.ru'
if (isLocalhost || isLaravel)  HOST = 'http://shopengine.test'


let WIDGET_STYLE_PATH = 'https://sellet.ru/widget/sellet_widget.css'

if (isLocalhost)  WIDGET_STYLE_PATH = '/sellet_widget.css'
if (isLaravel)  WIDGET_STYLE_PATH = '/widget/sellet_widget.css'

export {
    HOST, WIDGET_STYLE_PATH, redirectDelay, localStoragePrefix
}