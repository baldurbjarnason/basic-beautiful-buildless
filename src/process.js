import { escapeMarkup } from "./escape.js";
import { markup, shimMarkup, toJSON } from "./fetchScript.js";

export async function processParams(params) {
	const specifiers = params
		.get("specifiers")
		.split(" ")
		.map((result) => result.trim());
	const json = params.get("json") === "on";
	let result = "";
	let jsonResult;
	try {
		jsonResult = await toJSON(specifiers);
		if (!json) {
			result = await markup(jsonResult);
		} else {
			result = jsonResult;
		}
	} catch (err) {
		console.error(err);
	}
	if (result.length === 0) {
		return { ok: false, markup: "<p>This does not seem to have worked.</p>" };
	}
	let shim = "";
	if (json) {
		result.shim = await shimMarkup();
		result = JSON.stringify(result, null, "\t");
	} else {
		shim = await shimMarkup();
	}
	const meta = `
<p><a href="#code" class="Button-nav">Skip to code</a></p>
	<div class="Meta">
	<h2>Results</h2>
<div class="Notice"><p><em>Calculations and preloads <strong>do not</strong> include WASM files unless they were inlined using Base64 or similar.</em></p>
</div>
	<h3 class="Meta-heading">You entered</h3>

<p><code>${escapeMarkup(params.get("specifiers"))}</code></p>

	<h3 class="Meta-heading">Total payload</h3>
	<div class="Meta-section">
		<div class="Meta-size"><div class="Meta-size-value">${jsonResult.meta.total}</div><div class="Meta-size-text">uncompressed</div></div>
		<div class="Meta-size"><div class="Meta-size-value">${
			jsonResult.meta.compressed
		}</div><div class="Meta-size-text">compressed</div></div>
	</div>
	<h3 class="Meta-heading">Package payloads</h3>
	${packageSizes(jsonResult.meta)}
	</div>`;
	// Add skip to code. And "you entered."
	const rows = result.split("\n");
	return {
		ok: true,
		markup: `${meta}<label class="Meta" id="code">
		<span class="ResultLabel Meta-heading">Map and Preloads:</span>
<textarea spellcheck="false" rows="${rows.length + 2}">${escapeMarkup(result)}
${shim}
</textarea></label>`,
	};
}

function packageSizes(meta) {
	const packageNames = Object.keys(meta.packages);
	let result = [];
	for (const name of packageNames) {
		const percentage = (
			(meta.packages[name].length / meta.length) *
			100
		).toFixed(2);
		result = result.concat(`<div class="Meta-package">
			<div class="Meta-package-name">${escapeMarkup(
				name,
			)}<div class="Meta-package-percentage">${percentage}%</div></div>
		<div class="Meta-package-size"><div class="Meta-package-value">${escapeMarkup(
			meta.packages[name].size,
		)}</div><div class="Meta-package-text">uncompressed</div></div>
		<div class="Meta-package-size"><div class="Meta-package-value">${escapeMarkup(
			meta.packages[name].compressed,
		)}</div><div class="Meta-package-text">compressed</div></div>
			</div>`);
	}
	return result.join("\n");
}
