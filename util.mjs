export const converter = {
	arrayBufferToString,
	stringToArrayBuffer,
	hsvToRgb,
};

export const obj = {
	getPropFromPath,
	getPathFromObj,
};

/**
 * Get value for a property described by schema param
 * @param {object} - Dictionary on which to perform validation
 * @param {string} - Pattern to search object's heirarchy
 * @returns {*} - Found value or defaultValue if not found in pattern param
 */
function getPropFromPath (obj, schema = "", defaultReturnValue) {
	if (!obj) return defaultReturnValue || obj;
	if (!schema) return defaultReturnValue || obj;

	const expectedKeyArr = schema.split(".");

	while (expectedKeyArr.length) {
		const currentKey = expectedKeyArr.shift();

		if (obj.hasOwnProperty(currentKey)) {
			obj = obj[currentKey];
			continue;

		} else return defaultReturnValue;

	}

	return obj;
}

function getPathFromObj (obj, path = "") {
	if (path) {
		path += ".";
	}

	// console.log("returning from path", path, obj);
	return Object
		.keys(obj)
		.map(looploop);

	function looploop (key) {
		if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
			const fkey = path? path += "." + key: key;
			return fkey.concat(".", getPathFromObj(obj[key], key));
		} else {
			return path.concat(key);
		}
	}
}

/**
 * Convert ArrayBuffer to String; see https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
 * @param  {ArrayBuffer} buf ArrayBuffer to convert
 * @return {String}     String representation of provided buffer
 */
function arrayBufferToString (buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

/**
 * Convert String to ArrayBuffer; see https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
 * @param  {String} str 		String to convert
 * @return {ArrayBuffer}     	ArrayBuffer representation of provided string
 */
function stringToArrayBuffer (str) {
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Uint16Array(buf);
	const strArr = Array.from(str);

	for (let i = 0; i < strArr.length; i += 1) {
		bufView[i] = strArr.shift();
	}

	return buf;
}

function hsvToRgb (h, s, v) {
	var r, g, b;
	var i;
	var f, p, q, t;

	// Make sure our arguments stay in-range
	h = Math.max(0, Math.min(360, h));
	s = Math.max(0, Math.min(100, s));
	v = Math.max(0, Math.min(100, v));

	// We accept saturation and value arguments from 0 to 100 because that's
	// how Photoshop represents those values. Internally, however, the
	// saturation and value are calculated from a range of 0 to 1. We make
	// That conversion here.
	s /= 100;
	v /= 100;

	if (s == 0) {
		// Achromatic (grey)
		r = g = b = v;
		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	h /= 60; // sector 0 to 5
	i = Math.floor(h);
	f = h - i; // factorial part of h
	p = v * (1 - s);
	q = v * (1 - s * f);
	t = v * (1 - s * (1 - f));

	switch (i) {
		case 0:
			r = v;
			g = t;
			b = p;
			break;

		case 1:
			r = q;
			g = v;
			b = p;
			break;

		case 2:
			r = p;
			g = v;
			b = t;
			break;

		case 3:
			r = p;
			g = q;
			b = v;
			break;

		case 4:
			r = t;
			g = p;
			b = v;
			break;

		default: // case 5:
			r = v;
			g = p;
			b = q;
	}

	return [
		Math.round(r * 255),
		Math.round(g * 255),
		Math.round(b * 255),
	];
}
