// instant-kib.js

import { processKiBParams } from "./process-kib.js";
import DOMPurify from "dompurify";

class InstantKib extends HTMLElement {
	// constructor() {
	//   super();
	// }
	connectedCallback() {
		const queryString = window.location.search;
		this.params = new URLSearchParams(queryString);
		this.output = this.querySelector("output");
		if (this.params.get("specifiers")) {
			this.getResults();
		} else {
			this.output.textContent = "No package names specified.";
		}
	}
	async getResults() {
		const result = await processKiBParams(this.params);
		if (result.ok) {
			this.output.textContent = "Done. Results below.";
			this.output.setAttribute("hidden", "hidden");
			const fragment = DOMPurify.sanitize(result.markup, {
				FORBID_TAGS: ["style"],
				FORBID_ATTR: ["style"],
				RETURN_DOM_FRAGMENT: true,
			});
			this.appendChild(fragment);
		}
	}
}

customElements.define("instant-kib", InstantKib);
