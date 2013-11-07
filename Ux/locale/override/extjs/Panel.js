Ext.define('Ux.locale.override.extjs.Panel', {
    override : 'Ext.panel.Panel',

    requires : [
        'Ux.locale.override.extjs.Component'
    ],

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        // set a blank title so the header gets rendered.
        // This way we can fill in the localized value later
        if (me.enableLocale && me.locales && me.locales.title) {
            Ext.apply(me, {
                title: '&nbsp;'
            });
        }
    },

    setLocale : function(locale) {
        var me          = this,
            locales     = me.locales,
            title       = locales.title,
            manager     = me.locale,
            defaultText = '',
            text;

        if (title) {
            if (Ext.isObject(title)) {
                defaultText = title.defaultText;
                title       = title.key;
            }

            text = manager.get(title, defaultText);

            if (Ext.isString(text)) {
                me.setTitle(text);
            }
        }

        me.callOverridden(arguments);
    }
});