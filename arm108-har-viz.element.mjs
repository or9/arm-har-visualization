export default class ArmHarViz extends HTMLElement {
	constructor () {
		super();

		this.attachShadow({ mode: "open" })
			appendChild(this.constructor.template.content.cloneNode(true));
	}

	connectedCallback () {
		console.log("#connectedCallback");
	}

	adoptedCallback () {
		console.log("#adoptedCallback");
	}

	attributeChangedCallback (name, oldValue, newValue) {
		console.log("#attributeChangedCallback");
	}

	disconnectedCallback () {
		console.log("#disconnectedCallback");
	}

	static get observedAttributes () {
		// return [
			// `attr1`,
			// `attr2`
		// ];
	}

	static get template () {
		const tmpl = document.createElement(`template`);
		tmpl.innerHTML = /* html */`
		<!--
		schema {
			'$schema': 'http://json-schema.org/draft-04/schema#',
			description: '',
			type: 'object',
			properties: {
				version: {
					type: 'string',
					minLength: 1
				},
				creator: {
					type: 'object',
					properties: {
						name: { type: 'string', minLength: 1 },
						version: { type: 'string', minLength: 1 }
					},
					required: [ 'name', 'version' ]
				},
				pages: { type: 'array', uniqueItems: true, minItems: 1, items: [Object] },
				entries: { type: 'array', uniqueItems: true, minItems: 1, items: [Object] }
			},
			required: [ 'version', 'creator', ... ]
		}
		-->
		<p class="template--section section--meta">
			<span class="version"><code>{{ version }}</code></span>
			<span class="creator">{{ creator.name }} <code>{{ creator.version }}</code></span>
		</p>

		<!--
		schema {
			type: 'array',
			'$schema': 'http://json-schema.org/draft-04/schema#',
			description: '',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'object',
				properties: {
					startedDateTime: [Object],
					time: [Object],
					request: [Object],
					response: [Object],
					cache: [Object],
					timings: [Object],
					serverIPAddress: [Object],
					_initiator: [Object],
					_priority: [Object],
					_resourceType: [Object],
					connection: [Object],
					pageref: [Object]
				}
			}
		}
		-->
		<section class="template--section section--pages">
			<ul>
			{{#each pages}}
				<li>
					<ul>
						<li><label>startedDateTime: </label><code>{{ this.startedDateTime }}</code></li>
						<li><label>time: </label><code>{{ this.time }}</code></li>
						<li><label>request: </label><code>{{ this.request }}</code></li>
						<li><label>response: </label><code>{{ this.response }}</code></li>
						<li><label>cache: </label><code>{{ this.cache }}</code></li>
						<li><label>timings: </label><code>{{ this.timings }}</code></li>
						<li><label>serverIPAddress: </label><code>{{ this.serverIPAddress }}</code></li>
						<li><label>_initiator: </label><code>{{ this._initiator }}</code></li>
						<li><label>_priority: </label><code>{{ this._priority }}</code></li>
						<li><label>_resourceType: </label><code>{{ this._resourceType }}</code></li>
						<li><label>connection: </label><code>{{ this.connection }}</code></li>
						<li><label>pageref: </label><code>{{ this.pageref }}</code></li>
					</ul>
				</li>
			{{/each}}
			</ul>
		</section>

		<!--
		schema {
			type: 'array',
			'$schema': 'http://json-schema.org/draft-04/schema#',
			description: '',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'object',
				properties: {
					startedDateTime: '2020-05-21T17:59:40.350Z',
					time: 60.9669999998156,
					request: {
						method: [String],
						url: 'http://localhost:3011/page/amt',
						httpVersion: 'HTTP/1.1',
						headers: [
							[Object], [Object], [Object], ...
						],
						queryString: [],
						cookies: [ [Object], [Object], [Object] ],
						headersSize: [Integer],
						bodySize: 0
					},
					response: {
						status: 200,
						statusText: 'OK',
						httpVersion: 'HTTP/1.1',
						headers: [
							[Object], [Object], [Object], ...
						],
						cookies: [],
						content: {
						size: 1328029,
						mimeType: 'text/html',
						compression: 0,
						content: {
							size: 1328029,
							mimeType: 'text/html',
							compression: 0,
							text: '<!DOCTYPE html>\n...',
							redirectURL: '',
							headersSize: 1203,
							bodySize: 1328029,
							_transferSize: 1329232,
						}
					cache: {},
					timings: {
						blocked: 3.3589999889228492,
						dns: 0.015000000000000124,
						ssl: -1,
						connect: 0.19900000000000007,
						send: 0.20500000000000007,
						wait: 3.3169999922923745,
						receive: 53.872000018600374,
						_blocked_queueing: 2.1809999889228493,
						_blocked_proxy: 0.0020000000000000018
					},
					serverIPAddress: '[::1]',
					_initiator: { type: 'other' },
					_priority: 'VeryHigh',
					_resourceType: 'document',
					connection: '492202',
					pageref: 'page_78'
				}
			}
		}
		-->
		<section class="template--section section--entries">
		{{#each entries}}
			<label>startedDateTime: </label><code>{{ this.startedDateTime }}</code><br />
			<label>time: </label><code>{{ this.time }}</code><br />
			<label>request: </label><code>{{ this.request }}</code><br />
			<label>response: </label><code>{{ this.response }}</code><br />
			<label>cache</label><code>{{ this.cache }}</code><br />
			<label>timings</label><code>{{ this.timings }}</code><br />
			<label>serverIPAddress</label><code>{{ this.serverIPAddress }}</code><br />
			<label>_initiator</label><code>{{ this._initiator }}</code><br />
			<label>_priority</label><code>{{ this._priority }}</code><br />
			<label>_resourceType</label><code>{{ this._resourceType }}</code><br />
			<label>connection</label><code>{{ this.connection }}</code><br />
			<label>pageref</label><code>{{ this.pageref }}</code><br />
		{{/each}}
		</section>
		`;
		return tmpl;
	}

	static get is () {
		return `arm-har-viz`;
	}
}

customElements.define(ArmHarViz.is, ArmHarViz);
