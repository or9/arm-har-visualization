// import * as Chart from "./node_modules/chart.js/dist/Chart.bundle.js";
// import * as Chart from "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.8.0/Chart.bundle.min.js";
// create libs directory
// rollup chart.js
// import * as Chart from "./lib/chart.js/Chart.js";

export default class ArmHarViz extends HTMLElement {
	constructor () {
		super();

		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));
	}

	connectedCallback () {
		console.log("#connectedCallback");
		// this.ctx = this.shadowRoot.getElementById(this.constructor.id).getContext(`2d`);
		this.ctx = this.shadowRoot.getElementById(this.constructor.id);

		// insert data or load from URL
		this.chart = new window.Chart(this.ctx, {
			type: this.type,
			data: this.data,
			options: this.options
		});

		console.log("so this.chart???", this.chart);
	}

	adoptedCallback () {
		console.log("#adoptedCallback");
	}

	attributeChangedCallback (name, oldValue, newValue) {
		console.log("#attributeChangedCallback", name, newValue);
		// Reflect observed attributes to properties
		this[name] = newValue;
	}

	disconnectedCallback () {
		console.log("#disconnectedCallback");
		this.ctx = null;
	}

	static get id () {
		return `armVizCanvas`;
	}

	static get observedAttributes () {
		return [
			`width`,
			`height`,
			`type`,
			`data`,
			`options`,
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
				}
			]
		};
	}

	static get default_options () {
		return {
			responsive: true,
			maintainAspectRatio: true,
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
							beginAtZero: true
						}
					}
				]
			}
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
				display: inline-flex;
			}
		</style>
		<!-- <div id="${this.id}"></div> -->
		<canvas id="${this.id}"></canvas>
		`;
		return tmpl;
	}

	static get is () {
		return `arm-har-viz`;
	}
}

customElements.define(ArmHarViz.is, ArmHarViz);
