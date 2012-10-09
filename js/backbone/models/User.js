User = Backbone.Model.extend({
	defaults: {
		name: null,
		pass: null,
		authorized: false,
		prefs: {}
	},
	initialize: function() {
		this.on(User.events.AUTH_CHECK_COMPLETE, this.onAuthCheckComplete);

		if (localStorage.name && localStorage.pass) {
			this.fetch();
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
				model.id = 1;
			case 'update':
				localStorage.setItem('name', model.get('name'));
				localStorage.setItem('pass', model.get('pass'));
				localStorage.setItem('prefs', JSON.stringify(model.get('prefs')));
				break;
			case 'delete':
				this.destroy();
				model.id = 0;
				break;
			default:
				Backbone.sync(method, model, options);
		}
	},
	destroy: function() {
		localStorage.clear();
	},
	fetch: function() {
		this.set({
			'prefs': JSON.parse(localStorage.getItem('prefs')) || {}
		});
	},
	setPref: function(key, value) {
		this.get('prefs')[key] = value;
		this.save();
	},
	getPref: function(key, defaultValue) {
		defaultValue = defaultValue || null;
		return this.get('prefs')[key] ? this.get('prefs')[key] : defaultValue;
	}
});

User.events = {
	'AUTH_CHECK_COMPLETE': 'authCheckComplete'
};
User.prefs = {
	'LAST_MEDIA_FOLDER': 'lastMediaFolder'
};