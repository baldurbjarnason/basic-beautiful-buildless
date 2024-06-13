const encoder = new TextEncoder();
export async function checksum(scriptText, skipHash) {
	const data = encoder.encode(scriptText);

	const ds = new CompressionStream("gzip");
	const decompressedStream = new Blob([data]).stream().pipeThrough(ds);
	const compressed = new Uint8Array(
		await new Response(decompressedStream).arrayBuffer(),
	);
	if (skipHash) {
		return {
			size: data.length,
			compressed: compressed.length,
		}
	}
	const hash = await crypto.subtle.digest("SHA-384", data);
	const base64string = btoa(String.fromCharCode(...new Uint8Array(hash)));
	return {
		sri: `sha384-${base64string}`,
		size: data.length,
		compressed: compressed.length,
	};
}