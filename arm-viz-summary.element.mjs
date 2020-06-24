import {
	converter,
	obj,
} from "./util.mjs";

export default class ArmVizSummary extends HTMLElement {
	constructor () {
		super();

		this.__data = [];

		this.constructor.observedAttributes.forEach((attr) => {
			this[attr] = this.getAttribute(attr) || this.constructor[`default_${attr}`];
		});

		this.attachShadow({ mode: "open" });
		this.shadowRoot.appendChild(this.constructor.buildTemplate().content.cloneNode(true));

		const toggleSummaryCheckbox = this.shadowRoot.getElementById("toggleSummaryDisplay");
		toggleSummaryCheckbox.onchange = this.toggleSummaryDisplay.bind(this);
		toggleSummaryCheckbox.dispatchEvent(new Event("change"));
	}

	connectedCallback () {

	}

	adoptedCallback () {

	}

	disconnectedCallback () {

	}

	attributeChangedCallback (attrName, oldVal, newVal) {
		const funcName = `${attrName}AttrChanged`;
		if (typeof this[funcName] === "function") {
			this[funcName](newVal);
		} else {
			console.info(`No handler registered for attr ${attrName}`);
		}
	}

	reset () {
		this.__data = [];
	}

	/**
	 * Should be called whenever the chart needs to be updated.
	 * Normally this is on change of `path` or `data` attributes.
	 * @param  {Array}  datasets Array of datasets, each representing one full set of graphable data as well as associated metadata
	 * @return {void}
	 */
	dataPropChanged (datasets = []) {
		console.log("@summary#dataPropChanged", datasets);

		const totalsElement = this.shadowRoot.getElementById("totals");
		totalsElement.innerHTML = ``;

		const summedPages = datasets
			.map(mapDataToPages)
			.flat();

		while (summedPages.length > 0) {
			const page = summedPages.shift();
			console.log("page: ", page);
			const group = this.constructor.buildTotalsGroup(page).content.cloneNode(true);

			totalsElement.appendChild(group);
		}

		const entrySummaries = datasets
			.map(mapDataToEntrySummaries)
			.flat();


		console.log("entries flat: ", entrySummaries);

		while (entrySummaries.length > 0) {
			const entrySummary = entrySummaries.shift();
			console.log("entrySummary shifted", entrySummary);
			const summaryTemplateGroup = this.constructor
							.buildEntrySummaryGroup(entrySummary)
							.content
							.cloneNode(true);

			this.shadowRoot
				.getElementById("summaryContainer")
				.appendChild(summaryTemplateGroup);
		}

		function mapDataToPages ({ metadata, data }) {
			const defaultPagesAgg = {
				count: 0,
				startedDateTime: "",
				id: "",
				title: "",
				inputUrl: "",
				pageTimings: {
					onContentLoad: 0,
					onLoad: 0,
				}
			};


			const summedPageTimings = data.log.pages.reduce((curr, next) => {
				return {
					count: curr.count + 1,
					onContentLoad: curr.pageTimings.onContentLoad + next.pageTimings.onContentLoad,
					onLoad: curr.pageTimings.onLoad + next.pageTimings.onLoad,
				};
			}, defaultPagesAgg);

			for (const key in summedPageTimings) {
				if (key === "count") continue;
				summedPageTimings[key] = summedPageTimings[key] / summedPageTimings.count;
			}

			return {
				metadata,
				...summedPageTimings,
			};
		}

		function mapDataToEntrySummaries ({ metadata, data }) {
			const defaultEntryAgg = {
				count: 0,
				time: { max: 0, total: 0, },
				blocked: { max: 0, total: 0, },
				connect: { max: 0, total: 0, },
				dns: { max: 0, total: 0, },
				receive: { max: 0, total: 0, },
				send: { max: 0, total: 0, },
				ssl: { max: 0, total: 0, },
				wait: { max: 0, total: 0, },
				_blocked_queueing: { max: 0, total: 0, },
			};

			const timingsSummary = data.log.entries.reduce(reduceEntryToSummary, defaultEntryAgg);

			for (const key in timingsSummary) {
				if (key === "count") continue;

				const average = timingsSummary[key].total / timingsSummary.count;
				// console.log("setting average based on key.total ", average);
				timingsSummary[key] = {
					...timingsSummary[key],
					average: average < 0 ? -1 : average,
				};
			}

			return {
				metadata,
				...timingsSummary,
			};

			function reduceEntryToSummary (curr, next) {
				return {
					count: curr.count + 1,
					time: {
						max: Math.max(curr.time.max, next.time),
						total: curr.time.total + next.time,
					},
					blocked: {
						max: Math.max(curr.blocked.max, next.timings.blocked),
						total: curr.blocked.total + next.timings.blocked,
					},
					connect: {
						max: Math.max(curr.connect.max, next.timings.connect),
						total: curr.connect.total + next.timings.connect,
					},
					dns: {
						max: Math.max(curr.dns.max, next.timings.dns),
						total: curr.dns.total + next.timings.dns,
					},
					receive: {
						max: Math.max(curr.receive.max, next.timings.receive),
						total: curr.receive.total + next.timings.receive,
					},
					send: {
						max: Math.max(curr.send.max, next.timings.send),
						total: curr.send.total + next.timings.send,
					},
					ssl: {
						max: Math.max(curr.ssl.max, next.timings.ssl),
						total: curr.ssl.total + next.timings.ssl,
					},
					wait: {
						max: Math.max(curr.wait.max, next.timings.wait),
						total: curr.wait.total + next.timings.wait,
					},
					_blocked_queueing: {
						max: Math.max(curr._blocked_queueing.max, next.timings._blocked_queueing),
						total: curr._blocked_queueing.total + next.timings._blocked_queueing,
					},
				};
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

	toggleSummaryDisplay (event) {
		if (event.target.checked) {
			this.classList.add("show--summary_average");
			this.classList.remove("show--summary_max");
		} else {
			this.classList.remove("show--summary_average");
			this.classList.add("show--summary_max");
		}
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

	static buildTotalsGroup (pageObj) {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
		<div class="totals--group">
			<h3>${pageObj.metadata}</h3>
			<label class="label--totals">onContentLoad:</label>
			<span class="content--totals">${pageObj.onContentLoad}</span>
			<label class="label--totals">onLoad:</label>
			<span class="content--totals">${pageObj.onLoad}</span>
		</div>
		`;
		return tmpl;
	}

	static buildEntrySummaryGroup (entrySummaryObj) {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
		<div class="entry-summary--group">
			<h3>
				${entrySummaryObj.metadata}
				(${entrySummaryObj.count})
				<span class="display--average">avg</span>
				<span class="display--max">max</span>
			</h3>

			<ul class="display--average">
				<li>
					<label class="label--summary">time:</label>
					<span class="val">${entrySummaryObj.time.average}</span>
				</li>
				<li>
					<label class="label--summary">blocked:</label>
					<span class="val">${entrySummaryObj.blocked.average}</span>
				</li>
				<li>
					<label class="label--summary">connect:</label>
					<span class="val">${entrySummaryObj.connect.average}</span>
				</li>
				<li>
					<label class="label--summary">dns:</label>
					<span class="val">${entrySummaryObj.dns.average}</span>
				</li>
				<li>
					<label class="label--summary">receive:</label>
					<span class="val">${entrySummaryObj.receive.average}</span>
				</li>
				<li>
					<label class="label--summary">send:</label>
					<span class="val">${entrySummaryObj.send.average}</span>
				</li>
				<li>
					<label class="label--summary">ssl:</label>
					<span class="val">${entrySummaryObj.ssl.average}</span>
				</li>
				<li>
					<label class="label--summary">wait:</label>
					<span class="val">${entrySummaryObj.wait.average}</span>
				</li>
				<li>
					<label class="label--summary">_blocked_queueing:</label>
					<span class="val">${entrySummaryObj._blocked_queueing.average}</span>
				</li>
			</ul>
			<ul class="display--max">
				<li>
					<label class="label--summary">time:</label>
					<span class="val">${entrySummaryObj.time.max}</span>
				</li>
				<li>
					<label class="label--summary">blocked:</label>
					<span class="val">${entrySummaryObj.blocked.max}</span>
				</li>
				<li>
					<label class="label--summary">connect:</label>
					<span class="val">${entrySummaryObj.connect.max}</span>
				</li>
				<li>
					<label class="label--summary">dns:</label>
					<span class="val">${entrySummaryObj.dns.max}</span>
				</li>
				<li>
					<label class="label--summary">receive:</label>
					<span class="val">${entrySummaryObj.receive.max}</span>
				</li>
				<li>
					<label class="label--summary">send:</label>
					<span class="val">${entrySummaryObj.send.max}</span>
				</li>
				<li>
					<label class="label--summary">ssl:</label>
					<span class="val">${entrySummaryObj.ssl.max}</span>
				</li>
				<li>
					<label class="label--summary">wait:</label>
					<span class="val">${entrySummaryObj.wait.max}</span>
				</li>
				<li>
					<label class="label--summary">_blocked_queueing:</label>
					<span class="val">${entrySummaryObj._blocked_queueing.max}</span>
				</li>
			</ul>
		</div>
		`;
		return tmpl;
	}

	static buildTemplate () {
		const tmpl = document.createElement("template");
		tmpl.innerHTML = /* html */`
		<style>
		:host {
			display: flex;
			flex-flow: column wrap;
		}
		:host(.show--summary_average) .display--max,
		:host(.show--summary_max) .display--average {
			display: none;
		}
		:host(.show--summary_average) .display--average,
		:host(.show--summary_max) .display--max {
			display: block;
		}
		#totals {
			display: flex;
			flex-flow: row wrap;
			justify-content: space-between;
		}
		#totals h3 {
			display: inline-block;
		}
		.totals--group {

		}
		.label--totals {
			font: 1em/1.25em monaco, monospace;
			display: inline-block;
		}
		.label--summary {
			font: 1em/1.25em monaco, monospace;
			display: inline-block;
		}
		.content--totals {
			font-weight: bold;
			display: inline-block;
		}
		</style>
		<div id="summaryContainer">
			<label for="toggleSummaryDisplay">Toggle display</label>
			<input id="toggleSummaryDisplay" title="Toggle display" type="checkbox" checked />
			<div id="totals"></div>
		</div>
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
