openerp.web_dynatree.tree_view = function(instance){
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    instance.web.views.add('list_dynatree', 'instance.web.ListViewDynatree');
    instance.web.ListViewDynatree = instance.web.ListView.extend({
        template: 'ListViewDynatree',
        display_name: _lt('List dynatree'),
        view_type: 'list_dynatree',
        init: function(parent, dataset, view_id, options) {
            console.log('LIST_view');
            this._dynatrees = {};
            this._super(parent, dataset || null, view_id || null, options || {});
        },
        start: function () {
            console.log('tree_view start');
            this.display_dynatree();
            return this._super();
        },
        display_dynatree: function () {
            var self = this;
            if (this.options.action.dynatree_setting_ids) {
                dynatreeconf = new instance.web.Model('ir.actions.act_window.dynatree');
                dynatreeconf.call('get_dynatrees',
                        [this.options.action.dynatree_setting_ids],
                        {context: this.dataset.context}).then(function (dynatrees) {
                    _(dynatrees).each( function (dynatree) {
                        self._dynatrees[dynatree.id] = [];
                        var d = QWeb.render('TreeViewDynatree.Dynatree',
                                            {'dynatree': dynatree});
                        $(self.$el[0]).append(d);
                        new instance.web.Dynatree({
                            dynatree_id: dynatree.id,
                            configuration: {
                                model: dynatree.model,
                                first_node_domain: dynatree.init_domain,
                                child_field: dynatree.child_field,
                                checkbox_field: dynatree.checkbox_field,
                            },
                            context: dynatree.context,
                            use_checkbox: true,
                            onSelect: function(model_ids){
                                self._dynatrees[dynatree.id] = model_ids;
                                return self.load_view(self.dataset.context);
                            },
                            selectMode: dynatree.selectMode
                        });
                    });

                });
            }
        },
    });
};
