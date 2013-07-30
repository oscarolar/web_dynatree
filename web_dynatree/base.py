# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from openerp.tools.safe_eval import safe_eval
from openerp.tools.translate import _
from openerp.addons.base.ir.ir_actions import VIEW_TYPES
from lxml import etree
from logging import getLogger
from openerp import SUPERUSER_ID


_logger = getLogger(__name__)
VIEW_TYPE = ('tree_dynatree', _('Tree with dynatrees'))
VIEW_TYPES.append(VIEW_TYPE)


def valid_node_group(node):
    res = True
    if node.attrib.get('string', None) is None:
        _logger.error("Attribute 'string' missing in the group")
        res = False

    if not node.getchildren():
        _logger.error('The group must have children')
        res = False

    if not valid_type_tree_dynatrees(node):
        res = False

    return res


def valid_node_field(node, fromgroup=True):
    res = True
    if fromgroup:
        if node.attrib.get('invisible', None) is not None:
            _logger.error("Attribute 'invisible' on the field in one group "
                          "are not allowed")
            res = False
        if node.attrib.get('attrs', None) is not None:
            attrs = safe_eval(node.attrib['attrs'])
            if attrs.get('invisible', None) is not None:
                _logger.error("Attribute 'invisible' in attrs on the field "
                              "in one group are not allowed")
                res = False

    if node.attrib.get('name', None) is None:
        _logger.error("Attribute 'name' missing in the field")
        res = False

    if node.getchildren():
        _logger.error('The field does\'t have children')
        res = False
    return res


def valid_node_button(node):
    res = True
    if node.attrib.get('string', None) is None:
        _logger.error("Attribute 'string' missing in the button")
        res = False

    if node.getchildren():
        _logger.error('The button does\'t have children')
        res = False
    return res


def valid_type_tree_dynatrees(arch, fromgroup=True):
    res = True
    for node in arch.getchildren():
        if node.tag == 'group':
            if not valid_node_group(node):
                res = False
        elif node.tag == 'field':
            if not valid_node_field(node, fromgroup=fromgroup):
                res = False
        elif node.tag == 'button':
            if not valid_node_button(node):
                res = False
        elif node.tag == etree.Comment:
            # It is a comment
            pass
        else:
            _logger.error(
                'the tag %r are not allow in the xml arch' % node.tag)
            res = False
    return res


class IrUiView(osv.Model):
    _inherit = 'ir.ui.view'

    def __init__(self, pool, cr):
        res = super(IrUiView, self).__init__(pool, cr)
        select = [k for k, v in self._columns['type'].selection]
        if VIEW_TYPE[0] not in select:
            self._columns['type'].selection.append(VIEW_TYPE)
        return res

    def _check_xml_tree_dynatrees(self, cr, uid, ids, context=None):
        domain = [
            ('id', 'in', ids),
            ('type', '=', VIEW_TYPE[0]),
        ]
        view_ids = self.search(cr, uid, domain, context=context)
        for view in self.browse(cr, uid, view_ids, context=context):
            fvg = self.pool.get(view.model).fields_view_get(
                cr, uid, view_id=view.id, view_type=view.type, context=context)
            view_arch_utf8 = fvg['arch']
            view_docs = [etree.fromstring(view_arch_utf8)]
            if view_docs[0].tag == 'data':
                view_docs = view_docs[0]
            for view_arch in view_docs:
                if not valid_type_tree_dynatrees(view_arch, fromgroup=False):
                    return False

        return True

    _constraints = [
        (
            _check_xml_tree_dynatrees,
            'Invalide XML for tree_dynatrees view architecture',
            ['arch'],
        ),
    ]


class IrActionsActWindow(osv.Model):
    _inherit = 'ir.actions.act_window'

    _columns = {
        'dynatree_setting_ids': fields.one2many(
            'ir.actions.act_window.dynatree', 'action_id', 'Dynatrees'),
        'has_search_view': fields.boolean('Has search view'),
    }

    _defaults = {
        'has_search_view': lambda *a: False,
    }


class IrActionsActWindowDynatree(osv.Model):
    _name = 'ir.actions.act_window.dynatree'
    _description = 'Dynatree configuration on actions.act_window'

    _columns = {
        'action_id': fields.many2one('ir.actions.act_window', 'Action',
                                     required=True),
        'eval_name': fields.boolean(
            'Eval Label', help="If check, the name is evaluated with 'context'"
            " and 'user'"),
        'name': fields.char('Label', size=64),
        'model_id': fields.many2one('ir.model', 'Model', required=True),
        'type': fields.selection([('context', 'Context'), ('domain', 'Domain')
                                  ], 'Type', required=True),
        'search_field': fields.char(
            'field for search', size=64, required=True),
        'search_operator': fields.selection(
            [('in', 'In'), ('child_of', 'Child of')], 'Operator',
            required=True),
        'child_field_id': fields.many2one('ir.model.fields', 'field: child'),
        'checkbox_field_id': fields.many2one(
            'ir.model.fields', 'field: checkbox'),
        'init_domain': fields.char(
            'Initial domain', size=255, help="Initial domain is evaluate, "
            "you can use context and user local"),
        'selectmode': fields.selection(
            [('single', 'Single'), ('multi', 'Multi'), (
                'multi-hier', 'Multi Hier')], 'SelectMode', required=True),
        'context': fields.char('Context', size=255),
        'default_id': fields.char(
            'Default ID', size=12, help="Default ID is evaluate, you can use "
            "context and user local"),
        'active': fields.boolean(
            'Active', help='if check, this object is always available'),
        'sequence': fields.integer('Sequence',
                                   help='To control display ordering')
    }

    _order = 'sequence'

    _defaults = {
        'init_domain': lambda *a: '[]',
        'selectmode': 'multi',
        'context': '{}',
        'search_operator': 'in',
        'type': 'domain',
        'eval_name': False,
        'active': True,
        'sequence': 0,
    }

    def get_search_domain_fields(self, cr, uid, ids, context=None):
        return self.read(cr, SUPERUSER_ID, ids,
                         ['search_field', 'search_operator'], context=context)

    def get_dynatrees(self, cr, uid, ids, context=None):
        res = []
        user = self.pool.get('res.users').browse(
            cr, uid, uid, context=context)
        if context is None:
            context = {}
        for this in self.browse(cr, uid, ids, context=context):
            ctx = context.copy()
            local = {'context': ctx, 'user': user}
            dctx = safe_eval(this.context, local)
            if dctx:
                ctx.update(dctx)

            name = this.name
            if this.eval_name:
                name = safe_eval(this.name, local)

            init_domain = []
            init_domain = safe_eval(this.init_domain, local)

            default_id = 0
            if this.default_id:
                default_id = safe_eval(this.default_id, local)

            dynatree = {
                'id': this.id,
                'name': name or this.model_id.name,
                'model': this.model_id.model,
                'child_field': this.child_field_id
                and this.child_field_id.name or 'child_ids',
                'checkbox_field': this.checkbox_field_id
                and this.checkbox_field_id.name or False,
                'init_domain': init_domain,
                'selectMode': this.selectmode or 'multi',
                'context': ctx,
                'default_id': default_id,
            }
            res.append(dynatree)
        return res

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
