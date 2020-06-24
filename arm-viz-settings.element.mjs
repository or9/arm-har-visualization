export default class ArmVizSettings extends HTMLElement {
	constructor () {
		super();
		console.info(`TODO: figure out what this component should actually do. What goes into 'settings'?
			* axis mapping (time, timing, size,...)
			* chart type (bar, scatter, ...)
			* storage (sessionStorage?)`);

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

	static buildTemplate () {
		const tmpl = document.createElement("template");
		const tmpl.innerHTML = /* html */`

		`;
		return tmpl;
	}

	static get is () {
		return `arm-viz-settings`;
	}
}

customElements.define(ArmVizSettings.is, ArmVizSettings);
