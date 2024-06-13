import assert from "node:assert/strict";
import test from "node:test";
import { fetchAllScripts, fetchScript, markup, shimMarkup, toJSON } from "./fetchScript.js";
import fs from "node:fs/promises";

const resultGraph = [
	{
		sri: "sha384-zJs0dYbQXKkgyqY9ng6i8LzXpkz/2BgWU5Bjds3+H3rEOlc4R4uV2HIqewvriao2",
		specifiers: [
			"https://esm.sh/v135/udomdiff@1.1.0/esnext/udomdiff.mjs",
			"https://esm.sh/v135/domconstants@1.1.6/esnext/constants.js",
			"https://esm.sh/v135/domconstants@1.1.6/esnext/re.js",
			"https://esm.sh/v135/@webreflection/uparser@0.3.3/esnext/uparser.mjs",
			"https://esm.sh/v135/custom-function@1.0.6/esnext/factory.js",
			"https://esm.sh/v135/uhtml@4.5.9/esnext/uhtml.mjs",
		],
		url: "https://esm.sh/v135/uhtml@4.5.9",
		name: "uhtml",
		size: 353,
		compressed: 184,
	},
	{
		sri: "sha384-fg6RhlyUXzfOat9wJdz66tlimsvI48a0hMsBbDhLjUvvMWC7rT9tD/7NiYyt040k",
		size: 919,
		compressed: 506,
		specifiers: [],
		url: "https://esm.sh/v135/udomdiff@1.1.0/esnext/udomdiff.mjs",
	},
	{
		compressed: 228,
		size: 300,
		sri: "sha384-thLKEC/rC7i02g1TCpUwNMK7y14J1lT4UffrGOJlz8uaa5mueW7wK5qvFDp92S/K",
		specifiers: [],
		url: "https://esm.sh/v135/domconstants@1.1.6/esnext/constants.js",
	},
	{
		sri: "sha384-QvpDF8Qc8rnQAH8f0yyebB7i55c9fIGmppYLmFyINte9jaDpmBpaeeo8VseP85iF",
		compressed: 252,
		size: 301,

		specifiers: [],
		url: "https://esm.sh/v135/domconstants@1.1.6/esnext/re.js",
	},
	{
		compressed: 481,
		size: 619,
		sri: "sha384-2UPFgLwgrSfG+GU2sZwfqo0gy4a7m8XpnK+xzuqlKYNBG+MRCsHkiwmiLfNHZYnh",
		specifiers: ["https://esm.sh/v135/domconstants@1.1.6/esnext/re.js"],
		url: "https://esm.sh/v135/@webreflection/uparser@0.3.3/esnext/uparser.mjs",
	},
	{
		compressed: 266,
		size: 358,
		sri: "sha384-0Mj1jkqBiOHczwKGA2YRmLsjFCRTlh6JVIJMXAvyy+BrKQGCPwo3OHI0bmR7hsuZ",
		specifiers: [],
		url: "https://esm.sh/v135/custom-function@1.0.6/esnext/factory.js",
	},
	{
		compressed: 2721,
		size: 5495,
		sri: "sha384-SMyT02rTqS/AzgSeNhPGPz8fKWM6o0x91b21IdWd668m7Pu9D9KgulAxuRlZWUuz",
		specifiers: [
			"https://esm.sh/v135/udomdiff@1.1.0/esnext/udomdiff.mjs",
			"https://esm.sh/v135/domconstants@1.1.6/esnext/constants.js",
			"https://esm.sh/v135/custom-function@1.0.6/esnext/factory.js",
			"https://esm.sh/v135/domconstants@1.1.6/esnext/constants.js",
			"https://esm.sh/v135/domconstants@1.1.6/esnext/re.js",
			"https://esm.sh/v135/@webreflection/uparser@0.3.3/esnext/uparser.mjs",
		],
		url: "https://esm.sh/v135/uhtml@4.5.9/esnext/uhtml.mjs",
	},
	{
		compressed: 106,
		size: 169,
		sri: "sha384-QKM0siuF3iCvQD2ZLfQFUiHEs3Jvo+GNmICEoBQyUFERHOjMQNJ97NVPuA6a+sZh",
		specifiers: ["https://esm.sh/v135/fetch-mock@9.11.0/esnext/fetch-mock.mjs"],
		url: "https://esm.sh/v135/fetch-mock@9.11.0",
		name: "fetch-mock",
	},
	{
		compressed: 17406,
		size: 46964,
		sri: "sha384-hfCa0ajhkgQ2FO1auby9NcrkzX72s6PgrH77f00BM0lruM3qA7FatYP/fmG4IFxk",
		specifiers: ["https://esm.sh/v135/node_process.js"],
		url: "https://esm.sh/v135/fetch-mock@9.11.0/esnext/fetch-mock.mjs",
	},
	{
		compressed: 960,
		size: 1821,
		sri: "sha384-2iGeLyZpc5/j7k6p8aTc3fqwuLnFp+Lthyl9oeubOtxkXOU/JpF8fR2BNRsTFj76",
		specifiers: ["https://esm.sh/v135/node_events.js"],
		url: "https://esm.sh/v135/node_process.js",
	},
	{
		compressed: 2170,
		size: 6529,
		sri: "sha384-Ptf68f3LqWAiPKrN+T9hzA+7zhkv+0QCkGz2xIc10LZDk+DBkMfUzVOGu5avC8fq",
		specifiers: [],
		url: "https://esm.sh/v135/node_events.js",
	},
];

const testMarkup = `<link rel='modulepreload' href='https://esm.sh/v135/@webreflection/signal@2.1.2' integrity='sha384-JfEi3Y4+14WWoUj/LdlxmXAsucfgWPM1HpgB+GA/eNk3D7QQ/SpvZdOUUclkArtd'>
<link rel='modulepreload' href='https://esm.sh/v135/@webreflection/signal@2.1.2/esnext/signal.mjs' integrity='sha384-V4WC14TkBOFGabE4SWmnyhiBxIbK0e6rJHt4E04hTK1NzopTlcLNI5+iOkP5wvHI'>
<script type='importmap'>
{
	"imports": {
		"@webreflection/signal": "https://esm.sh/v135/@webreflection/signal@2.1.2"
	}
}
</script>`;

const testJSON = {
	meta: {
		compressed: "773 Bytes",
		numberOfModules: 2,
		total: "1.392 KiB",
		length: 1425,
		packages: {
			"@webreflection/signal": {
				length: 1425,
				compressed: "773 Bytes",
				size: "1.392 KiB",
			},
		},
	},
	graph: [
		{
			compressed: 102,
			name: "@webreflection/signal",
			size: 112,
			specifiers: [
				"https://esm.sh/v135/@webreflection/signal@2.1.2/esnext/signal.mjs",
			],
			sri: "sha384-JfEi3Y4+14WWoUj/LdlxmXAsucfgWPM1HpgB+GA/eNk3D7QQ/SpvZdOUUclkArtd",
			url: "https://esm.sh/v135/@webreflection/signal@2.1.2",
		},
		{
			compressed: 671,
			size: 1313,
			specifiers: [],
			sri: "sha384-V4WC14TkBOFGabE4SWmnyhiBxIbK0e6rJHt4E04hTK1NzopTlcLNI5+iOkP5wvHI",
			url: "https://esm.sh/v135/@webreflection/signal@2.1.2/esnext/signal.mjs",
		},
	],
	modulepreloads: [
		`<link rel='modulepreload' href='https://esm.sh/v135/@webreflection/signal@2.1.2' integrity='sha384-JfEi3Y4+14WWoUj/LdlxmXAsucfgWPM1HpgB+GA/eNk3D7QQ/SpvZdOUUclkArtd'>`,
		`<link rel='modulepreload' href='https://esm.sh/v135/@webreflection/signal@2.1.2/esnext/signal.mjs' integrity='sha384-V4WC14TkBOFGabE4SWmnyhiBxIbK0e6rJHt4E04hTK1NzopTlcLNI5+iOkP5wvHI'>`,
	],
	map: {
		imports: {
			"@webreflection/signal":
				"https://esm.sh/v135/@webreflection/signal@2.1.2",
		},
	},
};

test("fetchAllScripts", async function (t) {
	await t.test("basic graph", async function () {
		const { graph } = await fetchAllScripts([
			"uhtml@4.5.9",
			"fetch-mock@9.11.0",
		]);
		assert.deepEqual(graph, resultGraph);
	});
	await t.test("json markup", async function () {
		const markupJSON = await toJSON(["@webreflection/signal"]);
		assert.deepEqual(markupJSON, testJSON);
	});

	await t.test("not ok fetchscript", async function () {
		const result = await fetchScript("https://example.com/404");
		assert.deepEqual(result, []);
	});
	await t.test("basic markup", async function () {
		const json = await toJSON(["@webreflection/signal"]);
		const markupText = await markup(json);
		assert.deepEqual(markupText, testMarkup);
	});
	await t.test("shim markup", async function () {
		const markupText = await shimMarkup();
		assert.deepEqual(
			markupText,
			`<script async src='https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js' integrity='sha384-ie1x72Xck445i0j4SlNJ5W5iGeL3Dpa0zD48MZopgWsjNB/lt60SuG1iduZGNnJn' crossorigin='anonymous' data-size='40577' data-compressed='13812'></script>`,
		);
	});
});
