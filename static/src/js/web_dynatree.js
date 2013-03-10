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
            openerp.connection.rpc('/web/dynatree/get_children', {
                'model': this._configuration.model,
                'oerp_id': null,
                'init_domain': this._configuration.init_domain,
                'child_field': this.dynatree.child_field,
                'checkbox_field': this.dynatree.checkbox_field,
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
};
