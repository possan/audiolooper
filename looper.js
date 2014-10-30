(function() {

	var context, comp;
	var mix1, mix2;

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
				beatrange: [ 0, 1000, 1 ],
			},
			{
				url: '',
				beatrange: [ 0, 1000, 1 ],
			}
		],
		sourcepatterns: [
			{

			},
			{
				
			}
		],
		patterns: [
		],
	}

	function WaveformUI(el) {
		this.element = el;
		this.eventhandlers = {};
		this.viewrange = [0, 100];
		this.selection = [0, 100];
		this.buffer = null;
		this.samples = [];
		var _this = this;
		this.element.addEventListener('mousedown', function(e) {
			var h = _this.element.clientHeight;
			// console.log('e', e);
			_this.fireEvent('click', {
				x: e.offsetX,
				y: e.offsetY,
				sample: _this.xToSample(e.offsetX),
				top: (e.offsetY < h / 2),
				bottom: (e.offsetY > h / 2)
			});
			_this.redraw();
		});
		this.element.addEventListener('mousemove', function(e) {
			var h = _this.element.clientHeight;
			 console.log('e', e);
			if (e.which != 0) {
				_this.fireEvent('click', {
					x: e.offsetX,
					y: e.offsetY,
					sample: _this.xToSample(e.offsetX),
					top: (e.offsetY < h / 2),
					bottom: (e.offsetY > h / 2)
				});
				_this.redraw();
			}
		});
		this.redraw();
	}

	WaveformUI.prototype.setViewRange = function(st, en) {
		this.viewrange[0] = st;
		this.viewrange[1] = en;
		this.redraw();
	}

	WaveformUI.prototype.setSelection = function(st, en) {
		this.selection[0] = st;
		this.selection[1] = en;
		this.redraw();
	}

	WaveformUI.prototype.setCenter = function(c, ra) {
		ra = (ra || 10000);
		this.viewrange[0] = c - ra;
		this.viewrange[1] = c + ra;
		this.redraw();
	}

	WaveformUI.prototype.setBuffer = function(buf) {
		this.buffer = buf;
		this.samples = [];
		if (buf) {
			this.samples = buf.getChannelData(0);
		}
		this.redraw();
	}

	WaveformUI.prototype.getViewRange = function() {
		return [this.viewrange[0], this.viewrange[1]];
	}

	WaveformUI.prototype.getSelection = function() {
		return [this.selection[0], this.selection[1]];
	}

	WaveformUI.prototype.sampleToX = function(sample) {
		var w = this.element.clientWidth;
		var vw = this.viewrange[1] - this.viewrange[0];
		return (sample - this.viewrange[0]) * w / vw;
	}

	WaveformUI.prototype.xToSample = function(x) {
		var w = this.element.clientWidth;
		var vw = this.viewrange[1] - this.viewrange[0];
		return Math.floor((x * vw / w) + this.viewrange[0]);
	}

	WaveformUI.prototype.redraw = function() {
		console.log('draw waveform');

		var w = this.element.clientWidth;
		var h = this.element.clientHeight;

		var hh = h >> 1;

		var g = this.element.getContext('2d');

		g.fillStyle = '#000';
		g.fillRect(0, 0, w, h);

		console.log('samplebuffer', this.buffer);

		if (this.samples.length == 0 || !this.buffer)
			return;

		var d = this.samples;

		var t0 = this.selection[0];
		var t1 = this.selection[1];
		console.log('t range', t0, t1);

		var x0 = this.sampleToX(t0);
		var x1 = this.sampleToX(t1);
		console.log('x range', x0, x1);

		g.fillStyle = '#7a1';
		g.fillRect(x0,0,x1-x0,h);

		for(var i=0; i<w; i++) {
			var o = this.xToSample(i);
			var v = 0;
			for(var os=-10; os<=10; os++) {
				var o2 = o + os * 1;
				if (o2 < 0) o2 = 0;
				if (o2 >= this.samples.length) o2 = this.samples.length - 1;
				o2 = Math.floor(o2);
				v += this.samples[o2];
			}
			v /= 21.0;
			g.beginPath();
			g.strokeStyle = '#cfc';
			g.moveTo(i, hh - hh * v);
			g.lineTo(i, hh + hh * v);
			g.stroke();
		}
	}

	WaveformUI.prototype.addEventListener = function(event, callback) {
		this.eventhandlers[event] = callback;
	}

	WaveformUI.prototype.fireEvent = function(event, data) {
		console.log('fireEvent', event, data);
		if (this.eventhandlers[event]) {
			this.eventhandlers[event](data);
		}
	}

	var waveformui1;
	var waveformui1zoomin;
	var waveformui1zoomout;
	var waveformui2;
	var waveformui2zoomin;
	var waveformui2zoomout;

	function init() {

		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();

		comp = context.createDynamicsCompressor();
		comp.connect(context.destination);

		mixers[0] = context.createGain();
		mixers[0].connect(comp);

		mixers[1] = context.createGain();
		mixers[1].connect(comp);

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

		var bpm = 120;
		console.log('beats per minute', bpm);

		var spb = 60.0 / bpm;
		console.log('seconds per beat', spb);

		var sps = spb / 4.0;
		console.log('seconds per slice', sps);

		parseInput();
		setTimeout(parseInput, 1000);

		loadSound('https://p.scdn.co/mp3-preview/6c6ad99e0436091023157fc4f88f470f2fcd0cd3', function(buffer) {
			samplebuffers[0] = buffer;
			sampledata[0] = buffer.getChannelData(0);
			waveformui1.setBuffer(buffer);
			waveformui1zoomin.setBuffer(buffer);
			waveformui1zoomout.setBuffer(buffer);
			waveformui1.setViewRange(0, buffer.length);
		});

		loadSound('https://p.scdn.co/mp3-preview/3178912a225816f16ec11bd936b38baa756ff459', function(buffer) {
			samplebuffers[1] = buffer;
			sampledata[1] = buffer.getChannelData(0);
			waveformui2.setBuffer(buffer);
			waveformui2zoomin.setBuffer(buffer);
			waveformui2zoomout.setBuffer(buffer);
			waveformui2.setViewRange(0, buffer.length);
 		});

		var tick = -4;
		setInterval(function() {
			// console.log('tick', tick);

			for(var i=0; i<2; i++) {
				var stepdata = tick >= 0 ? state.patterns[i][tick] : null;
				if (stepdata && stepdata.slice > -1) {
					// console.log('trigger sound');
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

					var playback_dur = 1000.0 * stepdata.steps * sps;
					// console.log('playback_dur', playback_dur);

					snd.playbackRate.value = (sample_dur / 1000.0) / (playback_dur / 1000.0);
					// console.log('playbackRate', snd.playbackRate.value);

					snd.start(0, sample_start / 1000.0, playback_dur / 1000.0 );
				}
			}

			tick ++;
			if (tick >= 16)
				tick = 0;

		}, 1000 * sps);
	};

	window.addEventListener('load', function() {

		init();

	});

})();