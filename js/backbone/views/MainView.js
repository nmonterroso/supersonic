MainView = Backbone.View.extend({
	template: null,
	initialize: function() {
		this.on('select', this.onSelected);
		new TemplateLoader({
			listItem: {
				url: '/template/mediaBrowserItem.html',
				type: MediaBrowserListItemView
			}
		}, function(templates) {
			this.template = templates.listItem;
			this.render();
		}).work(this);
	},
	render: function() {
		var template = _.template(this.options.html, {});
		this.$el.html(template);
	},
	events: {
		'change #mediaFolder': 'onTopLevelMediaFolderSelect'
	},
	onSelected: function() {
		if (!user.get('authorized')) {
			return;
		}

		this.getTopLevelMediaFolders();
		this.showMediaFolder(
			user.getPref(User.prefs.LAST_MEDIA_FOLDER),
			MediaBrowserListView.fetchMethods.INDEXES,
			0
		);
	},
	getTopLevelMediaFolders: function() {
		var select =
			$('#mediaFolder')
				.find('option:gt(0)')
				.remove()
			.end();
		subsonic.api('getMusicFolders', function(response) {
			for (var i in response.musicFolders.musicFolder) {
				var folder = response.musicFolders.musicFolder[i];
				select.append("<option value='"+folder.id+"'>"+folder.name+"</option>");
			}

			if (user.getPref(User.prefs.LAST_MEDIA_FOLDER)) {
				select.val(user.getPref(User.prefs.LAST_MEDIA_FOLDER));
			}
		});
	},
	showMediaFolder: function(id, method, listId) {
		if (id == null) {
			return;
		}

		if (listId > 0) {
			var removeLowerBound = listId - 1;
			$('.mediaFolderList:gt('+removeLowerBound+')').remove();
		}

		new MediaBrowserListView({
			id: id,
			method: method,
			listId: listId,
			parent: this,
			itemTemplate: this.template,
			el: $('#mediaFolderContainer')
		});
	},
	onTopLevelMediaFolderSelect: function(event) {
		var index = $('#mediaFolder').val();
		user.setPref(User.prefs.LAST_MEDIA_FOLDER, index);
		$('.mediaFolderList', this.$el).remove();
		this.scrollTo(0);
		this.showMediaFolder(index, MediaBrowserListView.fetchMethods.INDEXES, 0);
	},
	scrollTo: function(left) {
		$('#mediaFolderContainer').animate({
			left: left
		}, 500);
		$.scrollTo($('#mediaFolderViewPort'), {
			duration: 500
		});
	}
});