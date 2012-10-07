User = Backbone.Model.extend({
	defaults: {
		name: null,
		pass: null,
		authorized: false
	},
	initialize: function() {
		this.on(User.events.AUTH_CHECK_COMPLETE, this.onAuthCheckComplete);

		if (localStorage.name && localStorage.pass) {
			this.checkAuth(localStorage.name, localStorage.pass);
		}
	},
	checkAuth: function(name, pass) {
		this.set({
			name: name,
			pass: pass
		});
		subsonic.authorize(this);
	},
	onAuthCheckComplete: function(authorized) {
		this.set({ authorized: authorized });
	},
	sync: function(method, model, options) {
		switch (method) {
			case 'create':
			case 'update':
				localStorage.setItem('name', model.get('name'));
				localStorage.setItem('pass', model.get('pass'));
				model.id = 1;
				break;
			case 'delete':
				localStorage.clear();
				model.id = 0;
				break;
			default:
				Backbone.sync(method, model, options);
		}
	},
	destroy: function() {
		localStorage.clear();
	}
});

User.events = {
	'AUTH_CHECK_COMPLETE': 'authCheckComplete',
}