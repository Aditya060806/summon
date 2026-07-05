// Word-boundary characters that earn a scoring bonus when a match starts there.
const BOUNDARY = /[\s\-_\/.@:]/v;

/**
Score how well `query` fuzzy-matches `target`.

Returns a non-negative score (higher is better) when every character of the
query appears in order within the target, or `-1` when there's no match.
Consecutive matches and matches at word boundaries score higher.

@param {string} query
@param {string} target
@returns {number}
*/
export function fuzzyScore(query, target) {
	const q = query.toLowerCase();
	const t = target.toLowerCase();

	if (q === '') {
		return 0;
	}

	let score = 0;
	let index = 0;
	let consecutive = 0;

	for (const char of q) {
		const found = t.indexOf(char, index);
		if (found === -1) {
			return -1;
		}

		let bonus = 1;

		if (found === index && index > 0) {
			consecutive += 1;
			bonus += consecutive * 2;
		} else {
			consecutive = 0;
		}

		if (found === 0 || BOUNDARY.test(t[found - 1])) {
			bonus += 3;
		}

		score += bonus;
		index = found + 1;
	}

	return score;
}

/**
Filter and rank items by fuzzy match against a label.

@template T
@param {string} query
@param {T[]} items
@param {(item: T) => string} toLabel
@returns {T[]} Matching items, best first.
*/
export function fuzzyFilter(query, items, toLabel = String) {
	return items
		.map(item => ({item, score: fuzzyScore(query, toLabel(item))}))
		.filter(entry => entry.score >= 0)
		.toSorted((a, b) => b.score - a.score)
		.map(entry => entry.item);
}
