openerp.web_dynatree.m2m_widget = function (instance) {
    instance.web.form.widgets.add('m2m_dynatree', 
            'instance.web.form.M2M_Dynatree');

    instance.web.form.M2M_Dynatree = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {
        template: 'M2M_Dynatree',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            child_field = this.node.attrs.child_field || 'child_ids';
            checkbox_field = this.node.attrs.checkbox_field || '';
            first_node_domain = this.node.attrs.first_node_domain || [];
            this.selectmode = this.node.attrs.selectmode || 'multi';
            domain = this.node.attrs.domain || this.field.domain || [];
            this.configuration = {
                model: this.field.relation,
                child_field: child_field,
                checkbox_field: checkbox_field,
                domain: domain,
                first_node_domain: first_node_domain,
            }
            this.set({'value': []});
            console.log('INIT        ');
            this.no_rerender = true;
        },
        render_value: function() {
            console.log('render : ' + this.get('value'));
            this._dynatree = new instance.web.Dynatree(
                this.id_for_label,
                this.configuration,
                context=this.session.user_context,
                use_checkbox=true,
                selectMode=this.selectmode,
                selected_oerp_ids = this.get('value')
            );
            this._dynatree.add_callback_onSelect(this, 
                    this.dynatree_onSelect);
        },
        set_value: function(value_) {
            value_ = value_ || [];
            if (value_.length >= 1 && value_[0] instanceof Array) {
                value_ = value_[0][2];
            }
            this._super(value_);
        },
        dynatree_onSelect: function (self, object, selected_oerp_ids){
            self.set_value(selected_oerp_ids);
        },
    });
};
