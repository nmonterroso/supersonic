MediaBrowserListView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		var id = this.options.id;
		var method = this.options.method;
		var listId = parseInt(this.options.listId);
		var passthru = {
			parent: this.options.parent,
			view: this
		};

		var apiParams = {};
		var iterator = function(response) {
			console.log('unhandled response for', response);
			return [];
		};

		switch (method) {
			case MediaBrowserListView.fetchMethods.INDEXES:
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
								canPlay: false
							});
						}
					}

					return items;
				};
				break;
			case MediaBrowserListView.fetchMethods.DIRECTORY:
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
							canPlay: true
						});
					}

					return items;
				};
				break;
		}
		var busyIndicator = $('.busy', this.$el).show();

		subsonic.api(method, function(response, passthru) {
			var list = $("<ol id='mediaFolderList"+listId+"' class='mediaFolderList'></ol>").insertBefore(busyIndicator);
			busyIndicator.hide();
			var items = iterator(response);

			list.selectable({
				stop: function() {
					var listId = parseInt($(this).attr('id').split('mediaFolderList')[1]);
					var selected = $('.ui-selected:eq(0)', this);
					var nextListId = listId + 1;
					var id = selected.attr('data-id');
					var isDir = selected.attr('data-dir') == 'true';

					$('.ui-selected:gt(0)', this).removeClass('ui-selected');

					if (isDir) {
						passthru.parent.showMediaFolder(
							id,
							MediaBrowserListView.fetchMethods.DIRECTORY,
							nextListId
						);

						if (listId >= 1) {
							passthru.parent.scrollTo(-($('#mediaFolderList'+(listId - 1)).position().left));
						}
					} else {
						selected.removeClass('ui-selected');
					}
				}
			});

			for (var i in items) {
				var item = items[i];
				passthru.view.showListItem(list, item);
			}
		}, apiParams, passthru);
	},
	showListItem: function(list, item) {
		new this.options.itemTemplate.type({
			html: this.options.itemTemplate.html,
			el: list,
			item: item
		});
	}
});

MediaBrowserListView.fetchMethods = {
	INDEXES: 'getIndexes',
	DIRECTORY: 'getMusicDirectory'
};