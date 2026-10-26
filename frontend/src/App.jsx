import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GraduationCap, Search, Plus, RefreshCw, Users, BookOpen, Mail, Phone,
  Pencil, Trash2, Eye, X, ArrowLeft, CheckCircle2, AlertCircle, LoaderCircle,
  LayoutDashboard, ChevronRight, ArrowUpRight, ShieldCheck, Sparkles, LockKeyhole,
  LogOut
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const EMPTY_FORM = {
  studentId: '', firstName: '', lastName: '', email: '',
  phone: '', course: '', yearOrSemester: ''
};
const REQUIRED = ['studentId', 'firstName', 'lastName', 'email', 'course'];

async function request(path, options = {}, token = '') {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('Cannot reach the API server. Check that the backend is running and try again.');
  }

  const body = response.status === 204 ? {} : await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(body?.error?.message || 'The request could not be completed.');
    error.fields = body?.error?.fields || {};
    error.status = response.status;
    throw error;
  }

  return body;
}

function validate(form) {
  const errors = {};

  REQUIRED.forEach((key) => {
    if (!String(form[key] || '').trim()) {
      errors[key] = 'This field is required.';
    }
  });

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.phone && form.phone.trim().length > 30) {
    errors.phone = 'Phone must be 30 characters or fewer.';
  }

  return errors;
}

function initials(student) {
  return `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}`.toUpperCase();
}

function fullName(student) {
  return `${student.firstName || ''} ${student.lastName || ''}`.trim();
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screen, setScreen] = useState({ type: 'overview', student: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(null);
  const [listError, setListError] = useState('');
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const notify = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => {
      setNotice((current) => current?.message === message ? null : current);
    }, 4200);
  };

  const logout = useCallback((message = '') => {
    setToken('');
    setAdminUser(null);
    setLoginPassword('');
    setStudents([]);
    setScreen({ type: 'overview', student: null });
    setListError('');
    setNotice(null);
    if (message) setLoginError(message);
  }, []);

  const handleAuthError = useCallback((error) => {
    if (error?.status === 401) {
      logout('Your session has expired. Please log in again.');
      return true;
    }
    return false;
  }, [logout]);

  const loadStudents = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setListError('');

    try {
      const result = await request('/students', {}, token);
      setStudents(result.data || []);
    } catch (error) {
      if (!handleAuthError(error)) setListError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, handleAuthError]);

  useEffect(() => {
    if (token) loadStudents();
    else {
      setStudents([]);
      setLoading(false);
    }
  }, [token, loadStudents]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError('');

    const username = loginUsername.trim();
    if (!username || !loginPassword) {
      setLoginError('Enter your admin username and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: loginPassword
        })
      });

      if (!result?.token || !result?.user) {
        throw new Error('The server returned an unexpected login response.');
      }

      setToken(result.token);
      setAdminUser(result.user);
      setLoginPassword('');
      setLoginUsername(username);
      setLoginError('');
      setScreen({ type: 'overview', student: null });
      setSearch('');
    } catch (error) {
      setLoginError(error.message || 'Unable to log in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return students;

    return students.filter((student) =>
      [
        student.studentId,
        student.firstName,
        student.lastName,
        student.email,
        student.course
      ].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [students, search]);

  const courseCount = useMemo(
    () => new Set(students.map((student) => student.course?.trim()).filter(Boolean)).size,
    [students]
  );

  function openAdd() {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setScreen({ type: 'form', mode: 'add', student: null });
  }

  function openEdit(student) {
    setForm({
      ...EMPTY_FORM,
      ...Object.fromEntries(
        Object.keys(EMPTY_FORM).map((key) => [key, student[key] || ''])
      )
    });
    setFieldErrors({});
    setScreen({ type: 'form', mode: 'edit', student });
  }

  function openDetails(student) {
    setScreen({ type: 'details', student });
  }

  function goBack() {
    setScreen({ type: 'list', student: null });
    setFieldErrors({});
  }

  function goOverview() {
    setScreen({ type: 'overview', student: null });
    setFieldErrors({});
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submitForm(event) {
    event.preventDefault();

    const errors = validate(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length) return;

    setSaving(true);
    const isEdit = screen.mode === 'edit';
    const path = isEdit ? `/students/${screen.student._id}` : '/students';

    try {
      const result = await request(path, {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value.trim()])
          )
        )
      }, token);

      if (isEdit) {
        setStudents((current) =>
          current.map((student) =>
            student._id === result.data._id ? result.data : student
          )
        );
      } else {
        setStudents((current) => [result.data, ...current]);
      }

      setScreen({ type: 'list', student: null });
      notify(
        'success',
        isEdit ? 'Student record updated successfully.' : 'Student added successfully.'
      );
    } catch (error) {
      setFieldErrors((current) => ({
        ...current,
        ...(error.fields || {})
      }));
      if (!handleAuthError(error)) notify('error', error.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    if (
      !window.confirm(
        `Delete ${fullName(student)} (${student.studentId})? This action cannot be undone.`
      )
    ) return;

    try {
      await request(`/students/${student._id}`, { method: 'DELETE' }, token);

      setStudents((current) =>
        current.filter((item) => item._id !== student._id)
      );

      if (screen.type !== 'list') {
        setScreen({ type: 'list', student: null });
      }

      notify('success', 'Student deleted successfully.');
    } catch (error) {
      if (!handleAuthError(error)) notify('error', error.message);
    }
  }

  if (!token) {
    return (
      <div className="login-shell">
        <section className="login-showcase">
          <div className="login-brand">
            <span className="brand-mark"><GraduationCap size={23} /></span>
            <span>campus<span className="brand-accent">desk</span></span>
          </div>

          <div className="showcase-copy">
            <div className="showcase-pill">
              <Sparkles size={14} /> A clearer way to manage campus
            </div>
            <h1>Good systems make room for <em>great learning.</em></h1>
            <p>
              Keep student records organized, accessible, and up to date —
              all from one calm, focused workspace.
            </p>
            <div className="showcase-metrics">
              <div><strong>One place</strong><span>For every student record</span></div>
              <div><strong>Less admin</strong><span>More time for people</span></div>
            </div>
          </div>

          <div className="showcase-bottom">
            <span><ShieldCheck size={15} /> Built for organized student records</span>
            <span>CampusDesk · Student workspace</span>
          </div>

          <div className="showcase-orb orb-one" />
          <div className="showcase-orb orb-two" />
        </section>

        <section className="login-panel">
          <div className="login-panel-top">
            <span className="mobile-brand"><GraduationCap size={21} /> CampusDesk</span>
            <span className="secure-label"><LockKeyhole size={14} /> Secure admin login</span>
          </div>

          <div className="login-card">
            <div className="login-icon"><GraduationCap size={24} /></div>
            <div className="eyebrow">ADMINISTRATOR ACCESS</div>
            <h2>Your campus, in order.</h2>
            <p className="login-intro">
              Sign in to manage student records in your workspace.
            </p>

            <form className="login-form" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label htmlFor="admin-username">Admin username</label>
                <input
                  id="admin-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(event) => {
                    setLoginUsername(event.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter your username"
                  maxLength={100}
                  required
                  disabled={loginLoading}
                />
              </div>

              <div className="field">
                <label htmlFor="admin-password">Password</label>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(event) => {
                    setLoginPassword(event.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={loginLoading}
                />
              </div>

              {loginError && (
                <div className="login-error" role="alert">
                  <AlertCircle size={17} />
                  <span>{loginError}</span>
                </div>
              )}

              <button className="login-submit" type="submit" disabled={loginLoading}>
                {loginLoading ? (
                  <><LoaderCircle className="spin" size={17} /> Signing in…</>
                ) : (
                  <>Sign in securely <ChevronRight size={17} /></>
                )}
              </button>
            </form>

            <div className="login-divider"><span>DESIGNED FOR CLARITY</span></div>

            <div className="login-benefit">
              <span className="benefit-icon"><Users size={17} /></span>
              <div>
                <strong>Every record, one place</strong>
                <p>Find, review, and update student information.</p>
              </div>
            </div>

            <div className="login-benefit">
              <span className="benefit-icon"><ShieldCheck size={17} /></span>
              <div>
                <strong>Protected workspace</strong>
                <p>Only authenticated administrators can access student records.</p>
              </div>
            </div>
          </div>

          <div className="login-footer">
            © {new Date().getFullYear()} CampusDesk
            <span>Thoughtfully organized.</span>
          </div>
        </section>
      </div>
    );
  }

  const pageTitle =
    screen.type === 'overview' ? 'Overview' :
    screen.type === 'form'
      ? (screen.mode === 'edit' ? 'Edit student' : 'Add student') :
    screen.type === 'details' ? 'Student details' : 'Student directory';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button
          className="brand brand-button"
          onClick={goOverview}
          aria-label="CampusDesk home"
        >
          <span className="brand-mark"><GraduationCap size={23} /></span>
          <span>
            <strong>campus<span className="brand-accent">desk</span></strong>
            <small>STUDENT WORKSPACE</small>
          </span>
        </button>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${screen.type === 'overview' ? 'active' : ''}`}
          onClick={goOverview}
        >
          <LayoutDashboard size={17} />
          Overview
          <ChevronRight className="nav-chevron" size={15} />
        </button>

        <button
          className={`nav-item ${screen.type === 'list' || screen.type === 'details' || (screen.type === 'form' && screen.mode === 'edit') ? 'active' : ''}`}
          onClick={goBack}
        >
          <Users size={17} />
          Students
          <span className="nav-count">{students.length}</span>
        </button>

        <button
          className={`nav-item ${screen.type === 'form' && screen.mode === 'add' ? 'active' : ''}`}
          onClick={openAdd}
        >
          <Plus size={17} />
          Add student
        </button>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-icon"><BookOpen size={17} /></div>
            <div>
              <strong>Records, made simple</strong>
              <p>A focused space for the details that keep your campus moving.</p>
            </div>
          </div>
          <div className="sidebar-footer">
            <span className="online-dot" /> Workspace ready
            <span className="footer-version">v1.0</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{pageTitle}</strong>
          </div>
          <div className="topbar-right">
            <span className="connection-label">
              <span className="status-dot" /> API workspace
            </span>
            <span className="admin-identity" title={adminUser?.username || 'Administrator'}>
              {adminUser?.username || 'Administrator'}
            </span>
            <button className="secondary-btn logout-btn" onClick={() => logout()} type="button">
              <LogOut size={15} /> Log out
            </button>
            <div className="top-avatar">CD</div>
          </div>
        </header>

        <section className="content">
          {notice && (
            <div className={`toast ${notice.type}`} role="status">
              <span>
                {notice.type === 'success'
                  ? <CheckCircle2 size={18} />
                  : <AlertCircle size={18} />}
              </span>
              {notice.message}
              <button aria-label="Dismiss notification" onClick={() => setNotice(null)}>
                <X size={16} />
              </button>
            </div>
          )}

          {screen.type === 'overview' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    YOUR WORKSPACE <span className="eyebrow-line" />
                  </div>
                  <h1>Overview<span className="heading-period">.</span></h1>
                  <p>Your campus at a glance. Monitor student records and manage your workspace.</p>
                </div>
                <button className="primary-btn" onClick={openAdd}>
                  <Plus size={17} /> Add student
                </button>
              </div>

              <div className="welcome-strip">
                <div className="welcome-symbol"><GraduationCap size={23} /></div>
                <div>
                  <strong>Welcome to CampusDesk</strong>
                  <p>Your student management workspace, all in one place.</p>
                </div>
                <span className="welcome-tag">
                  <span className="status-dot" /> Live workspace
                </span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-topline">
                    <span>Total students</span>
                    <span className="stat-icon blue"><Users size={18} /></span>
                  </div>
                  <strong className="stat-number">{students.length.toLocaleString()}</strong>
                  <div className="stat-foot">Student records in your directory</div>
                </div>

                <div className="stat-card">
                  <div className="stat-topline">
                    <span>Courses represented</span>
                    <span className="stat-icon violet"><BookOpen size={18} /></span>
                  </div>
                  <strong className="stat-number">{courseCount.toLocaleString()}</strong>
                  <div className="stat-foot">Unique courses or departments</div>
                </div>

                <div className="stat-card">
                  <div className="stat-topline">
                    <span>Directory health</span>
                    <span className="stat-icon green"><CheckCircle2 size={18} /></span>
                  </div>
                  <strong className="stat-number healthy">
                    {loading ? 'Loading' : listError ? 'Attention needed' : 'Operational'}
                  </strong>
                  <div className="stat-foot">
                    {listError ? 'Unable to load student records' : 'Student workspace status'}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <div className="eyebrow">QUICK ACCESS</div>
                    <h2>Student records</h2>
                    <p>Open your directory to search, view, and manage students.</p>
                  </div>
                  <button className="primary-btn" onClick={goBack}>
                    <Users size={16} /> View students
                  </button>
                </div>
                <div className="toolbar">
                  <span className="result-count">
                    {students.length} {students.length === 1 ? 'student' : 'students'} registered
                  </span>
                  <button className="secondary-btn" onClick={loadStudents}>
                    <RefreshCw size={15} /> Refresh
                  </button>
                </div>
              </div>
            </>
          )}

          {screen.type === 'list' && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    STUDENT RECORDS <span className="eyebrow-line" />
                  </div>
                  <h1>Student directory<span className="heading-period">.</span></h1>
                  <p>Search, browse, and manage individual student records.</p>
                </div>
                <button className="primary-btn" onClick={openAdd}>
                  <Plus size={17} /> Add student
                </button>
              </div>

              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <div className="eyebrow">RECORDS</div>
                    <h2>All students</h2>
                    <p>Browse your directory and manage individual records.</p>
                  </div>
                  <button
                    className="icon-btn"
                    onClick={loadStudents}
                    title="Refresh student list"
                    aria-label="Refresh student list"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="toolbar">
                  <div className="search-box">
                    <Search size={17} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name, ID, email or course..."
                      aria-label="Search students"
                    />
                    {search && (
                      <button aria-label="Clear search" onClick={() => setSearch('')}>
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <span className="result-count">
                    {visibleStudents.length} {visibleStudents.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {loading ? (
                  <div className="state-box">
                    <LoaderCircle className="spin" size={28} />
                    <strong>Loading your directory</strong>
                    <span>Connecting to your student databaseâ€¦</span>
                  </div>
                ) : listError ? (
                  <div className="state-box error-state">
                    <AlertCircle size={30} />
                    <strong>Could not load students</strong>
                    <span>{listError}</span>
                    <button className="secondary-btn" onClick={loadStudents}>
                      <RefreshCw size={15} /> Try again
                    </button>
                  </div>
                ) : visibleStudents.length === 0 ? (
                  <div className="state-box">
                    <div className="empty-icon"><Users size={26} /></div>
                    <strong>{search ? 'No matching students' : 'Your directory starts here'}</strong>
                    <span>
                      {search
                        ? 'Try another name, ID, email, or course.'
                        : 'Add your first student to start building your directory.'}
                    </span>
                    {!search && (
                      <button className="primary-btn" onClick={openAdd}>
                        <Plus size={16} /> Add first student
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>STUDENT</th>
                          <th>STUDENT ID</th>
                          <th>COURSE / DEPARTMENT</th>
                          <th>EMAIL ADDRESS</th>
                          <th className="actions-heading">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleStudents.map((student) => (
                          <tr key={student._id}>
                            <td>
                              <button className="student-cell" onClick={() => openDetails(student)}>
                                <span className="student-avatar">{initials(student)}</span>
                                <span>
                                  <strong>{fullName(student)}</strong>
                                  <small>{student.yearOrSemester || 'Year / semester not set'}</small>
                                </span>
                              </button>
                            </td>
                            <td><span className="id-chip">{student.studentId}</span></td>
                            <td><span className="course-text">{student.course}</span></td>
                            <td><span className="email-text">{student.email}</span></td>
                            <td>
                              <div className="row-actions">
                                <button
                                  className="action-btn"
                                  title="View details"
                                  aria-label={`View ${fullName(student)}`}
                                  onClick={() => openDetails(student)}
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="action-btn"
                                  title="Edit student"
                                  aria-label={`Edit ${fullName(student)}`}
                                  onClick={() => openEdit(student)}
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  className="action-btn delete-action"
                                  title="Delete student"
                                  aria-label={`Delete ${fullName(student)}`}
                                  onClick={() => deleteStudent(student)}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && !listError && visibleStudents.length > 0 && (
                  <div className="table-footer">
                    Showing <strong>{visibleStudents.length}</strong> of{' '}
                    <strong>{students.length}</strong> records
                    <span className="footer-separator">Â·</span>
                    Student data is saved to your database
                  </div>
                )}
              </div>
            </>
          )}

          {screen.type === 'form' && (
            <>
              <button className="back-link" onClick={goBack}>
                <ArrowLeft size={16} /> Back to directory
              </button>

              <div className="page-heading compact-heading">
                <div>
                  <div className="eyebrow">
                    STUDENT RECORDS <span className="eyebrow-line" />
                  </div>
                  <h1>
                    {screen.mode === 'edit' ? 'Edit student' : 'Add a student'}
                    <span className="heading-period">.</span>
                  </h1>
                  <p>
                    {screen.mode === 'edit'
                      ? 'Make your updates below, then save the record.'
                      : 'Add the essential details to create a student record.'}
                  </p>
                </div>
              </div>

              <form className="panel form-panel" onSubmit={submitForm} noValidate>
                <div className="form-section-title">
                  <div className="form-section-icon"><Users size={19} /></div>
                  <div>
                    <h2>Student information</h2>
                    <p>Fields marked with <b>*</b> are required.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <Field label="Student ID" name="studentId" required value={form.studentId} error={fieldErrors.studentId} onChange={updateField} placeholder="e.g. STU-2026-001" />
                  <Field label="Course / Department" name="course" required value={form.course} error={fieldErrors.course} onChange={updateField} placeholder="e.g. Computer Science" />
                  <Field label="First name" name="firstName" required value={form.firstName} error={fieldErrors.firstName} onChange={updateField} placeholder="Enter first name" />
                  <Field label="Last name" name="lastName" required value={form.lastName} error={fieldErrors.lastName} onChange={updateField} placeholder="Enter last name" />
                  <Field label="Email address" name="email" required type="email" value={form.email} error={fieldErrors.email} onChange={updateField} placeholder="student@example.com" />
                  <Field label="Phone number" name="phone" type="tel" value={form.phone} error={fieldErrors.phone} onChange={updateField} placeholder="Optional phone number" />
                  <Field label="Year / Semester" name="yearOrSemester" value={form.yearOrSemester} error={fieldErrors.yearOrSemester} onChange={updateField} placeholder="e.g. Year 2 or Semester 4" />
                </div>

                <div className="form-footer">
                  <button type="button" className="secondary-btn" onClick={goBack} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? (
                      <><LoaderCircle size={17} className="spin" /> Savingâ€¦</>
                    ) : (
                      <><CheckCircle2 size={17} /> {screen.mode === 'edit' ? 'Save changes' : 'Create student'}</>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {screen.type === 'details' && screen.student && (
            <>
              <button className="back-link" onClick={goBack}>
                <ArrowLeft size={16} /> Back to directory
              </button>

              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    STUDENT RECORD <span className="eyebrow-line" />
                  </div>
                  <h1>Student details<span className="heading-period">.</span></h1>
                  <p>Review the saved information for this student.</p>
                </div>
                <div className="heading-actions">
                  <button className="secondary-btn" onClick={() => openEdit(screen.student)}>
                    <Pencil size={15} /> Edit record
                  </button>
                  <button className="danger-btn" onClick={() => deleteStudent(screen.student)}>
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-hero">
                  <div className="detail-avatar">{initials(screen.student)}</div>
                  <div className="detail-identity">
                    <h2>{fullName(screen.student)}</h2>
                    <p>{screen.student.studentId}</p>
                    <span className="detail-status"><span /> Saved student record</span>
                  </div>
                  <span className="detail-open-icon"><ArrowUpRight size={20} /></span>
                </div>

                <div className="detail-grid">
                  <DetailItem icon={<Mail size={17} />} label="Email address" value={screen.student.email} />
                  <DetailItem icon={<Phone size={17} />} label="Phone number" value={screen.student.phone || 'Not provided'} />
                  <DetailItem icon={<BookOpen size={17} />} label="Course / Department" value={screen.student.course} />
                  <DetailItem icon={<GraduationCap size={17} />} label="Year / Semester" value={screen.student.yearOrSemester || 'Not provided'} />
                  <DetailItem label="Created" value={screen.student.createdAt ? new Date(screen.student.createdAt).toLocaleString() : 'Not available'} />
                  <DetailItem label="Last updated" value={screen.student.updatedAt ? new Date(screen.student.updatedAt).toLocaleString() : 'Not available'} />
                </div>
              </div>
            </>
          )}
        </section>

        <footer className="app-footer">
          <span><strong>CampusDesk</strong> <i>Â·</i> Student Management</span>
          <span>Organized records. Clearer days.</span>
        </footer>
      </main>
    </div>
  );
}

function Field({ label, name, required, value, error, onChange, placeholder, type = 'text' }) {
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}{required && <span> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        maxLength={name === 'phone' ? 30 : name === 'studentId' ? 80 : name === 'yearOrSemester' ? 50 : 254}
      />
      {error && <small className="field-error" id={`${name}-error`}>{error}</small>}
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="detail-item">
      <div className="detail-item-icon">{icon || <BookOpen size={17} />}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
