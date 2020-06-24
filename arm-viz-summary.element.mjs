// import {
// 	converter,
// 	obj,
// } from "./util.mjs";

export default class ArmVizSummary extends HTMLElement {
	constructor () {
		super();

		this.__data = [];

		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.buildTemplate().content.cloneNode(true));
	}

	connectedCallback () {

	}

	adoptedCallback () {

	}

	disconnectedCallback () {

	}

	attributeChangedCallback (attrName, oldVal, newVal) {

	}

	reset () {
		this.__data = [];
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

	static buildTemplate () {
		const tmpl = document.createElement("template");
		const tmpl.innerHTML = /* html */`

		`;
		return tmpl;
	}

	static get observedAttributes () {
		return [
			`data`,
		];
	}

	static get is () {
		return `arm-viz-summary`;
	}
}

customElements.define(ArmVizSummary.is, ArmVizSummary);
