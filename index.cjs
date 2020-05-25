#!/usr/bin/env node

const {
	readFile,
	readableStream,
	writableStream,
} = require("fs");
const { promisify } = require("util");
global.__readFile = promisify(readFile);

const {
	buildHtmlFromFileContent,
	buildDocument,
} = require("./template.cjs");

// create a uuid, send with response + session
// if uuid is returned with same session, it's good to go
// else reject

const harFiles = [
	process.argv[2],
	process.argv[3],
];

Promise.all(harFiles.filter(f => f)
	.map((filepath) => __readFile(filepath, "utf-8")))
	.then((fileContent) => {
		/**
		schema {
			'$schema': 'http://json-schema.org/draft-04/schema#',
			description: '',
			type: 'object',
			properties: { log: { type: 'object', properties: [Object], required: [Array] } },
			required: [ 'log' ]
		}
		*/
		const json = JSON.parse(fileContent);

		return buildDocument(json);
	})
	.then((results) => {
		return console.log("results: ", results);
	})
	.catch((err) => {
		console.debug(err);
		console.error(err.message);
	});
