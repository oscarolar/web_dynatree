openerp.web_dynatree.dynatree = function (instance) {
    instance.web.Dynatree = instance.web.Widget.extend({
        init: function(obj){
            this.dynatree_id = obj.dynatree_id;
            this._configuration = obj.configuration;
            this._context = obj.context;
            this._use_checkbox = obj.use_checkbox;
            this.onSelect = obj.onSelect || function(object, oerp_ids){};
            this.onActivate = obj.onActivate || function(oerp_id, title){};
            this._classNames = {checkbox: "dynatree-checkbox"};
            switch (obj.selectMode){
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
                'first_node_domain': this._configuration.first_node_domain || [],
                'domain': this._configuration.domain || [],
                'child_field': this._configuration.child_field,
                'checkbox_field': this._configuration.checkbox_field,
                'use_checkbox': this._use_checkbox,
                'selected_oerp_ids': obj.selected_oerp_ids,
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
                onCreate: function(node, nodeSpan){
                    var selectedNodes = node.tree.getSelectedNodes();
                    var selected_oerp_ids = $.map(selectedNodes, function(node){
                        return node.data.oerp_id;
                    });
                    if (selected_oerp_ids.length)
                        self.onSelect(selected_oerp_ids);
                },
                onSelect: function(flag, node){
                    var selectedNodes = node.tree.getSelectedNodes();
                    var selected_oerp_ids = $.map(selectedNodes, function(node){
                        return node.data.oerp_id;
                    });
                    self.onSelect(selected_oerp_ids);
                },
                onActivate: function(node) {
                    self.onActivate(node.data.oerp_id, node.data.title);
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
    });
};
