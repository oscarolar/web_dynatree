openerp.web_dynatree = function (instance) {
    instance.web.Dynatree = instance.web.Widget.extend({
        init: function(dynatree_id, configuration, context, use_checkbox) {
            this.dynatree_id = dynatree_id;
            this._configuration = configuration;
            this._context = context;
            this._use_checkbox = use_checkbox;
            this._onSelect = function(object, oerp_ids){},
            this._onSelectObject = null;
            this._onActivate = function(object, oerp_id, title){}
            this._onActivateObject = null;
            this._oerp_ids = []
            var self = this;
            this.rpc('/web/dynatree/get_first_node', {
                'model': this._configuration.model,
                'domain': this._configuration.domain,
                'first_node_domain': this._configuration.first_node_domain,
                'child_field': this._configuration.child_field,
                'checkbox_field': this._configuration.checkbox_field,
                'use_checkbox': this._use_checkbox,
                'context': this._context,
                }).then(function (children) {
                    self.load_dynatree(children);
            });
            this._super();
        },
        load_dynatree: function (children) {
            var self = this;
            $("#dynatree_" + this.dynatree_id).dynatree({
                checkbox: this.use_checkbox,
                selectMode: 3,
                clickFolderMode: 1,
                onLazyRead: function(node) {
                    self.rpc('/web/dynatree/get_children', {
                        'model': node.data.oerp_model,
                        'oerp_id': node.data.oerp_id,
                        'domain': node.data.oerp_domain,
                        'first_node_domain': self._configuration.first_node_domain,
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
                    if (flag) {
                        if (self._oerp_ids) {
                            self._oerp_ids = _.union(self._oerp_ids, 
                                                    [node.data.oerp_id]);
                        } else {
                            self._oerp_ids = [node.data.oerp_id];
                        }
                    } else {
                        self._oerp_ids = _.without(
                                self._oerp_ids, [node.data.oerp_id]);
                    }
                    self._onSelect(self._onSelectObject, 
                            self._object, self._oerp_ids);
                },
                onActivate: function(node) {
                    self._onActivate(self._onActivateObject, 
                            node.data.oerp_id, node.data.title);
                    // collapse the first node after choose/activate the node
                    node._parentList()[0]._expand(false);
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
            this.set({'value': false});
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
        render_value: function(no_recurse) {
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
    });
};
