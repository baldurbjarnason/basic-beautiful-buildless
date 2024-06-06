import { readdir, open } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import crypto from "node:crypto";

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
			.join("\n"),
		layers: styleTag(layers, files),
	};
}

const map = {
	imports: {
		"@swc/wasm-web": "https://esm.sh/v135/@swc/wasm-web@1.5.11",
		dompurify: "https://esm.sh/dompurify@3.1.4",
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
