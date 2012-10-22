import simplejson
try:
    import openerp.addons.web.common.http as openerpweb
except ImportError:
    import web.common.http as openerpweb

class PocController(openerpweb.Controller):

    _cp_path = '/poc'

    @openerpweb.httprequest
    def hello(self, request):
        return 'Hello, client\n'

    @openerpweb.jsonrequest
    def whoami(self, request):
        """Return the name of the current user."""
        # auth has to be refreshed client side before
        # (can be done calling needed request.session.authenticate)
        # but there are shortcuts in json_rpc calls (see core.js)
        # that *probably* make this more or less automatic
        session = request.session
        return session.model('res.users').read([session._uid])['name']
