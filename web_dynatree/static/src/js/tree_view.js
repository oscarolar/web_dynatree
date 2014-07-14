openerp.web_dynatree.tree_view = function(instance){

    var QWeb = instance.web.qweb,
        _lt = instance.web._lt;

    instance.web.views.add('tree_dynatree', 'instance.web.TreeViewDynatree');
    instance.web.TreeViewDynatree = instance.web.TreeView.extend({
        template: 'TreeViewDynatree',
        display_name: _lt('Tree dynatree'),
        view_type: 'tree_dynatree',
        init: function(parent, dataset, view_id, options) {
            console.log('tree_view');
            this.searchable = options.action.has_search_view;
            this._dynatrees = {};
            this._define_hook = false;
            this._search_view_domain = dataset.domain;
            this._super(parent, dataset || null, view_id || null, options || {});
        },
        start: function () {
            console.log('tree_view start');
            this.display_dynatree();
            return this._super();
        },
        load_tree: function (fields_view){
            console.log('tree_view load');
            var self = this;
            this.arch_view = [];
            this.columns = [];
            this.fields = fields_view.fields;
            this.child_field = fields_view['field_parent'];
            this.fields_toread = _.keys(this.fields);
            this.dynatree_get_arch_view(fields_view.arch.children, this.columns, 
                                        this.arch_view, 0);
            if (!this._define_hook) {
                // Add this test because the add of the do_search methode
                // duplicate the call of the hook_row_click methode
                // who duplicate the delegate methode when we click on one row
                this.hook_row_click();
                this._define_hook = true;
            }
            var header = QWeb.render(this.template + '.headers', {
                header: this.arch_view,
                levels: _.range(this.arch_view.length),
                fields: this.fields
            });
            this.$el.find('thead').html(header);
            this.$el.addClass(fields_view.arch.attrs['class']);
            this.rpc('/web/dynatree/tree/get_rows', {
                model: this.dataset._model.name,
                parent_id: false,
                fields: this.fields_toread,
                child_field: this.child_field,
                domain: this._search_view_domain,
                dynatrees: this._dynatrees,
                context: this.dataset.context}).then(function(records){
                    self.getdata(null, records);
            });
            this.do_push_state({});
            if (!this.fields_view.arch.attrs.colors) {
                return;
            }
            this.colors = _(this.fields_view.arch.attrs.colors.split(';')).chain()
                .compact()
                .map(function(color_pair) {
                    var pair = color_pair.split(':'),
                    color = pair[0],
                    expr = pair[1];
                return [color, py.parse(py.tokenize(expr)), expr];
                }).value();
        },
        hook_row_click: function () {
            var self = this;
            this.$el.delegate('.treeview-td span, .treeview-tr span', 'click', function (e) {
                e.stopImmediatePropagation();
                self.activate($(this).closest('tr').data('id'));
            });
            this.$el.delegate('.treeview-tr', 'click', function () {
                var is_loaded = 0,
                    $this = $(this),
                    record_id = $this.data('id');
                _(self.records[record_id]).each(function(childid) {
                    if (self.$el.find('#treerow_' + childid).length) {
                        if (self.$el.find('#treerow_' + childid).is(':hidden')) {
                            is_loaded = -1;
                        } else {
                            is_loaded++;
                        }
                    }
                });
                if (is_loaded === 0) {
                    if (!$this.parent().hasClass('oe_open')) {
                        self.rpc('/web/dynatree/tree/get_rows', {
                            model: self.dataset._model.name,
                            parent_id: record_id,
                            fields: self.fields_toread,
                            child_field: self.child_field,
                            domain: [],
                            dynatrees: self._dynatrees,
                            context: self.dataset.context}).done(
                                function(records) {
                                    self.getdata(record_id, records);
                        });
                    }
                } else {
                    self.showcontent(record_id, is_loaded < 0);
                }
            });
        },
        getdata: function (id, records) {
            var self = this;
            _(records).each(function (record) {
                self.records[record.id] = [];
            });
            if (id != null) {
                self.records[id] = _(records).pluck('id');
            }
            var $curr_node = this.$el.find('#treerow_' + id);
            var children_rows = QWeb.render(this.template + '.rows', {
                'records': records,
                'children_field': this.child_field,
                'columns': this.columns,
                'fields': this.fields,
                'level': $curr_node.data('level') || 0,
                'render': instance.web.format_value,
                'color_for': this.color_for
            });
            if ($curr_node.length) {
                $curr_node.addClass('oe_open');
                $curr_node.after(children_rows);
            } else {
                this.$el.find('tbody').html(children_rows);
            };
        },
        showcontent: function (record_id, show) {
            this.$el.find('#treerow_' + record_id)
                    .toggleClass('oe_open', show);
            _(this.records[record_id]).each(function (child_id) {
                var $child_row = this.$el.find('#treerow_' + child_id);
                if ($child_row.hasClass('oe_open')) {
                    this.showcontent(child_id, false);
                }
                $child_row.toggle(show);
            }, this);
        },
        dynatree_get_arch_view: function(nodes, fields, arch, level) {
            var self = this;
            if (!arch[level]) arch[level] = [];
            _(nodes).each(function(node){
                if (node.tag == 'group'){
                    self.dynatree_get_arch_view(node.children, fields, arch, level + 1);
                    node.colspan = self.get_colspan(node);
                    console.log(node)
                    arch[level].push(node);
                }else{
                    fields.push(node);
                    arch[level].push(node);
                }
            });
        },
        get_colspan: function(node) {
            if (node.tag != 'group')
                return 1;
            var self = this;
            var colspan = 0;
            _(node.children).each(function (n) {
                colspan += self.get_colspan(n);
            });
            return colspan;
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
        do_search: function (domain, context, group_by) {
            this._search_view_domain = domain;
            return this.load_view(context);
        },
    });
};
