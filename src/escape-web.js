export function escapeMarkup(text) {
	const result = document.createTextNode(text);
	const wrapper = document.createElement("p");
	wrapper.appendChild(result);
	return wrapper.innerHTML;
}
