MediaBrowserListItemView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		var item = this.options.item;
		var img = {
			src: subsonic.stream(item.id, null, 'getCoverArt'),
			class: ''
		};
		var div = {
			class: ''
		};

		if (!item.isDir) {
			img.class = 'hidden';
			img.src = '';
			div.class = 'leaf'
		} else if (!item.canPlay) {
			img.src = '/images/folder.png';
			img.class = 'smallImage';
		}

		var params = {
			id: item.id,
			isDir: item.isDir,
			displayName: item.display,
			img: img
		}

		var template = _.template(this.options.html, params);
		this.$el.append(template);
	}
});