export default class ArmDropzone extends HTMLElement {
	constructor () {
		super();

		// Reflect attributes to properties
		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		// const busWorkerName = this.getAttribute("bus-worker");
		// this.busWorker = window[busWorkerName];
		// this.busWorker.postMessage(new ArrayBuffer(), [new ArrayBuffer()]);

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.template.content.cloneNode(true));

		this.shadowRoot.getElementById("fileInput").addEventListener("change", this.fileAddHandler.bind(this));
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

		this.shadowRoot.querySelectorAll(".coreui--icon__svg > use")
			.forEach((el) => {
				const href = el.getAttribute("href");
				el.setAttribute("href", "");
				el.setAttribute("href", href);
			});
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
			// console.log("yes, we're over it");
			return this.highlight.call(this, event);
		}
	}

	highlight (event) {
		// console.log("#highlight", event);
		this.classList.add(this.constructor.constant.class.HIGHLIGHT);
	}

	unhighlight (event) {
		// console.log("#unhilight", event);
		this.classList.remove(this.constructor.constant.class.HIGHLIGHT);
		this.classList.remove(this.constructor.constant.class.INTERACTIVE);
	}

	fileAddHandler (event) {
		// console.log("fileAddHandler event", event.path[0].files);
		this.dropHandler({
			dataTransfer: {
				files: event.path[0].files
			}
		});
	}

	dropHandler (event) {
		// console.log("#dropHandler event", event);
		const files = event.dataTransfer.files;
		const length = files.length;
		var i = 0;

		while (i < length) {
			const file = files[i];

			// File is not a transferrable type
			file.arrayBuffer()
			.then((fileArrayBuffer) => {
				this.busWorker.postMessage([
					"addFile",
					file.name,
					fileArrayBuffer,
				],
				[
					strToArrayBuffer("addFile"),
					strToArrayBuffer(file.name),
					fileArrayBuffer,
				])
			});

			i += 1;
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
			display: flex;
			flex-flow: column wrap;
			align-items: center;
			justify-content: center;
		}

		:host(.${this.constant.class.INTERACTIVE}) {
			pointer-events: all;
		}

		:host(.${this.constant.class.HIGHLIGHT}) {
			border: 3px dashed blue;
		}
		input {
			pointer-events: all;
			display: inline-flex;
			position: relative;
			flex: 1 0 auto;
		}
		.dropfiles--icon {
			position: relative;
			display: inline-flex;
			flex: 1 0 auto;
			fill: lightblue;
		}
		:host(.${this.constant.class.HIGHLIGHT}) .dropfiles--icon {
			transition: width, height, fill, 0.5s;
			width: 30%;
			fill: blue;
		}
		:host(.${this.constant.class.INTERACTIVE}) .dropfiles--icon {
			transition: width, height, fill, 0.5s;
			width: 20%;
		}
		:host(.row--has-data) .dropfiles--icon,
		:host(.row--has-data) input {
			display: none;
		}
		</style>

		<svg class="coreui--icon__svg dropfiles--icon">
			<use href="lib/@coreui/icons/sprites/free.svg#cil-library-add"></use>
		</svg>

		<input type="file"
			id="fileInput"
			value="Upload file(s)"
			accept=".har,application/json"
			multiple
			/>
		`;

		return tmpl;
	}

	static get is () {
		return `arm-dropzone`;
	}
}

window.customElements.define(ArmDropzone.is, ArmDropzone);
