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
    def expand(self, request, node_id=None):
        """Return the list of direct children of the current node.

        If node_id is None, the records that have no parents are returned."""

        model = request.session.model('pos.category')

        if node_id is None:
            child_ids = model.search([('parent_id', '=', False)])
        else:
            child_ids = model.read([node_id])[0]['child_id']

        return self.nodes_as_json(model, child_ids)

    def nodes_as_json(self, model, ids):
        """Return Dynatree JSON representation from an id list.

        TODO: stop hardcoding at least 'child_id' and 'name' fields.
        """

        if not ids:
            return []

        record = model.read(ids)
        return [ dict(title=child['name'],
                      oerp_id=child['id'],
                      isFolder=bool(child['child_id']),
                      isLazy=bool(child['child_id']),
                      )
                 for child in record]

