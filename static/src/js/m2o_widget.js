openerp.web_dynatree.m2o_widget = function (instance) {
    instance.web.form.widgets.add('m2o_dynatree', 
            'instance.web.form.M2O_Dynatree');

    instance.web.form.M2O_Dynatree = instance.web.form.AbstractField.extend(
            instance.web.form.ReinitializeFieldMixin, {
        template: 'M2O_Dynatree',
        init: function(field_manager, node) {
            this._super(field_manager, node);
            this._display_value = {}
            child_field = this.node.attrs.child_field || 'child_ids';
            first_node_domain = this.node.attrs.first_node_domain || [];
            domain = this.node.attrs.domain || this.field.domain || [];
            this.configuration = {
                model: this.field.relation,
                child_field: child_field,
                domain: domain,
                first_node_domain: first_node_domain,
            };
        },
        render_value: function() {
            var self = this;
            if (!this.get('effective_readonly')){
                if (! this._dynatree) {
                    this._dynatree = new instance.web.Dynatree({
                        dynatree_id: self.id_for_label,
                        configuration: self.configuration,
                        context: self.session.user_context,
                        use_checkbox: false,
                        onActivate: function (oerp_id, title){
                            self.internal_set_value(oerp_id);
                            self._display_value[oerp_id] = title;
                            self.render_value();
                        }});
                }
            }else{
                delete this._dynatree;
            }
            if (! this.get("value")) {
                this.display_string("");
                return;
            }
            if (this.get("value")[1]){
                this.display_string(this.get("value")[1]);
            } else {
                this.display_string(this._display_value[this.get('value')]);
            }
        },
        display_string: function(str) {
            var self = this;
            var lines = _.escape(str).split("\n");
            var link = "";
            var follow = "";
            link = lines[0];
            follow = _.rest(lines).join("<br />");
            if (follow)
                link += "<br />";
            var $link = this.$el.find('.oe_form_uri')
                 .unbind('click')
                 .html(link);
            $link.click(function () {
                self.do_action({
                    type: 'ir.actions.act_window',
                    res_model: self.field.relation,
                    res_id: self.get("value")[0],
                    views: [[false, 'form']],
                    target: 'current'
                });
                return false;
             });
            $(".oe_form_m2o_follow", this.$el).html(follow);
        },
    });
};
