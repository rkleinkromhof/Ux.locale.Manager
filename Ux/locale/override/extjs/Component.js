Ext.define('Ux.locale.override.extjs.Component', {
	override: 'Ext.Component',

	requires: [
		'Ux.locale.Manager',
		'Ux.util.Reflector'
	],

	enableLocale: false,
	locale: null,
	locales: null,

	/**
	 * @cfg {Object} [locales]
	 * The locale properties that need to be localized. All values are looked up in a translation file and are
	 * applied to the component.
	 *
	 * Locale properties can either be specified as a String or an Object.
	 *
	 * ## As a String
	 *
	 * Example usage:
	 *
	 * 		locales: {
	 *			foo: 'path.to.locale'
	 *    }
	 *
	 * 	Use the property name as key and the locale path as value.
	 *
	 * ## As an Object
	 *
	 * Example usage:
	 *
	 * 		locales: {
	 * 			foo: {
	 * 				path: 'path.to.locale'
	 * 			}
	 * 		}
	 *
	 * 	-	**path**
	 *
	 * 		The locale path. This leads to a localized value in a translation file.
	 *
	 * ## Configuring a custom locale setter function
	 * By default this component will look for the appropriate setter for the specified property. For a property named
	 * 'bar' the setter 'setBar' will be used. If there is no such setter, the property value will be set directly,
	 * like so: this.bar = value.
	 *
	 * If you need to specify your own setter, you can do this using a locale property object and specifying the
	 * function name or the function itself as a property:
	 *
	 *		locales: {
	 *			foo: {
	 *				path: 'path.to.locale',
	 *				fn: 'setBar'
	 *			}
	 *		}
	 *
	 * ## Applying locales on a specific event
	 * @cfg {String[]} [locales.applyOn=['beforeshow']]
	 * Localized values are applied on the {@link Ext.AbstractComponent#beforeshow} event by default. To apply locales
	 * on a different event, configure {@link locales.applyOn}:
	 *
	 *		locales: {
	 *			foo: 'path.to.locale',
	 *			applyOn: ['show']
	 *		}
	 *
	 */

	/**
	 * @inheritDoc
	 */
	initComponent: function() {
		var me = this;

		if (Ext.isObject(me.locales) || me.enableLocale) {
			Ext.apply(me, {
				enableLocale: true,
				locale: Ux.locale.Manager
			});

			me.bindLocaleEventHandlers();
		}

		me.callParent(arguments);
	},

	/**
	 * binds all events in {@link locales.applyOn} to {@link #applyLocale}
	 */
	bindLocaleEventHandlers: function() {
		var me = this,
			events = me.locales.applyOn || ['beforeshow'];

		Ext.Array.each(events, me.bindLocaleEventHandler, me);
	},

	/**
	 * binds {@link #applyLocale} to the given event.
	 * @param {String} event child component.
	 */
	bindLocaleEventHandler: function(event) {
		this.on(event, this.applyLocale, this);
	},

	/**
	 * Uses {@link FreeForm.ux.locale.override.Manager#applyLocales} to apply locales on this component.
	 */
	applyLocale: function() {
		var mgr = this.locale;

		mgr.applyLocales.call(mgr, this);
	}
});
