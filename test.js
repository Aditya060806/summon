import process from 'node:process';
import {createReadStream} from 'node:fs';
import test from 'ava';
import {execa} from 'execa';
import {temporaryDirectory} from 'tempy';
import {
	isUrl,
	looksLikeDomain,
	normalizeTarget,
	buildSearchUrl,
	resolveTarget,
	SummonError,
} from './lib/resolve.js';

const run = (arguments_, options) => execa(process.execPath, ['cli.js', ...arguments_], options);

// A fresh config dir per invocation keeps tests isolated.
const withConfig = () => ({env: {...process.env, SUMMON_CONFIG_DIR: temporaryDirectory()}});

// --- Unit: resolve helpers ---

test('isUrl detects absolute URLs', t => {
	t.true(isUrl('https://example.com'));
	t.true(isUrl('mailto:a@b.com'));
	t.false(isUrl('example.com'));
	t.false(isUrl('./file.txt'));
});

test('looksLikeDomain matches bare domains only', t => {
	t.true(looksLikeDomain('github.com'));
	t.true(looksLikeDomain('example.co.uk/path'));
	t.true(looksLikeDomain('localhost:3000'));
	t.false(looksLikeDomain('https://github.com'));
	t.false(looksLikeDomain('./relative/path'));
	t.false(looksLikeDomain('just-a-word'));
	t.false(looksLikeDomain('report.pdf'));
});

test('normalizeTarget prepends https for bare domains', t => {
	t.is(normalizeTarget('github.com'), 'https://github.com');
	t.is(normalizeTarget('https://github.com'), 'https://github.com');
	t.is(normalizeTarget('./file.txt'), './file.txt');
});

test('buildSearchUrl encodes the query into the template', t => {
	t.is(
		buildSearchUrl('rust async', 'https://www.google.com/search?q=%s'),
		'https://www.google.com/search?q=rust%20async',
	);
});

test('resolveTarget expands @bookmarks', t => {
	const bookmarks = {docs: 'https://docs.example.com'};
	t.is(resolveTarget('@docs', bookmarks), 'https://docs.example.com');
	t.is(resolveTarget('docs', bookmarks), 'https://docs.example.com');
});

test('resolveTarget throws for unknown @bookmark', t => {
	const error = t.throws(() => resolveTarget('@nope', {}), {instanceOf: SummonError});
	t.is(error.exitCode, 3);
});

// --- Integration: CLI ---

test('--version prints a version', async t => {
	const {stdout} = await run(['--version']);
	t.true(stdout.length > 0);
});

test('--help mentions summon', async t => {
	const {stdout} = await run(['--help']);
	t.true(stdout.includes('summon'));
});

test('dry-run opens a single URL', async t => {
	const {stdout} = await run(['https://example.com', '--dry-run']);
	t.is(stdout.trim(), '[dry-run] open: https://example.com');
});

test('dry-run normalizes a bare domain', async t => {
	const {stdout} = await run(['github.com', '--dry-run']);
	t.is(stdout.trim(), '[dry-run] open: https://github.com');
});

test('dry-run handles multiple targets', async t => {
	const {stdout} = await run(['https://a.com', 'https://b.com', '--dry-run']);
	const lines = stdout.trim().split('\n');
	t.is(lines.length, 2);
	t.true(lines[0].includes('https://a.com'));
	t.true(lines[1].includes('https://b.com'));
});

test('dry-run shows the chosen app', async t => {
	const {stdout} = await run(['https://example.com', '--dry-run', '--', 'firefox']);
	t.true(stdout.includes('via firefox'));
});

test('missing file exits with code 2', async t => {
	const error = await t.throwsAsync(run(['no-such-file-1234.pdf']));
	t.is(error.exitCode, 2);
	t.true(error.stderr.includes('not found'));
});

test('search builds a search URL', async t => {
	const {stdout} = await run(['-s', 'hello world', '--dry-run']);
	t.true(stdout.includes('search?q=hello%20world'));
});

test('bookmarks: save, list, resolve, remove', async t => {
	const options = withConfig();

	const saved = await run(['https://docs.example.com', '--save', 'docs'], options);
	t.true(saved.stdout.includes('Saved bookmark docs'));

	const list = await run(['--bookmarks'], options);
	t.true(list.stdout.includes('docs'));
	t.true(list.stdout.includes('https://docs.example.com'));

	const opened = await run(['@docs', '--dry-run'], options);
	t.is(opened.stdout.trim(), '[dry-run] open: https://docs.example.com');

	const removed = await run(['--remove-bookmark', 'docs'], options);
	t.true(removed.stdout.includes('Removed bookmark'));

	const emptyList = await run(['--bookmarks'], options);
	t.true(emptyList.stdout.includes('No bookmarks'));
});

test('supports opening files from stdin (dry-run)', async t => {
	const {stdout} = await run(['--dry-run'], {input: createReadStream('./cli.js')});
	t.true(stdout.includes('[dry-run] open piped stdin'));
});
