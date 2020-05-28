export default class ArmDropzone extends HTMLElement {
	constructor () {
		super();

		// Reflect attributes to properties
		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));
	}

	connectedCallback () {
		// dragenter?
		// dragleave?
		[
			`dragenter`,
			`dragover`,
			`dragleave`,
			`drop`,
		].forEach((eventName) => {
			this.addEventListener(eventName, this.preventDefaults, false);
		});

		[
			`dragover`,
		].forEach((eventName) => {
			this.addEventListener(eventName, this.highlight.bind(this), false);
		});

		[
			`drop`,
			`dragleave`,
		].forEach((eventName) => {
			this.addEventListener(eventName, this.unhighlight.bind(this), false);
		});

		this.addEventListener("drop", this.dropHandler.bind(this), false);
		this.addEventListener("dragover", this.dragoverHandler.bind(this), false);

		document.body.addEventListener("drop", this.preventDefaults, false);
		document.body.addEventListener("dragenter", this.makeInteractive.bind(this), false);
		document.body.addEventListener("dragover", this.proxyHighlight.bind(this), false);
	}

	disconnectedCallback () {
		[
			`dragenter`,
			`dragover`,
			`dragleave`,
			`drop`,
		].forEach((eventName) => {
			this.removeEventListener(eventName, this.preventDefaults);
		});

		[
			`dragover`,
		].forEach((eventName) => {
			this.removeEventListener(eventName, this.highlight.bind(this));
		});

		[
			`drop`,
			`dragleave`,
		].forEach((eventName) => {
			this.removeEventListener(eventName, this.unhighlight.bind(this));
		});

		this.removeEventListener("drop", this.dropHandler.bind(this));
		this.removeEventListener("dragover", this.dragoverHandler.bind(this));

		document.body.removeEventListener("drop", this.preventDefaults);
		document.body.removeEventListener("dragenter", this.proxyHighlight.bind(this));
		document.body.removeEventListener("dragover", this.proxyHighlight.bind(this));
	}

	adoptedCallback () {

	}

	attributeChangedCallback (name, oldVal, newVal) {

	}

	addListeners (methodName, eventName) {
		this[methodName]();
	}

	preventDefaults (event) {
		event.stopPropagation();
		event.preventDefault();
	}

	makeInteractive (event) {
		this.classList.add(this.constructor.constant.class.INTERACTIVE);
	}

	proxyHighlight (event) {
		if (event.path.some(el => el.tagName && el.tagName === this.constructor.is.toUpperCase())) {
			console.log("yes, we're over it");
			return this.highlight.call(this, event);
		}
	}

	highlight (event) {
		// console.log("#highlight", event);
		this.classList.add(this.constructor.constant.class.HIGHLIGHT);
	}

	unhighlight (event) {
		console.log("#unhilight", event);
		this.classList.remove(this.constructor.constant.class.HIGHLIGHT);
		this.classList.remove(this.constructor.constant.class.INTERACTIVE);
	}

	dropHandler (event) {
		console.log("dropHandler", event);
		console.log("event dataTransfer? ", event.dataTransfer);
		console.log("event.files? ", event.dataTransfer.files);
	}

	dragoverHandler (event) {
		// console.log("#dragoverHandler", event);
	}

	static get observedAttributes () {
		return [
		];
	}

	static get constant () {
		return {
			class: {
				HIGHLIGHT: `over`,
				INTERACTIVE: `interactive`,
			},
		};
	}

	static get template () {
		const tmpl = document.createElement("template");

		tmpl.innerHTML = /* html */`
		<style type="text/css">
		:host {
			contain: content;
			border: 5px dashed lightblue;
			transition: all 0.2s;
			pointer-events: none;
		}

		:host(.${this.constant.class.INTERACTIVE}) {
			pointer-events: all;
		}

		:host(.${this.constant.class.HIGHLIGHT}) {
			border: 3px dashed blue;
		}
		</style>
		<h1>Drop zone</h1>
		<p>Drag your files right over here</p>
		`;

		return tmpl;
	}

	static get is () {
		return `arm-dropzone`;
	}
}

window.customElements.define(ArmDropzone.is, ArmDropzone);
