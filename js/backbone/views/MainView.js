MainView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template(this.options.html, {});
		$(this.el).html(template);
	}
});