try:
    import openerp.addons.web.http as openerpweb
except ImportError:
    import web.common.http as openerpweb  # noqa


class PocController(openerpweb.Controller):

    _cp_path = '/web/dynatree'

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
    def expand(self, request, model=None, node_id=None,
               child_field='child_id'):
        """Return the list of direct children of the current node.

        If node_id is None, the records that have no parents are returned.
        model is a kw argument for the sake of expliciteness,
        but it's required.
        """

        if model is None:
            raise RuntimeError("Model must be specified")
        model = request.session.model(model)

        if node_id is None:
            child_ids = model.search([('parent_id', '=', False)])
        else:
            child_ids = model.read([node_id])[0][child_field]

        return self.dynatree_nodes(model, child_ids, child_field=child_field)

    def dynatree_nodes(self, model, ids, title_field='name',
                       child_field=None):
        """Return Dynatree nodes representation from a list of ids.
        """

        if not ids:
            return []

        if child_field is None:
            child_field = 'child_id'  # front JS will always pass None

        records = model.read(ids, (title_field, child_field))
        has_children = lambda record: bool(record[child_field])

        return [dict(title=record[title_field],
                     oerp_id=record['id'],
                     isFolder=has_children(record),
                     isLazy=has_children(record),
                     )
                for record in records]
