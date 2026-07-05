#!/usr/bin/env node
import process from 'node:process';
import {existsSync} from 'node:fs';
import * as streamConsumers from 'node:stream/consumers';
import meow from 'meow';
import open from 'open';
import clipboard from 'clipboardy';
import {temporaryWrite} from 'tempy';
import {fileTypeFromBuffer} from 'file-type';
import {
	readBookmarks,
	saveBookmark,
	removeBookmark,
	readHistory,
	addHistory,
	readSearchEngines,
	defaultSearchEngineName,
} from './lib/config.js';
import {
	isUrl,
	looksLikeDomain,
	normalizeTarget,
	expandBookmark,
	resolveTarget,
	buildSearchUrl,
	SummonError,
} from './lib/resolve.js';
import {revealInFileManager} from './lib/reveal.js';
import {pick} from './lib/picker.js';

const cli = meow(`
	Usage
	  $ summon <file|url|@bookmark> … [options] [-- <app> [args]]
	  $ cat <file> | summon [--extension] [options] [-- <app> [args]]

	Options
	  --wait, -w          Wait for the app to exit
	  --background        Do not bring the app to the foreground (macOS only)
	  --extension         File extension for when stdin file type cannot be detected
	  --dry-run, -n       Print what would be opened without opening it
	  --search, -s        Treat the input as a search query
	  --engine, -e        Search engine to use with --search (see --engines)
	  --engines           List available search engines
	  --clipboard, -c     Open the URL/path currently on the clipboard
	  --reveal, -r        Reveal the file/folder in your file manager
	  --recent            Pick from recently opened items
	  --save <name>       Save the given target as a bookmark (does not open)
	  --remove-bookmark   Remove a saved bookmark by name
	  --bookmarks         List saved bookmarks

	Examples
	  $ summon https://sindresorhus.com
	  $ summon github.com                 # scheme added automatically
	  $ summon report.pdf photo.png notes.txt
	  $ summon https://github.com -- 'google chrome' --incognito
	  $ summon @docs                      # open a saved bookmark
	  $ summon https://docs.example.com --save docs
	  $ summon -s "rust async traits"
	  $ summon -s "flatMap" -e mdn
	  $ echo '<h1>Hi</h1>' | summon --extension=html
	  $ summon report.pdf --reveal
	  $ summon --recent
`, {
	importMeta: import.meta,
	flags: {
		wait: {type: 'boolean', default: false, shortFlag: 'w'},
		background: {type: 'boolean', default: false},
		extension: {type: 'string'},
		dryRun: {type: 'boolean', default: false, shortFlag: 'n'},
		search: {type: 'boolean', default: false, shortFlag: 's'},
		engine: {type: 'string', shortFlag: 'e'},
		engines: {type: 'boolean', default: false},
		clipboard: {type: 'boolean', default: false, shortFlag: 'c'},
		reveal: {type: 'boolean', default: false, shortFlag: 'r'},
		recent: {type: 'boolean', default: false},
		save: {type: 'string'},
		removeBookmark: {type: 'string'},
		bookmarks: {type: 'boolean', default: false},
	},
});

const {flags} = cli;

// Split off a trailing `-- <app> [args]` section from the raw arguments so it
// never gets confused with the (now possibly multiple) targets.
const rawArguments = process.argv.slice(2);
const separatorIndex = rawArguments.indexOf('--');
const appTokens = separatorIndex === -1 ? [] : rawArguments.slice(separatorIndex + 1);
const targets = appTokens.length > 0
	? cli.input.slice(0, cli.input.length - appTokens.length)
	: cli.input;

const openOptions = {wait: flags.wait, background: flags.background};
if (appTokens.length > 0) {
	const [name, ...appArguments] = appTokens;
	openOptions.app = {name, arguments: appArguments};
}

const stderr = message => process.stderr.write(`${message}\n`);
const stdout = message => process.stdout.write(`${message}\n`);

async function main() {
	if (handleManagementCommand()) {
		return;
	}

	const bookmarks = readBookmarks();
	const plan = await collectInputs(bookmarks);
	if (plan.done) {
		return;
	}

	if (plan.stdinMode) {
		await handleStdin();
		return;
	}

	await act(plan.rawInputs, bookmarks);
}

// Handle commands that never open anything. Returns true when one ran.
function handleManagementCommand() {
	if (flags.bookmarks) {
		listBookmarks();
		return true;
	}

	if (flags.engines) {
		listSearchEngines();
		return true;
	}

	if (flags.removeBookmark !== undefined) {
		if (!removeBookmark(flags.removeBookmark)) {
			throw new SummonError(`No such bookmark: ${flags.removeBookmark}`, 3);
		}

		stdout(`Removed bookmark: ${flags.removeBookmark}`);
		return true;
	}

	if (flags.save !== undefined) {
		if (targets.length === 0) {
			throw new SummonError('Specify a target to save, e.g. `summon https://example.com --save name`', 4);
		}

		const value = resolveTarget(targets[0], readBookmarks());
		saveBookmark(flags.save, value);
		stdout(`Saved bookmark ${flags.save} → ${value}`);
		return true;
	}

	return false;
}

// Decide what to open. Returns {rawInputs} | {stdinMode:true} | {done:true}.
async function collectInputs(bookmarks) {
	if (flags.clipboard) {
		const clipboardText = await clipboard.read();
		const text = clipboardText.trim();
		if (!text) {
			throw new SummonError('Clipboard is empty', 4);
		}

		return {rawInputs: text.split(/\s+/v).filter(Boolean)};
	}

	if (flags.search) {
		return {rawInputs: [searchUrlFromTargets()]};
	}

	if (flags.recent) {
		const chosen = await pick('Recently opened', readHistory().map(item => ({label: item, value: item})));
		return chosen ? {rawInputs: [chosen]} : {done: true};
	}

	if (targets.length > 0) {
		return {rawInputs: targets};
	}

	if (process.stdin.isTTY) {
		const chosen = await interactivePicker(bookmarks);
		return chosen ? {rawInputs: [chosen]} : {done: true};
	}

	return {stdinMode: true};
}

function searchUrlFromTargets() {
	if (targets.length === 0) {
		throw new SummonError('Provide a search query, e.g. `summon -s "hello world"`', 4);
	}

	const engines = readSearchEngines();
	const engineName = flags.engine ?? defaultSearchEngineName();
	const template = engines[engineName];
	if (!template) {
		throw new SummonError(`Unknown search engine: ${engineName}. Available: ${Object.keys(engines).toSorted().join(', ')}`, 4);
	}

	return buildSearchUrl(targets.join(' '), template);
}

async function act(rawInputs, bookmarks) {
	const expanded = rawInputs.map(input => expandBookmark(input, bookmarks));

	if (flags.reveal) {
		for (const target of expanded) {
			if (flags.dryRun) {
				stdout(`[dry-run] reveal: ${target}`);
				continue;
			}

			await revealInFileManager(target); // eslint-disable-line no-await-in-loop
		}

		return;
	}

	for (const input of expanded) {
		await openOne(input); // eslint-disable-line no-await-in-loop
	}
}

// Prefer an existing file over domain normalization, then URLs, then bare domains.
function classify(input) {
	if (existsSync(input)) {
		return {target: input};
	}

	if (isUrl(input)) {
		return {target: input};
	}

	if (looksLikeDomain(input)) {
		return {target: normalizeTarget(input)};
	}

	return {target: input, missing: true};
}

async function openOne(input) {
	const {target, missing} = classify(input);
	if (missing) {
		throw new SummonError(`File or URL not found: ${input}`, 2);
	}

	if (flags.dryRun) {
		const via = openOptions.app ? ` (via ${openOptions.app.name})` : '';
		stdout(`[dry-run] open: ${target}${via}`);
		return;
	}

	await open(target, openOptions);
	addHistory(target);
}

async function handleStdin() {
	const buffer = await streamConsumers.buffer(process.stdin);
	const type = await fileTypeFromBuffer(buffer);
	const extension = flags.extension ?? type?.ext ?? 'txt';

	if (flags.dryRun) {
		stdout(`[dry-run] open piped stdin as .${extension} file`);
		return;
	}

	const filePath = await temporaryWrite(buffer, {extension});
	await open(filePath, openOptions);
	addHistory(filePath);
}

function listBookmarks() {
	const bookmarks = readBookmarks();
	const names = Object.keys(bookmarks);

	if (names.length === 0) {
		stdout('No bookmarks yet. Add one with: summon <target> --save <name>');
		return;
	}

	const width = Math.max(...names.map(name => name.length));
	for (const name of names.toSorted()) {
		stdout(`  ${name.padEnd(width)}  ${bookmarks[name]}`);
	}
}

function listSearchEngines() {
	const engines = readSearchEngines();
	const defaultName = defaultSearchEngineName();
	const names = Object.keys(engines).toSorted();
	const width = Math.max(...names.map(name => name.length));

	for (const name of names) {
		const marker = name === defaultName ? '*' : ' ';
		stdout(`${marker} ${name.padEnd(width)}  ${engines[name]}`);
	}

	stdout('\n* = default. Choose another with: summon -s "query" -e <name>');
}

async function interactivePicker(bookmarks) {
	const items = [
		...Object.entries(bookmarks).map(([name, target]) => ({label: `@${name} → ${target}`, value: `@${name}`})),
		...readHistory().map(item => ({label: item, value: item})),
	];

	if (items.length === 0) {
		throw new SummonError('Specify a file path or URL', 4);
	}

	return pick('What would you like to open?', items);
}

try {
	await main();
} catch (error) {
	if (error instanceof SummonError) {
		stderr(`summon: ${error.message}`);
		process.exit(error.exitCode);
	}

	stderr(`summon: ${error.message ?? error}`);
	process.exit(1);
}
