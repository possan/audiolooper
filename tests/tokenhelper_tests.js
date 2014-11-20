var assert = require('assert');
var TokenHelper = require('../server/tokenhelper').TokenHelper;

describe('Cryptographic Token Helper', function() {

	it('Can encrypt a token into something', function() {
		var h = new TokenHelper('secret');
		var t = h.encrypt({key: 'value', a: 123});
		assert(t != null);
		assert(t != '');
		assert(t.length > 5);
	});

	it('Encrypted tokens should be unique', function() {
		var h = new TokenHelper('secret');
		var data = {key: 'value', a: 123};
		var t1 = h.encrypt(data);
		var t2 = h.encrypt(data);
		var t3 = h.encrypt(data);
		assert(t1 != t2);
		assert(t1 != t3);
		assert(t2 != t3);
	});

	it('Can decrypt a token', function() {
		var h = new TokenHelper('secret3333');
		var t = h.encrypt({key: 'value', a: 123});
		var d2 = h.decrypt(t);
		assert(d2 != null);
		assert(d2.key == 'value');
		assert(d2.a == 123);
	});

	it('Cant decrypt with different secret', function() {
		var h = new TokenHelper('secret');
		var h2 = new TokenHelper('other secret');
		var t = h.encrypt({key: 'value', a: 123});
		var d2 = h2.decrypt(t);
		assert(d2 == null);
	});

	it('Cant decrypt empty input', function() {
		var h = new TokenHelper('secret');
		assert(h.decrypt(null) == null);
		assert(h.decrypt('') == null);
	});

	it('Cant decrypt broken input', function() {
		var h = new TokenHelper('secret');
		assert(h.decrypt('dummy string here') == null);
//		assert(h.decrypt((new Buffer('dummy string here')).toString('base64')) == null);
	});

});

