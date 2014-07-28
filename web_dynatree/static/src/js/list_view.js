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
            this._super(parent, dataset || null, view_id || null, options || {});
        },
    });
};
