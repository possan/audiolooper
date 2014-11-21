if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.controller('MainCtrl', function($scope, $rootScope, $location, ForkableAPI, Playback) {
	console.log('in MainCtrl', g_view, g_user);

	// bind initial state from document
	$scope.doc = g_view.data || '';
	$scope.originaldoc = $scope.doc;
	$scope.docid = g_view.id || '';
	$scope.docver = g_view.version || '';
	$scope.docowner = g_view.owner || '';

	Playback.init();

	$scope.editormodel = {
		bpm: 135,
		playing: false,
		mixer: 0, // -100=A, 0=A+B, 100=B,
		changes: 0,
		tracks: [
			{
				id: 0,
				view: 0,
				url: 'https://p.scdn.co/mp3-preview/6c6ad99e0436091023157fc4f88f470f2fcd0cd3',
				loopStart: 1045,
				loopEnd: 1900,
				loopBeats: 2,
				cuedPattern: 0,
				playingPattern: 0,
				patterns: [
					{
						id: 0,
						slice: [ 0,1,2,3, 4,5,6,7, 8,9,10,11, 12,13,14,15 ],
						volume: 100,
					}
				]
			},
			{
				id: 1,
				view: 0,
				url: 'https://p.scdn.co/mp3-preview/3178912a225816f16ec11bd936b38baa756ff459',
				loopStart: 6690,
				loopEnd: 8405,
				loopBeats: 4,
				cuedPattern: 0,
				playingPattern: 0,
				patterns: [
					{
						id: 0,
						slice: [ 0,1,2,3, 4,5,6,7, 8,9,10,11, 12,13,14,15 ],
						volume: 100,
					},
					{
						id: 1,
						slice: [ 0,1,2,3, 0,1,2,3, 0,1,0,1, 0,0,0,0 ],
						volume: 100,
					}
				]
			},
		]
	}

	$scope.doc = JSON.stringify($scope.editormodel);

	$scope.$watch('editormodel.changes', function() {
		console.log('model changed?');
		Playback.update($scope.editormodel);
		$scope.doc = JSON.stringify($scope.editormodel);
	});

	$scope.playpause = function() {
		$scope.editormodel.playing = !$scope.editormodel.playing;
		Playback.update($scope.editormodel);
		if ($scope.editormodel.playing)
			Playback.play();
		else
			Playback.stop();
	}

	$scope.addtrack = function() {
		$scope.editormodel.tracks.push({
			id: $scope.editormodel.tracks.length,
			view: 0,
			url: '',
			outa: true,
			outb: true,
			loopStart: 1000,
			loopEnd: 3000,
			loopBeats: 1,
			cuedPattern: 0,
			playingPattern: 0,
			patterns: [
				{
					id: 0,
					slice: [ 0,1,2,3, 4,5,6,7, 8,9,10,11, 12,13,14,15 ],
					volume: 100,
				},
				{
					id: 1,
					slice: [ 0,1,2,3, 0,1,2,3, 0,1,0,1, 0,0,0,0 ],
					volume: 100,
				}
			]
		});
		$scope.doc = JSON.stringify($scope.editormodel);
	}

	$scope.changebpm = function() {
		Playback.update($scope.editormodel);
		$scope.doc = JSON.stringify($scope.editormodel);
	}

	$rootScope.isDirty = function() {
		return ($scope.doc != $scope.originaldoc);
	}

	$rootScope.confirmSave = function() {
		if ($rootScope.currentuserid != '') {
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
		if ($rootScope.isDirty()) {
			// store data temporarily if changes are made, then do ?rescue
			// window.location = '/login?forward=' + encodeURIComponent('/?rescue');
			window.location = '/login?forward=' + encodeURIComponent('/?recover');
		} else {
			window.location = '/login?forward=' + encodeURIComponent('/');
		}
	}

	$scope.logout = function() {
		console.log('logout');
		if ($rootScope.isDirty()) {
			confirmSave();
		} else {
			window.location = '/logout';
		}
	}

	$scope.savedoc = function() {
		console.log('save this document', $scope.doc);
		if ($scope.docid != '') {
			console.log('we have a doc id');
			if ($scope.docowner == $rootScope.currentuserid) {
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
			if ($rootScope.currentuserid != '') {
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
		if ($rootScope.isDirty()) {
			confirmSave();
		} else {
			window.location = '/';
		}
	}

});
