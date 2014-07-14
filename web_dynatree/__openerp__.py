{
    'name': 'Dynatree selectors',
    'category': 'Hidden',
    'description': '''
Dynatree
========

Add Dynatree Jquerie to add:

* m2o_dynatree: Widget to display a many2one by a dynatree
* tree_dynatree: New Type of view to replace the select by One or More
                dynatree(s). The setting of the dynatree are on a
                one2many on the ir.actions.act_window
''',
    'version': '0.1',
    'depends': [
        'web',
        'base',
        'base_setup',
    ],
    'data': [
        'security/ir.model.access.csv',
        'base.xml',
        'views/web_dynatree_assets.xml',
    ],
    'js': [
     ],
     'css': [
     ],
    'qweb': [
        'static/src/xml/web_dynatree.xml',
    ],
    'auto_install': True,
    'web_preload': True,
}
