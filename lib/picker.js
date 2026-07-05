import process from 'node:process';
import readline from 'node:readline/promises';
import {fuzzyFilter} from './fuzzy.js';

const PAGE_SIZE = 15;

function render(title, items) {
	process.stderr.write(`\n${title}\n\n`);

	const shown = items.slice(0, PAGE_SIZE);
	for (const [index, item] of shown.entries()) {
		process.stderr.write(`  ${String(index + 1).padStart(2)}. ${item.label}\n`);
	}

	if (items.length > shown.length) {
		process.stderr.write(`  … ${items.length - shown.length} more (type to filter)\n`);
	}

	process.stderr.write('\n');
	return shown;
}

/**
Show an interactive fuzzy picker and return the chosen value.

Type to fuzzy-filter, enter a number to select from the visible list, or press
Enter on an empty line to cancel. When a filter narrows results to one, it's
selected automatically.

@param {string} title
@param {Array<{label: string, value: string}>} items
@returns {Promise<string | undefined>}
*/
export async function pick(title, items) {
	if (items.length === 0) {
		return undefined;
	}

	const rl = readline.createInterface({input: process.stdin, output: process.stderr});
	let current = items;

	try {
		for (;;) {
			const shown = render(title, current);
			// eslint-disable-next-line no-await-in-loop
			const response = await rl.question('Type to filter, number to select, Enter to cancel: ');
			const answer = response.trim();

			if (answer === '') {
				return undefined;
			}

			if (/^\d+$/v.test(answer)) {
				const index = Number.parseInt(answer, 10) - 1;
				if (index >= 0 && index < shown.length) {
					return shown[index].value;
				}

				process.stderr.write('Invalid selection.\n');
				continue;
			}

			const filtered = fuzzyFilter(answer, items, item => item.label);

			if (filtered.length === 0) {
				process.stderr.write('No matches.\n');
				current = items;
			} else if (filtered.length === 1) {
				return filtered[0].value;
			} else {
				current = filtered;
			}
		}
	} finally {
		rl.close();
	}
}
