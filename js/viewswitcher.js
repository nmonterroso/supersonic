$(document).ready(function() {
	var LOGIN_INDEX = 1;
	var MAIN_INDEX = 2;

	var view = $('#container').tabs();
	var onTemplatesLoaded = function(templateList) {
		$.each(templateList, function(name, data) {
			new data.type({
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
		var index = authorized ? MAIN_INDEX : LOGIN_INDEX;
		view.tabs('select', index);
	});

	if (!user.get('name')) {
		view.tabs('select', LOGIN_INDEX);
	}
});