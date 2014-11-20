if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.controller('UserCtrl', function($scope, $rootScope, $location, ForkableAPI) {
	console.log('in UserCtrl', g_view, g_user);

	// bind initial state from document
	$scope.id = g_view.id || '';
	$scope.user = g_view.user || {};
	$scope.docs = (g_view.docs || []).reverse();

});
