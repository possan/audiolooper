if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.factory('Dirtystate', function() {
	var _dirty = false;
	return {
		isDirty: function() {
			return _dirty;
		},
		markDirty: function() {
			_dirty = true;
		},
		markClean: function() {
			_dirty = false;
		}
	};
});
