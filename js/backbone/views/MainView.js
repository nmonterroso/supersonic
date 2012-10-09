MainView = Backbone.View.extend({
	template: null,
	initialize: function() {
		this.on('select', this.onSelected);
		new TemplateLoader({
			listItem: {
				url: '/template/mediaBrowserItem.html',
				type: MediaBrowserItemView
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
		this.getMediaFolder(user.getPref(User.prefs.LAST_MEDIA_FOLDER), MainView.fetchMethods.INDEXES, 0);
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
	getMediaFolder: function(id, method, listId) {
		if (id === null) {
			return;
		}

		listId = parseInt(listId);
		var apiParams = {},
			iterator = function(response) {
				console.log('unhandled response for', response);
				return [];
			};
		switch (method) {
			case MainView.fetchMethods.INDEXES:
				apiParams = {
					musicFolderId: id
				};
				iterator = function(response) {
					var items = [];
					for (var i in response.indexes.index) {
						var index = response.indexes.index[i];
						var children = index.artist;

						if (!_.isArray(index.artist)) {
							children = [index.artist];
						}

						for (var j in children) {
							child = children[j];
							items.push({
								id: child.id,
								display: child.name,
								isDir: true,
								showControls: false
							});
						}
					}

					return items;
				};
				break;
			case MainView.fetchMethods.DIRECTORY:
				apiParams = {
					id: id
				};
				iterator = function(response) {
					var items = [];
					if (!_.isArray(response.directory.child)) {
						response.directory.child = [response.directory.child];
					}
					for (var i in response.directory.child) {
						var child = response.directory.child[i];

						items.push({
							id: child.id,
							display: child.title || child.album || child.artist,
							isDir: child.isDir,
							showControls: true
						});
					}

					return items;
				};
				break;
		}
		var busyIndicator = $('.busy', $('#mediaFolderContainer')).show();
		subsonic.api(method, function(response, passthru) {
			busyIndicator.hide();
			var list =
				$("<ol id='mediaFolderList"+listId+"' class='mediaFolderList'>")
					.insertBefore(busyIndicator);
			var items = iterator(response);
			for (var i in items) {
				var item = items[i];
				list.append(passthru.view.getListItemMarkup(list, item));
			}
			list.selectable({
				stop: function() {
					var listId = parseInt($(this).attr('id').split('mediaFolderList')[1]);
					var selected = $('.ui-selected:eq(0)', this);
					var nextListId = listId + 1;
					var id = selected.attr('data-id');
					var isDir = selected.attr('data-dir') == 'true';

					$('.ui-selected:gt(0)', this).removeClass('ui-selected');

					if (isDir) {
						passthru.view.getMediaFolder(id, MainView.fetchMethods.DIRECTORY, nextListId);
						if (listId >= 1) {
							passthru.view.scrollTo(-($('#mediaFolderList'+(listId - 1)).position().left));
						}
					} else {
						selected.removeClass('ui-selected');
					}
				}
			});
		}, apiParams, {
			view: this
		});
	},
	onTopLevelMediaFolderSelect: function(event) {
		var index = $('#mediaFolder').val();
		user.setPref(User.prefs.LAST_MEDIA_FOLDER, index);
		$('.mediaFolderList', this.$el).remove();
		this.scrollTo(0);
		this.getMediaFolder(index, MainView.fetchMethods.INDEXES, 0);
	},
	getListItemMarkup: function(container, item) {
		return new this.template.type({
			html: this.template.html,
			el: container,
			item: item
		});
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

MainView.fetchMethods = {
	'INDEXES': 'getIndexes',
	'DIRECTORY': 'getMusicDirectory'
};