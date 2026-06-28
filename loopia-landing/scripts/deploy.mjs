// Deploy loopia-landing/dist to Loopia public_html.
// Credentials must come from environment variables:
//   FTP_HOST, FTP_USER, FTP_PASS
//
// Optional:
//   FTP_REMOTE=/public_html

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requireFromAstroSite = createRequire(
  path.resolve(__dirname, '../../ElevateMind/elevatemind-site/package.json')
);
const { Client } = requireFromAstroSite('basic-ftp');

const dist = path.resolve(__dirname, '../dist');
const remote = process.env.FTP_REMOTE || '/public_html';
const host = process.env.FTP_HOST;
const user = process.env.FTP_USER;
const password = process.env.FTP_PASS;

if (!host || !user || !password) {
  console.error('Missing FTP_HOST / FTP_USER / FTP_PASS env vars');
  process.exit(1);
}

const client = new Client(30000);
client.ftp.verbose = false;

try {
  await client.access({ host, user, password, secure: false });
  console.log(`Connected to ${host}`);
  await client.ensureDir(remote);
  await client.cd(remote);
  console.log(`Clearing ${remote}`);
  await client.clearWorkingDir();
  console.log(`Uploading ${dist} -> ${remote}`);
  await client.uploadFromDir(dist, remote);
  const list = await client.list(remote);
  console.log('Remote root now contains:');
  for (const item of list.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  ${item.isDirectory ? '[d]' : '   '} ${item.name}`);
  }
  console.log('DONE');
} catch (error) {
  console.error(`DEPLOY FAILED: ${error.message}`);
  process.exitCode = 1;
} finally {
  client.close();
}
