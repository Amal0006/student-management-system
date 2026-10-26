
const readline = require('node:readline');
const bcrypt = require('bcryptjs');

if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
  console.error('Run this script directly in an interactive PowerShell terminal.');
  process.exit(1);
}

const input = process.stdin;
let password = '';
let finished = false;

function cleanup() {
  if (finished) return;
  finished = true;
  input.setRawMode(false);
  input.pause();
}

function onKeypress(_chunk, key) {
  if (!key) return;

  if (key.ctrl && key.name === 'c') {
    cleanup();
    password = '';
    console.log('\nCancelled.');
    process.exit(0);
  }

  if (key.name === 'return' || key.name === 'enter') {
    if (!password) {
      process.stdout.write('\nPassword cannot be empty. Try again: ');
      return;
    }

    cleanup();
    const enteredPassword = password;
    password = '';

    bcrypt.hash(enteredPassword, 12)
      .then((hash) => {
        console.log('\n\nYour bcrypt password hash:\n');
        console.log(hash);
        console.log('\nCopy this hash into ADMIN_PASSWORD_HASH in backend/.env.');
        console.log('Do not share the hash or your password publicly.');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\nCould not generate the hash:', error.message);
        process.exit(1);
      });

    return;
  }

  if (key.name === 'backspace') {
    if (password.length > 0) {
      password = password.slice(0, -1);
      process.stdout.write('\b \b');
    }
    return;
  }

  if (!key.ctrl && !key.meta && key.sequence && key.sequence.length === 1) {
    password += key.sequence;
    process.stdout.write('*');
  }
}

console.log('Enter the admin password you want to use.');
console.log('Your password will be masked. Press Enter when finished.\n');
process.stdout.write('Password: ');

readline.emitKeypressEvents(input);
input.setRawMode(true);
input.resume();
input.on('keypress', onKeypress);
