LoginView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},
	render: function() {
		var template = _.template(this.options.html, {});
		$(this.el).html(template);

		if (user.get('name')) {
			$(this.el).find('#loginName').val(user.get('name'));
		}

		if (user.get('pass')) {
			$(this.el).find('#loginPass').val(user.get('pass'));
		}
	},
	events: {
		'submit #loginForm': 'onLogin'
	},
	onLogin: function(event) {
		var username = $('#loginName').val();
		var password = $('#loginPass').val();
		var onComplete = function(authorized) {
			user.off(User.events.AUTH_CHECK_COMPLETE, onComplete);
			if (authorized) {
				if ($('#loginRemember').is(':checked')) {
					user.save();
				} else {
					user.destroy();
				}
			}
		};

		user.on(User.events.AUTH_CHECK_COMPLETE, onComplete);
		user.checkAuth(username, password);
		event.preventDefault();
	}
});