import assert from "node:assert/strict";
import test from "node:test";
import { parseSync } from "@swc/core";
import { extractSpecifiers } from "./extract-specifiers.js";
import fs from "node:fs/promises";

const ast = parseSync(`import dingus from "doofus";
import {dario} from "doofus2";

const whatever = await import("hohoho1");
const whatever2 = await importShim("hohoho2");
const whatever3 = await import("blammo" + "hohoho1");
const whatever4 = await importShim(callGlobalFunction() + "hohoho2");`);

const ast2 = parseSync(
	await fs.readFile("test-data/test-file.js", {
		encoding: "utf8",
	}),
);
const ast3 = parseSync(
	await fs.readFile("test-data/test-file2.js", { encoding: "utf8" }),
);

test("extract-specifiers", async function (t) {
	await t.test("basic extraction", function () {
		const identifiers = extractSpecifiers(ast);
		assert.deepEqual(identifiers, ["doofus", "doofus2", "hohoho1"]);
	});

	await t.test("basic extraction with shim", function () {
		const identifiers = extractSpecifiers(ast, true);
		assert.deepEqual(identifiers, ["doofus", "doofus2", "hohoho1", "hohoho2"]);
	});

	await t.test("test that parsing results empty", function () {
		const identifiers = extractSpecifiers(ast2, false);
		assert.deepEqual(identifiers, []);
	});

	await t.test("test with real world example", function () {
		const identifiers = extractSpecifiers(ast3, false);
		assert.deepEqual(identifiers, [
			"node:crypto",
			"node:path",
			"node:fs/promises",
			"./ImportMap.js",
			"@swc/core",
			"./extract-specifiers.js",
		]);
	});
});
