openerp.web_dynatree = function (instance) {
    instance.web.Dynatree = instance.web.Widget.extend({
        init: function(dynatree_id, configuration, context, use_checkbox,
                       selectMode, selected_oerp_ids) {
            this.dynatree_id = dynatree_id;
            this._configuration = configuration;
            this._context = context;
            this._use_checkbox = use_checkbox;
            this._onSelect = function(object, oerp_ids){};
            this._onSelectObject = null;
            this._onActivate = function(object, oerp_id, title){};
            this._onActivateObject = null;
            this._classNames = {checkbox: "dynatree-checkbox"};
            switch (selectMode){
                case 'single':
                    this._selectMode = 1;
                    this._classNames = {checkbox: "dynatree-radio"};
                    break;
                case 'multi-hier':
                    this._selectMode = 3;
                    break;
                case 'multi':
                    // make nothing because multi and default are same
                default:
                    this._selectMode = 2;
                    break;
            }
            var self = this;
            this.rpc('/web/dynatree/get_first_node', {
                'model': this._configuration.model,
                'first_node_domain': this._configuration.first_node_domain,
                'domain': this._configuration.domain,
                'child_field': this._configuration.child_field,
                'checkbox_field': this._configuration.checkbox_field,
                'use_checkbox': this._use_checkbox,
                'selected_oerp_ids': selected_oerp_ids,
                'context': this._context,
                }).then(function (children) {
                    self.load_dynatree(children);
            });
            this._super();
        },
        load_dynatree: function (children) {
            var self = this;
            $("#dynatree_" + this.dynatree_id).dynatree({
                checkbox: this._use_checkbox,
                selectMode: this._selectMode,
                classNames: this._classNames,
                clickFolderMode: 1,
                onLazyRead: function(node) {
                    self.rpc('/web/dynatree/get_children', {
                        'model': node.data.oerp_model,
                        'oerp_id': node.data.oerp_id,
                        'first_node_domain': self._configuration.first_node_domain,
                        'domain': node.data.oerp_domain,
                        'child_field': node.data.oerp_child_field,
                        'checkbox_field': node.data.oerp_checkbox_field,
                        'use_checkbox': self._use_checkbox,
                        'context': self._context,
                        }).then(function (children) {
                            node.setLazyNodeStatus(DTNodeStatus_Ok);
                            node.addChild(children);
                    });
                },
                onSelect: function(flag, node){
                    var selectedNodes = node.tree.getSelectedNodes();
                    var selected_oerp_ids = $.map(selectedNodes, function(node){
                        return node.data.oerp_id;
                    });
                    console.log('onSelect : ' + selected_oerp_ids);
                    self._onSelect(self._onSelectObject, 
                            self._object, selected_oerp_ids);
                },
                onActivate: function(node) {
                    self._onActivate(self._onActivateObject, 
                            node.data.oerp_id, node.data.title);
                    // collapse the first node after choose/activate the node
                    parentList = node._parentList();
                    if (parentList[0])
                        parentList[0]._expand(false);
                    else
                        node._expand(false);
                },
                persist: false,
                children: children
            });
            $('#dropdown-dynatree').click(function() {
                self.toggle_dynatree();
            });
            this.dynatree_displayed = true;
        },
        toggle_dynatree: function() {
            this.dynatree_displayed = !(this.dynatree_displayed);
            $('#' + this.dynatree_id).css("display",
                               this.dynatree_displayed ? "block" : "none");
        },
        add_callback_onSelect: function(object, callback) {
            this._onSelectObject = object;
            this._onSelect = callback;
        },
        add_callback_onActivate: function(object, callback) {
            this._onActivateObject = object;
            this._onActivate = callback;
        },
    });

    instance.web.form.widgets.add('m2o_dynatree', 
            'instance.web.form.M2O_Dynatree');

    instance.web.form.M2O_Dynatree = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {
        template: 'M2O_Dynatree',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            this._display_value = {}
            child_field = this.node.attrs.child_field || 'child_ids';
            first_node_domain = this.node.attrs.first_node_domain || [];
            domain = this.node.attrs.domain || this.field.domain || [];
            this.configuration = {
                model: this.field.relation,
                child_field: child_field,
                domain: domain,
                first_node_domain: first_node_domain,
            }
        },
        render_value: function() {
            var self = this;
            if (! this.get("value")) {
                this.display_string("");
                return;
            }
            if (this.get("value")[1]){
                this.display_string(this.get("value")[1]);
            } else {
                this.display_string(this._display_value[this.get('value')]);
            }
            if (!this.get('effective_readonly')){
                this._dynatree = new instance.web.Dynatree(
                      this.id_for_label,
                      this.configuration,
                      context=this.session.user_context,
                      use_checkbox=false
                      );
                this._dynatree.add_callback_onActivate(this, 
                        this.dynatree_onActivate);
            }
        },
        display_string: function(str) {
            var self = this;
            var lines = _.escape(str).split("\n");
            var link = "";
            var follow = "";
            link = lines[0];
            follow = _.rest(lines).join("<br />");
            if (follow)
                link += "<br />";
            var $link = this.$el.find('.oe_form_uri')
                 .unbind('click')
                 .html(link);
            $link.click(function () {
                self.do_action({
                    type: 'ir.actions.act_window',
                    res_model: self.field.relation,
                    res_id: self.get("value")[0],
                    views: [[false, 'form']],
                    target: 'current'
                });
                return false;
             });
            $(".oe_form_m2o_follow", this.$el).html(follow);
        },
        dynatree_onActivate: function (self, oerp_id, title){
            self.internal_set_value(oerp_id);
            self._display_value[oerp_id] = title;
            self.render_value();
        },
    });

    instance.web.form.widgets.add('m2m_dynatree', 
            'instance.web.form.M2M_Dynatree');

    instance.web.form.M2M_Dynatree = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {
        template: 'M2M_Dynatree',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            child_field = this.node.attrs.child_field || 'child_ids';
            checkbox_field = this.node.attrs.checkbox_field || '';
            first_node_domain = this.node.attrs.first_node_domain || [];
            this.selectmode = this.node.attrs.selectmode || 'multi';
            domain = this.node.attrs.domain || this.field.domain || [];
            this.configuration = {
                model: this.field.relation,
                child_field: child_field,
                checkbox_field: checkbox_field,
                domain: domain,
                first_node_domain: first_node_domain,
            }
            this.set({'value': []});
            console.log('INIT        ');
            this.no_rerender = true;
        },
        render_value: function() {
            console.log('render : ' + this.get('value'));
            this._dynatree = new instance.web.Dynatree(
                this.id_for_label,
                this.configuration,
                context=this.session.user_context,
                use_checkbox=true,
                selectMode=this.selectmode,
                selected_oerp_ids = this.get('value')
            );
            this._dynatree.add_callback_onSelect(this, 
                    this.dynatree_onSelect);
        },
        set_value: function(value_) {
            value_ = value_ || [];
            if (value_.length >= 1 && value_[0] instanceof Array) {
                value_ = value_[0][2];
            }
            this._super(value_);
        },
        dynatree_onSelect: function (self, object, selected_oerp_ids){
            self.set_value(selected_oerp_ids);
        },
    });
};
