# -*- coding: utf-8 -*-
import openerp.addons.web.http as openerpweb
from openerp.tools.translate import _
from openerp.tools.safe_eval import safe_eval
from openerp.pooler import RegistryManager


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
                           child_field, checkbox_field, use_checkbox,
                           selected_oerp_ids, context):
        if selected_oerp_ids is None:
            selected_oerp_ids = []
        fields = [child_field]
        if checkbox_field:
            fields.append(checkbox_field)
        reads = {}
        obj_reads = obj.read(oerp_ids, fields, context=context)
        if obj_reads and obj_reads[0].get(child_field, None) is None:
            return [_('No child fields valid')]

        if use_checkbox and len(oerp_ids) == 1 and checkbox_field:
            if bool(obj_reads[0][checkbox_field]):
                if obj_reads[0]['id'] not in selected_oerp_ids:
                    selected_oerp_ids.append(obj_reads[0]['id'])

        for r in obj_reads:
            reads[r['id']] = {
                'has_children': bool(r[child_field]),
                'hideCheckbox': not use_checkbox,
            }
            if checkbox_field:
                reads[r['id']]['hideCheckbox'] = not bool(r[checkbox_field])

        nodes = []
        for id, title in obj.name_get(oerp_ids, context=context):
            nodes.append({
                'title': title,
                'oerp_model': model,
                'oerp_id': id,
                'isFolder': reads[id]['has_children'],
                'isLazy': reads[id]['has_children'],
                'hideCheckbox': reads[id]['hideCheckbox'],
                'select': id in selected_oerp_ids,
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
                     first_node_domain=[], domain=[], child_field='child_ids',
                     checkbox_field=None, use_checkbox=False,
                     selected_oerp_ids=None):
        context = request.context
        obj = request.session.model(model)
        registry = RegistryManager.get(request.session._db)
        if hasattr(registry.get(model), 'dynatree_get_node'):
            return obj.dynatree_get_node(
                model=model, oerp_id=oerp_id,
                first_node_domain=first_node_domain, domain=domain,
                child_field=child_field, checkbox_field=checkbox_field,
                use_checkbox=use_checkbox, selected_oerp_ids=selected_oerp_ids,
                context=context)

        oerp_ids = self._get_oerp_ids(
            obj, oerp_id, first_node_domain, domain, child_field, context)
        return self._get_children_node(
            obj, model, oerp_ids, domain, child_field, checkbox_field,
            use_checkbox, selected_oerp_ids, context)

    @openerpweb.jsonrequest
    def get_first_node(self, request, model=None, first_node_domain=[],
                       domain=[], child_field='child_ids', checkbox_field=None,
                       use_checkbox=False, selected_oerp_ids=None):
        context = request.context
        obj = request.session.model(model)
        registry = RegistryManager.get(request.session._db)
        if hasattr(registry.get(model), 'dynatree_get_first_node'):
            return obj.dynatree_get_first_node(
                model=model, first_node_domain=first_node_domain,
                domain=domain, child_field=child_field,
                checkbox_field=checkbox_field, use_checkbox=use_checkbox,
                selected_oerp_ids=selected_oerp_ids, context=context)
        if use_checkbox:
            oerp_ids = self._get_oerp_ids(
                obj, None, first_node_domain, domain, child_field, context)
            return self._get_children_node(
                obj, model, oerp_ids, domain, child_field, checkbox_field,
                use_checkbox, selected_oerp_ids, context)
        return self._get_children_none(
            model, first_node_domain, domain, child_field, checkbox_field)


class TreeDynatree(openerpweb.Controller):

    _cp_path = '/web/dynatree/tree'

    def get_context(self, request, obj, dynatrees, context=None):
        registry = RegistryManager.get(request.session._db)
        if hasattr(registry.get(obj.model), 'tree_dynatree_get_context'):
            return obj.tree_dynatree_get_context(dynatrees, context=context)
        if context is None:
            context = {}

        ctx = context.copy()
        dynatree = request.session.model('ir.actions.act_window.dynatree')
        for d in dynatree.read(dynatrees.keys(),
                               ['type', 'search_field'],
                               context=context):
            if d['type'] == 'context':
                ctx.update({d['search_field']: dynatrees[d['id']]})
        return ctx

    def get_domain(self, request, obj, domain, dynatrees, context=None):
        if domain is None:
            domain = []
        registry = RegistryManager.get(request.session._db)
        if hasattr(registry.get(obj.model), 'tree_dynatree_get_domain'):
            return obj.tree_dynatree_get_domain(
                domain, dynatrees, context=context)
        dynatree = request.session.model('ir.actions.act_window.dynatree')
        for d in dynatree.read(dynatrees.keys(),
                               ['type', 'search_field', 'search_operator'],
                               context=context):
            if d['type'] == 'domain':
                domain.append((d['search_field'], d['search_operator'],
                               dynatrees[d['id']]))
        return domain

    @openerpweb.jsonrequest
    def get_rows(self, request, model=None, parent_id=None, fields=None,
                 child_field=None, domain=None, dynatrees=None):
        obj = request.session.model(model)

        for k, v in dynatrees.items():
            # k is str or ID is numeric
            del dynatrees[k]
            dynatrees[int(k)] = v

        context = self.get_context(request, obj, dynatrees, request.context)
        registry = RegistryManager.get(request.session._db)
        if hasattr(registry.get(model), 'tree_dynatree_get_rows'):
            return obj.tree_dynatree_get_rows(
                parent_id=parent_id, fields=fields, child_field=child_field,
                domain=domain, dynatrees=dynatrees, context=context)

        if parent_id:
            child_ids = obj.read(
                parent_id, [child_field], context=context)[child_field]
        else:
            domain = self.get_domain(
                request, obj, domain, dynatrees, context=context)
            child_ids = obj.search(domain, context=context)

        return obj.read(child_ids, fields + [child_field], context=context)

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
