import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStudent } from '../src/utils/validation.js';

const valid = { studentId: ' STU-101 ', firstName: ' Ada ', lastName: ' Lovelace ', email: 'ADA@example.com', course: ' Computer Science ' };

test('trims text and normalizes email to lowercase', () => {
  const result = validateStudent(valid);
  assert.deepEqual(result.errors, {});
  assert.equal(result.value.studentId, 'STU-101');
  assert.equal(result.value.email, 'ada@example.com');
});

test('rejects missing required fields', () => {
  const result = validateStudent({ studentId: 'S1' });
  for (const key of ['firstName', 'lastName', 'email', 'course']) assert.ok(result.errors[key]);
});

test('rejects invalid email format', () => {
  assert.equal(validateStudent({ ...valid, email: 'not-an-email' }).errors.email, 'Enter a valid email address.');
});

test('rejects non-object payloads', () => {
  assert.ok(validateStudent(null).errors.form);
  assert.ok(validateStudent([]).errors.form);
});

test('partial updates reject explicitly blank required fields', () => {
  assert.ok(validateStudent({ firstName: '   ' }, { partial: true }).errors.firstName);
});

test('optional fields may be omitted', () => {
  assert.deepEqual(validateStudent(valid).errors, {});
});
