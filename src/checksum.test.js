import assert from "node:assert/strict";
import test from "node:test";
import { checksum } from "./checksum.js";

test("checksum", async function (t) {
	await t.test("skip hash", async function () {
		const result = await checksum("this is a piece of text", true);
		assert.deepEqual(result, { compressed: 43, size: 23 });
	});
});
