MediaBrowserListItemView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		var item = this.options.item;
		var params = {
			id: item.id,
			isDir: item.isDir,
			displayName: item.display
		}

		var template = _.template(this.options.html, params);
		this.$el.append(template);
	}
});