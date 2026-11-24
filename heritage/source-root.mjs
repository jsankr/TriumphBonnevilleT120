import {existsSync} from 'node:fs';
// A standalone source bundle includes archive/. In the upstream repository,
// heritage/ builds directly from the maintained source and evidence at its parent.
export const sourceRoot=existsSync('archive/parts.json')?'archive':'..';
