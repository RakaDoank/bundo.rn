export function findLastLineOf(
	line: RegExp,
	lines: string[],
	startIndex: number = 0,
	endIndex?: number,
) {

	let endLine = -1

	for(let ln = startIndex; ln < lines.length; ln++) {
		const currentLine = lines[ln]

		if(!currentLine) {
			break
		}

		if(line.test(currentLine)) {
			endLine = ln
		} else if(
			(typeof endIndex === "number" && endIndex == ln) ||
			endLine > -1
		) {
			break
		}
	}

	return endLine

}
