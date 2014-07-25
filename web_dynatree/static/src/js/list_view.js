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
            this.searchable = options.action.has_search_view;
            this._dynatrees = {};
            this._define_hook = false;
            this._search_view_domain = dataset.domain;
            this._super(parent, dataset || null, view_id || null, options || {});
        },
    });
};
