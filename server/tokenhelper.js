//
// Encrypted token helper
//

var CryptoJS = require('crypto-js');

function tohex(data) {
	var str = '';

	for(var i=0; i<data.length; i++) {
		var b = data.charCodeAt(i);
		if (i > 0) str += ',';
		str += b.toString(16);
	}

	return str;
}

var TokenHelper = function(secret) {
	this.secret = secret;
}

TokenHelper.prototype.encrypt = function(data) {
	// console.log('TokenHelper::encrypt', data);
	if (!data) {
		return null;
	}

	if (typeof(data) !== 'object') {
		return null;
	}

	data['__d1'] = Math.random() * 10000000;

	var decrypted = JSON.stringify(data);
	var encrypted = null;
	try {
		encrypted = CryptoJS.AES.encrypt(decrypted, this.secret, { asBytes: true });
		encrypted = encrypted.toString();
	} catch(e) {
		console.error('encrypt error', e);
	}

	// console.log('encrypted result', encrypted);
	return encrypted;
}

TokenHelper.prototype.decrypt = function(token) {
	// console.log('TokenHelper::decrypt', token);
	if (!token) {
		return null;
	}

	if (token == '') {
		return null;
	}

	var encrypted = token;
	var	decrypted = null;
	try {
		decrypted = CryptoJS.AES.decrypt(encrypted, this.secret, { asBytes: true });
		decrypted = decrypted.toString(CryptoJS.enc.Utf8);
		if (decrypted == '')
			decrypted = null;
	} catch(e) {
		console.error('decrypt error', e);
		decrypted = null;
	}

	if (decrypted) {
		try {
			decrypted = JSON.parse(decrypted);
		} catch(e) {
			decrypted = null;
		}
	}

	if (decrypted) {
		if (decrypted['__d1']) {
			delete(decrypted['__d1']);
		}
	}

	// console.log('decrypted result "' + decrypted + '"');
	return decrypted;
}

exports.TokenHelper = TokenHelper;
