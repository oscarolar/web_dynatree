/*---------------------------------------------------------
 * Dynatree selectors
 *---------------------------------------------------------*/

// GR: mandatory to use exactly the same name as the module's
openerp.web_dynatree = function (openerp) {
    openerp.web.search.DynatreeSelectionField = openerp.web.search.Field.extend({
        template: "SearchDynatreeSelectionField",

        start: function() {
            this.dynatree_selected = null;
            field = this;
            child_field = null;
            if (field.attrs.hasOwnProperty('options')) {
                options = eval('(' + field.attrs.options + ')');
                child_field = options.child_field;
            }
            $("#dynatree").dynatree({
                onLazyRead: function(node) {
                    field.rpc('/web/dynatree/expand',
                              {'node_id': node.data.oerp_id,
                               'child_field': child_field,
                               'model': field.attrs.relation}
                             ).then(
                                  function(result) {
                                      node.setLazyNodeStatus(DTNodeStatus_Ok);
                                      node.addChild(result);
                                  }
                              );
                },
                onActivate: function(node) {
                    // A DynaTreeNode object is passed to the activation handler
                    // Note: we also get this event, if persistence is on,
                    // and the page is reloaded.
                    field.dynatree_selected = node.data.oerp_id;
                    $('#dynatree-summary')[0].value = node.data.title;
                    field.view.do_search();
                },
                persist: false,
                children: [{title: "", oerp_id: null,
                            isFolder : true, isLazy: true}]
            });

            /* GR keeping attempt at AJAX init loading, which seems to fail
               because some object is not ready yet.

               field.rpc('/web/dynatree/roots', {}).then(
                 function(result) {
                    var rootNode = $("#dynatree").dynatree("getRoot");
                    for (i=0; i<result.length; i++) {
                        rootNode.addChild(result[i]);
                    }
                }
            ); */

            $('#dropdown-dynatree').click(function() {
                field.toggle_dynatree();
            });

            this.dynatree_displayed = true;
            this._super();
        },

        get_value: function() {
            console.debug('Dynatree get_value: ', this.dynatree_selected);
            return this.dynatree_selected;
        },

        // GR no need to override get_domain() or make_domain()
        // the <field> attrs can include 'operator', 'name' etc that
        // the generic version froms search.js will take care of

        toggle_dynatree: function() {
            this.dynatree_displayed = !(this.dynatree_displayed);
            $('#dynatree').css("display",
                               this.dynatree_displayed ? "block" : "none");
        }

    });

    openerp.web.search.fields.add('dynatree_selection',
                                  'openerp.web.search.DynatreeSelectionField');
};

// vim:et fdc=0 fdl=0:
