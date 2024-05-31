import assert from "node:assert/strict";
import test from "node:test";
import { fetchAllScripts, markup, shimMarkup } from "./fetchScript.js";
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
	},
	{
		sri: "sha384-fg6RhlyUXzfOat9wJdz66tlimsvI48a0hMsBbDhLjUvvMWC7rT9tD/7NiYyt040k",
		specifiers: [],
		url: "https://esm.sh/v135/udomdiff@1.1.0/esnext/udomdiff.mjs",
	},
	{
		sri: "sha384-thLKEC/rC7i02g1TCpUwNMK7y14J1lT4UffrGOJlz8uaa5mueW7wK5qvFDp92S/K",
		specifiers: [],
		url: "https://esm.sh/v135/domconstants@1.1.6/esnext/constants.js",
	},
	{
		sri: "sha384-QvpDF8Qc8rnQAH8f0yyebB7i55c9fIGmppYLmFyINte9jaDpmBpaeeo8VseP85iF",
		specifiers: [],
		url: "https://esm.sh/v135/domconstants@1.1.6/esnext/re.js",
	},
	{
		sri: "sha384-2UPFgLwgrSfG+GU2sZwfqo0gy4a7m8XpnK+xzuqlKYNBG+MRCsHkiwmiLfNHZYnh",
		specifiers: ["https://esm.sh/v135/domconstants@1.1.6/esnext/re.js"],
		url: "https://esm.sh/v135/@webreflection/uparser@0.3.3/esnext/uparser.mjs",
	},
	{
		sri: "sha384-0Mj1jkqBiOHczwKGA2YRmLsjFCRTlh6JVIJMXAvyy+BrKQGCPwo3OHI0bmR7hsuZ",
		specifiers: [],
		url: "https://esm.sh/v135/custom-function@1.0.6/esnext/factory.js",
	},
	{
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
		sri: "sha384-QKM0siuF3iCvQD2ZLfQFUiHEs3Jvo+GNmICEoBQyUFERHOjMQNJ97NVPuA6a+sZh",
		specifiers: ["https://esm.sh/v135/fetch-mock@9.11.0/esnext/fetch-mock.mjs"],
		url: "https://esm.sh/v135/fetch-mock@9.11.0",
		name: "fetch-mock",
	},
	{
		sri: "sha384-hfCa0ajhkgQ2FO1auby9NcrkzX72s6PgrH77f00BM0lruM3qA7FatYP/fmG4IFxk",
		specifiers: ["https://esm.sh/v135/node_process.js"],
		url: "https://esm.sh/v135/fetch-mock@9.11.0/esnext/fetch-mock.mjs",
	},
	{
		sri: "sha384-2iGeLyZpc5/j7k6p8aTc3fqwuLnFp+Lthyl9oeubOtxkXOU/JpF8fR2BNRsTFj76",
		specifiers: ["https://esm.sh/v135/node_events.js"],
		url: "https://esm.sh/v135/node_process.js",
	},
	{
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
	graph: [
		{
			name: "@webreflection/signal",
			specifiers: [
				"https://esm.sh/v135/@webreflection/signal@2.1.2/esnext/signal.mjs",
			],
			sri: "sha384-JfEi3Y4+14WWoUj/LdlxmXAsucfgWPM1HpgB+GA/eNk3D7QQ/SpvZdOUUclkArtd",
			url: "https://esm.sh/v135/@webreflection/signal@2.1.2",
		},
		{
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
		const graph = await fetchAllScripts(["uhtml@4.5.9", "fetch-mock@9.11.0"]);
		assert.deepEqual(graph, resultGraph);
	});
	await t.test("basic markup", async function () {
		const markupText = await markup(["@webreflection/signal"]);
		assert.deepEqual(markupText, testMarkup);
	});
	await t.test("json markup", async function () {
		const markupJSON = await markup(["@webreflection/signal"], true);
		assert.deepEqual(markupJSON, testJSON);
	});
	await t.test("shim markup", async function () {
		const markupText = await shimMarkup();
		assert.deepEqual(
			markupText,
			`<script async src='https://ga.jspm.io/npm:es-module-shims@1.10.0/dist/es-module-shims.js' integrity='sha384-ie1x72Xck445i0j4SlNJ5W5iGeL3Dpa0zD48MZopgWsjNB/lt60SuG1iduZGNnJn' crossorigin='anonymous'></script>`,
		);
	});
});
