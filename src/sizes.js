

export function toHumanReadable(bytes) {
	const log = 1024;
	const decimals = 3;
	const sizes = [
		"Bytes",
		"KiB",
		"MiB",
		"GiB",
		"TiB",
		"PiB",
		"EiB",
		"ZiB",
		"YiB",
	];
	const index = Math.floor(Math.log(bytes) / Math.log(log));
	return `${Number.parseFloat((bytes / log ** index).toFixed(decimals))} ${sizes[index]
		}`;
}