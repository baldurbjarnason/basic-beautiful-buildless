import crypto from "node:crypto";
import path, { relative } from "node:path";
import fs from "node:fs/promises";
import { ImportMap } from "./ImportMap.js";
import swc from "@swc/core";
import { extractSpecifiers } from "./extract-specifiers.js";

export async function getPathMeta(inputPath, root) {
	const hash = crypto.createHash("md5");
	const file = await fs.open(path.join(root, inputPath));
	const filestream = file.createReadStream();
	const chunks = [];
	for await (const chunk of filestream) {
		hash.update(chunk);
		chunks.push(Buffer.from(chunk));
	}
	const scriptText = Buffer.concat(chunks).toString("utf8");
	let specifiers;
	try {
		const ast = await swc.parse(scriptText);
		specifiers = extractSpecifiers(ast);
	} catch (err) {
		console.error(`${inputPath}: `, err);
	}
	const checksum = hash.digest("hex").slice(0, 12);
	const parsed = path.parse(inputPath);
	return {
		importSpecifiers: specifiers, // Need to resolve these based on inputPath and import map. All off-domain specifiers need to be fetched
		originalPath: `/${inputPath}`,
		hashedPath: `${parsed.dir}/${parsed.name}.${checksum}.js`,
	};
}

export async function scanDir(root = "./") {
	const map = new ImportMap();
	const meta = {};
	const updatedSpecifierMap = {};
	try {
		const dir = await fs.opendir(root, { recursive: true });
		for await (const dirent of dir) {
			if (dirent.isFile() && includeJSfiles(dirent.name)) {
				const relativePath = path.relative(
					root,
					path.join(dirent.parentPath, dirent.name),
				);
				// This is slow because there is no concurrency. Fix later.
				meta[relativePath] = await getPathMeta(relativePath, root);
				updatedSpecifierMap[relativePath] = meta[relativePath].hashedPath;
			} else if (dirent.isFile && dirent.name === "import-map.json") {
				const importMap = JSON.parse(
					await fs.readFile(path.join(dirent.parentPath, dirent.name), {
						encoding: "utf8",
					}),
				);
				if (dirent.parentPath === root) {
					map.addBaseMap(importMap);
				} else {
					const relativePath = path.relative(root, dirent.parentPath);
					map.addScopedMap(importMap, `/${relativePath}/`);
				}
			}
		}
	} catch (err) {
		console.error(err);
	}
	map.updateSpecifierTargets(updatedSpecifierMap);
	return { map, meta };
}

const filterSuffixes = [
	"test.js",
	"spec.js",
	"test.mjs",
	"spec.mjs",
	".11tydata.js",
	".11ty.js",
];
function includeJSfiles(name) {
	return (
		!filterSuffixes.some((suffix) => name.endsWith(suffix)) &&
		(name.endsWith(".js") || name.endsWith(".mjs"))
	);
}
