$(document).ready(function() {
	var views = {
		main: {
			index: 2,
			name: 'main'
		},
		login: {
			index: 1,
			name: 'login'
		}
	};

	var tabs = $('#container').tabs({
		show: function(event, ui) {
			$.each(views, function(name, data) {
				if (views[name].view && data.index == ui.index) {
					views[name].view.trigger('select');
				}
			});
		}
	});
	var onTemplatesLoaded = function(templateList) {
		$.each(templateList, function(name, data) {
			views[name].view = new data.type({
				html: data.html,
				el: $(data.el)
			});
		});
	};

	new TemplateLoader({
		main: {
			'url': '/template/main.html',
			'el': '#mainView',
			'type': MainView
		},
		login: {
			url: '/template/login.html',
			el: '#loginView',
			type: LoginView
		}
	}, onTemplatesLoaded).work();


	user.on(User.events.AUTH_CHECK_COMPLETE, function(authorized) {
		var index = authorized ? views.main.index : views.login.index;
		tabs.tabs('select', index);
	});

	if (!user.get('name')) {
		tabs.tabs('select', views.login.index);
	}
});