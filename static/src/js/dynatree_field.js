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
                onActivate: function(node) {
                    // A DynaTreeNode object is passed to the activation handler
                    // Note: we also get this event, if persistence is on, and the page is reloaded.
                    alert("You activated " + node.data.title);
                    field.dynatree_selected = node.data.oerp_id;
                },
                persist: false, // TODO load via request and lazyload
                children: [ // Pass an array of nodes.
                    {oerp_id: 1, title: "Item 1"},
                    {title: "Folder 2", isFolder: true,
                     children: [
                         {title: "Sub-item 2.1", oerp_id: 14},
                         {title: "Sub-item 2.2", oerp_id: 8}
                     ]
                    },
                    {title: "Item 3", oerp_id: 7}
                ]
            });

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
