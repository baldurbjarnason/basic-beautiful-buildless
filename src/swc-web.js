import initSwc, { parse as swcParse } from "@swc/wasm-web";

await initSwc();

export const parse = swcParse;
