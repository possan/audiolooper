if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.directive('audiotrack', function(Playback) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      track: '=',
      editormodel: '='
    },
    link: function(scope, element, attrs) {
      console.log('link', scope, element, attrs);

      scope.patterndummy = [];
      scope.stepdummy = [];
      for(var i=0; i<16; i++) {
        scope.patterndummy.push({
          index: i,
          cued: i == 3,
          playing: i == 1
        });
        scope.stepdummy.push({
          index: i,
          current: i == 3,
          playing: i == 1
        });
      }

      // uppdatera index med timer

      scope.clickpat = function(i) {
        scope.patterndummy[i].cued = true;
      }

      scope.kill = function() {
        scope.editormodel.tracks.splice(scope.index, 1);
        for(var i=0; i<scope.editormodel.tracks.length; i++) {
          scope.editormodel.tracks[i].id = i;
        }
        scope.editormodel.changes ++;
      }

      scope.store = function() {
        scope.editormodel.changes ++;
      }

      scope.changeview = function(v) {
        scope.track.view = v;
        scope.editormodel.changes ++;
      }
    },
    templateUrl: '/track.html'
  };
});