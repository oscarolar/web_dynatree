# -*- coding: utf-8 -*-
import openerp.addons.web.http as openerpweb
from openerp.tools.translate import _
from openerp.tools.safe_eval import safe_eval


class DynatreeController(openerpweb.Controller):

    _cp_path = '/web/dynatree'

    def _get_children_none(self, model, first_node_domain, domain,
                           child_field, checkbox_field):
        return [{
            'title': '',
            'oerp_model': model,
            'oerp_id': None,
            'isFolder': True,
            'isLazy': True,
            'hideCheckbox': True,
            'oerp_first_node_domain': first_node_domain,
            'oerp_domain': domain,
            'oerp_child_field': child_field,
            'oerp_checkbox_field': checkbox_field,
        }]

    def _get_children_node(self, obj, model, oerp_ids, domain,
                           child_field, checkbox_field, use_checkbox, context):
        fields = [child_field]
        if checkbox_field:
            fields.append(checkbox_field)
        reads = {}
        obj_reads = obj.read(oerp_ids, fields, context=context)
        if obj_reads and obj_reads[0].get(child_field, None) is None:
            return [_('No child fields valid')]
        for r in obj_reads:
            reads[r['id']] = {
                'has_children': bool(r[child_field]),
                'hideCheckbox': True,
            }
            if checkbox_field:
                reads[r['id']]['hideCheckbox'] = bool(r[checkbox_field])

        nodes = []
        for id, title in obj.name_get(oerp_ids, context=context):
            nodes.append({
                'title': title,
                'oerp_model': model,
                'oerp_id': id,
                'isFolder': reads[id]['has_children'],
                'isLazy': reads[id]['has_children'],
                'hideCheckbox': reads[id]['hideCheckbox'],
                'oerp_domain': domain,
                'oerp_child_field': child_field,
                'oerp_checkbox_field': checkbox_field,
            })

        return nodes

    def _get_oerp_ids(self, obj, oerp_id, first_node_domain, domain,
                      child_field, context):
        search_domain = []
        if oerp_id:
            obj_ids = obj.read(
                oerp_id, [child_field], context=context)[child_field]
            search_domain.append(('id', 'in', obj_ids))
        else:
            # case for the first node
            if isinstance(first_node_domain, str):
                first_node_domain = safe_eval(first_node_domain)
            search_domain.extend(first_node_domain)
        if isinstance(domain, str):
            domain = safe_eval(domain)
        search_domain.extend(domain)
        return obj.search(search_domain, context=context)

    @openerpweb.jsonrequest
    def get_children(self, request, model=None, oerp_id=None,
                     first_node_domain=[], domain=[], child_field='child_ids', checkbox_field=None,
                     use_checkbox=False):
        context = request.context
        obj = request.session.model(model)
        oerp_ids = self._get_oerp_ids(
            obj, oerp_id, first_node_domain, domain, child_field, context)
        return self._get_children_node(
            obj, model, oerp_ids, domain, child_field, checkbox_field,
            use_checkbox, context)

    @openerpweb.jsonrequest
    def get_first_node(self, request, model=None, first_node_domain=[],
                       domain=[], child_field='child_ids', checkbox_field=None,
                       use_checkbox=False):
        context = request.context
        if use_checkbox:
            obj = request.session.model(model)
            oerp_ids = self._get_oerp_ids(
                obj, None, first_node_domain, domain, child_field, context)
            return self._get_children_node(
                obj, model, oerp_ids, domain, child_field, checkbox_field,
                use_checkbox, context)
        else:
            return self._get_children_none(
                model, first_node_domain, domain, child_field, checkbox_field)

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
