if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.controller('LoginStatusCtrl', function($scope, $rootScope, $location, ForkableAPI) {
	console.log('in LoginStatusCtrl', g_view, g_user);

	$rootScope.currentuserid = g_user.id || '';
	$rootScope.currentusername = g_user.username || '';
	$rootScope.currentuseravatar = g_user.avatar || '';

	$scope.login = function() {
		console.log('start login');
		if ($rootScope.isDirty && $rootScope.isDirty()) {
			// store data temporarily if changes are made, then do ?rescue
			// window.location = '/login?forward=' + encodeURIComponent('/?rescue');
			window.location = '/login?forward=' + encodeURIComponent('/?recover');
		} else {
			window.location = '/login?forward=' + encodeURIComponent('/');
		}
	}

	$scope.logout = function() {
		console.log('logout');
		if ($rootScope.isDirty && $rootScope.isDirty()) {
			if ($rootScope.confirmSave) $rootScope.confirmSave();
		} else {
			window.location = '/logout';
		}
	}

});
