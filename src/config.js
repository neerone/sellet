const isDev = window.location.origin.includes('localhost')
export const HOST = isDev ? 'https://sellet.ru' : 'https://sellet.ru';
export const WIDGET_STYLE_PATH = isDev ? '/sellet_widget.css' : 'https://sellet.ru/widget/sellet_widget.css';