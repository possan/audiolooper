if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.controller('MainCtrl', function($scope, $location, ForkableAPI) {
	console.log('in MainCtrl', g_view, g_user);

	// bind initial state from document
	$scope.doc = g_view.data || '';
	$scope.originaldoc = $scope.doc;
	$scope.docid = g_view.id || '';
	$scope.docver = g_view.version || '';
	$scope.docowner = g_view.owner || '';

	$scope.currentuserid = g_user.id || '';
	$scope.currentusername = g_user.username || '';
	$scope.currentuseravatar = g_user.avatar || '';

	function isDirty() {
		return ($scope.doc != $scope.originaldoc);
	}

	function confirmSave() {
		if ($scope.currentuserid != '') {
			if (confirm('You have unsaved changes, save?') == 1) {
				ForkableAPI.save($scope.doc, function(res) {
					console.log('save result', res);
				});
			} else {
				alert('Ignoring changes.');
			}
		} else {
			alert('You need to log in to save your changes...');
		}
	}

	$scope.login = function() {
		console.log('start login');
		if (isDirty()) {
			// store data temporarily if changes are made, then do ?rescue
			// window.location = '/login?forward=' + encodeURIComponent('/?rescue');
			window.location = '/login?forward=' + encodeURIComponent('/?recover');
		} else {
			window.location = '/login?forward=' + encodeURIComponent('/');
		}
	}

	$scope.logout = function() {
		console.log('logout');
		if (isDirty()) {
			confirmSave();
		} else {
			window.location = '/logout';
		}
	}

	$scope.savedoc = function() {
		console.log('save this document', $scope.doc);
		if ($scope.docid != '') {
			console.log('we have a doc id');
			if ($scope.docowner == $scope.currentuserid) {
				console.log('we are the owner, create new version.');
				ForkableAPI.save($scope.docid, $scope.doc, function(res) {
					console.log('updated doc', res);
					// TODO: just update ui silently.
					if (res.id) {
						location = '/'+res.id+'/'+res.version;
					}
				});
			} else {
				console.log('not owner, fork.')
				ForkableAPI.fork($scope.doc, $scope.docid, function(res) {
					console.log('saved a forked doc', res);
					if (res.id) {
						location = '/'+res.id+'/'+res.version;
					}
				});
			}
		} else {
			if ($scope.currentuserid != '') {
				console.log('saving from a new doc');
				ForkableAPI.fork($scope.doc, $scope.docid, function(res) {
					console.log('saved a new doc', res);
					if (res.id) {
						location = '/'+res.id+'/'+res.version;
					}
				});
			} else {
				alert('You need to log in to save your document.');
			}
		}
	}

	$scope.forkdoc = function() {
		console.log('just fork this document');
		ForkableAPI.fork($scope.doc, $scope.docid, function(res) {
			console.log('saved a new doc', res);
			if (res.id) {
				location = '/'+res.id;
			}
		});
	}

	$scope.newdoc = function() {
		console.log('create new document');
		if (isDirty()) {
			confirmSave();
		} else {
			window.location = '/';
		}
	}

});

g_module.controller('UserCtrl', function($scope, $location, ForkableAPI) {
	console.log('in UserCtrl', g_view, g_user);

	// bind initial state from document
	$scope.id = g_view.id || '';
	$scope.user = g_view.user || {};
	$scope.docs = g_view.docs || [];

	$scope.currentuserid = g_user.id || '';
	$scope.currentusername = g_user.username || '';
	$scope.currentuseravatar = g_user.avatar || '';

	$scope.login = function() {
		console.log('start login');
		if (isDirty()) {
			// store data temporarily if changes are made, then do ?rescue
			// window.location = '/login?forward=' + encodeURIComponent('/?rescue');
			window.location = '/login?forward=' + encodeURIComponent('/?recover');
		} else {
			window.location = '/login?forward=' + encodeURIComponent('/');
		}
	}

	$scope.logout = function() {
		console.log('logout');
		if (isDirty()) {
			confirmSave();
		} else {
			window.location = '/logout';
		}
	}


});

g_module.controller('VersionsCtrl', function($scope, $location, ForkableAPI) {
	console.log('in VersionsCtrl', g_view, g_user);

	// bind initial state from document
	$scope.doc = g_view.data || '';
	$scope.originaldoc = $scope.doc;
	$scope.docid = g_view.id || '';
	$scope.versions = g_view.versions || '';
	$scope.docowner = g_view.owner || '';

	$scope.currentuserid = g_user.id || '';
	$scope.currentusername = g_user.username || '';
	$scope.currentuseravatar = g_user.avatar || '';

	$scope.login = function() {
		console.log('start login');
		if (isDirty()) {
			// store data temporarily if changes are made, then do ?rescue
			// window.location = '/login?forward=' + encodeURIComponent('/?rescue');
			window.location = '/login?forward=' + encodeURIComponent('/?recover');
		} else {
			window.location = '/login?forward=' + encodeURIComponent('/');
		}
	}

	$scope.logout = function() {
		console.log('logout');
		if (isDirty()) {
			confirmSave();
		} else {
			window.location = '/logout';
		}
	}

});
