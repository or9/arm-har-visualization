import "./arm-dropzone.element.mjs";
import "./arm-har-viz.element.mjs";
import {
	converter,
	obj,
} from "./util.mjs";

function busWorkerMixin (__class) {
	return class BusWorkerMixin extends __class {
		constructor (...args) {
			super(...args);

			// TODO: move this to its own arm108.util.mixins.reflector
			this.constructor.observedAttributes.forEach((attr) => {
				this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
			});

			const busWorkerName = this.getAttribute("bus-worker");
			this.busWorker = window[busWorkerName];
			this.busWorker.postMessage(new ArrayBuffer(), [new ArrayBuffer()]);
		}
	}
}

function mixer (mixins = [], __class) {
	// TODO: come back to this...
	// const mix = mixins.reduce((curr, acc) => {
	// 	return curr(acc);
	// });

	// return mix(__class);
}

// TODO: do we want to reflect properties to attributes as well?
function reflectToPropertyMixin (__class) {
	return class ReflectToProperty extends __class {
		constructor (...args) {
			super(...args);

			this.constructor.observedAttributes.forEach((attr) => {
				this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
			});
		}
	}
}

export default class ArmRowDropzone extends reflectToPropertyMixin(HTMLElement) {
	constructor () {
		super();

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));

		const pathInput = this.shadowRoot.getElementById("jsonPath");
		pathInput.value = this.getAttribute("path");
		pathInput.onchange = (ev) => {
			this.setAttribute("path", ev.target.value);
		};

		[
			`dragenter`,
			`dragover`,
			`dragleave`,
			`drop`
		]
		.forEach((eventName) => {
			// Redirect all drag & drop events to dropzone
			this.addEventListener(eventName, (event) => {
				event.preventDefault();
				event.stopPropagation();

				this.shadowRoot.getElementById("armDropzone")
					.dispatchEvent(new event.constructor(event.type, event));
			}, false);
		});

		console.info("@arm108-row-dropzone#constructor TODO: add listener for window.location.hash update and update path to match? Or watch all observedAttributes of arm-har-viz?");
	}

	connectedCallback () {
		// TODO: eventually generate / track _uid and add to name to associate with instance
		this.busWorker = new Worker("./bus-worker.js", {
			type: "module",
			credentials: "include",
			name: this.constructor.is,
		}, {
			type: "module",
		});

		this.path = this.getAttribute("path");

		this.shadowRoot.getElementById("armDropzone").busWorker = this.busWorker;

		this.busWorker.onmessage = this.onmessage.bind(this);
	}

	disconnectedCallback () {
		this.busWorker.terminate();
	}

	adoptedCallback () {
	}

	attributeChangedCallback (attr, oldVal, newVal) {
		this[attr] = newVal;
		const attrChangedHandlerName = `${attr}AttrChanged`;

		if (typeof this[attrChangedHandlerName] === "function") {
			this[attrChangedHandlerName].call(this, oldVal, newVal);
		} else {
			console.info(`No handler defined for ${attr}; expected ${attrChangedHandlerName}`);
		}
	}

	onmessage (messageEvent) {
		// TODO: put this in some sort of util mixin
		var method = "UNHANDLED";
		var args = [];

		if (Array.isArray(messageEvent.data)) {
			method = messageEvent.data[0];
			args = messageEvent.data.slice(1);
		} else {
			method = messageEvent.data.method;
			args = messageEvent.data.args;
		}

		if (this.constructor.acceptWorkerMessages.includes(method)) {
			this[method](...args);
		} else {
			console.warn("@arm108-row-dropzone does not have a handler for message: ", method);
		}
	}

	async addFile (fileName, fileBuffer) {
		try {
			const text = await new Blob([fileBuffer]).text();
			updateChartData.call(this, fileName, text);
		} catch (err) {
			console.debug(err);
			console.warn("Error trying to parse file", err.message);
		}
		console.info("TODO: aggregate all data and display a summary of key differences");

		function updateChartData (fileName, dataText) {
			this.shadowRoot.getElementById("chartContainer").classList.remove("nodisplay");
			const data = `{ "metadata": "${fileName}", "data": ${dataText} }`;

			const chartContainer = this.shadowRoot.getElementById("chartContainer");

			if (chartContainer.querySelectorAll("arm-har-viz").length === 0) {
				// Does not have a chart, create one
							// instantiate chart. Constructor invoked here...
				const vizElement = document.createElement("arm-har-viz");
				vizElement.onchange = this.handleVizChange.bind(this);

				updateChart(vizElement, this.path, data);

				chartContainer.appendChild(vizElement);

				this.setAttribute("has-chart", true);
				this.dispatchEvent(new Event("change"));
				this.shadowRoot.querySelector("arm-dropzone").classList.add("row--has-data");
			} else {
				// Already has a chart, just update data
				const vizElement = chartContainer.querySelector("arm-har-viz");
				updateChart(vizElement, this.path, data);
			}

			function updateChart (viz, path, data) {
				viz.setAttribute("path", path);
				viz.setAttribute("data", data);
				viz.setAttribute("type", "horizontalBar");
			}
		}
	}

	handleVizChange (event) {
		const path = event.target.getAttribute("path");
		console.log("set path to path", path);
		// this.setAttribute("path", path);
		const jsonPathInput = this.shadowRoot.getElementById("jsonPath");
		jsonPathInput.value = path;
		jsonPathInput.dispatchEvent(new Event("change"));
	}

	// handleStringMessage (data) {
	// 	console.log("#handleStringMessage called for some reason");
	// 	if (this.constructor.acceptWorkerMessages.includes(data.method)) {
	// 		this[data.method](...data.args);
	// 	} else {
	// 		console.warn("@arm108-row-dropzone does not have a handler for message: ", data.method);
	// 	}
	// }

	pathAttrChanged (oldVal, newVal) {
		this.shadowRoot.querySelectorAll("#chartContainer > arm-har-viz")
			.forEach((vizElement) => {
				if (vizElement.getAttribute("path") === newVal) return;
				else vizElement.setAttribute("path", newVal);
			});
	}

	populateDatalistOptions (optionsArrayBuffer = "") {
		const options = optionsArrayBuffer.split(",");
		const jsonPathInput = this.shadowRoot.getElementById("jsonPath");
		jsonPathInput.classList.remove("nodisplay");
		this.shadowRoot.getElementById("settingsBtn").classList.remove("nodisplay");

		const datalistMap = Array.from(this.shadowRoot.querySelectorAll("#jsonPathDatalist > option"))
			.map(el => el.value);

		options
			.filter((opt) => !datalistMap.includes(opt))
			.map((opt) => {
				const optionElement = document.createElement("option");
				optionElement.innerHTML = opt;
				optionElement.value = opt;

				return optionElement;
			})
			.forEach((el) => {
				this.shadowRoot
					.getElementById("jsonPathDatalist")
					.appendChild(el);
			});

		if (!options.includes(jsonPathInput.value)) {
			jsonPathInput.value = options[0];
			jsonPathInput.dispatchEvent(new Event("change"));
		}

		// TODO: using data-attr-name binding,
		// automatically dispatch appropriate event
		// update attr ( and prop, implicitly )
	}

	removeChart (event) {
		console.log("#removeChart event", event);
		// how do we know which element initiated the action?
		const chartContainer = this.shadowRoot.getElementById("chartContainer");

		chartContainer.removeChild(event.path[0]);
		if (chartContainer.querySelectorAll(`arm-har-viz`).length === 0) {
			// notify index that row is empty
		}
	}

	clearCharts () {
		this.shadowRoot.getElementById("chartContainer").innerHTML = "";
	}

	clearDatalistOptions () {
		this.shadowRoot.getElementById("jsonPathDatalist").innerHTML = "";
	}

	set data (jsonStrVal = "{}") {
		try {
			this.__data = JSON.parse(jsonStrVal);
		} catch (err) {
			console.debug(err);
			console.warn("Could not parse JSON string", err.message);
		}
	}

	static get acceptWorkerMessages () {
		return [
			"populateDatalistOptions",
			"addFile",
		];
	}

	static get observedAttributes () {
		return [
			`path`,
			`data`,
		];
	}

	static get template () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
		<style type="text/css" rel="stylesheet">
		:host {
			position: relative;
			contain: content;
			height: auto;
		}
		#chartContainer {
			position: relative;
			flex: 5 1 auto;
		}
		input {
			position: relative;
			flex: 10 1 95%;
			display: inline-flex;
			box-sizing: border-box;
			margin: 10px auto;
		}
		#settingsBtn {
			display: inline-flex;
			flex: 1 1 2%;
			box-sizing: border-box;
			margin-top: 10px;
		}
		arm-dropzone {
			position: fixed;
			width: 100%;
			height: 100%;
			min-height: 20vh;
			box-sizing: border-box;
		}
		arm-dropzone.row--has-data {
			opacity: 0.5;
		}

		.nodisplay {
			display: none !important;
		}
		</style>
		<arm-dropzone id="armDropzone"></arm-dropzone>

		<input
			id="jsonPath"
			placeholder="path"
			value=""
			list="jsonPathDatalist"
			data-attr-name="path"
			class="nodisplay"
			/>
		<datalist id="jsonPathDatalist">
		</datalist>
		<!--<svg class="coreui--icon__svg settings--icon">
			<use href="node_modules/@coreui/icons/sprites/free.svg#cil-settings"></use>
		</svg>-->
		<button
		id="settingsBtn"
		class="nodisplay"
		title="Adjust display settings">
			S
		</button>

		<div id="chartContainer" class="nodisplay"></div>
		`;
		return tmpl;
	}

	static get is () {
		return "arm-row-dropzone";
	}
}

customElements.define(ArmRowDropzone.is, ArmRowDropzone);
