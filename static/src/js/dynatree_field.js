/*---------------------------------------------------------
 * Dynatree selectors
 *---------------------------------------------------------*/

// GR: mandatory to use exactly the same name as the module's
openerp.web_dynatree = function (openerp) {
    openerp.web.search.DynatreeSelectionField = openerp.web.search.Field.extend({
        render: function(defaults) {
	    console.info('GR render', defaults)
            return '<div id="dynatree"> DYNATREE</div>'; // TODO use name in id
        },

        start: function() {
            console.info('GR start', this);
            this.dynatree_selected = null;
            field = this;
            $("#dynatree").dynatree({
                onLazyRead: function(node) {
                    field.rpc('/poc/expand',
                              {'node_id': node.data.oerp_id}).then(
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
                },
                persist: false,
                children: [{title: "Categories", oerp_id: null,
                            isFolder : true, isLazy: true}]
            });

            /* GR keeping attempt at AJAX init loading, which seems to fail
               because some object is not ready yet.

               field.rpc('/poc/roots', {}).then(
                 function(result) {
                    var rootNode = $("#dynatree").dynatree("getRoot");
                    for (i=0; i<result.length; i++) {
                        rootNode.addChild(result[i]);
                    }
                }
            ); */

            this._super();
        },

        get_value: function() {
            console.debug('GR dynatree get_value:', this.dynatree_selected);
            return this.dynatree_selected;
        },

        // GR no need to override get_domain() or make_domain()
        // the <field> attrs can include 'operator', 'name' etc that
        // the generic version froms search.js will take care of

    });

    openerp.web.search.fields.add('dynatree_selection',
                                  'openerp.web.search.DynatreeSelectionField');
};

// vim:et fdc=0 fdl=0:
