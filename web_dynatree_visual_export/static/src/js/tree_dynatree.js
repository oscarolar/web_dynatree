openerp.web_dynatree_visual_export = function (instance) {

    var _t = instance.web._t;
    var QWeb = instance.web.qweb;

    instance.web.TreeViewDynatree.include({
        load_tree: function () {
            var self = this;
            var add_button = false;
            if (!this.$buttons) {
                this.$buttons = $(QWeb.render("ListView.buttons", {'widget':self}));
                if (this.options.$buttons) {
                    this.$buttons.appendTo(this.options.$buttons);
                } else {
                    this.$el.find('.oe_list_buttons').replaceWith(this.$buttons);  
                }
                add_button = true;
            }
            this._super.apply(this, arguments);
            if(add_button) {
                this.$buttons.on('click', '.oe_list_button_export', function() {
                    fields_and_headers = self.get_export_fields_and_headers();
                    $.blockUI();
                    self.session.get_file({
                        url: '/web/export/spreadsheet_view',
                        data: {data: JSON.stringify({
                            model: self.model,
                            fields: fields_and_headers[0],
                            headers: fields_and_headers[1],
                            view_type: self.view_type,
                            other_filter: self.get_export_other_filter(),
                            title: self.options.action.name,
                            view_mode: 'tree',
                            child_field: self.get_export_child_field(),
                            domain: self.dataset.domain,
                            context: self.dataset.context
                        })},
                        complete: $.unblockUI
                    });
                });
            }
        },
        get_export_fields_and_headers: function(){
            var self = this;
            var fields = [];
            var headers = [];
            var rowspan = this.arch_view.length
            _(this.arch_view).each(function(row){
                header = [];
                _(row).each(function(c) {
                    if (c.tag === 'field' && !c.attrs.modifiers.invisible){
                        header.push({
                            string: c.attrs.string || self.fields[c.attrs.name].string,
                            rowspan: rowspan,
                            colspan: 1});
                    }else{
                        if (c.tag === 'group') {
                            header.push({
                                string: c.attrs.string,
                                rowspan: 1,
                                colspan: c.children.length});
                        }
                    }
                });
                headers.push(header);
                rowspan -= 1;
            });
            _(this.columns).each(function(c){
                if (!c.attrs.invisible) fields.push(c.attrs.name);
            });
            return [fields, headers];
        },
        get_export_other_filter: function(){
            return this._dynatrees;
        },
        get_export_child_field: function(){
            return this.child_field;
        },
    });
};
