{
    "name": "Dynatree selectors",
    "category": "Hidden",
    "description":
        """
        """,
    "version": "0.1",
    "depends": [
        'web',
    ],
    "js": [
        "static/lib/js/jquery.cookie.js",
        "static/lib/js/jquery.dynatree.min.js",
        "static/src/js/web_dynatree.js",
    ],
    "css": [
        "static/lib/css/*.css",
        "static/src/css/*.css",
    ],
    'qweb': [
        "static/src/xml/web_dynatree.xml",
    ],
    'auto_install': True,
    'web_preload': True,
}
