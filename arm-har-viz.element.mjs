// import * as Chart from "./node_modules/chart.js/dist/Chart.bundle.js";
// import * as Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js";
// create libs directory
// rollup chart.js
// import * as Chart from "./lib/chart.js/Chart.js";
import {
	obj,
	converter,
} from "./util.mjs";

export default class ArmHarViz extends HTMLElement {
	constructor () {
		super();

		this.__data = [];
		this.__path = "";

		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));

		this.textContentArea = this.shadowRoot.getElementById(this.constructor.textContentId);
		this.graphCanvas = this.shadowRoot.getElementById(this.constructor.canvasId);
		this.canvasContainer = this.shadowRoot.getElementById(this.constructor.canvasContainerId);

		this.ctx = this.graphCanvas.getContext(`2d`);

		// insert data or load from URL
		this.chart = new window.Chart(this.ctx, {
			// type: this.type,
			type: "horizontalBar",
			data: this.data,
			options: this.options
		});
	}

	connectedCallback () {

	}

	adoptedCallback () {
	}

	attributeChangedCallback (name, oldValue, newValue) {
		// Reflect observed attributes to properties
		// this[name] = newValue;
		const funcName = `${name}AttrChanged`;
		if (typeof this[funcName] === "function") {
			this[funcName](newValue);
		} else {
			console.info(`No handler registered for attr ${name}`);
		}
	}

	disconnectedCallback () {
		this.ctx = null;
	}

	/**
	 * Should be called whenever the chart needs to be updated.
	 * Normally this is on change of `path` or `data` attributes.
	 * @param  {Array}  datasets Array of datasets, each representing one full set of graphable data as well as associated metadata
	 * @return {void}
	 */
	dataPropChanged (datasets = []) {
		const isGraphableData = datasets.length && datasets.every(({ data }) => {
			return Array.isArray(data);
		});
		console.log("datasets", datasets);
		if (isGraphableData) {

			this.chart.data = {};

			const labels = datasets.reduce((curr, next) => {
				if (curr.data.length > next.data.length) return curr
				else return next;
			}, { data: [] }).data
			.map((d, i) => `${d.request.method} ${new URL(d.request.url).pathname}`);
			// .flat();

			const colorMap = datasets.map((d, index, arr) => {
				const baseIncrement = 360 / arr.length;
				return converter.hsvToRgb(baseIncrement * (index + 1), 80, 100);
			});

			const chartDatasets = datasets.map(({ metadata, data }, index) => {
				const axis = `time`;
				// TODO: don't hardcode axis
				// // [
				//   "startedDateTime",
				//   "time",
				//   "request",
				//   "response",
				//   "cache",
				//   "timings",
				//   "serverIPAddress",
				//   "_initiator",
				//   "_priority",
				//   "_resourceType",
				//   "connection",
				//   "pageref",
				//   "_meta",
				//   "data"
				// ]

				const color = {
					R: colorMap[index][0],
					G: colorMap[index][1],
					B: colorMap[index][2],
				};

				return {
					type: "horizontalBar",
					label: metadata,
					backgroundColor: `rgba(${color.R}, ${color.G}, ${color.B}, 0.9)`,
					barThickness: "flex",
					minBarLength: 10,
					data: data.map((d) => d[axis]),
					// data: data.map((d) => [ d.startDateTime, d.time ]),
				};
			});

			const data = {
				datasets: chartDatasets,
				labels,
			};

			const options = {
				// stacked: true,
				responsive: true,
				maintainAspectRatio: false,
				legend: {
					display: true,
				},
				tooltips: {
					enabled: true,
				},
				scales: {
					yAxes: [
						{
							// stacked: true,
							ticks: {
								beginAtZero: true,
								callback (value) {
									return value.substring(0, 20);
								},
							},
						},
					],
					xAxes: [
						{
							ticks: {
								beginAtZero: true,
							}
						}
					],
				},
			};

			const longestArrayLength = datasets.reduce((curr, next) => {
				return Math.max(curr, next.data.length);
			}, 0);

			// Set height so that responsive / flex bars will scale appropriately
			this.style.height = longestArrayLength * 20 + "px";

			this.chart.data = data;
			this.chart.options = options;

			this.canvasContainer.classList.remove("nodisplay");
			this.textContentArea.classList.add("nodisplay");

			this.chart.update();
		} else {
			datasets.forEach(displayTextDataset, this);
			this.style.height = "";
		}

		function displayTextDataset ({ metadata, data }, index) {
			if (index === 0) {
				this.canvasContainer.classList.add("nodisplay");
				this.textContentArea.classList.remove("nodisplay");
				this.textContentArea.innerHTML = "";
			}

			const wrapperContainer = createContainer("container--wrapper");
			addHeaderElement(wrapperContainer, metadata);

			if (typeof data === "string") {
				const container = createContainer("container--data");
				addPathButton.call(this, container, this.path);
				addCodeElement(container, data);

				wrapperContainer.appendChild(container);
			} else {
				for (const key in data) {
					const container = createContainer("container--data");
					addPathButton.call(this, container, key);
					addCodeElement(container, data[key]);

					wrapperContainer.appendChild(container);
				}
			}

			this.textContentArea.appendChild(wrapperContainer);

			function createContainer (className) {
				const container = document.createElement("div");
				container.classList.add(className);
				return container;
			}

			function addHeaderElement (container, text) {
				const header = document.createElement("h2");
				header.innerHTML = text;
				container.appendChild(header);
			}

			function addPathButton (container, str = "") {
				const pathButton = document.createElement("button");
				pathButton.innerHTML = str;
				pathButton.class = "link--path";
				pathButton.onclick = () => {
					console.info("TODO: emit change event to adjust path from parent");
					this.setAttribute("path", `${this.path}.${str}`);
					this.dispatchEvent(new Event("change"));
					// window.location.hash = `${this.path}.${str}`;
				};
				container.appendChild(pathButton);
			}

			function addCodeElement (container, str = "") {
				const codeElement = document.createElement("code");
				if (typeof str === "object") {
					if (Object.keys(str).length < 5) {
						str = JSON.stringify(str);
					} else {
						str = `[object Object]&hellip;(${Object.keys(str).length}))`;
					}
				}

				codeElement.innerHTML = str;
				container.appendChild(codeElement);
			}
		}
	}

	pathAttrChanged (newVal) {
		this.path = newVal;
		this.dataPropChanged(this.data);
	}

	dataAttrChanged (newVal) {
		this.data = JSON.parse(newVal);
		this.dataPropChanged(this.data);
	}

	heightAttrChanged (newVal) {
		// TODO: anything?
		// this.chart.update();
	}

	widthAttrChanged (newVal) {
		// TODO: anything?
		// this.chart.update();
	}

	// TODO: maybe implement an options update method?
	// optionsAttrChanged (newVal) {
	// 	const {
	// 		property,
	// 		value,
	// 	} = JSON.parse(newVal);

	// 	this.chart.options[property] = value;
	// }

	titleAttrChanged (newVal) {
		if (newVal) {
			this.chart.options.title.display = true;
			this.chart.options.title.text = newVal;
		} else {
			this.chart.options.title.display = false;
			this.chart.options.title.text = "";
		}

		this.chart.update();
	}

	typeAttrChanged (newVal) {
		this.chart.options.type = newVal;
		this.chart.update();
	}

	optionsAttrChanged (newVal) {
		this.chart.options = JSON.parse(newVal);
		this.chart.update();

	}

	set path (val = "") {
		this.__path = val;
	}

	get path () {
		return this.__path;
	}

	/**
	 * Store `data` in proper format including relavent metadata
	 * @param  {Object} val data and metadata to be stored
	 * @param  {String} val.metadata filename
	 * @param  {Object} val.data full dataset
	 * @return {void}
	 */
	set data (val = { metadata: "", data: {} }) {
		this.__data.push(val);
	}

	/**
	 * Retrieve properly formatted data for use in creating a chart
	 * @return {Object[]} All datasets adjusted for `path`
	 */
	get data () {
		// return obj.getPropFromPath(this.__data[0], this.path);
		// We want to always format each dataset to match the path attribute
		const mappedData = this.__data
			.map(({ metadata, data }) => {
				return {
					metadata,
					data: obj.getPropFromPath(data, this.path),
				};
			})
			.filter(({ metadata, data }) => !!metadata && !!data);

		return mappedData;
	}

	static get canvasId () {
		return `armVizCanvas`;
	}

	static get textContentId () {
		return `textContentArea`;
	}

	static get canvasContainerId () {
		return `canavsContainer`;
	}

	static get observedAttributes () {
		return [
			`width`,
			`height`,
			`type`,
			`data`,
			`options`,
			`path`,
		];
	}

	static get default_type () {
		return "bar";
	}

	static get default_data () {
		return {
			labels: [
				"default data 1",
				"default data 2",
				"default data 3",
			],
			datasets: [
				{
					label: "DEFAULT LABEL",
					data: [10, 20, 3],
					backgroundColor: [
						"rgba(128, 128, 128, 0.5)",
						"rgba(136, 136, 136, 0.5)",
						"rgba(144, 144, 144, 0.5)",
					],
					borderColor: [
						"rgba(136, 136, 136, 0.5)",
						"rgba(128, 128, 128, 0.5)",
						"rgba(128, 128, 128, 0.5)",
					],
					borderWidth: 1,
				},
			],
		};
	}

	static get default_options () {
		return {
			// stacked: true,
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				display: true,
			},
			tooltips: {
				enabled: true,
			},
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: true,
						},
					},
				],
			},
		};
	}

	static get default_height () {
		return 100;
	}

	static get default_width () {
		return 250;
	}

	static get template () {
		// ${this} is constructor in context
		const tmpl = document.createElement(`template`);
		tmpl.innerHTML = /* html */`
		<!-- <link rel="stylesheet" type="text/css" href="./node_modules/chart.js/dist/Chart.min.css"> -->
		<style type="text/css">
			@import "./node_modules/chart.js/dist/Chart.min.css";
			:host {
				contain: content;
				display: block;
				position: relative;
				width: 100%;
				height: 100%;
			}
			#${this.canvasContainerId} {
				position: relative;
				width: 100%;
				height: 100%;
			}
			canvas {
				contain: content;
			}
			.container--wrapper {
				max-width: 50vw;
				flex: 1 1 auto;
			}
			.container--data {

			}
			.link--path {

			}
			.nodisplay {
				display: none !important;
			}
		}
		</style>
		<div id="${this.canvasContainerId}">
			<canvas id="${this.canvasId}" class="content content--graph"></canvas>
		</div>
		<div id="${this.textContentId}" class="content content--text nodisplay"></div>
		`;
		return tmpl;
	}

	static get is () {
		return `arm-har-viz`;
	}
}

customElements.define(ArmHarViz.is, ArmHarViz);
