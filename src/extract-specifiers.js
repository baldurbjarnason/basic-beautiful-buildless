// @ts-check

export function extractSpecifiers(ast, shim = false) {
	const identifiers = parseBody(ast.body, shim);
	return identifiers;
}
// This is almost certainly not the right way to do this, but it'll do for now.
function parseBody(body, shim) {
	let identifiers = [];
	// if (body === undefined || body === null || (!body.length && body.length !== 0)) console.log(body);
	for (const node of body) {
		if (
			node.type === "ImportDeclaration" ||
			node.type === "ExportNamedDeclaration" ||
			node.type === "ExportAllDeclaration"
		) {
			identifiers.push(node.source?.value);
		} else if (node.callee?.type === "Import") {
			if (node.arguments[0].expression.type === "StringLiteral") {
				identifiers.push(node.arguments[0].expression.value);
			}
		} else if (
			node.callee?.type === "Identifier" &&
			node.callee?.value === "importShim" &&
			shim === true
		) {
			if (node.arguments[0].expression.type === "StringLiteral") {
				identifiers.push(node.arguments[0].expression.value);
			}
		} else if (node.init?.argument) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.init.argument), shim),
			);
		} else if (node.init) {
			identifiers = identifiers.concat(parseBody([node.init], shim));
		} else if (node.consequent) {
			identifiers = identifiers.concat(parseBody([node.consequent], shim));
		} else if (node.elements) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.elements), shim),
			);
		} else if (node.left && node.right) {
			identifiers = identifiers.concat(
				parseBody([node.left, node.right], shim),
			);
		} else if (node.argument) {
			identifiers = identifiers.concat(parseBody([node.argument], shim));
		} else if (node.arguments) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.arguments), shim),
			);
		} else if (node.expression) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.expression), shim),
			);
		} else if (node.expressions) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.expressions), shim),
			);
		} else if (node.body) {
			identifiers = identifiers.concat(parseBody([].concat(node.body), shim));
		} else if (node.stmts) {
			identifiers = identifiers.concat(parseBody([].concat(node.stmts), shim));
		} else if (node.declarations) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.declarations), shim),
			);
		} else if (node.declaration) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.declaration), shim),
			);
		} else if (node.block) {
			identifiers = identifiers.concat(parseBody([].concat(node.block), shim));
			if (node.handler?.body) {
				identifiers = identifiers.concat(
					parseBody([].concat(node.handler.body), shim),
				);
			}
		} else if (node.property) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.property), shim),
			);
		} else if (node.properties) {
			identifiers = identifiers.concat(parseBody(node.properties, shim));
		} else if (node.function?.body) {
			identifiers = identifiers.concat(
				parseBody([].concat(node.function.body), shim),
			);
		} else if (node.value) {
			identifiers = identifiers.concat(parseBody([].concat(node.value), shim));
		} else {
			// console.log(node);
		}
	}
	return identifiers.filter((id) => id);
}
