import { extractSpecifiers } from "./extract-specifiers.js";
import { parse } from "./swc.js";

const encoder = new TextEncoder();
export async function checksum(scriptText) {
	const data = encoder.encode(scriptText);
	const hash = await crypto.subtle.digest("SHA-384", data);
	const base64string = btoa(String.fromCharCode(...new Uint8Array(hash)));

	return `sha384-${base64string}`;
}

export async function getSpecifiers(inputText, url) {
	const ast = await parse(inputText, {
		isModule: "unknown",
		syntax: "ecmascript",
	});
	const specifiers = extractSpecifiers(ast);
	return specifiers.map((specifier) => new URL(specifier, url));
}

export async function fetchAllScripts(specifiers = []) {
	const packages = await Promise.all(
		specifiers.map((specifier) => fetchPackage(specifier)),
	);
	const graph = await Promise.all(packages.map((pack) => processScript(pack)));
	return normaliseGraph(graph.flat());
}

export async function fetchPackage(specifier) {
	const url = dependencyToURL(specifier);
	const scriptResponse = await fetch(url);
	const resultURL = new URL(scriptResponse.url);
	const scriptText = await scriptResponse.text();
	const sri = await checksum(scriptText);
	const originalSpecifiers = await getSpecifiers(scriptText, resultURL);
	const hrefs = originalSpecifiers.map((specifier) => specifier.href);
	const specifiers = Array.from(new Set(hrefs)).map(
		(specifier) => new URL(specifier),
	);
	return {
		sri,
		specifiers,
		url: resultURL,
		name: normaliseSpecifier(specifier),
	};
}

function normaliseSpecifier(specifier) {
	let name = "";
	if (specifier[0] === "@") {
		name = `@${specifier.split("@")[1]}`;
	} else {
		name = specifier.split("@")[0];
	}
	return name;
}

// Use document.createTextNode to inject this into the rendered template
export async function markup(specifiers = []) {
	const map = { imports: {} };
	const graph = await fetchAllScripts(specifiers);
	for (const pack of graph.filter((pack) => pack.name !== undefined)) {
		map.imports[pack.name] = pack.url;
	}
	// turn graph into modulepreloads
	const modulepreloads = graph.map(
		(pack) =>
			`<link rel="modulepreload" href="${pack.url}" integrity="${pack.sri}">`,
	);
	return `${modulepreloads.join("\n")}
<script type="importmap">
${JSON.stringify(map, null, "\t")}
</script>`;
}

function normaliseGraph(graph) {
	const graphUnique = Array.from(new Set(graph.map((item) => item.url.href)));
	return graphUnique.map((href) => {
		const script = graph.find((script) => script.url.href === href);
		const { sri, specifiers, url } = script;

		const result = {
			sri,
			specifiers: specifiers.map((specifier) => specifier.href),
			url: url.href,
		};
		if (script.name) {
			result.name = script.name;
		}
		return result;
	});
}

function dependencyToURL(specifier) {
	// Maybe change the default to bundle?
	return new URL(`/v135/${specifier}`, "https://esm.sh/");
}
// This needs to include the originating package in every result
// and entrypoint: true|false, (find file with resultURL for entrypoint mark it.)

const SHIM_URL =
	"https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js";
export async function shimMarkup() {
	const scriptResponse = await fetch(SHIM_URL);
	const scriptText = await scriptResponse.text();
	const sri = await checksum(scriptText);
	return `<script async src="${SHIM_URL}" integrity="${sri}" crossorigin="anonymous"></script>`;
}

export async function fetchScript(url) {
	const scriptResponse = await fetch(url);
	if (!scriptResponse.ok) return [];
	const resultURL = new URL(scriptResponse.url);
	const scriptText = await scriptResponse.text();
	const sri = await checksum(scriptText);
	const specifiers = await getSpecifiers(scriptText, resultURL);
	const graph = await processScript({ sri, specifiers, url: resultURL });
	return graph;
}

async function processScript(pack) {
	const dependencies = (
		await Promise.all(pack.specifiers.map((url) => fetchScript(url.href)))
	).flat();
	const depProcessed = (
		await Promise.all(dependencies.map((script) => processScript(script)))
	).flat();
	return [pack].concat(depProcessed).flat();
}
