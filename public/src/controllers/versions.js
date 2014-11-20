if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.controller('VersionsCtrl', function($scope, $rootScope, $location, ForkableAPI) {
	console.log('in VersionsCtrl', g_view, g_user);

	// bind initial state from document
	$scope.doc = g_view.data || '';
	$scope.originaldoc = $scope.doc;
	$scope.docid = g_view.id || '';
	$scope.versions = g_view.versions || '';
	$scope.docowner = g_view.owner || '';

});
