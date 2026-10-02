
import path from 'node:path';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// returns true if the passsed file is being invoked from node,
// not imported. `node -e` / stdin runs have no argv[1]: nothing is main.
/** @param {string} importMetaUrl @returns {boolean} */
export function isMain(importMetaUrl) {
    const entry = process.argv[1];
    if (entry === undefined) return false;
    if (importMetaUrl === pathToFileURL(path.resolve(entry)).href) return true;
    // Node resolves the main module through symlinks by default, while argv
    // retains the invoked path. Keep the original-path check for
    // --preserve-symlinks-main and compare the resolved path for normal runs.
    try {
        return importMetaUrl === pathToFileURL(realpathSync(entry)).href;
    } catch {
        return false;
    }
}
