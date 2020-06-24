export default class ArmVizSettings extends HTMLElement {
	constructor () {

	}

	static get is () {
		return `arm-viz-settings`;
	}
}

customElements.define(ArmVizSettings.is, ArmVizSettings);
