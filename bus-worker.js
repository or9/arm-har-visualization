import deepKeys from "./lib/deep-keys/index.mjs";

self.methods = {
	addFile,
	getDeepKeys,
	getFileContent,
};

self.onmessage = onmessage;

function onmessage (messageEvent) {
	if (Array.isArray(messageEvent.data)) {
		const method = messageEvent.data[0];
		const args = messageEvent.data.slice(1);
		self.methods[method](...args);
	} else {
		const {
			method,
			args,
		} = messageEvent.data;

		try {
			self.methods[method](JSON.parse(args));
		} catch (err) {
			self.methods[method](...args);
		}
	}
}

async function addFile (fileName, fileBuffer) {
	// The following are equivalent. I just opted to keep it on a single line.
	// const fileBufferCopy = new Blob([fileBuffer]);
	// const fileBufferTextContet = await fileBufferCopy.text();
	// getDeepKeys(fileBufferTextContet);
	getDeepKeys(JSON.parse(await new Blob([fileBuffer]).text()));

	postMessage([
		"addFile",
		fileName,
		fileBuffer,
	],
	[
		strToArrayBuffer("addFile"),
		strToArrayBuffer(fileName),
		fileBuffer,
	]);
}

async function getFileContent (fileName) {
	const content = await import(fileName);
	postMessage([
		"getFileContent",
		fileName,
		content,
	],
	[
		strToArrayBuffer("getFileContent"),
		strToArrayBuffer(fileName),
		strToArrayBuffer(fileContent),
	]);
}

function getDeepKeys (obj) {
	const keys = deepKeys(obj, true).join(",");

	postMessage([
			"populateDatalistOptions",
			keys,
		],
		[
			strToArrayBuffer("populateDatalistOptions"),
			strToArrayBuffer(keys),
		]);
}

function arrayBufferToStr (buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function strToArrayBuffer (str) {
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Uint16Array(buf);
	const strArr = Array.from(str);

	for (let i = 0; i < strArr.length; i += 1) {
		bufView[i] = strArr.shift();
	}

	return buf;
}
