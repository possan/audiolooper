if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.factory('ForkableAPI', function($http) {
	return {
		fork: function(data, origin, callback) {
			console.log('posting data', data, origin);
			jQuery.ajax({
				type: 'POST',
				url: '/api/doc',
				data: { data: data, origin: origin },
				dataType: 'text',
				success: function(r) {
	            	console.log('fork returned', r);
					callback(JSON.parse(r));
				}
			});
		},
		save: function(id, data, callback) {
			jQuery.ajax({
				type: 'POST',
				url: '/api/doc/' + id,
				data: { data: data },
				dataType: 'text',
				success: function(r) {
	            	console.log('save returned', r);
					callback(JSON.parse(r));
				}
			});
		}
	};
});
