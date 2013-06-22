{
    'name': 'Dynatree selectors',
    'category': 'Hidden',
    'description': '''
        ''',
    'version': '0.1',
    'depends': [
        'web',
    ],
    'update_xml': [
        'security/ir.model.access.csv',
        'base.xml',
    ],
    'js': [
        'static/lib/js/jquery.cookie.js',
        'static/lib/js/jquery.dynatree.min.js',
        'static/src/js/boot.js',
        'static/src/js/dynatree.js',
        'static/src/js/m2o_widget.js',
        'static/src/js/m2m_widget.js',
        'static/src/js/tree_view.js',
    ],
    'css': [
        'static/lib/css/*.css',
        'static/src/css/*.css',
    ],
    'qweb': [
        'static/src/xml/web_dynatree.xml',
    ],
    'auto_install': False,
    'web_preload': True,
}
