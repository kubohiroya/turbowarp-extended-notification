import {readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync = promisify(execFile);
const errors = [];

const packageMetadata = JSON.parse(await readFile('package.json', 'utf8'));
const policy = JSON.parse(await readFile('repo-policy.json', 'utf8'));
const readme = await readFile('README.md', 'utf8');
const license = await readFile('LICENSE', 'utf8');
const viteConfig = await readFile('vite.config.ts', 'utf8');
const bundle = await readFile(policy.extension.bundle, 'utf8');

checkPolicy();
checkPackageMetadata();
checkReadme();
checkLicense();
checkBundleMetadata();
await checkPackContents();

if (errors.length > 0) {
  throw new Error(`Repository policy check failed:\n- ${errors.join('\n- ')}`);
}

process.stdout.write('Repository policy is aligned.\n');

function checkPolicy() {
  if (policy.schemaVersion !== 1) errors.push('repo-policy.json schemaVersion must be 1');
  if (policy.productName !== 'TurboWarp Extended Notification') {
    errors.push('repo-policy.json productName must be TurboWarp Extended Notification');
  }
  if (policy.licensePolicy !== 'mpl-2.0') errors.push('repo-policy.json licensePolicy must be mpl-2.0');
  if (policy.packageManager !== 'pnpm') errors.push('repo-policy.json packageManager must be pnpm');
  if (policy.homepage !== 'pages') errors.push('repo-policy.json homepage must record Pages as the user entrypoint');
  if (policy.node?.minimum !== '22') errors.push('repo-policy.json node.minimum must be 22');
}

function checkPackageMetadata() {
  for (const key of ['description', 'author', 'license', 'homepage', 'packageManager']) {
    if (typeof packageMetadata[key] !== 'string' || packageMetadata[key].trim().length === 0) {
      errors.push(`package.json ${key} must be a non-empty string`);
    }
  }
  if (packageMetadata.license !== 'MPL-2.0') errors.push('package.json license must be MPL-2.0');
  if (packageMetadata.homepage !== 'https://kubohiroya.github.io/turbowarp-extended-notification/') {
    errors.push('package.json homepage must point to the Pages user guide');
  }
  if (!packageMetadata.packageManager?.startsWith('pnpm@')) {
    errors.push('package.json packageManager must pin pnpm exactly');
  }
  if (packageMetadata.engines?.node !== '>=22') errors.push('package.json engines.node must be >=22');
  for (const command of ['check', 'check:dist', 'prepublishOnly']) {
    if (/\bnpm run\b/u.test(packageMetadata.scripts?.[command] ?? '')) {
      errors.push(`package.json ${command} must use pnpm run`);
    }
  }
  for (const file of ['dist/extended-notification.js', 'docs/specification.md', 'CHANGELOG.md', 'README.md', 'LICENSE']) {
    if (!packageMetadata.files?.includes(file)) errors.push(`package.json files must include ${file}`);
  }
}

function checkReadme() {
  if (!readme.startsWith(`# ${policy.productName}\n`)) {
    errors.push('README.md H1 must match repo-policy.json productName');
  }
  if (!readme.includes('## Block reference')) errors.push('README.md must use Block reference heading');
  if (!readme.includes('Node.js 22') || !readme.includes('pnpm install --frozen-lockfile')) {
    errors.push('README.md must document the Node/pnpm baseline');
  }
  if (!readme.includes('SPDX-License-Identifier: MPL-2.0')) {
    errors.push('README.md License section must include the SPDX identifier');
  }
  if ((readme.match(/<!-- BEGIN GENERATED BLOCKS -->/g) ?? []).length !== 1) {
    errors.push('README.md must contain exactly one generated block start marker');
  }
  if ((readme.match(/<!-- END GENERATED BLOCKS -->/g) ?? []).length !== 1) {
    errors.push('README.md must contain exactly one generated block end marker');
  }
}

function checkLicense() {
  if (!license.startsWith('Mozilla Public License Version 2.0\n==================================')) {
    errors.push('LICENSE must contain the Mozilla Public License Version 2.0 full text');
  }
  if (!license.includes('Exhibit A - Source Code Form License Notice')) {
    errors.push('LICENSE must include the MPL-2.0 Exhibit A text');
  }
}

function checkBundleMetadata() {
  if (!viteConfig.includes("license: extensionConfig.license")) {
    errors.push('vite.config.ts must use extensionConfig license metadata');
  }
  for (const line of [
    '// Name: Extended Notification',
    '// ID: kubohiroyaextendednotification',
    '// License: MPL-2.0'
  ]) {
    if (!bundle.includes(line)) errors.push(`dist/extended-notification.js must include ${line}`);
  }
}

async function checkPackContents() {
  const {stdout} = await execFileAsync('npm', ['pack', '--dry-run', '--ignore-scripts', '--json']);
  const [pack] = JSON.parse(stdout);
  const files = new Set(pack.files.map((file) => file.path));
  for (const file of ['dist/extended-notification.js', 'docs/specification.md', 'CHANGELOG.md', 'README.md', 'LICENSE']) {
    if (!files.has(file)) errors.push(`npm pack must include ${file}`);
  }
  if (pack.version !== packageMetadata.version) {
    errors.push('npm pack version must match package.json version');
  }
}
