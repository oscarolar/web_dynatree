Integration of jquery.dynatree into OpenERP web
===============================================

This addon defines a new search field based on `jquery.dynatree
<http://wwwendt.de/tech/dynatree/index.html>`_ for arborescent
structures such as product and partner categories.

.. image:: images/icon.png
    :align: center

This project is at an early stage, feel free to contribute, and keep
posted ! See the included ``TODO.txt`` to see what's in the pipe.

Widget: ``m2o_dynatree``
------------------------

It is a many2one widget for arborescent model. the application is easy:

.. figure:: images/code1.png
    :align: center

    In not editable, the widget m2o_dynatree, like classic many2one is a link 
    to model form view

The setting options are:

* domain: to filter all the line
* first_node_domain: Only to apply a filter on the first node, not use after
* child_field: like tree view, we need to know the child field of the model,
  by default it is ``child_ids``

.. figure:: images/m2o_dynatree1.png
    :align: center

    In not editable node, the widget m2o_dynatree, like classic many2one is a 
    link to model form view

.. figure:: images/m2o_dynatree2.png
    :align: center

    In editable mode, the tree cursor is shown.

.. figure:: images/m2o_dynatree3.png
    :align: center

    Click on the cursor to open tree

.. figure:: images/m2o_dynatree4.png
    :align: center

    When you select a node, the tree is closed and the new value are selected.


View: ``tree_dynatree``
-----------------------

Like the view_mode tree in view type tree, the view tree_dynatree replace the
simple selector by dynatrees.

.. figure:: images/tree_dynatree1.png
    :align: center

    The analytic plan chart has not a selector on a analytic account but a 
    dynatree on a general account and a dynatree on a budget

.. figure:: images/tree_dynatree2.png
    :align: center

    The compute of the line depend of the dynatree's selected nodes

.. figure:: images/tree_dynatree3.png
    :align: center

    The setting of the ir.actions.act_window is the same, just use 
    tree_dynatree

.. figure:: images/tree_dynatree4.png
    :align: center

    The setting of the view is classic, Don't forgive the version="7.0"

.. figure:: images/tree_dynatree5.png
    :align: center

    The model of dynatree setting is ``ir.actions.act_window.dynatree``

.. figure:: images/tree_dynatree6.png
    :align: center

    Here it is the general account with analytic accont in dynatree

.. figure:: images/tree_dynatree7.png
    :align: center

    Like list_multiheader, we use group node for multi header

.. figure:: images/tree_dynatree8.png
    :align: center

    The tree_dynatree is multiheader


The dynatree setting can also be added by OpenERP client

.. figure:: images/setting_dynatree1.png
    :align: center

    A new menu are added

.. figure:: images/setting_dynatree2.png
    :align: center

    Tree view

.. figure:: images/setting_dynatree3.png
    :align: center

    Form view, 
    
.. warning:: The form view must be improve but all the concept exist
    

.. figure:: images/setting_dynatree4.png
    :align: center

    A one2many to dynatrees are added on ``ir.actions.act_window`` model.

.. warning:: The capability to add ``search`` view but not tested


A hook method can be added on the model to make a specif action. For exemple 
the budget ``analytic.budget`` is linked on a period

.. figure:: images/tree_dynatree9.png
    :align: center

    The period is a many2one to ``account.fiscalyear``

.. figure:: images/tree_dynatree10.png
    :align: center

    The first node are the périod and the second the budget, period and buget 
    are not arborescent

.. figure:: images/tree_dynatree11.png
    :align: center

    The setting of the dynatree are the same then genral account dynatree

.. figure:: images/tree_dynatree12.png
    :align: center

    We use a hook method to return all the node, without leazy mode.

The existing hook method are:

* tree_dyntaree_get_context: to define a specific context in function of 
  dynatree
* tree_dyntaree_get_domain: to define a specific domain in function od dynatree
* tree_dynatree_get_rows: to return the model line of the actions, it is a 
  read by default
