# -*- coding: utf-8 -*-
import openerp.addons.web.http as openerpweb


class DynatreeController(openerpweb.Controller):

    _cp_path = '/web/dynatree'

    def _get_children_none(self, model, domain, child_field, checkbox_field):
        return [{
            'title': '',
            'oerp_model': model,
            'oerp_id': None,
            'isFolder': True,
            'isLazy': True,
            'hideCheckbox': True,
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

    def _get_first_activate_node(self, obj, model, init_domain, child_field,
                                 context):
        obj_ids = obj.search(init_domain, context=context)
        return self._get_children_node(obj, model, obj_ids, [],
                                       child_field, None, False, context)

    def _get_next_activate_node(self, obj, model, oerp_id, child_field,
                                 context):
        obj_ids = obj.read(oerp_id, [child_field], context=context)[child_field]
        return self._get_children_node(obj, model, obj_ids, [],
                                       child_field, None, False, context)

    def _get_children(self, obj, model, oerp_id, init_domain, child_field,
                      checkbox_field, use_checkbox, init, context):
        if not use_checkbox:
            if init:
                return self._get_children_none(model, init_domain,
                                               child_field, checkbox_field)
            elif not oerp_id:
                return self._get_first_activate_node(
                    obj, model, init_domain, child_field, context)
            else:
                return self._get_next_activate_node(
                    obj, model, oerp_id, child_field, context)

        return self._get_children_none(model, init_domain,
                                               child_field, checkbox_field)

    @openerpweb.jsonrequest
    def get_children(self, request, model=None, oerp_id=None, init_domain=[],
               child_field='child_ids', checkbox_field=None,
               use_checkbox=False, init=False, context=None):
        obj = request.session.model(model)
        return self._get_children(obj, model, oerp_id, init_domain,
                                  child_field, checkbox_field,
                                  use_checkbox, init, context)

