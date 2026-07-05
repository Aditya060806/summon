import process from 'node:process';
import readline from 'node:readline/promises';

/**
Show a numbered interactive menu and return the chosen value.

@param {string} title
@param {Array<{label: string, value: string}>} items
@returns {Promise<string | undefined>} The chosen value, or undefined if cancelled/empty.
*/
export async function pick(title, items) {
	if (items.length === 0) {
		return undefined;
	}

	const rl = readline.createInterface({input: process.stdin, output: process.stderr});

	try {
		process.stderr.write(`${title}\n\n`);
		for (const [index, item] of items.entries()) {
			process.stderr.write(`  ${String(index + 1).padStart(2)}. ${item.label}\n`);
		}

		process.stderr.write('\n');

		const response = await rl.question('Select a number (or press Enter to cancel): ');
		const answer = response.trim();

		if (answer === '') {
			return undefined;
		}

		const index = Number.parseInt(answer, 10) - 1;
		if (Number.isInteger(index) && index >= 0 && index < items.length) {
			return items[index].value;
		}

		process.stderr.write('Invalid selection.\n');
		return undefined;
	} finally {
		rl.close();
	}
}
