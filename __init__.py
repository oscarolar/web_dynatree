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
        return session.model('res.users').read([session._uid])[0]['name']


    @openerpweb.jsonrequest
    def expand(self, request, node_id=1):
        model = request.session.model('pos.category')
        child_ids = model.read([node_id])[0]['child_id']
        if not child_ids:
            return []

        children = model.read(child_ids)
        return [ dict(title=child['name'],
                      oerp_id=child['id'],
                      isFolder=bool(child['child_id']),
                      isLazy=bool(child['child_id']),
                      )
                 for child in children]
