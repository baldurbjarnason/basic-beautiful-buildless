import { readdir, open } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import crypto from "node:crypto";

const mapData = {
	meta: {
		length: 33976,
		total: "33.18 KiB",
		compressed: "12.48 KiB",
		numberOfModules: 4,
		packages: {
			"@swc/wasm-web": {
				length: 12532,
				size: "12.238 KiB",
				compressed: "4.115 KiB",
			},
			dompurify: {
				length: 21444,
				size: "20.941 KiB",
				compressed: "8.365 KiB",
			},
		},
	},
	graph: [
		{
			sri: "sha384-BGZRSymkPqivjLAYR6XNpVcGa+8ZDlCuieFC+eezED/hY24KZ5qd0d3zbLVfTU2r",
			size: 174,
			compressed: 109,
			specifiers: [
				"https://esm.sh/v135/@swc/wasm-web@1.5.25/es2022/wasm-web.mjs",
			],
			url: "https://esm.sh/v135/@swc/wasm-web@1.5.25",
			name: "@swc/wasm-web",
		},
		{
			sri: "sha384-LRhwYZWjt+Q2ja3adcByJ+c0hxW45Jl7QxGJupKGIABrSjgtcE3MjHjzUzzvbYFk",
			size: 12358,
			compressed: 4105,
			specifiers: [],
			url: "https://esm.sh/v135/@swc/wasm-web@1.5.25/es2022/wasm-web.mjs",
		},
		{
			sri: "sha384-SxfAKwUijKfuht8xp6QVrn5FWkBGSKffRZwo1z9wQOztSuCFJj6ysuRzl03XAra+",
			size: 161,
			compressed: 104,
			specifiers: ["https://esm.sh/v135/dompurify@3.1.5/es2022/dompurify.mjs"],
			url: "https://esm.sh/v135/dompurify@3.1.5",
			name: "dompurify",
		},
		{
			sri: "sha384-efDf8tV9QHj7yD6i9c/CXPu0n5w/FTh6Re9NBn3U7R7S9ZRUB8aMdUtMPt1qUGum",
			size: 21283,
			compressed: 8462,
			specifiers: [],
			url: "https://esm.sh/v135/dompurify@3.1.5/es2022/dompurify.mjs",
		},
	],
	modulepreloads: [
		"<link rel='modulepreload' href='https://esm.sh/v135/@swc/wasm-web@1.5.25' integrity='sha384-BGZRSymkPqivjLAYR6XNpVcGa+8ZDlCuieFC+eezED/hY24KZ5qd0d3zbLVfTU2r'>",
		"<link rel='modulepreload' href='https://esm.sh/v135/@swc/wasm-web@1.5.25/es2022/wasm-web.mjs' integrity='sha384-LRhwYZWjt+Q2ja3adcByJ+c0hxW45Jl7QxGJupKGIABrSjgtcE3MjHjzUzzvbYFk'>",
		"<link rel='modulepreload' href='https://esm.sh/v135/dompurify@3.1.5' integrity='sha384-SxfAKwUijKfuht8xp6QVrn5FWkBGSKffRZwo1z9wQOztSuCFJj6ysuRzl03XAra+'>",
		"<link rel='modulepreload' href='https://esm.sh/v135/dompurify@3.1.5/es2022/dompurify.mjs' integrity='sha384-efDf8tV9QHj7yD6i9c/CXPu0n5w/FTh6Re9NBn3U7R7S9ZRUB8aMdUtMPt1qUGum'>",
	],
	map: {
		imports: {
			"@swc/wasm-web": "https://esm.sh/v135/@swc/wasm-web@1.5.25",
			dompurify: "https://esm.sh/v135/dompurify@3.1.5",
		},
	},
	shim: "<script async src='https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js' integrity='sha384-ie1x72Xck445i0j4SlNJ5W5iGeL3Dpa0zD48MZopgWsjNB/lt60SuG1iduZGNnJn' crossorigin='anonymous' data-size='40577' data-compressed='13742'></script>",
};

export default async function () {
	const baseDir = "assets";
	const layers = ["base", "decorations", "structure", "tokens"];
	const files = await Promise.all(
		layers.map((layer) => listFiles(layer, baseDir)),
	);
	const scripts = await listScripts("src");
	const scriptFiles = scripts.map((desc) => desc.url);
	const mainScript = scripts.find(
		(script) => script.filename === "instant-results.js",
	);
	const kibScript = scripts.find(
		(script) => script.filename === "instant-kib.js",
	);
	return {
		files: files.flat().concat(scriptFiles),
		filesJSON: JSON.stringify(files.flat().concat(scriptFiles)),
		main: `<script type="module" src="${mainScript.url}"></script>
`,
		scripts,
		kib: `<script type="module" src="${kibScript.url}"></script>
`,
		map: processMap(scripts),
		modulepreloads: scripts
			.filter((pack) => pack.filename !== "instant-results.js")
			.map(
				(pack) =>
					`<link rel='modulepreload' href='${pack.url}' integrity='${pack.sri}'>`,
			)
			.concat(mapData.modulepreloads)
			.join("\n"),
		layers: styleTag(layers, files),
	};
}

const map = {
	imports: {
		...mapData.map.imports,
		"/src/swc.js": "/src/swc-web.js",
		"/src/escape.js": "/src/escape-web.js",
	},
};

function processMap(scripts) {
	for (const script of scripts) {
		const unversionedURL = script.url.split("?")[0];
		if (unversionedURL.endsWith("-web.js")) {
			const original = unversionedURL.replace("-web.js", ".js");
			map.imports[original] = script.url;
		} else {
			map.imports[unversionedURL] = script.url;
		}
	}
	return JSON.stringify(map, null, "\t");
}

async function listFiles(layer, baseDir) {
	try {
		const files = await readdir(join(baseDir, layer), { recursive: true });
		return Promise.all(
			files
				.filter((filename) => extname(filename) === ".css")
				.map((filename) => fileToURL(filename, layer, baseDir)),
		);
	} catch (_err) {
		console.error(_err);
		return [];
	}
}

async function fileToURL(filename, layer, baseDir) {
	return `/${baseDir}/${layer}/${filename}${await checkFile(
		filename,
		layer,
		baseDir,
	)}`;
}

function styleTag(layers = [], files = []) {
	let importStatements = [];
	for (const layer of files) {
		const layerName = layers[files.indexOf(layer)];
		importStatements = importStatements.concat(
			layer.map(
				(filename) => `@import url("${filename}") layer(${layerName});`,
			),
		);
	}
	return `<style>
${importStatements.join("\n")}
</style>`;
}

async function listScripts(baseDir) {
	try {
		const files = await readdir(baseDir, { recursive: true });
		const descriptions = await Promise.all(
			files
				.filter(
					(filename) =>
						extname(filename) === ".js" && !filename.endsWith(".test.js"),
				)
				.map((filename) => describeScript(filename, baseDir)),
		);
		const filenames = descriptions.map((desc) =>
			basename(desc.filename, ".js"),
		);
		return descriptions.filter(
			(desc) => !filenames.includes(`${basename(desc.filename, ".js")}-web`),
		);
	} catch (_err) {
		console.error(_err);
		return [];
	}
}

async function describeScript(filename, baseDir) {
	const hash = crypto.createHash("sha256");
	const file = await open(join(baseDir, filename));
	const filestream = file.createReadStream();
	// Async iteration seems to be the best way to handle streams in a promise environment
	for await (const chunk of filestream) {
		hash.update(chunk);
	}
	const hashBuffer = hash.digest();
	const checksum = hashBuffer.toString("hex");
	const sri = `sha256-${hashBuffer.toString("base64")}`;
	return {
		sri,
		filename,
		url: `/${baseDir}/${filename}${getHashParam(checksum)}`,
	};
}

async function checkFile(filename, layer, baseDir) {
	const hash = crypto.createHash("sha256");
	const file = await open(join(baseDir, layer, filename));
	const filestream = file.createReadStream();
	// Async iteration seems to be the best way to handle streams in a promise environment
	for await (const chunk of filestream) {
		hash.update(chunk);
	}
	const checksum = hash.digest("hex");
	return getHashParam(checksum);
}
function getHashParam(checksum) {
	return `?v=${checksum.slice(0, 32)}`;
}
