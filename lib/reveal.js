import process from 'node:process';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import open from 'open';
import {SummonError} from './resolve.js';

function run(command, arguments_) {
	return new Promise((resolve, reject) => {
		const subprocess = spawn(command, arguments_, {stdio: 'ignore', detached: false});
		subprocess.on('error', reject);
		subprocess.on('close', code => {
			if (code === 0 || code === null) {
				resolve();
			} else {
				reject(new Error(`${command} exited with code ${code}`));
			}
		});
	});
}

/**
Reveal a file or folder in the OS file manager, selecting/highlighting it.

- macOS: `open -R <path>`
- Windows: `explorer /select,<path>`
- Linux/other: open the containing directory (reliable, no highlight)

@param {string} target
@returns {Promise<void>}
*/
export async function revealInFileManager(target) {
	const resolved = path.resolve(target);

	if (!existsSync(resolved)) {
		throw new SummonError(`Cannot reveal, path not found: ${target}`, 2);
	}

	if (process.platform === 'darwin') {
		await run('open', ['-R', resolved]);
		return;
	}

	if (process.platform === 'win32') {
		// `explorer` returns exit code 1 even on success, so we don't treat that as failure.
		await run('explorer', [`/select,${resolved}`]).catch(() => undefined);
		return;
	}

	// Best effort on Linux and everything else: open the containing folder.
	await open(path.dirname(resolved));
}
