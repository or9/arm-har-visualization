#!/usr/bin/env node
"use strict";

if (!Date.prototype.toISOString) {
	Date.prototype.toISOString = toISOString;
}

const system = require('system');
const phantom = require("phantomjs");
const page = require('webpage').create();

if (system.args.length === 1) {
	console.error(`Usage: netsniff.js <some URL>`);
	phantom.exit(1);
} else {

	page.address = system.args[1];
	page.resources = [];

	page.onLoadStarted = onLoadStarted;
	page.onResourceRequested = onResourceRequested;
	page.onResourceReceived = onResourceReceived;

	page.open(page.address, function (status) {
		if (status !== `success`) {
			console.error(`FAIL to load the address`, status);
			phantom.exit(1);
		} else {
			page.endTime = new Date();
			page.title = page.evaluate(() => document.title);

			const har = createHAR(page.address, page.title, page.startTime, page.resources);
			console.info(JSON.stringify(har, undefined, 4));
			phantom.exit();
		}
	});


	function onLoadStarted () {
		page.startTime = new Date();
	}

	function onResourceRequested (req) {
		page.resources[req.id] = {
			request: req,
			startReply: null,
			endReply: null
		};
	}

	function onResourceReceived (res) {
		if (res.stage === 'start') {
			page.resources[res.id].startReply = res;
		}
		if (res.stage === 'end') {
			page.resources[res.id].endReply = res;
		}
	}
}

function createHAR (address, title, startTime, resources) {
	const entries = resources
		.filter(excludeMissingRequestOrReply)
		.filter(excludeDataUri)
		.map(buildEntries);

	return {
		log: {
			version: '1.2',
			creator: {
				name: "PhantomJS",
				version: phantom.version.major + '.' + phantom.version.minor +
					'.' + phantom.version.patch
			},
			pages: [{
				startedDateTime: startTime.toISOString(),
				id: address,
				title: title,
				pageTimings: {
					onLoad: page.endTime - page.startTime
				}
			}],
			entries
		}
	};


	function excludeMissingRequestOrReply ({ request, startReply, endReply }) {
		return request && startReply && endReply;
	}

	function excludeDataUri ({ request }) {
		return !request.url.match(/(^data:image\/.*)/i);
	}

	function buildEntries ({ request, startReply, endReply }) {
		console.info(`TODO: get actual httpVersion rather than statically setting to HTTP/1.1?`);

		return {
			startedDateTime: request.time.toISOString(),
			time: endReply.time - request.time,
			request: {
				method: request.method,
				url: request.url,
				httpVersion: "HTTP/1.1",
				cookies: [],
				headers: request.headers,
				queryString: [],
				headersSize: -1,
				bodySize: -1
			},
			response: {
				status: endReply.status,
				statusText: endReply.statusText,
				httpVersion: "HTTP/1.1",
				cookies: [],
				headers: endReply.headers,
				redirectURL: "",
				headersSize: -1,
				bodySize: startReply.bodySize,
				content: {
					size: startReply.bodySize,
					mimeType: endReply.contentType
				}
			},
			cache: {},
			timings: {
				blocked: 0,
				dns: -1,
				connect: -1,
				send: 0,
				wait: startReply.time - request.time,
				receive: endReply.time - startReply.time,
				ssl: -1
			},
			pageref: address
		};
	}
}

function toISOString () {
	return this.getFullYear() + '-' +
		pad(this.getMonth() + 1) + '-' +
		pad(this.getDate()) + 'T' +
		pad(this.getHours()) + ':' +
		pad(this.getMinutes()) + ':' +
		pad(this.getSeconds()) + '.' +
		ms(this.getMilliseconds()) + 'Z';

	function pad (n) {
		return n < 10 ? '0' + n : n;
	}

	function ms (n) {
		return n < 10 ? '00'+ n : n < 100 ? '0' + n : n;
	}
}
