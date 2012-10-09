var user, subsonic;
$(document).ready(function() {
	subsonic = new Subsonic();
	user = new User();
	_.templateSettings = {
		interpolate: /\$\{(.+?)\}/g
	}
})