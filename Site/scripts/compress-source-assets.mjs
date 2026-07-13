import { spawn } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      ...options,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(
        signal
          ? `${command} ${args.join(' ')} exited after signal ${signal}`
          : `${command} ${args.join(' ')} exited with code ${code}`,
      ));
    });
  });
}

async function main() {
  console.log('Compressing lossless source raster assets in Vault/Assets...');
  await run(npmCommand, ['run', 'build'], {
    env: {
      ...process.env,
      CODEX_COMPRESS_SOURCE_ASSETS: '1',
    },
  });

  console.log('\nRebuilding from the compressed source assets...');
  await run(npmCommand, ['run', 'build'], {
    env: {
      ...process.env,
      CODEX_COMPRESS_SOURCE_ASSETS: '0',
    },
  });

  console.log('\nCompression complete. Review the asset changes before committing:');
  try {
    await run('git', [
      'status',
      '--short',
      '--',
      '../Vault/Assets',
      'public/assets',
    ]);
  } catch (error) {
    console.warn(`Could not show Git status: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exitCode = 1;
});
