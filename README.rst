Integration of jquery.dynatree into OpenERP web
===============================================

.. image:: raw/default/images/icon.png
    :align: center

This project is at an early stage, feel free to contribute, and keep
posted ! See the included ``TODO.txt`` to see what's in the pipe.

Branch: 6.1
~~~~~~~~~~~

This addon defines a new search field based on `jquery.dynatree
<http://wwwendt.de/tech/dynatree/index.html>`_ for arborescent
structures such as product and partner categories.

The controller can be loaded in 6.1 version of openerp.

Branch: 7.0
~~~~~~~~~~~

This addon defines:

* Many2one widget
* View

Bases on `jquery.dynatree <http://wwwendt.de/tech/dynatree/index.html>`_ for
arborescent structure.

Widget: ``m2o_dynatree``
------------------------

It is a many2one widget for arborescent model. the application is easy::

    <field name="categ_id" widget="m2o_dynatree" 
           first_node_domain="[('parent_id', '=', False)]"
           child_field="child_id"/>

In not editable, the widget m2o_dynatree, like classic many2one is a link 
to model form view

The setting options are:

* domain: to filter all the line
* first_node_domain: Only to apply a filter on the first node, not use after
* child_field: like tree view, we need to know the child field of the model,
  by default it is ``child_ids``

.. figure:: raw/default/images/m2o_dynatree1.png
    :align: center

    In not editable node, the widget m2o_dynatree, like classic many2one is a 
    link to model form view

.. figure:: raw/default/images/m2o_dynatree2.png
    :align: center

    In editable mode, the tree cursor is shown.

.. figure:: raw/default/images/m2o_dynatree3.png
    :align: center

    Click on the cursor to open tree

.. figure:: raw/default/images/m2o_dynatree4.png
    :align: center

    When you select a node, the tree is closed and the new value are selected.


View: ``tree_dynatree``
-----------------------

The view ``tree_dynatree`` replace the simple selector by dynatrees of the 
classic ``tree`` view

.. figure:: raw/default/images/tree_dynatree1.png
    :align: center

    The analytic plan chart has not a selector on a analytic account but a 
    dynatree on a general account and a dynatree on a budget

.. figure:: raw/default/images/tree_dynatree2.png
    :align: center

    The compute of the line depend of the dynatree's selected nodes

The setting of the ``ir.actions.act_window`` is the same, just use 
tree_dynatree::

    <openerp>
        <data>
            <record id="view_account_analytic_account_dynatree_tree" 
                    model="ir.ui.view">
                <field name="name">account.analytic.account.tree</field>
                <field name="model">account.analytic.account</field>
                <field name="field_parent">child_complete_ids</field>
                <field name="arch" type="xml">
                    <tree_dynatree version="7.0" string="Analytic account">
                        <field name="name"/>
                        <field name="code"/>
                        <field name="debit"/>
                        <field name="credit"/>
                        <field name="balance"/>
                        <field name="type"/>
                    </tree_dynatree>
                </field>
            </record>
            <record id="action_account_analytic_account_dynatree"
                model="ir.actions.act_window">
                <field name="name">Analytic account chart</field>
                <field name="res_model">account.analytic.account</field>
                <field name="type">ir.actions.act_window</field>
                <field name="view_type">tree</field>
                <field name="view_mode">tree_dynatree</field>
                <field name="domain">[('parent_id.parent_id', '=', False)]</field>
                <field name="view_id"
                    ref="view_account_analytic_account_dynatree_tree"/>
            </record>
            <menuitem id="menu_account_analytic_account_dynatree" 
                parent="menu_under_budget"
                sequence="20"
                action="action_account_analytic_account_dynatree"/>
            <record model="ir.actions.act_window.dynatree" 
                    id="analytic_account_dynatree">
                <field name="action_id" 
                    ref="action_account_analytic_account_dynatree"/>
                <field name="name">General account</field>
                <field name="model_id" ref="account.model_account_account"/>
                <field name="child_field_id" 
                    ref="account.field_account_account_child_parent_ids"/>
                <field name="init_domain">[('parent_id.code', '=', '0')]</field>
                <field name="domain">[]</field>
                <field name="search_field">general_account_id</field>
                <field name="type">context</field>
            </record>
            <record model="ir.actions.act_window.dynatree" 
                    id="analytic_account_dynatree_2">
                <field name="action_id" 
                    ref="action_account_analytic_account_dynatree"/>
                <field name="name">Budget</field>
                <field name="model_id"
                    ref="account.model_account_fiscalyear"/>
                <field name="context">{}</field>
                <field name="selectmode">single</field>
                <field name="search_field">budget_id</field>
                <field name="type">context</field>
            </record>
        </data>
    </openerp>

.. warning:: The setting of the view is classic, Don't forgive the 
    ``version="7.0"``

.. figure:: raw/default/images/tree_dynatree6.png
    :align: center

    Here it is the general account with analytic account in dynatree


The tree_dynatree is also multiheader::

    <tree_dynatree string="Budget entries by account"  version="7.0">
        <field name="code"/>
        <field name="name"/>
        <group string="Budget 1">
            <field name="debit_1"/>
            <field name="credit_1"/>
        </group>
        <group string="Budget 2">
            <field name="debit_2"/>
            <field name="credit_2"/>
        </group>
    </tree_dynatree>

.. figure:: raw/default/images/tree_dynatree7.png
    :align: center

    Like list_multiheader, we use ``group`` node for multi header


The dynatree setting can also be added by OpenERP client

.. figure:: raw/default/images/setting_dynatree1.png
    :align: center

    A new menu are added

.. figure:: raw/default/images/setting_dynatree2.png
    :align: center

    Tree view

.. figure:: raw/default/images/setting_dynatree3.png
    :align: center

    Form view, 
    
.. warning:: The form view must be improve but all the concept exist
    

.. figure:: raw/default/images/setting_dynatree4.png
    :align: center

    A one2many to dynatrees are added on ``ir.actions.act_window`` model.

.. warning:: The capability to add ``search`` view but not tested


A hook method can be added on the model to make a specif action. For exemple 
the budget ``analytic.budget`` is linked on a period

.. figure:: raw/default/images/tree_dynatree9.png
    :align: center

    The period is a many2one to ``account.fiscalyear``

.. figure:: raw/default/images/tree_dynatree10.png
    :align: center

    The first node are the périod and the second the budget, period and buget 
    are not arborescent

We use a hook method to return all the node, without leazy mode::

    def dynatree_get_first_node(self, cr, uid, context=None,
                                first_node_domain=None, *args, **kwargs):
        budget_obj = self.pool.get('analytic.budget')
        if isinstance(first_node_domain, str):
            first_node_domain = safe_eval(first_node_domain)
        res = []
        ids = self.search(cr, uid, first_node_domain, context=context)
        for id, name in self.name_get(cr, uid, ids, context=context):
            domain = [('period_id', '=', id)]
            budget_ids = budget_obj.search(cr, uid, domain, context=context)
            if not budget_ids:
                continue
            val = {
                'title': name,
                'oerp_model': self._name,
                'oerp_id': id,
                'isFolder': True,
                'isLazy': True,
                'hideCheckbox': True,
                'select': False,
                'oerp_domain': domain,
                'oerp_child_field': '',
                'oerp_checkbox_field': None,
                'children': [],
            }
            for bid, bname in budget_obj.name_get(cr, uid, budget_ids,
                                                  context=context):
                val['children'].append({
                    'title': bname,
                    'oerp_model': 'analytic.budget',
                    'oerp_id': bid,
                    'isFolder': False,
                    'isLazy': False,
                    'hideCheckbox': False,
                    'select': False,
                    'oerp_domain': [],
                    'oerp_child_field': '',
                    'oerp_checkbox_field': None,
                })

            res.append(val)

        if len(res) == 1 and len(res[0]['children']) == 1:
            res[0]['children'][0]['select'] = True
        return res

The existing hook method are:

* tree_dyntaree_get_context: to define a specific context in function of 
  dynatree
* tree_dyntaree_get_domain: to define a specific domain in function od dynatree
* tree_dynatree_get_rows: to return the model line of the actions, it is a 
  read by default
