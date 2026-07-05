import process from 'node:process';
import {homedir} from 'node:os';
import path from 'node:path';
import {
	mkdirSync,
	readFileSync,
	writeFileSync,
	existsSync,
} from 'node:fs';

const HISTORY_LIMIT = 50;

const DEFAULT_CONFIG = {
	// Map of alias -> target. Resolved when you run `summon @alias` or `summon alias`.
	bookmarks: {},
	// Search URL template. `%s` is replaced with the URL-encoded query.
	searchEngine: 'https://www.google.com/search?q=%s',
};

/**
Resolve the directory where summon stores its config and history.

Priority:
1. `SUMMON_CONFIG_DIR` (used by tests and power users)
2. `XDG_CONFIG_HOME/summon`
3. Windows: `%APPDATA%/summon`
4. `~/.config/summon`

@returns {string}
*/
export function configDirectory() {
	if (process.env.SUMMON_CONFIG_DIR) {
		return process.env.SUMMON_CONFIG_DIR;
	}

	if (process.env.XDG_CONFIG_HOME) {
		return path.join(process.env.XDG_CONFIG_HOME, 'summon');
	}

	if (process.platform === 'win32' && process.env.APPDATA) {
		return path.join(process.env.APPDATA, 'summon');
	}

	return path.join(homedir(), '.config', 'summon');
}

const configPath = () => path.join(configDirectory(), 'config.json');
const historyPath = () => path.join(configDirectory(), 'history.json');

function readJson(filePath, fallback) {
	try {
		if (!existsSync(filePath)) {
			return fallback;
		}

		return JSON.parse(readFileSync(filePath, 'utf8'));
	} catch {
		// A corrupt file should never crash the CLI; fall back to defaults.
		return fallback;
	}
}

function writeJson(filePath, data) {
	mkdirSync(path.dirname(filePath), {recursive: true});
	writeFileSync(filePath, JSON.stringify(data, null, '\t') + '\n');
}

/**
Read the full config, merged with defaults.

@returns {{bookmarks: Record<string, string>, searchEngine: string}}
*/
export function readConfig() {
	return {...DEFAULT_CONFIG, ...readJson(configPath(), {})};
}

/** @returns {Record<string, string>} */
export function readBookmarks() {
	return readConfig().bookmarks ?? {};
}

/**
Save (or overwrite) a bookmark.

@param {string} name
@param {string} target
*/
export function saveBookmark(name, target) {
	const config = readConfig();
	config.bookmarks = {...config.bookmarks, [name]: target};
	writeJson(configPath(), config);
}

/**
Remove a bookmark.

@param {string} name
@returns {boolean} Whether the bookmark existed.
*/
export function removeBookmark(name) {
	const config = readConfig();

	if (!config.bookmarks || !(name in config.bookmarks)) {
		return false;
	}

	delete config.bookmarks[name];
	writeJson(configPath(), config);
	return true;
}

/** @returns {string[]} Most-recent-first list of opened targets. */
export function readHistory() {
	const history = readJson(historyPath(), []);
	return Array.isArray(history) ? history : [];
}

/**
Prepend a target to the history, de-duplicated and capped.

@param {string} target
*/
export function addHistory(target) {
	const existing = readHistory().filter(item => item !== target);
	const history = [target, ...existing].slice(0, HISTORY_LIMIT);
	writeJson(historyPath(), history);
}
