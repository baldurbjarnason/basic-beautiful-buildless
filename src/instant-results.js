// instant-results.js

import { processParams } from "./process.js";
import DOMPurify from "dompurify";

class InstantResults extends HTMLElement {
	// constructor() {
	//   super();
	// }
	connectedCallback() {
		console.log("Custom element added to page.");
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
		const result = await processParams(this.params);
		if (result.ok) {
			this.output.textContent = "Done. Results below.";
			const fragment = DOMPurify.sanitize(result.markup, {
				FORBID_TAGS: ["style"],
				FORBID_ATTR: ["style"],
				RETURN_DOM_FRAGMENT: true,
			});
			this.appendChild(fragment);
		}
	}
}

customElements.define("instant-results", InstantResults);
