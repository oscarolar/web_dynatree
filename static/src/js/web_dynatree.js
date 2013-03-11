openerp.web_dynatree = function (instance) {
    instance.web.Dynatree = instance.web.Widget.extend({
        init: function(
                  dynatree_id,
                  configuration,
                  context={},
                  use_checkbox=false,
                  onSelect=function(oerp_ids){},
                  onActivate=function(oerp_id, title){}
                  ) {
            this.dynatree_id = dynatree_id;
            this._configuration = configuration;
            this._context = context;
            this._use_checkbox = use_checkbox;
            this._onSelect = onSelect;
            this._onActivate = onActivate;
            this._oerp_ids = []
            this.rpc('/web/dynatree/get_children', {
                'model': this._configuration.model,
                'oerp_id': null,
                'init_domain': this._configuration.init_domain,
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
            $("#" + this.dynatree_id).dynatree({
                checkbox: this.use_checkbox,
                onLazyRead: function(node) {
                    openerp.connection.rpc('/web/dynatree/get_children', {
                        'model': node.data.oerp_model,
                        'oerp_id': node.data.oerp_id,
                        'init_domain': node.data.oerp_domain,
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
                    self._onSelect(self._oerp_ids);
                },
                onActivate: function(node) {
                    self.onActivate(node.data.oerp_id, node.data.title);
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
        }
    });

    instance.web.form.widgets.add('m2o_dynatree', 
            'instance.web.form.M2O_Dynatree');

    instance.web.form.M2O_Dynatree = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {
        template: 'M2O_Dynatree',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            this.set({'value': false});
            this.configuration = {}
            console.log(this);
            this._dynatree = new instance.web.Dynatree(
                  this.id_for_label,
                  this.configuration//,
                  //context={},
                  //use_checkbox=false,
                  //onSelect=function(oerp_ids){},
                  //onActivate=function(oerp_id, title){}
                  );
        },
        render_value: function(no_recurse) {
            var self = this;
            if (! this.get("value")) {
                this.display_string("");
                return;
            }
            this.display_string(this.get("value")[1]);
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
    });
};
