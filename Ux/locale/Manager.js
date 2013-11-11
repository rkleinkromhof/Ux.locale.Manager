Ext.define('Ux.locale.Manager', {
	singleton: true,

	requires: [
		'Ext.ComponentQuery',
		'Ext.Ajax'
	],

	uses: [
		'Ext.data.Store'
	],

	_ajaxConfig: {},
	_beforeLoad: Ext.emptyFn,
	_language: navigator.language ? navigator.language.split('-')[0] : navigator.userLanguage.split('-')[0],
	_loaded: true,
	_loadingInd: true,
	_locale: {},
	_localeQuery: 'component[enableLocale]',

	/**
	 * @property {Object[]} _locales Available locales. Each locale contains an abbr and text property.
	 */
	_locales: [
		{ abbr: 'en', text: 'English' },
		{ abbr: 'fr', text: 'French' }
	],
	_tpl: '',
	_type: 'script',

	_decoder: function(options, success, response) {
		var text = response.responseText;

		return Ext.decode(text);
	},

	_callback: function() {
		this.applyLocales();
	},

	init: function(callback) {
		var me = this,
			type = me._type,
			lmCallback = me._callback,
			method = type === 'script' ? 'loadScriptTag' : 'loadAjaxRequest';

		if (typeof callback !== 'function') {
			callback = Ext.emptyFn;
		}

		callback = Ext.Function.createInterceptor(callback, lmCallback, me);

		me[method](callback);
	},

	loadAjaxRequest: function(callback) {
		var me = this;

		me._loaded = false;

		me._beforeLoad();

		var ajaxConfig = Ext.apply({}, me._ajaxConfig),
			path = me._tpl.replace('{locale}', me._language),
			decoder = me._decoder,
			params = ajaxConfig.params || {},
			json;

		params.language = me._language;

		Ext.apply(ajaxConfig, {
			params: params,
			url: path,
			callback: function(options, success, response) {
				json = decoder(options, success, response);
				me._locale = json;
				me._loaded = true;

				if (typeof callback === 'function') {
					Ext.Function.bind(callback, me, [me, options, success, response])();
				}
			}
		});

		Ext.Ajax.request(ajaxConfig);
	},

	loadScriptTag: function() {
		console.log('<script/> support coming');
	},

	setConfig: function(config) {
		Ext.Object.each(config, function(key, value) {
			this['_' + key] = value;
		}, this);

		return this;
	},

	/**
	 * Applies locales to the root component.
	 * @param {Ext.Component} (rootCmp) apply locales to this root component and its children only.
	 * Leave empty to use document as root.
	 */
	applyLocales: function(rootCmp) {
		var me = this,
			cmps = Ext.ComponentQuery.query(me._localeQuery, rootCmp),
			c = 0,
			cNum = cmps.length,
		/*Ext.Component*/cmp;

		if (rootCmp) {
			me.setLocale(rootCmp);
		}

		for (; c < cNum; c++) {
			cmp = cmps[c];

			me.setLocale(cmp);
		}
	},

	/**
	 * Localizes all specified locale properties and applies them to the component.
	 * @param {Ext.Component} cmp the component to localize.
	 * @param {Object} cmp.locales the component's locales.
	 */
	setLocale: function(cmp) {
		var locales = Ext.apply({}, cmp.locales);
		delete locales.applyOn; // this is not a property so we'll remove it from the list of locales we're about to set

		Ext.Object.each(locales, function(property, locale) {
			this.doSetLocale(property, locale, cmp);
		}, this);
	},

	/**
	 * Localizes the property value and sets it on the component.
	 * @param {String} property The property key.
	 * @param {String|Object} locale The locale path or locale object specifying a path and optionally a
	 * setter function.
	 * @param {String} locale.path The locale path.
	 * @param {String|Function} [locale.fn] The setter for the localized property value. This must be either the
	 * setter function itself or the function name as a string.
	 * @param {Ext.Component} cmp the component to set the localized value on.
	 */
	doSetLocale: function(property, locale, cmp) {
		var path = Ext.isObject(locale) ? locale.path : locale;
		var value = this.localize(path);

		Ux.util.Reflector.setValue({
			target: cmp,
			property: property,
			fn: locale.fn, // This can be a function, a string or undefined. Either way, the Reflector will sort it out
			value: value
		});
	},

	/**
	 * Localizes the value
	 * @param {String|Object} value the unlocalized value format.
	 * @param {String} value.defaultText default text to display if no locale is found.
	 * @param {String} value.key locale key.
	 * @return {String} localized value.
	 */
	localize: function(value) {
		var defaultText = '';

		if (Ext.isObject(value)) {
			defaultText = value.defaultText;
			value = value.key;
		}

		value = this.get(value, defaultText);

		return value;
	},

	isLoaded: function() {
		return this._loaded;
	},

	get: function(key, defaultText) {
		var me = this,
			locale = me._locale,
			plural = key.indexOf('p:') === 0,
			keys = (plural ? key.substr(2) : key).split('.'),
			k = 0,
			kNum = keys.length,
			res;

		if (!me.isLoaded()) {
			return defaultText;
		}

		for (; k < kNum; k++) {
			key = keys[k];

			if (locale) {
				locale = locale[key];
			}
		}

		res = locale || defaultText;

		if (plural) {
			return Ext.util.Inflector.pluralize(res);
		} else {
			return res;
		}
	},

	getAvailable: function(simple) {
		var locales = this._locales;

		if (simple) {
			return locales;
		} else {
			return new Ext.data.Store({
				fields: ['abbr', 'text'],
				data: locales
			});
		}
	},

	updateLocale: function(locale) {
		var me = this;

		me._language = locale;

		if (me._loadingInd && Ext.Viewport.setMasked) {
			Ext.Viewport.setMasked({
				xtype: 'loadmask',
				indicator: true,
				message: me.get('misc.loadingLocaleMsg', 'Loading...')
			});
		}

		me.init(function(/*mngr*/) {
			if (me._loadingInd && Ext.Viewport.setMasked) {
				Ext.Viewport.setMasked(false);
			}
		});
	},

	getLanguage: function() {
		return this._language;
	},

	getLocales: function() {
		return this._locales;
	},

	getEnableLocale: function() {
		return this.enableLocale;
	},

	isLocalable: function(me, config) {
		if (!config) {
			config = {};
		}

		if (Ext.isObject(me.config.locales)) {
			config.locales = me.config.locales;
		}

		var locales = config.locales || me.locales || (me.getLocales && me.getLocales()),
			enableLocale = config.enableLocale || me.enableLocale || (me.getEnableLocale && me.getEnableLocale());

		if (Ext.isObject(locales) || enableLocale) {
			Ext.apply(me, {
				enableLocale: true,
				locale: this
			});
		}

		return config;
	}
});
