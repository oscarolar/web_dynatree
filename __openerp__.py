{
    "name": "Dynatree selectors",
    "category": "Hidden",
    "description":
        """
        Provide jquery.dynatree selectors for hierarchical data,
        such as products categories.
        """,
    "version": "0.1",
    "depends": ['web'],
    "js": ["static/lib/js/jquery.cookie.js",
           "static/lib/js/jquery.dynatree.min.js",
           "static/src/js/*.js",
           ],
    "css": ["static/lib/css/*.css",
            "static/src/css/*.css",
            ],
    'qweb': ["static/src/xml/*.xml",
             ],
    'auto_install': True,
    'web_preload': True,
}
