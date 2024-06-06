import { escapeMarkup } from "./escape.js";
import { toJSON } from "./fetchScript.js";

export async function processKiBParams(params) {
	const specifiers = params.get("specifiers").split(/\W+/);
	const jsonResult = await toJSON(specifiers);
	const meta = `
	<div class="Meta Meta-kib">
	<h2>Calculations</h2>
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
	${whoa(jsonResult)}
	</div>`;
	// Add skip to code. And "you entered."
	return {
		ok: true,
		markup: `${meta}`,
	};
}

function whoa(results) {
	if (
		results.meta.compressed.includes("KiB") ||
		results.meta.compressed.includes("Bytes")
	) {
		return `<p class="Meta-comment">That isn’t so bad, is it?</p>`;
	}
	return `<p class="Meta-comment">Whoah! That's not just a few KiB. That&rquo;s the other thing!</p>`;
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
