import { md5 } from 'hash-wasm';

export function hashText (text) {
	return md5(text)
}