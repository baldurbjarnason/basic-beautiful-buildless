import { extractSpecifiers } from "./extract-specifiers.js";
import { parse } from "./swc.js";
import { checksum } from "./checksum.js";
import { toHumanReadable } from "./sizes.js";

export async function getSpecifiers(inputText, url) {
	const ast = await parse(inputText, {
		isModule: "unknown",
		syntax: "ecmascript",
	});
	const specifiers = extractSpecifiers(ast);
	return specifiers.map((specifier) => new URL(specifier, url));
}

export async function fetchAllScripts(specifiers = [], skipHash = false) {
	const packages = await Promise.all(
		specifiers.map((specifier) => fetchPackage(specifier, skipHash)),
	);
	const graph = await Promise.all(packages.map((pack) => processScript(pack, skipHash)));
	const meta = {
		packages: {},
	};
	for (let index = 0; index < specifiers.length; index++) {
		const spec = specifiers[index];
		const subgraph = Array.from(
			new Set(graph[index].map((pack) => pack.url.href)),
		).map((href) => graph[index].find((pack) => pack.url.href === href));
		const totalSize = subgraph.reduce((prev, current) => {
			return prev + current.size;
		}, 0);
		const totalCompressed = subgraph.reduce((prev, current) => {
			return prev + current.compressed;
		}, 0);
		meta.packages[spec] = {
			length: totalSize,
			size: toHumanReadable(totalSize),
			compressed: toHumanReadable(totalCompressed),
		};
	}
	return { graph: normaliseGraph(graph.flat()), meta };
}

export async function fetchPackage(specifier, skipHash) {
	const url = dependencyToURL(specifier);
	const scriptResponse = await fetch(url);
	const resultURL = new URL(scriptResponse.url);
	const scriptText = await scriptResponse.text();
	const { sri, size, compressed } = await checksum(scriptText, skipHash);
	const originalSpecifiers = await getSpecifiers(scriptText, resultURL);
	const hrefs = originalSpecifiers.map((specifier) => specifier.href);
	const specifiers = Array.from(new Set(hrefs)).map(
		(specifier) => new URL(specifier),
	);
	return {
		sri,
		size,
		compressed,
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
export async function toJSON(specifiers = [], skipHash = false) {
	const map = { imports: {} };
	const { graph, meta } = await fetchAllScripts(specifiers, skipHash);
	const totalSize = graph.reduce((prev, current) => {
		return prev + current.size;
	}, 0);
	const totalCompressed = graph.reduce((prev, current) => {
		return prev + current.compressed;
	}, 0);
	const humanTotal = toHumanReadable(totalSize);
	const humanCompressed = toHumanReadable(totalCompressed);
	for (const pack of graph.filter((pack) => pack.name !== undefined)) {
		map.imports[pack.name] = pack.url;
	}
	// turn graph into modulepreloads
	const modulepreloads = graph.map(
		(pack) =>
			`<link rel='modulepreload' href='${pack.url}' integrity='${pack.sri}'>`,
	);

	return {
		meta: {
			length: totalSize,
			total: humanTotal,
			compressed: humanCompressed,
			numberOfModules: graph.length,
			...meta,
		},
		graph,
		modulepreloads,
		map,
	};
}

export async function markup(json) {
	return `${json.modulepreloads.join("\n")}
<script type='importmap'>
${JSON.stringify(json.map, null, "\t")}
</script>`;
}

function normaliseGraph(graph) {
	const graphUnique = Array.from(new Set(graph.map((item) => item.url.href)));
	return graphUnique.map((href) => {
		const script = graph.find((script) => script.url.href === href);
		const { sri, specifiers, url, size, compressed } = script;

		const result = {
			sri,
			size,
			compressed,
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
	const { sri, size, compressed } = await checksum(scriptText);
	return `<script async src='${SHIM_URL}' integrity='${sri}' crossorigin='anonymous' data-size='${size}' data-compressed='${compressed}'></script>`;
}

const store = new Map();

export async function fetchScript(url, skipHash) {
	if (store.has(url)) { 
		return store.get(url)
	};
	const scriptResponse = await fetch(url);
	if (!scriptResponse.ok) { 
		return []
	};
	const resultURL = new URL(scriptResponse.url);
	const scriptText = await scriptResponse.text();
	const { sri, size, compressed } = await checksum(scriptText, skipHash);
	const specifiers = await getSpecifiers(scriptText, resultURL);
	const graph = await processScript({
		sri,
		size,
		compressed,
		specifiers,
		url: resultURL,
	}, skipHash);
	store.set(url, graph);
	return graph;
}

async function processScript(pack, skipHash) {
	const dependencies = (
		await Promise.all(pack.specifiers.map((url) => fetchScript(url.href, skipHash)))
	).flat();
	const depProcessed = (
		await Promise.all(dependencies.map((script) => processScript(script, skipHash)))
	).flat();
	const result = [pack].concat(depProcessed).flat();
	return result;
}
