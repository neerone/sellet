
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    const isDev = window.location.origin.includes('localhost');
    const HOST = isDev ? 'https://sellet.ru' : 'https://sellet.ru';
    const WIDGET_STYLE_PATH = isDev ? '/sellet_widget.css' : 'https://sellet.ru/widget/sellet_widget.css';

    function reachGoals(goalName) {
        if (!window.Object.keys) return
        var metrika = null;
        getKeys(window).map(windowProperty => {
            if (windowProperty && windowProperty.indexOf('yaCounter') >= 0) {metrika = window[windowProperty];}
        });
        if (!metrika) return
        metrika.reachGoal(goalName);
    }


    function getKeys(obj) {
        if (!window.Object || !window.Object.keys) return []
        return window.Object.keys(obj)
    }

    function formToJSON( form ) {
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

    function formFromDataAttributes(buttonNode) {
        var attrs = buttonNode.attributes;
    	var obj = {};

        for(var i = attrs.length - 1; i >= 0; i--) {
            let attrName = attrs[i].name;

            if (attrName.includes('data-')) {
                obj[attrName.replace('data-', '')] = attrs[i].value;
            }
        }
        return obj
    }

    function setForm( form ) {
        if (!window.localStorage) return
        getKeys(form).map((k) => {
            var v = form[k];
            window.localStorage.setItem(k, v);
        });
        return form
    }

    function makeFormData(form) {
        var formData = new FormData();
        if (!window.localStorage) return
        getKeys(form).map((k) => {
            var v = form[k];
            formData.append(k, v);
        });
        return formData
    }

    function getForm( form ) {
        if (!window.localStorage) return form;
        getKeys(form).map((k) => {
            var v = form[k];
            form[k] = window.localStorage.getItem(k);
        });
        return form;
    }

    function getPhoneError(phone) {
        if (!phone || phone.length === 0) return 'Телефон обязателен к заполнению';
        if (phone.length <= 3) return 'Неверно заполнен телефон';
        const digits = phone.match(/\d/g);
        if (!digits || !digits.length) return 'Неверный формат телефона'
        if (digits.length <= 9) return 'Неверный формат телефона'
        if (digits.length > 12) return 'Неверный формат телефона'
    }

    function getNameError(name) {
        if (!name || name.length === 0) return 'Не заполнено имя'
        if (name.length < 2) return 'Некорректно заполнено имя'
        const digits = name.match(/\d/g);
        if (digits && digits.length) return 'Имя не должно содержать цифр'
    }

    function getFormErrors(formData) {
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

    /* src\components\Loader.svelte generated by Svelte v3.12.1 */

    const file = "src\\components\\Loader.svelte";

    function create_fragment(ctx) {
    	var div5, div4, div0, div1, div2, div3;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			div1 = element("div");
    			div2 = element("div");
    			div3 = element("div");
    			attr_dev(div0, "class", "svelte-anuude");
    			add_location(div0, file, 47, 26, 1036);
    			attr_dev(div1, "class", "svelte-anuude");
    			add_location(div1, file, 47, 37, 1047);
    			attr_dev(div2, "class", "svelte-anuude");
    			add_location(div2, file, 47, 48, 1058);
    			attr_dev(div3, "class", "svelte-anuude");
    			add_location(div3, file, 47, 59, 1069);
    			attr_dev(div4, "class", "lds-ring svelte-anuude");
    			add_location(div4, file, 47, 4, 1014);
    			attr_dev(div5, "class", "sellet-preloader-wrapper svelte-anuude");
    			add_location(div5, file, 46, 0, 970);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div4, div1);
    			append_dev(div4, div2);
    			append_dev(div4, div3);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div5);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Loader", options, id: create_fragment.name });
    	}
    }

    function cubicOut(t) {
      var f = t - 1.0;
      return f * f * f + 1.0
    }

    function fade ( node, ref ) {
    	var delay = ref.delay; if ( delay === void 0 ) delay = 0;
    	var duration = ref.duration; if ( duration === void 0 ) duration = 400;

    	var o = +getComputedStyle( node ).opacity;

    	return {
    		delay: delay,
    		duration: duration,
    		css: function (t) { return ("opacity: " + (t * o)); }
    	};
    }

    function fly(node, ref) {
    	var delay = ref.delay; if ( delay === void 0 ) delay = 0;
    	var duration = ref.duration; if ( duration === void 0 ) duration = 400;
    	var easing = ref.easing; if ( easing === void 0 ) easing = cubicOut;
    	var x = ref.x; if ( x === void 0 ) x = 0;
    	var y = ref.y; if ( y === void 0 ) y = 0;

    	var style = getComputedStyle(node);
    	var opacity = +style.opacity;
    	var transform = style.transform === 'none' ? '' : style.transform;

    	return {
    		delay: delay,
    		duration: duration,
    		easing: easing,
    		css: function (t) { return ("\n\t\t\ttransform: " + transform + " translate(" + ((1 - t) * x) + "px, " + ((1 - t) * y) + "px);\n\t\t\topacity: " + (t * opacity)); }
    	};
    }

    /* src\components\Modal.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\components\\Modal.svelte";

    function create_fragment$1(ctx) {
    	var div5, div4, div3, div0, t1, div1, t2, t3, div2, div3_transition, div5_transition, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "×";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(ctx.header);
    			t3 = space();
    			div2 = element("div");

    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "sellet-modal-close svelte-1khay3i");
    			add_location(div0, file$1, 63, 12, 1610);
    			attr_dev(div1, "class", "sellet-modal-header svelte-1khay3i");
    			add_location(div1, file$1, 64, 12, 1682);

    			attr_dev(div2, "class", "sellet-modal-content svelte-1khay3i");
    			add_location(div2, file$1, 65, 12, 1743);
    			attr_dev(div3, "class", "sellet-modal-inner-wrapper svelte-1khay3i");
    			add_location(div3, file$1, 62, 8, 1511);
    			attr_dev(div4, "class", "sellet-modal-prewrapper svelte-1khay3i");
    			add_location(div4, file$1, 61, 4, 1464);
    			attr_dev(div5, "class", "sellet-modal-wrapper svelte-1khay3i");
    			add_location(div5, file$1, 60, 0, 1386);
    			dispose = listen_dev(div0, "click", ctx.onClose);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div2_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			if (default_slot) {
    				default_slot.m(div2, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!current || changed.header) {
    				set_data_dev(t2, ctx.header);
    			}

    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { y: 200, duration: 300 }, true);
    				div3_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div5_transition) div5_transition = create_bidirectional_transition(div5, fade, { duration: 300 }, true);
    				div5_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);

    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fly, { y: 200, duration: 300 }, false);
    			div3_transition.run(0);

    			if (!div5_transition) div5_transition = create_bidirectional_transition(div5, fade, { duration: 300 }, false);
    			div5_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div5);
    			}

    			if (default_slot) default_slot.d(detaching);

    			if (detaching) {
    				if (div3_transition) div3_transition.end();
    				if (div5_transition) div5_transition.end();
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { header, onClose } = $$props;

    	const writable_props = ['header', 'onClose'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('header' in $$props) $$invalidate('header', header = $$props.header);
    		if ('onClose' in $$props) $$invalidate('onClose', onClose = $$props.onClose);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { header, onClose };
    	};

    	$$self.$inject_state = $$props => {
    		if ('header' in $$props) $$invalidate('header', header = $$props.header);
    		if ('onClose' in $$props) $$invalidate('onClose', onClose = $$props.onClose);
    	};

    	return { header, onClose, $$slots, $$scope };
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$1, safe_not_equal, ["header", "onClose"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Modal", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.header === undefined && !('header' in props)) {
    			console.warn("<Modal> was created without expected prop 'header'");
    		}
    		if (ctx.onClose === undefined && !('onClose' in props)) {
    			console.warn("<Modal> was created without expected prop 'onClose'");
    		}
    	}

    	get header() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClose() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClose(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\icons\Checkmark.svelte generated by Svelte v3.12.1 */

    const file$2 = "src\\components\\icons\\Checkmark.svelte";

    function create_fragment$2(ctx) {
    	var svg, line0, line1;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			line0 = svg_element("line");
    			line1 = svg_element("line");
    			attr_dev(line0, "x1", "0.609711");
    			attr_dev(line0, "y1", "9.06452");
    			attr_dev(line0, "x2", "9.89543");
    			attr_dev(line0, "y2", "16.2074");
    			attr_dev(line0, "stroke", "#00862E");
    			attr_dev(line0, "stroke-width", "2");
    			add_location(line0, file$2, 1, 4, 101);
    			attr_dev(line1, "x1", "8.56158");
    			attr_dev(line1, "y1", "16.3103");
    			attr_dev(line1, "x2", "22.8473");
    			attr_dev(line1, "y2", "1.31035");
    			attr_dev(line1, "stroke", "#00862E");
    			attr_dev(line1, "stroke-width", "2");
    			add_location(line1, file$2, 2, 4, 201);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "17");
    			attr_dev(svg, "viewBox", "0 0 24 17");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			add_location(svg, file$2, 0, 0, 0);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, line0);
    			append_dev(svg, line1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(svg);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    class Checkmark extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Checkmark", options, id: create_fragment$2.name });
    	}
    }

    /* src\components\Refill.svelte generated by Svelte v3.12.1 */

    const file$3 = "src\\components\\Refill.svelte";

    function create_fragment$3(ctx) {
    	var div5, div4, div0, label0, t1, input0, t2, span0, t3_value = ctx.errors.name ? ctx.errors.name : '' + "", t3, t4, div1, label1, t6, input1, t7, span1, t8_value = ctx.errors.phone ? ctx.errors.phone : '' + "", t8, t9, div2, label2, input2, t10, a0, t12, a1, t14, span2, t15_value = ctx.errors.agree ? ctx.errors.agree : '' + "", t15, t16, div3, button, t17, button_disabled_value, current, dispose;

    	var checkmark = new Checkmark({ $$inline: true });

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Имя *";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			span0 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Телефон *";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			span1 = element("span");
    			t8 = text(t8_value);
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			input2 = element("input");
    			t10 = text("\r\n                Я согласен на обработку ");
    			a0 = element("a");
    			a0.textContent = "персональных данных";
    			t12 = text(" и ознакомлен с ");
    			a1 = element("a");
    			a1.textContent = "политикой конфиденциальности";
    			t14 = space();
    			span2 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			div3 = element("div");
    			button = element("button");
    			checkmark.$$.fragment.c();
    			t17 = text("\r\n                Оставить заявку");
    			attr_dev(label0, "class", "svelte-form-label svelte-1mgi63m");
    			add_location(label0, file$3, 69, 12, 1590);
    			attr_dev(input0, "class", "svelte-form-input svelte-1mgi63m");
    			attr_dev(input0, "name", "name");
    			toggle_class(input0, "error", !!ctx.errors.name);
    			add_location(input0, file$3, 70, 12, 1650);
    			attr_dev(span0, "class", "svelte-form-message svelte-1mgi63m");
    			add_location(span0, file$3, 71, 12, 1762);
    			attr_dev(div0, "class", "svelte-form-input-group svelte-1mgi63m");
    			add_location(div0, file$3, 68, 8, 1539);
    			attr_dev(label1, "class", "svelte-form-label svelte-1mgi63m");
    			add_location(label1, file$3, 74, 12, 1912);
    			attr_dev(input1, "class", "svelte-form-input svelte-1mgi63m");
    			attr_dev(input1, "name", "phone");
    			toggle_class(input1, "error", !!ctx.errors.phone);
    			add_location(input1, file$3, 75, 12, 1976);
    			attr_dev(span1, "class", "svelte-form-message svelte-1mgi63m");
    			add_location(span1, file$3, 76, 12, 2091);
    			attr_dev(div1, "class", "svelte-form-input-group svelte-1mgi63m");
    			add_location(div1, file$3, 73, 8, 1861);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-form-input svelte-1mgi63m");
    			attr_dev(input2, "name", "phone");
    			toggle_class(input2, "error", !!ctx.errors.phone);
    			add_location(input2, file$3, 80, 16, 2294);
    			attr_dev(a0, "class", "link svelte-1mgi63m");
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$3, 81, 40, 2455);
    			attr_dev(a1, "class", "link svelte-1mgi63m");
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$3, 81, 120, 2535);
    			attr_dev(label2, "class", "svelte-form-label svelte-1mgi63m");
    			add_location(label2, file$3, 79, 12, 2243);
    			attr_dev(span2, "class", "svelte-form-message svelte-1mgi63m");
    			add_location(span2, file$3, 84, 12, 2646);
    			attr_dev(div2, "class", "svelte-form-input-group svelte-1mgi63m");
    			add_location(div2, file$3, 78, 8, 2192);
    			attr_dev(button, "class", "svelte-form-submit svelte-1mgi63m");
    			button.disabled = button_disabled_value = getKeys(ctx.errors).length;
    			attr_dev(button, "type", "submit");
    			add_location(button, file$3, 87, 12, 2798);
    			attr_dev(div3, "class", "svelte-form-input-group svelte-1mgi63m");
    			add_location(div3, file$3, 86, 8, 2747);
    			attr_dev(div4, "class", "sellet-refill-form svelte-1mgi63m");
    			add_location(div4, file$3, 67, 4, 1497);
    			attr_dev(div5, "class", "sellet-refill-form svelte-1mgi63m");
    			add_location(div5, file$3, 66, 0, 1459);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(input2, "change", ctx.input2_change_handler),
    				listen_dev(button, "click", ctx.onRefill)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);

    			set_input_value(input0, ctx.form.name);

    			append_dev(div0, t2);
    			append_dev(div0, span0);
    			append_dev(span0, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);

    			set_input_value(input1, ctx.form.phone);

    			append_dev(div1, t7);
    			append_dev(div1, span1);
    			append_dev(span1, t8);
    			append_dev(div4, t9);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(label2, input2);

    			input2.checked = ctx.form.agree;

    			append_dev(label2, t10);
    			append_dev(label2, a0);
    			append_dev(label2, t12);
    			append_dev(label2, a1);
    			append_dev(div2, t14);
    			append_dev(div2, span2);
    			append_dev(span2, t15);
    			append_dev(div4, t16);
    			append_dev(div4, div3);
    			append_dev(div3, button);
    			mount_component(checkmark, button, null);
    			append_dev(button, t17);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.form && (input0.value !== ctx.form.name)) set_input_value(input0, ctx.form.name);

    			if (changed.errors) {
    				toggle_class(input0, "error", !!ctx.errors.name);
    			}

    			if ((!current || changed.errors) && t3_value !== (t3_value = ctx.errors.name ? ctx.errors.name : '' + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if (changed.form && (input1.value !== ctx.form.phone)) set_input_value(input1, ctx.form.phone);

    			if (changed.errors) {
    				toggle_class(input1, "error", !!ctx.errors.phone);
    			}

    			if ((!current || changed.errors) && t8_value !== (t8_value = ctx.errors.phone ? ctx.errors.phone : '' + "")) {
    				set_data_dev(t8, t8_value);
    			}

    			if (changed.form) input2.checked = ctx.form.agree;

    			if (changed.errors) {
    				toggle_class(input2, "error", !!ctx.errors.phone);
    			}

    			if ((!current || changed.errors) && t15_value !== (t15_value = ctx.errors.agree ? ctx.errors.agree : '' + "")) {
    				set_data_dev(t15, t15_value);
    			}

    			if ((!current || changed.errors) && button_disabled_value !== (button_disabled_value = getKeys(ctx.errors).length)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkmark.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(checkmark.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div5);
    			}

    			destroy_component(checkmark);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

        let { form, errors, onRefill } = $$props;

    	const writable_props = ['form', 'errors', 'onRefill'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Refill> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		form.name = this.value;
    		$$invalidate('form', form);
    	}

    	function input1_input_handler() {
    		form.phone = this.value;
    		$$invalidate('form', form);
    	}

    	function input2_change_handler() {
    		form.agree = this.checked;
    		$$invalidate('form', form);
    	}

    	$$self.$set = $$props => {
    		if ('form' in $$props) $$invalidate('form', form = $$props.form);
    		if ('errors' in $$props) $$invalidate('errors', errors = $$props.errors);
    		if ('onRefill' in $$props) $$invalidate('onRefill', onRefill = $$props.onRefill);
    	};

    	$$self.$capture_state = () => {
    		return { form, errors, onRefill };
    	};

    	$$self.$inject_state = $$props => {
    		if ('form' in $$props) $$invalidate('form', form = $$props.form);
    		if ('errors' in $$props) $$invalidate('errors', errors = $$props.errors);
    		if ('onRefill' in $$props) $$invalidate('onRefill', onRefill = $$props.onRefill);
    	};

    	$$self.$$.update = ($$dirty = { form: 1 }) => {
    		if ($$dirty.form) { {
                    $$invalidate('errors', errors = getFormErrors(form));
                } }
    	};

    	return {
    		form,
    		errors,
    		onRefill,
    		input0_input_handler,
    		input1_input_handler,
    		input2_change_handler
    	};
    }

    class Refill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$3, safe_not_equal, ["form", "errors", "onRefill"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Refill", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.form === undefined && !('form' in props)) {
    			console.warn("<Refill> was created without expected prop 'form'");
    		}
    		if (ctx.errors === undefined && !('errors' in props)) {
    			console.warn("<Refill> was created without expected prop 'errors'");
    		}
    		if (ctx.onRefill === undefined && !('onRefill' in props)) {
    			console.warn("<Refill> was created without expected prop 'onRefill'");
    		}
    	}

    	get form() {
    		throw new Error("<Refill>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set form(value) {
    		throw new Error("<Refill>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errors() {
    		throw new Error("<Refill>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<Refill>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onRefill() {
    		throw new Error("<Refill>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onRefill(value) {
    		throw new Error("<Refill>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\ErrorsRender.svelte generated by Svelte v3.12.1 */

    const file$4 = "src\\components\\ErrorsRender.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.error = list[i];
    	return child_ctx;
    }

    // (12:0) {#each errors as error}
    function create_each_block(ctx) {
    	var div, t_value = ctx.error + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "sellet-error-message svelte-x2zx6f");
    			add_location(div, file$4, 12, 4, 151);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.errors) && t_value !== (t_value = ctx.error + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(12:0) {#each errors as error}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var each_1_anchor;

    	let each_value = ctx.errors;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.errors) {
    				each_value = ctx.errors;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { errors } = $$props;

    	const writable_props = ['errors'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<ErrorsRender> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('errors' in $$props) $$invalidate('errors', errors = $$props.errors);
    	};

    	$$self.$capture_state = () => {
    		return { errors };
    	};

    	$$self.$inject_state = $$props => {
    		if ('errors' in $$props) $$invalidate('errors', errors = $$props.errors);
    	};

    	return { errors };
    }

    class ErrorsRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$4, safe_not_equal, ["errors"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ErrorsRender", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.errors === undefined && !('errors' in props)) {
    			console.warn("<ErrorsRender> was created without expected prop 'errors'");
    		}
    	}

    	get errors() {
    		throw new Error("<ErrorsRender>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<ErrorsRender>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Thanks.svelte generated by Svelte v3.12.1 */

    function create_fragment$5(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = text("Наш менеджер свяжется с вами в ближашее время!");
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class Thanks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Thanks", options, id: create_fragment$5.name });
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    // (68:0) {#if state === 'refill' && getKeys(errors).length}
    function create_if_block_3(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		header: "Форма заявки",
    		onClose: ctx.handleCloseModal,
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var modal_changes = {};
    			if (changed.$$scope || changed.form || changed.errors) modal_changes.$$scope = { changed, ctx };
    			modal.$set(modal_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(68:0) {#if state === 'refill' && getKeys(errors).length}", ctx });
    	return block;
    }

    // (69:4) <Modal header="Форма заявки" onClose={handleCloseModal}>
    function create_default_slot_3(ctx) {
    	var current;

    	var refill = new Refill({
    		props: {
    		onRefill: ctx.onRefill,
    		form: ctx.form,
    		errors: ctx.errors
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			refill.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(refill, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var refill_changes = {};
    			if (changed.form) refill_changes.form = ctx.form;
    			if (changed.errors) refill_changes.errors = ctx.errors;
    			refill.$set(refill_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(refill.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(refill.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(refill, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(69:4) <Modal header=\"Форма заявки\" onClose={handleCloseModal}>", ctx });
    	return block;
    }

    // (74:0) {#if state === 'errors' && errors.length}
    function create_if_block_2(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		header: "Ошибка!",
    		onClose: ctx.handleCloseModal,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var modal_changes = {};
    			if (changed.$$scope || changed.errors) modal_changes.$$scope = { changed, ctx };
    			modal.$set(modal_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(74:0) {#if state === 'errors' && errors.length}", ctx });
    	return block;
    }

    // (75:4) <Modal header="Ошибка!" onClose={handleCloseModal}>
    function create_default_slot_2(ctx) {
    	var current;

    	var errorsrender = new ErrorsRender({
    		props: { errors: ctx.errors },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			errorsrender.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(errorsrender, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var errorsrender_changes = {};
    			if (changed.errors) errorsrender_changes.errors = ctx.errors;
    			errorsrender.$set(errorsrender_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(errorsrender.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(errorsrender.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(errorsrender, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(75:4) <Modal header=\"Ошибка!\" onClose={handleCloseModal}>", ctx });
    	return block;
    }

    // (80:0) {#if state === 'loading'}
    function create_if_block_1(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		header: "Подождите",
    		onClose: ctx.handleCloseModal,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var modal_changes = {};
    			if (changed.$$scope) modal_changes.$$scope = { changed, ctx };
    			modal.$set(modal_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(80:0) {#if state === 'loading'}", ctx });
    	return block;
    }

    // (81:4) <Modal header="Подождите" onClose={handleCloseModal}>
    function create_default_slot_1(ctx) {
    	var current;

    	var loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			loader.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(81:4) <Modal header=\"Подождите\" onClose={handleCloseModal}>", ctx });
    	return block;
    }

    // (86:0) {#if state === 'thanks'}
    function create_if_block(ctx) {
    	var current;

    	var modal = new Modal({
    		props: {
    		header: "Спасибо за заказ",
    		onClose: ctx.handleCloseModal,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			modal.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var modal_changes = {};
    			if (changed.$$scope) modal_changes.$$scope = { changed, ctx };
    			modal.$set(modal_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(86:0) {#if state === 'thanks'}", ctx });
    	return block;
    }

    // (87:4) <Modal header="Спасибо за заказ" onClose={handleCloseModal}>
    function create_default_slot(ctx) {
    	var current;

    	var thanks = new Thanks({ $$inline: true });

    	const block = {
    		c: function create() {
    			thanks.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(thanks, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(thanks.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(thanks.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(thanks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(87:4) <Modal header=\"Спасибо за заказ\" onClose={handleCloseModal}>", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var show_if = ctx.state === 'refill' && getKeys(ctx.errors).length, t0, t1, t2, if_block3_anchor, current;

    	var if_block0 = (show_if) && create_if_block_3(ctx);

    	var if_block1 = (ctx.state === 'errors' && ctx.errors.length) && create_if_block_2(ctx);

    	var if_block2 = (ctx.state === 'loading') && create_if_block_1(ctx);

    	var if_block3 = (ctx.state === 'thanks') && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();
    			if (if_block3) if_block3.c();
    			if_block3_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, if_block3_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.state || changed.errors) show_if = ctx.state === 'refill' && getKeys(ctx.errors).length;

    			if (show_if) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();
    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});
    				check_outros();
    			}

    			if (ctx.state === 'errors' && ctx.errors.length) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}

    			if (ctx.state === 'loading') {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    					transition_in(if_block2, 1);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();
    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});
    				check_outros();
    			}

    			if (ctx.state === 'thanks') {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			if (if_block1) if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			if (if_block2) if_block2.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			if (if_block3) if_block3.d(detaching);

    			if (detaching) {
    				detach_dev(if_block3_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

        let color;
        let state = null;
        let errors = {};

        let form = {
            name: '',
            phone: '',
            selltype: '',
            cost: '',
            offer: '',
            title: '',
            agree: false
        };

        document.addEventListener('submit', function (event) {
            if (!event.target.tagName.toLowerCase() === 'form') return;
            event.preventDefault();
            event.stopPropagation();
            $$invalidate('form', form = formToJSON(this));
            handleLandingFormSubmit(setForm(form));
        }, false);

        document.addEventListener('click', function (event) {
            if (!event.target.classList.contains('sellet-buy-button')) return;
            event.preventDefault();
            event.stopPropagation();
            $$invalidate('form', form = Object.assign({}, form, formFromDataAttributes(event.target)));
            setForm(form);
            handleLandingFormSubmit(getForm(form));
        }, false);

        async function handleLandingFormSubmit(form)  {
            const validationErrors = getFormErrors(form);
            if (getKeys(validationErrors).length) {
                $$invalidate('state', state = 'refill');
                $$invalidate('errors', errors = validationErrors);
                return
            }
            $$invalidate('state', state = 'loading');
            reachGoals('sell-success');
            const res = await fetch(`${HOST}/order.php`, {
                method: 'POST',
                body: makeFormData(form)
            });
            $$invalidate('state', state = 'thanks');
        }

        function handleCloseModal () {
            $$invalidate('state', state = null);
        }

        function onRefill() {
            handleLandingFormSubmit(form);
        }

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) color = $$props.color;
    		if ('state' in $$props) $$invalidate('state', state = $$props.state);
    		if ('errors' in $$props) $$invalidate('errors', errors = $$props.errors);
    		if ('form' in $$props) $$invalidate('form', form = $$props.form);
    	};

    	return {
    		state,
    		errors,
    		form,
    		handleCloseModal,
    		onRefill
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$6.name });
    	}
    }

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

    return app;

}());
//# sourceMappingURL=sellet_widget.js.map
