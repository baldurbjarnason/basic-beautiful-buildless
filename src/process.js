// This needs to be called with the url params, process them. Then render the final HTML that gets run through DOMpurify before insertion.
// Trim the param values,
// call markup. If it throws or returns an empty string, render an error notice
// Escape the markup string.
// Render template
// Ultimately, this will get called by a custom element on the results page and that element is responsible for calling dompurify on the result.

import { escapeMarkup } from "./escape.js";
import { markup, shimMarkup } from "./fetchScript.js";

export async function processParams(params) {
	const specifiers = params.get("specifiers").split(/\W+/);
	let result = "";
	try {
		result = await markup(specifiers);
	} catch (err) {
		console.error(err);
	}
	if (result.length === 0) {
		return { ok: false, markup: "<p>This does not seem to have worked.</p>" };
	}
	let shim = "";
	if (params.get("shim") !== "true") {
		shim = await shimMarkup();
	}
	const rows = result.split("\n");
	return {
		ok: true,
		markup: `<label>
		<span class="ResultLabel">Here is your instant import map, with modulepreloads:</span>
<textarea spellcheck="false" rows="${rows.length + 2}">${escapeMarkup(result)}
${shim}
</textarea></label>`,
	};
}
