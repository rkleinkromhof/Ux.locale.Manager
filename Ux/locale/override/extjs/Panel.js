Ext.define('Ux.locale.override.extjs.Panel', {
    override: 'Ext.panel.Panel',

    requires: [
        'Ux.locale.override.extjs.Component'
    ],

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        // If no title is set but the title does need to be localized, set a blank title
		// so the header gets rendered. This way we can fill in the localized value later
        if (!me.title && me.enableLocale && me.locales && me.locales.title) {
            me.title = '&nbsp;';
        }
    }
});
