var Subsonic = function() {
	var errorHandler = null;
	this.errorHandler = function(handler) {
		errorHandler = handler;
	}

	this.authorize = function(user) {
		this.api('ping', function(response) {
			user.trigger(User.events.AUTH_CHECK_COMPLETE, response != null);
		}, { u: user.get('name'), p: user.get('pass') });
	};

	this.api = function(endpoint, callback, params, passthru) {
		var data = $.extend({}, defaultParams(), params);
		passthru = passthru || null;
		$.ajax({
			url: settings.url+endpoint+'.view',
			type: 'post',
			data: data,
			success: function(obj, stat, xhr) {
				var response = obj['subsonic-response'];
				if (response.status != 'ok') {
					callback(null, passthru);

					if (response.error) {
						handleError(response.error);
					} else {
						handleError({
							code: 0, // 0 is generic error in subsonic
							message: 'something broke'
						})
					}
				} else {
					callback(response, passthru);
				}
			}
		})
	};

	this.debug = function(endpoint, params, passthru) {
		this.api(endpoint, function(response) {
			console.log(response);
		}, params, passthru);
	};

	this.stream = function(id, options, endpoint) {
		endpoint = endpoint || 'stream';
		var params = $.extend({ id: id }, defaultParams(), options);
		var baseUrl = settings.url+endpoint+'.view?';

		var queryParams = [];
		for (var key in params) {
			queryParams.push(key+'='+params[key]);
		}

		return baseUrl+queryParams.join('&');
	}

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