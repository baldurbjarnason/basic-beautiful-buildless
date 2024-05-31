import { readdir, open } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import crypto from "node:crypto";

export default async function layers() {
	const baseDir = "assets";
	const layers = ["base", "decorations", "structure", "tokens"];
	console.log("WTF!");
	const files = await Promise.all(
		layers.map((layer) => listFiles(layer, baseDir)),
	);
	return styleTag(layers, files);
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
