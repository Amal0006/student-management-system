import { Router } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import { REQUIRED_FIELDS, validateStudent } from '../utils/validation.js';

const router = Router();
const badId = (id) => !mongoose.isValidObjectId(id);
const failValidation = (res, errors) => res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Please correct the submitted fields.', fields: errors } });

router.get('/', async (req, res, next) => {
  try {
    const students = await Student.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
    res.json({ data: students });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  if (badId(req.params.id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Student ID is not a valid record ID.' } });
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ error: { code: 'STUDENT_NOT_FOUND', message: 'Student was not found.' } });
    res.json({ data: student });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const { errors, value } = validateStudent(req.body);
  for (const field of REQUIRED_FIELDS) if (!value[field] && !errors[field]) errors[field] = 'This field is required.';
  if (Object.keys(errors).length) return failValidation(res, errors);
  try {
    const student = await Student.create(value);
    res.status(201).json({ data: student });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  if (badId(req.params.id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Student ID is not a valid record ID.' } });
  const { errors, value } = validateStudent(req.body, { partial: true });
  if (Object.keys(errors).length) return failValidation(res, errors);
  try {
    const existing = await Student.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: { code: 'STUDENT_NOT_FOUND', message: 'Student was not found.' } });
    const candidate = { ...existing.toObject(), ...value };
    const check = validateStudent(candidate);
    if (Object.keys(check.errors).length) return failValidation(res, check.errors);
    Object.assign(existing, check.value);
    const saved = await existing.save();
    res.json({ data: saved });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  if (badId(req.params.id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'Student ID is not a valid record ID.' } });
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: { code: 'STUDENT_NOT_FOUND', message: 'Student was not found.' } });
    res.json({ message: 'Student deleted successfully.' });
  } catch (error) { next(error); }
});
export default router;
