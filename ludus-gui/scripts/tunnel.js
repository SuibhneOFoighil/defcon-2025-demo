#!/usr/bin/env node

const { spawn } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const sshHost = process.env.LUDUS_SSH_HOST;
const sshUser = process.env.LUDUS_SSH_USER || 'root';

if (!sshHost) {
  console.error('Error: LUDUS_SSH_HOST is not set in .env.local');
  process.exit(1);
}

console.log(`Starting SSH tunnel to ${sshUser}@${sshHost} on port 8081...`);

const ssh = spawn('ssh', [
  '-L', '8081:127.0.0.1:8081',
  `${sshUser}@${sshHost}`,
  '-N'
], {
  stdio: 'inherit'
});

ssh.on('error', (err) => {
  console.error('SSH tunnel error:', err);
  process.exit(1);
});

ssh.on('exit', (code) => {
  console.log(`SSH tunnel exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  ssh.kill();
  process.exit();
});