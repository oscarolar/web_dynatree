# -*- coding: utf-8 -*-
import openerp.addons.web.http as openerpweb


class DynatreeController(openerpweb.Controller):

    _cp_path = '/web/dynatree'


    @openerpweb.jsonrequest
    def expand(self, request, model=None, oerp_id=None, init_domain=[],
               child_field='child_ids', checkbox_field=None,
               use_checkbox=False, context=None):
        obj = request.session.model(model)
        domain = []
        obj_ids = obj.search(domain, context=context)

