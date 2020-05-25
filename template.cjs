const {
	readFileSync,
	readdirSync,
	readableStream,
	writableStream,
} = require("fs");
const Handlebars = require("handlebars");

const templates = readdirSync("./templates")
	.map((filename) => {
		const content = readFileSync(`./templates/${filename}`, "utf8");

		return {
			filename: filename.replace(/\.hbs$/i, ""),
			template: Handlebars.compile(content),
			// template: null
		};
	})
	.reduce((curr, acc) => {
		curr[acc.filename] = acc.template;
		return curr;
	}, {});

module.exports = {
	buildHtmlFromFileContent,
	buildDocument,
};

function buildHtmlFromFileContent (harFileContext = [], path = {}, key = "") {
	if (templates.hasOwnProperty(key)) {
		return harFileContext.map((content) => templates[key](content));
	} else {
		throw new Error(`Specified object path does not exist. Available: [${Object.keys(templates).join(" | ")}]; Received [${key}]`);
	}
}

function buildDocument (harFileContext) {
	return new Promise((resolve, reject) => {
		// probably need to load it all into memory. doesn't seem to be any real way to stream it to handlebars
		if (!harFileContext.hasOwnProperty("log")) {
			throw new Error(`Expected HAR file to have a key of "log"`);
		}

		// console.log("entry 0", harFileContext.log.entries[0]);

		const html = templates.document(harFileContext.log);
	});
}
