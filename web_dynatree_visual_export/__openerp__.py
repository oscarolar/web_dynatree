{
    'name': 'Web dynatree global export',
    'version': '0.0.1',
    'sequence': 150,
    'category': 'Anybox',
    'description': """
    """,
    'author': 'Anybox',
    'website': 'http://anybox.fr',
    'depends': [
        'base',
        'visual_export',
        'web_dynatree',
    ],
    'js': [
        'static/src/js/tree_dynatree.js',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'AGPL-3',
}
