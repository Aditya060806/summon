// A conservative "looks like a bare domain" matcher, e.g. `github.com`,
// `example.co.uk`, `localhost:3000`, `192.168.0.1:8080/path`.
const DOMAIN_PATTERN = /^(?:localhost|(?:[a-z\d\-]+\.)+[a-z]{2,}|\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?(?:[\/?#].*)?$/vi;

// When a dotted name ends in one of these, treat it as a (possibly missing)
// file rather than a domain — so `summon report.pdf` never becomes a URL.
const FILE_EXTENSIONS = new Set([
	'txt',
	'md',
	'pdf',
	'png',
	'jpg',
	'jpeg',
	'gif',
	'webp',
	'svg',
	'ico',
	'bmp',
	'tiff',
	'mp3',
	'mp4',
	'mkv',
	'mov',
	'avi',
	'wav',
	'flac',
	'ogg',
	'aac',
	'm4a',
	'webm',
	'zip',
	'gz',
	'tar',
	'7z',
	'rar',
	'xz',
	'zst',
	'doc',
	'docx',
	'xls',
	'xlsx',
	'ppt',
	'pptx',
	'odt',
	'csv',
	'json',
	'xml',
	'yml',
	'yaml',
	'toml',
	'ini',
	'html',
	'htm',
	'css',
	'js',
	'ts',
	'jsx',
	'tsx',
	'exe',
	'dmg',
	'iso',
	'bin',
	'app',
	'deb',
	'rpm',
	'msi',
]);

/**
Whether a string starts with an explicit URL scheme (http, https, mailto, file, …).

A single-letter prefix (Windows drive letter `C:`) and a colon followed by a
digit (a `host:port`) are intentionally not treated as schemes.

@param {string} value
@returns {boolean}
*/
export function hasScheme(value) {
	return /^[a-z][a-z\d+.\-]+:(?!\d)/vi.test(value);
}

/**
Whether a string is a well-formed absolute URL.

@param {string} value
@returns {boolean}
*/
export function isUrl(value) {
	if (!hasScheme(value)) {
		return false;
	}

	try {
		new URL(value); // eslint-disable-line no-new
		return true;
	} catch {
		return false;
	}
}

/**
Whether a bare string looks like a domain we should turn into an `https://` URL.

@param {string} value
@returns {boolean}
*/
export function looksLikeDomain(value) {
	if (hasScheme(value) || !DOMAIN_PATTERN.test(value)) {
		return false;
	}

	const [host] = value.split(/[\/?#]/v);
	const [hostname] = host.split(':');
	const tld = hostname.split('.').pop().toLowerCase();
	return !FILE_EXTENSIONS.has(tld);
}

/**
Normalize a target for opening. Bare domains get an `https://` prefix; existing
URLs and file paths are returned unchanged.

@param {string} target
@returns {string}
*/
export function normalizeTarget(target) {
	return looksLikeDomain(target) ? `https://${target}` : target;
}

/**
Build a search URL from a query and an engine template containing `%s`.

@param {string} query
@param {string} engineTemplate
@returns {string}
*/
export function buildSearchUrl(query, engineTemplate) {
	const encoded = encodeURIComponent(query);

	return engineTemplate.includes('%s')
		? engineTemplate.replaceAll('%s', encoded)
		: engineTemplate + encoded;
}

/**
Expand a bookmark alias into its stored target.

Handles explicit `@name` syntax and bare names that match a bookmark. Anything
else (file paths, URLs) is returned unchanged.

@param {string} input
@param {Record<string, string>} [bookmarks]
@returns {string}
*/
export function expandBookmark(input, bookmarks = {}) {
	if (input.startsWith('@')) {
		const name = input.slice(1);
		if (bookmarks[name]) {
			return bookmarks[name];
		}

		throw new SummonError(`Unknown bookmark: ${input}`, 3);
	}

	if (bookmarks[input] && !hasScheme(input) && !input.includes('/') && !input.includes('\\')) {
		return bookmarks[input];
	}

	return input;
}

/**
Fully resolve a raw input into a final target (bookmark expansion + normalization).

Note: this does not touch the filesystem. The CLI additionally prefers an
existing file over domain normalization.

@param {string} input
@param {Record<string, string>} [bookmarks]
@returns {string}
*/
export function resolveTarget(input, bookmarks = {}) {
	return normalizeTarget(expandBookmark(input, bookmarks));
}

/**
Error type carrying an intended process exit code.
*/
export class SummonError extends Error {
	/**
	@param {string} message
	@param {number} [exitCode]
	*/
	constructor(message, exitCode = 1) {
		super(message);
		this.name = 'SummonError';
		this.exitCode = exitCode;
	}
}
