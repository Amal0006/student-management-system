export const REQUIRED_FIELDS = ['studentId', 'firstName', 'lastName', 'email', 'course'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStudent(input, { partial = false } = {}) {
  const errors = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { errors: { form: 'Provide a valid student object.' }, value: {} };
  }
  const allowed = [...REQUIRED_FIELDS, 'phone', 'yearOrSemester'];
  const value = {};
  for (const field of allowed) {
    if (input[field] === undefined) continue;
    if (typeof input[field] !== 'string' && typeof input[field] !== 'number') {
      errors[field] = 'Must be text.';
      continue;
    }
    value[field] = String(input[field]).trim();
  }
  for (const field of REQUIRED_FIELDS) {
    if (!partial && !value[field]) errors[field] = 'This field is required.';
    if (partial && Object.hasOwn(input, field) && !value[field]) errors[field] = 'This field cannot be blank.';
  }
  if (value.email && !EMAIL_RE.test(value.email)) errors.email = 'Enter a valid email address.';
  if (value.email) value.email = value.email.toLowerCase();
  if (value.studentId && value.studentId.length > 80) errors.studentId = 'Student ID must be 80 characters or fewer.';
  for (const field of ['firstName', 'lastName', 'course']) {
    if (value[field] && value[field].length > 100) errors[field] = 'Must be 100 characters or fewer.';
  }
  if (value.phone && value.phone.length > 30) errors.phone = 'Phone must be 30 characters or fewer.';
  if (value.yearOrSemester && value.yearOrSemester.length > 50) errors.yearOrSemester = 'Must be 50 characters or fewer.';
  return { errors, value };
}
