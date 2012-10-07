var Subsonic = function() {
	var errorHandler = null;
	this.errorHandler = function(handler) {
		errorHandler = handler;
	}

	this.authorize = function(user) {
		this.api('ping.view', function(response) {
			user.trigger(User.events.AUTH_CHECK_COMPLETE, response != null);
		}, { u: user.get('name'), p: user.get('pass') });
	};

	this.api = function(endpoint, callback, params) {
		var data = $.extend({}, defaultParams(), params);
		$.ajax({
			url: settings.url+endpoint,
			type: 'post',
			data: data,
			success: function(obj, stat, xhr) {
				var response = obj['subsonic-response'];
				if (response.status != 'ok') {
					callback(null);

					if (response.error) {
						handleError(response.error);
					} else {
						handleError({
							code: 0, // 0 is generic error in subsonic
							message: 'something broke'
						})
					}
				} else {
					callback(response);
				}
			}
		})
	};

	var handleError = function(error) {
		var handler = errorHandler || function(error) {
			console.log(error);
		};

		handler(error);
	}

	var defaultParams = function() {
		return {
			u: user ? user.get('name') : null,
			p: user ? user.get('pass') : null,
			v: settings.version,
			c: settings.client,
			f: 'json'
		}
	}
};