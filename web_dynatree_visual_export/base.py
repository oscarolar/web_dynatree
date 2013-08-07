# -*- coding: utf-8 -*-

from openerp.osv import osv
from openerp.addons.web_dynatree.base import VIEW_TYPE


class IrUiView(osv.Model):
    _inherit = 'ir.ui.view'

    def get_export_header(self, cr, uid, doc, obj, **kwargs):
        if hasattr(obj, 'get_export_header'):
            return obj.get_export_header(cr, uid, doc, **kwargs)
        cellfilled = []
        if kwargs.get('view_type') == VIEW_TYPE[0]:
            for header in kwargs.get('headers'):
                row = doc.AddRow()
                for c in header:
                    nextcell = (row.number, row.nextcell)
                    while nextcell in cellfilled:
                        cellfilled.remove(nextcell)
                        row.AddStringCell('')
                        nextcell = (row.number, row.nextcell)
                    cell = row.AddStringCell(unicode(c['string']),
                                             rowspan=c['rowspan'],
                                             colspan=c['colspan'])
                    if c['rowspan'] > 1:
                        for rowspan in range(c['rowspan'] - 1):
                            cellfilled.append(
                                (row.number + rowspan + 1, cell.number))
        else:
            super(IrUiView, self).get_export_header(cr, uid, doc, obj, **kwargs)

    def get_export_criteria(self, cr, uid, doc, obj, fields_get, **kwargs):
        super(IrUiView, self).get_export_criteria(
            cr, uid, doc, obj, fields_get, **kwargs)
        if kwargs.get('view_type') == VIEW_TYPE[0]:
            doc.AddRow()
            dynatrees = kwargs.get('other_filter', {})
            context = kwargs.get('context', {}).copy()
            for k, v in dynatrees.items():
                # k is str or ID is numeric
                del dynatrees[k]
                dynatrees[int(k)] = v

            number_column = len(kwargs.get('fields'))
            row = doc.AddRow()
            row.AddStringCell('Dynatrees', colspan=number_column)
            dynatree = self.pool.get('ir.actions.act_window.dynatree')
            for d in dynatree.read(cr, uid, dynatrees.keys(),
                                   ['name', 'search_operator', 'model_id'],
                                   load='_classic_write', context=context):
                model = self.pool.get('ir.model').read(
                    cr, uid, d['model_id'], ['model'], context=context)['model']
                model = self.pool.get(model)
                for v in model.name_get(cr, uid, dynatrees[d['id']], context=context):
                    row = doc.AddRow()
                    val = '%s %s %s' % (d['name'], d['search_operator'], v[1])
                    row.AddStringCell(val, colspan=number_column)

    def get_export_tree_rows(self, cr, uid, doc, obj, fields_get, **kwargs):
        if hasattr(obj, 'get_export_tree_rows'):
            return obj.get_export_tree_rows(cr, uid, doc, obj, **kwargs)
        elif kwargs.get('view_type') == VIEW_TYPE[0]:
            dynatrees = kwargs.get('other_filter', {})
            for k, v in dynatrees.items():
                # k is str or ID is numeric
                del dynatrees[k]
                dynatrees[int(k)] = v
            child_field = kwargs['child_field']
            fields = [] + kwargs.get('fields')

            def get_context(context=None):
                if hasattr(obj, 'tree_dynatree_get_context'):
                    return obj.tree_dynatree_get_context(
                        cr, uid, dynatrees, context=context)
                if context is None:
                    context = {}

                ctx = context.copy()
                dynatree = self.pool.get('ir.actions.act_window.dynatree')
                for d in dynatree.read(cr, uid, dynatrees.keys(),
                                       ['type', 'search_field'],
                                       context=context):
                    if d['type'] == 'context':
                        ctx.update({d['search_field']: dynatrees[d['id']]})
                return ctx

            def get_domain(domain, context=None):
                if domain is None:
                    domain = []
                if hasattr(obj, 'tree_dynatree_get_domain'):
                    return obj.tree_dynatree_get_domain(
                        cr, uid, domain, dynatrees, context=context)
                dynatree = self.pool.get('ir.actions.act_window.dynatree')
                for d in dynatree.read(cr, uid, dynatrees.keys(),
                                       ['type', 'search_field', 'search_operator'],
                                       context=context):
                    if d['type'] == 'domain':
                        domain.append((d['search_field'], d['search_operator'],
                                       dynatrees[d['id']]))
                return domain

            def get_row(parent_id, domain, context, level):
                if hasattr(obj, 'tree_dynatree_get_rows'):
                    reads = obj.tree_dynatree_get_rows(
                        cr, uid, parent_id=parent_id, fields=fields, child_field=child_field,
                        domain=domain, dynatrees=dynatrees, context=context)
                else:
                    if parent_id is None:
                        child_ids = obj.search(cr, uid, domain, context=context)
                    else:
                        child_ids = obj.read(cr, uid, parent_id, [child_field],
                                             context=context)[child_field]

                    reads = obj.read(cr, uid, child_ids, fields + [child_field],
                                     context=context)

                for r in reads:
                    row = doc.AddRow()
                    for c in fields:
                        if c == fields[0] and r[child_field]:
                            val = " - " * level + '> ' + unicode(r[c])
                            row.AddStringCell(val)
                        elif c == fields[0]:
                            val = " - " * level + unicode(r[c])
                            row.AddStringCell(val)
                        else:
                            self.get_export_row_add_field(
                                cr, uid, obj, row, r[c], fields_get, c,
                                context=context)

                    if r[child_field]:
                        get_row(r['id'], domain, context, level + 1)

            context = get_context(context=kwargs.get('context', {}))
            domain = get_domain(kwargs.get('domain', []), context=context)
            get_row(None, domain, context, 0)
            doc.AddRow()
            doc.AddRow()
            return kwargs['domain']
        else:
            return super(IrUiView, self).get_export_tree_rows(
                cr, uid, doc, obj, fields_get, **kwargs)

# vim:expandtab:smartindent:tabst p=4:softtabstop=4:shiftwidth=4:
