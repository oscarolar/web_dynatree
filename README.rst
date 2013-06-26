Integration of jquery.dynatree into OpenERP web
===============================================

.. image:: raw/default/images/icon.png
    :align: center

This addon provides new UI componants based on
`jquery.dynatree <http://wwwendt.de/tech/dynatree/index.html>`_ for
arborescent structures, such as product and partner categories.

This project is at an early stage, feel free to contribute, and keep
posted ! See the included ``TODO.txt`` to see what's in the pipe.

Branch: 6.1
~~~~~~~~~~~

For OpenERP 6.1 this branch provides a new search field 

Branch: 7.0
~~~~~~~~~~~

For OpenERP 7.0 this branch provides:

* A many2one widget ``m2o_dynatree`` for ``form`` views
* A view ``tree_dynatree`` that enhances the foldable ``tree`` views with 
  dynatree selectors


Widget: ``m2o_dynatree``
------------------------

It is a many2one widget for  many2one fields targetting arborescent models. 
Using it is fairly easy::

    <field name="categ_id" widget="m2o_dynatree" 
           first_node_domain="[('parent_id', '=', False)]"
           child_field="child_id"/>


The available options are:

* All usual options for the standard many2one like ``domain`` and ``context``
* ``first_node_domain``: Used to select the roots of the dynatree
* ``child_field``: like the ``tree`` view, we need to know the child field 
  of the target model, by default it is ``child_ids``

.. figure:: raw/default/images/m2o_dynatree1.png
    :align: center

    In readonly mode, the widget m2o_dynatree, like the classic many2one,
    is a link to ``form`` view

.. figure:: raw/default/images/m2o_dynatree2.png
    :align: center

    In editable mode, the dynatree unfolding handle gets displayed

.. figure:: raw/default/images/m2o_dynatree3.png
    :align: center

    Click on the triangular handle to unfold

.. figure:: raw/default/images/m2o_dynatree4.png
    :align: center

    As you select a node, the tree is folded and the new value are selected.


View: ``tree_dynatree``
-----------------------

The ``tree_dynatree`` view replaces the simple ``select`` html of the 
classic ``tree`` view by one or several dynatree selectors

.. figure:: raw/default/images/tree_dynatree1.png
    :align: center

    The analytic plan chart's ``select`` which normally on 
    ``analytic account``, has been replaced by two dynatree selectors: the 
    first on general account and the second on the budget

.. figure:: raw/default/images/tree_dynatree2.png
    :align: center

    The bottom half of the screen sums up only those analytic lines that match 
    the dynatree selectors from the upper half.

The definition of the ``ir.actions.act_window`` is similar to the usual one,
just use ``tree_dynatree`` instead of ``tree`` in a few places, then add the 
definitions of the dynatree selectors::

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

            <!-- Dynatree selectors -->
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

.. warning::  Don't forget to put ``version="7.0"``, otherwise the RelaxNG 
    for pre v7 views will refuse this definition.

.. figure:: raw/default/images/tree_dynatree6.png
    :align: center

    General account folding view with analytic account dynatree selection.


The ``tree_dynatree`` view also has a multiheader capability::

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

    Like in the 
    `list_multiheader addon <https://bitbucket.org/anybox/list_multiheader>`_, 
    we use ``group`` node to express the grouping of headers.


The dynatree configurations can also be managed by OpenERP client

.. figure:: raw/default/images/setting_dynatree1.png
    :align: center

    Dynatree configuration menu

.. figure:: raw/default/images/setting_dynatree2.png
    :align: center

    Tree view

.. figure:: raw/default/images/setting_dynatree3.png
    :align: center

    Form view, 
    
.. warning:: The form view must be improve but all the concept exist
    

.. figure:: raw/default/images/setting_dynatree4.png
    :align: center

    There is a one2many pointing to dynatrees  on the 
    ``ir.actions.act_window`` model.

.. warning:: The capability to add ``search`` view but not tested


Some hook methods can be defined on the target model for advanced tuning.
The screenshots of the two views above illustrate one of them, meant to use a
virtual arborescent structure (periods and budgets):

.. figure:: raw/default/images/tree_dynatree9.png
    :align: center

    The period is a many2one to ``account.fiscalyear``

.. figure:: raw/default/images/tree_dynatree10.png
    :align: center

    The first nodes are the periods and the second ones the budgets, although 
    period and buget are not part of a common arborescent model.

To get this result, we used a hook method returning all the dynatree nodes 
at once::

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

The existing hook methods are:

* ``tree_dynatree_get_context``: to pass a specific context that will be used 
  while searching and reading the results
* ``tree_dynatree_get_domain``: to define a specific domain in function of 
  dynatree
* ``tree_dynatree_get_rows``: must return the lines to display in the main 
  part of the view (defaults to a simple read)
