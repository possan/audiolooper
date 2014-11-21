if (typeof(g_module) == 'undefined') {
	g_module = angular.module("LooperApp", []);
}

g_module.factory('Playback', function() {

	function loadSound(url, callback) {
		var request = new XMLHttpRequest();

		console.log('loading', url);

		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {

			console.log('got response');

			context.decodeAudioData(request.response, function(buffer) {
				console.log('decoded audio');

				callback(buffer);
			}, function(e) {
				console.error('decode error', e);
				callback(null);
			});
		}

		request.send();
	}

	var mixers = [];
	var samplebuffers = [];
	var sampledata = [];

	var state = {
		samples: [
			{
				url: '',
				beatrange: [ 1045, 1900, 2 ],
			},
			{
				url: '',
				beatrange: [ 6690, 8405, 4 ],
			}
		],
		sourcepatterns: [
			{

			},
			{
				
			}
		],
		patterns: [
			[
				{slice: 0},
				{slice: 1},
				{slice: 2},
				{slice: 3},

				{slice: 4},
				{slice: 5},
				{slice: 6},
				{slice: 7},

				{slice: 8},
				{slice: 9},
				{slice: 10},
				{slice: 11},

				{slice: 12},
				{slice: 13},
				{slice: 14},
				{slice: 15}
			],[
				{slice: 0},
				{slice: 1},
				{slice: 2},
				{slice: 3},

				{slice: 4},
				{slice: 5},
				{slice: 6},
				{slice: 7},

				{slice: 8},
				{slice: 9},
				{slice: 10},
				{slice: 11},

				{slice: 12},
				{slice: 13},
				{slice: 14},
				{slice: 15}
			]
		],
	}

	var waveformui1;
	var waveformui1zoomin;
	var waveformui1zoomout;
	var waveformui2;
	var waveformui2zoomin;
	var waveformui2zoomout;

	// function init() {

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();

		comp = context.createDynamicsCompressor();
		comp.connect(context.destination);

		mixers[0] = context.createGain();
		mixers[0].connect(comp);

		mixers[1] = context.createGain();
		mixers[1].connect(comp);

/*
		var el_url1 = document.getElementById('url1');
		var el_url2 = document.getElementById('url2');

		var el_vol1 = document.getElementById('vol1');
		var el_vol2 = document.getElementById('vol2');

		var el_pat1 = document.getElementById('pat1');
		var el_pat2 = document.getElementById('pat2');

		var el_beatrange1 = document.getElementById('beatrange1');
		var el_beatrange2 = document.getElementById('beatrange2');

		el_vol1.addEventListener('mousemove', function(e) { mixers[0].gain.value = el_vol1.value / 100.0; });
		el_vol2.addEventListener('mousemove', function(e) { mixers[1].gain.value = el_vol2.value / 100.0; });

		el_beatrange1.addEventListener('change', parseInput);
		el_beatrange2.addEventListener('change', parseInput);

		el_pat1.addEventListener('change', parseInput);
		el_pat2.addEventListener('change', parseInput);

		el_url1.addEventListener('change', function() {
			loadSound(el_url1.value, function(buffer) {
				samplebuffers[0] = buffer;
				sampledata[0] = buffer.getChannelData(0);
				waveformui1.setBuffer(buffer);
				waveformui1zoomin.setBuffer(buffer);
				waveformui1zoomout.setBuffer(buffer);
				waveformui1.setViewRange(0, buffer.length);
			});
		});
		el_url2.addEventListener('change', function() {
			loadSound(el_url2.value, function(buffer) {
				samplebuffers[1] = buffer;
				sampledata[1] = buffer.getChannelData(0);
				waveformui2.setBuffer(buffer);
				waveformui2zoomin.setBuffer(buffer);
				waveformui2zoomout.setBuffer(buffer);
				waveformui2.setViewRange(0, buffer.length);
			});
		});

		var canvel1 = document.getElementById('waveform1');
		var canvel1zoomin = document.getElementById('waveform1zoomin');
		var canvel1zoomout = document.getElementById('waveform1zoomout');
		var canvel2 = document.getElementById('waveform2');
		var canvel2zoomin = document.getElementById('waveform2zoomin');
		var canvel2zoomout = document.getElementById('waveform2zoomout');

	//	canvel1.addEventListener('mousedown', function() { drawWaveform(canvel1, 0); });
	//	canvel2.addEventListener('mousedown', function() { drawWaveform(canvel2, 1); });

		waveformui1 = new WaveformUI(canvel1);
		waveformui1.addEventListener('click', function(e) {
			var s = waveformui1.getSelection();
			if (e.top) {
				s[1] = e.sample + (s[1] - s[0]);
				s[0] = e.sample;
			}
			if (e.bottom) {
				// s[0] = e.sample - (s[1] - s[0]);
				s[1] = e.sample;
			}
			console.log('s', s);
			waveformui1.setSelection(s[0], s[1]);
			waveformui1zoomin.setSelection(s[0], s[1]);
			waveformui1zoomout.setSelection(s[0], s[1]);
			state.samples[0].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[0].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[0].beatrange.join(',');
			el_beatrange1.value = t;
			waveformui1zoomin.setCenter(
				state.samples[0].beatrange[0] * 44100 / 1000
			);
			waveformui1zoomout.setCenter(
				state.samples[0].beatrange[1] * 44100 / 1000
			);
		});

		waveformui1zoomin = new WaveformUI(canvel1zoomin);
		waveformui1zoomin.addEventListener('click', function(e) {
			var s = waveformui1.getSelection();
			s[0] = e.sample;
			console.log('s', s);
			waveformui1.setSelection(s[0], s[1]);
			waveformui1zoomin.setSelection(s[0], s[1]);
			waveformui1zoomout.setSelection(s[0], s[1]);
			state.samples[0].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[0].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[0].beatrange.join(',');
			el_beatrange1.value = t;
		});

		waveformui1zoomout = new WaveformUI(canvel1zoomout);
		waveformui1zoomout.addEventListener('click', function(e) {
			var s = waveformui1.getSelection();
			s[1] = e.sample;
			console.log('s', s);
			waveformui1.setSelection(s[0], s[1]);
			waveformui1zoomin.setSelection(s[0], s[1]);
			waveformui1zoomout.setSelection(s[0], s[1]);
			state.samples[0].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[0].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[0].beatrange.join(',');
			el_beatrange1.value = t;
		});

		waveformui2 = new WaveformUI(canvel2);
		waveformui2.addEventListener('click', function(e) {
			var s = waveformui2.getSelection();
			if (e.top) {
				s[1] = e.sample + (s[1] - s[0]);
				s[0] = e.sample;
			}
			if (e.bottom) {
				// s[0] = e.sample - (s[1] - s[0]);
				s[1] = e.sample;
			}
			console.log('s', s);
			waveformui2.setSelection(s[0], s[1]);
			waveformui2zoomin.setSelection(s[0], s[1]);
			waveformui2zoomout.setSelection(s[0], s[1]);
			state.samples[1].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[1].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[1].beatrange.join(',');
			el_beatrange2.value = t;
			waveformui2zoomin.setCenter(
				state.samples[1].beatrange[0] * 44100 / 1000
			);
			waveformui2zoomout.setCenter(
				state.samples[1].beatrange[1] * 44100 / 1000
			);
		});

		waveformui2zoomin = new WaveformUI(canvel2zoomin);
		waveformui2zoomin.addEventListener('click', function(e) {
			var s = waveformui2.getSelection();
			s[0] = e.sample;
			console.log('s', s);
			waveformui2.setSelection(s[0], s[1]);
			waveformui2zoomin.setSelection(s[0], s[1]);
			waveformui2zoomout.setSelection(s[0], s[1]);
			state.samples[1].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[1].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[1].beatrange.join(',');
			el_beatrange2.value = t;
		});

		waveformui2zoomout = new WaveformUI(canvel2zoomout);
		waveformui2zoomout.addEventListener('click', function(e) {
			var s = waveformui2.getSelection();
			s[1] = e.sample;
			console.log('s', s);
			waveformui2.setSelection(s[0], s[1]);
			waveformui2zoomin.setSelection(s[0], s[1]);
			waveformui2zoomout.setSelection(s[0], s[1]);
			state.samples[1].beatrange[0] = Math.round(s[0] * 1000 / 44100);
			state.samples[1].beatrange[1] = Math.round(s[1] * 1000 / 44100);
			var t = state.samples[1].beatrange.join(',');
			el_beatrange2.value = t;
		});

		function parseBeatrange(trk, input) {
			// console.log('parseBeatrange', trk, input);
			var v = input.split(',');
			if (v.length < 2)
				return;
			state.samples[trk].beatrange[0] = parseInt(v[0], 10); // in ms
			state.samples[trk].beatrange[1] = parseInt(v[1], 10); // in ms
			state.samples[trk].beatrange[2] = parseInt(v[2], 10); // in ms
			// console.log(state.samples[trk]);

			if (trk == 0) {
				waveformui1.setSelection(
					state.samples[0].beatrange[0] * 44100 / 1000,
					state.samples[0].beatrange[1] * 44100 / 1000
				);
				waveformui1zoomin.setSelection(
					state.samples[0].beatrange[0] * 44100 / 1000,
					state.samples[0].beatrange[1] * 44100 / 1000
				);
				waveformui1zoomout.setSelection(
					state.samples[0].beatrange[0] * 44100 / 1000,
					state.samples[0].beatrange[1] * 44100 / 1000
				);
				waveformui1zoomin.setCenter(
					state.samples[0].beatrange[0] * 44100 / 1000
				);
				waveformui1zoomout.setCenter(
					state.samples[0].beatrange[1] * 44100 / 1000
				);
			}
			if (trk == 1) {
				waveformui2.setSelection(
					state.samples[1].beatrange[0] * 44100 / 1000,
					state.samples[1].beatrange[1] * 44100 / 1000
				);
				waveformui2zoomin.setSelection(
					state.samples[1].beatrange[0] * 44100 / 1000,
					state.samples[1].beatrange[1] * 44100 / 1000
				);
				waveformui2zoomout.setSelection(
					state.samples[1].beatrange[0] * 44100 / 1000,
					state.samples[1].beatrange[1] * 44100 / 1000
				);
				waveformui2zoomin.setCenter(
					state.samples[1].beatrange[0] * 44100 / 1000
				);
				waveformui2zoomout.setCenter(
					state.samples[1].beatrange[1] * 44100 / 1000
				);
			}
		}

		function parsePattern(trk, input) {
			var p = input.replace(/ /g, '').split(',');
			var o = [];

			p.forEach(function(ch) {
				if (/[0-9]+/g.test(ch)) {
					var slice = parseInt(ch, 10);
					o.push({
						slice: slice,
						steps: 1
					});
				} else {
					o.push({
					})
				}
			});

			state.patterns[trk] = o;
		}

		function parseInput() {
			console.log('parseInput');
			parseBeatrange(0, el_beatrange1.value);
			parseBeatrange(1, el_beatrange2.value);
			parsePattern(0, el_pat1.value);
			parsePattern(1, el_pat2.value);
		}
		*/

		var bpm = 130;
		var sps = 0;

		function calcInterval(_bpm) {
			console.log('beats per minute', _bpm);

			var spb = 60.0 / _bpm;
			console.log('seconds per beat', spb);

			var sps = spb / 4.0;
			console.log('seconds per slice', sps);

			return sps;
		}

		// parseInput();
		// setTimeout(parseInput, 1000);

		loadSound('https://p.scdn.co/mp3-preview/6c6ad99e0436091023157fc4f88f470f2fcd0cd3', function(buffer) {
			samplebuffers[0] = buffer;
			sampledata[0] = buffer.getChannelData(0);
			// waveformui1.setBuffer(buffer);
			// waveformui1zoomin.setBuffer(buffer);
			// waveformui1zoomout.setBuffer(buffer);
			// waveformui1.setViewRange(0, buffer.length);
		});

		loadSound('https://p.scdn.co/mp3-preview/3178912a225816f16ec11bd936b38baa756ff459', function(buffer) {
			samplebuffers[1] = buffer;
			sampledata[1] = buffer.getChannelData(0);
			// waveformui2.setBuffer(buffer);
			// waveformui2zoomin.setBuffer(buffer);
			// waveformui2zoomout.setBuffer(buffer);
			// waveformui2.setViewRange(0, buffer.length);
 		});

		var playing = false;
		var timer = 0;
		var tick = -4;
		function beat() {
			// console.log('tick', tick);

			if (!playing)
				return;

			for(var i=0; i<2; i++) {
				var stepdata = tick >= 0 ? state.patterns[i][tick] : null;
				// console.log('stepdata', stepdata);
				if (stepdata && stepdata.slice > -1) {
					// console.log('trigger sound', stepdata);
					// console.log('slice', stepdata.slice);
					// console.log('steps', stepdata.steps);

					var snd = context.createBufferSource();
					snd.buffer = samplebuffers[i];
					snd.connect(mixers[i]);

					var beat_start = state.samples[i].beatrange[0];
					var beat_end = state.samples[i].beatrange[1];
					var beat_beats = state.samples[i].beatrange[2] || 1;
					var beat_dur = (beat_end - beat_start) / beat_beats;

					var sample_start = beat_start + (stepdata.slice * beat_dur / 4.0);
					var sample_end = sample_start + (stepdata.steps * beat_dur / 4.0);
					var sample_dur = sample_end - sample_start;

					// console.log('sample_start', sample_start);
					// console.log('sample_end', sample_end);
					// console.log('sample_dur', sample_dur);

					var playback_dur = 1000.0 * (stepdata.steps || 1) * sps;
					// console.log('playback_dur', playback_dur);

					snd.playbackRate.value = (sample_dur / 1000.0) / (playback_dur / 1000.0);
					// console.log('playbackRate', snd.playbackRate.value);

					snd.start(0, sample_start / 1000.0, playback_dur / 1000.0 );
				}
			}

			tick ++;
			if (tick >= 16)
				tick = 0;
		}

	//  ))};

	return {
		init: function() {
			// init();
		},
		play: function() {
			console.log('Playback: play');
			tick = 0;
			playing = true;
			clearInterval(timer);
			sps = calcInterval(bpm);
			timer = setInterval(beat, 1000 * sps);
		},
		stop: function() {
			console.log('Playback: stop');
			playing = false;
			clearInterval(timer);
		},
		update: function(doc) {
			console.log('Playback: updateWorkspace', doc);
		
			if (doc) {
				bpm = parseInt(doc.bpm, 10);
			}
			// state = doc;
			// check for new sounds
		},
		getPlaybackPosition: function() {
			ret = [
				{ track:0, pattern:0 },
				{ track:1, pattern:3 },
				{ track:2, pattern:2 },
			];
			console.log('Playback: getPlaybackPosition', ret);
			return ret;
		}
	};
});
