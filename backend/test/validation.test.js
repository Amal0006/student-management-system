
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStudent } from '../src/utils/validation.js';

const valid = {
  studentId: ' STU-101 ',
  firstName: ' Ada ',
  lastName: ' Lovelace ',
  email: 'ADA@example.com',
  course: ' Computer Science ',
};

test('trims text and normalizes email to lowercase', () => {
  const result = validateStudent(valid);

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.studentId, 'STU-101');
  assert.equal(result.value.firstName, 'Ada');
  assert.equal(result.value.lastName, 'Lovelace');
  assert.equal(result.value.email, 'ada@example.com');
  assert.equal(result.value.course, 'Computer Science');
});

test('rejects missing required fields', () => {
  const result = validateStudent({ studentId: 'S1' });

  for (const field of ['firstName', 'lastName', 'email', 'course']) {
    assert.ok(result.errors[field], `${field} should be required`);
  }
});

test('rejects empty and whitespace-only required fields', () => {
  for (const field of [
    'studentId',
    'firstName',
    'lastName',
    'email',
    'course',
  ]) {
    const result = validateStudent({ ...valid, [field]: '   ' });

    assert.ok(result.errors[field], `${field} should not be blank`);
  }
});

test('rejects invalid email formats', () => {
  for (const email of [
    'not-an-email',
    'missing-domain@',
    '@missing-user.com',
    'user @example.com',
    'user@example',
  ]) {
    const result = validateStudent({ ...valid, email });

    assert.equal(
      result.errors.email,
      'Enter a valid email address.',
      `Expected ${email} to be rejected`,
    );
  }
});

test('rejects null, arrays, and primitive payloads', () => {
  for (const input of [null, [], 'student', 42, true]) {
    const result = validateStudent(input);

    assert.equal(
      result.errors.form,
      'Provide a valid student object.',
    );
    assert.deepEqual(result.value, {});
  }
});

test('rejects unsupported field value types', () => {
  for (const value of [null, true, {}, []]) {
    const result = validateStudent({ ...valid, phone: value });

    assert.equal(result.errors.phone, 'Must be text.');
  }
});

test('accepts numeric values by converting them to strings', () => {
  const result = validateStudent({
    ...valid,
    studentId: 101,
    phone: 9876543210,
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.studentId, '101');
  assert.equal(result.value.phone, '9876543210');
});

test('allows optional fields to be omitted', () => {
  const result = validateStudent(valid);

  assert.deepEqual(result.errors, {});
  assert.equal(Object.hasOwn(result.value, 'phone'), false);
  assert.equal(Object.hasOwn(result.value, 'yearOrSemester'), false);
});

test('accepts valid optional fields', () => {
  const result = validateStudent({
    ...valid,
    phone: ' 9876543210 ',
    yearOrSemester: ' Semester 5 ',
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.value.phone, '9876543210');
  assert.equal(result.value.yearOrSemester, 'Semester 5');
});

test('rejects fields exceeding their maximum lengths', () => {
  const cases = [
    ['studentId', 'S'.repeat(81)],
    ['firstName', 'A'.repeat(101)],
    ['lastName', 'B'.repeat(101)],
    ['course', 'C'.repeat(101)],
    ['phone', '1'.repeat(31)],
    ['yearOrSemester', 'Y'.repeat(51)],
  ];

  for (const [field, value] of cases) {
    const result = validateStudent({ ...valid, [field]: value });

    assert.ok(
      result.errors[field],
      `${field} should reject a value exceeding its limit`,
    );
  }
});

test('accepts values at the maximum allowed lengths', () => {
  const result = validateStudent({
    ...valid,
    studentId: 'S'.repeat(80),
    firstName: 'A'.repeat(100),
    lastName: 'B'.repeat(100),
    course: 'C'.repeat(100),
    phone: '1'.repeat(30),
    yearOrSemester: 'Y'.repeat(50),
  });

  assert.deepEqual(result.errors, {});
});

test('partial updates allow omitted required fields', () => {
  const result = validateStudent(
    { firstName: 'Grace' },
    { partial: true },
  );

  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.value, { firstName: 'Grace' });
});

test('partial updates reject explicitly blank required fields', () => {
  for (const field of [
    'studentId',
    'firstName',
    'lastName',
    'email',
    'course',
  ]) {
    const result = validateStudent(
      { [field]: '   ' },
      { partial: true },
    );

    assert.equal(
      result.errors[field],
      'This field cannot be blank.',
    );
  }
});

test('partial updates still validate a supplied email', () => {
  const result = validateStudent(
    { email: 'invalid-email' },
    { partial: true },
  );

  assert.equal(
    result.errors.email,
    'Enter a valid email address.',
  );
});

test('ignores unknown fields', () => {
  const result = validateStudent({
    ...valid,
    admin: true,
    unexpectedField: 'value',
  });

  assert.deepEqual(result.errors, {});
  assert.equal(Object.hasOwn(result.value, 'admin'), false);
  assert.equal(
    Object.hasOwn(result.value, 'unexpectedField'),
    false,
  );
});
