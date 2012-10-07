var TemplateLoader = function(templateList, onComplete) {
	var numTemplatesLoaded = 0;
	var numTemplatesRequired = 0;

	for (var name in templateList) {
		++numTemplatesRequired;
	}

	this.getTemplateData = function() {
		return templateList;
	};

	this.work = function() {
		$.each(templateList, function(templateName, data) {
			$.ajax({
				url: data.url,
				success: function(html, status, xhr) {
					templateList[templateName].html = html;

					if (++numTemplatesLoaded == numTemplatesRequired) {
						onComplete(templateList);
					}
				}
			});
		});
	};
};