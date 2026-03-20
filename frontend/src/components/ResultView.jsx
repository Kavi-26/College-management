import React, { useState, useEffect } from 'react';

const ResultView = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // States for Faculty View
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedDept, setSelectedDept] = useState('BCA');
    const [selectedYear, setSelectedYear] = useState('III');
    const [selectedSection, setSelectedSection] = useState('A');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [examType, setExamType] = useState('Final');
    const [students, setStudents] = useState([]); // List of students to enter marks for
    const [marksData, setMarksData] = useState({}); // { studentId: marks }

    // State for Student View
    const [myResults, setMyResults] = useState([]);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [studentMarkEntry, setStudentMarkEntry] = useState({
        subject_code: '',
        cat_marks: '',
        assessment_marks: '',
        semester_marks: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReferenceData(); // Both Roles need subjects/depts now
        if (user.role === 'student') {
            fetchMyResults();
        }
    }, []);

    // Fetch Reference Data (Departments, Subjects)
    const fetchReferenceData = async () => {
        try {
            const [deptRes, subjRes] = await Promise.all([
                fetch('http://localhost:5000/api/reference/departments', { headers: { 'x-auth-token': token } }),
                fetch('http://localhost:5000/api/reference/subjects', { headers: { 'x-auth-token': token } })
            ]);
            const deptData = await deptRes.json();
            const subjData = await subjRes.json();

            setDepartments(deptData);
            setSubjects(subjData);
            if (deptData.length > 0) setSelectedDept(deptData[0].code);
            if (subjData.length > 0) setSelectedSubject(subjData[0].code); // Default first subject
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch Students for Marks Entry (Faculty)
    const fetchClassForEntry = async () => {
        setLoading(true);
        try {
            // First fetching students of the class
            // Ideally we need an endpoint to get students list, but we can reuse attendance/admin endpoints or similar
            // For now let's assume we can GET /api/auth/students?dept=... (Need to verify if this exists)
            // Wait, we don't have a direct "get students of class" endpoint exposed yet except in attendance report
            // Let's create a quick way or use what we have.
            // Actually, we can just use the attendance "get students" logic or add one.
            // Let's assume fetch logic similar to attendance.

            const res = await fetch(`http://localhost:5000/api/attendance/report?department=${selectedDept}&year=${selectedYear}&section=${selectedSection}&type=daily&date=${new Date().toISOString().split('T')[0]}`, {
                headers: { 'x-auth-token': token }
            });
            // This returns attendance data which includes student list. A bit hacky but works for getting list.

            const data = await res.json();
            // data is array of { student_id, name, reg_no, status... }

            setStudents(data);

            // Also fetch existing results if any to pre-fill?
            // Skipping for MVP simplicity
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Submit Marks
    const handleSubmitMarks = async () => {
        if (!selectedSubject) return alert('Select a subject');

        const resultsPayload = Object.keys(marksData).map(studentId => ({
            student_id: studentId,
            marks_obtained: marksData[studentId],
            remarks: ''
        }));

        if (resultsPayload.length === 0) return alert('No marks entered');

        try {
            const res = await fetch('http://localhost:5000/api/results/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    subject_code: selectedSubject,
                    exam_type: examType,
                    semester: selectedYear, // Using Year as Semester for now
                    results: resultsPayload
                })
            });

            if (res.ok) {
                alert('Marks saved successfully!');
                setMarksData({});
            } else {
                alert('Failed to save marks');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Student: Save Marks
    const handleStudentSaveMarks = async () => {
        if (!studentMarkEntry.subject_code) return alert('Select a subject');
        
        try {
            const res = await fetch('http://localhost:5000/api/results/student-submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({
                    subject_code: studentMarkEntry.subject_code,
                    semester: user.year, // Using student's current year as semester
                    cat_marks: studentMarkEntry.cat_marks,
                    assessment_marks: studentMarkEntry.assessment_marks,
                    semester_marks: studentMarkEntry.semester_marks
                })
            });

            if (res.ok) {
                alert('Marks recorded successfully!');
                setStudentMarkEntry({ subject_code: '', cat_marks: '', assessment_marks: '', semester_marks: '' });
                setShowEntryForm(false);
                fetchMyResults();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Failed to record marks');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Student: Fetch My Results
    const fetchMyResults = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/results/my-results', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setMyResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Render Student View
    if (user.role === 'student') {
        return (
            <div className="results-container">
                <div className="header-actions">
                    <h2>🎓 My Results</h2>
                    <button className="add-marks-btn" onClick={() => setShowEntryForm(!showEntryForm)}>
                        {showEntryForm ? 'Close Form' : '+ Add My Marks'}
                    </button>
                </div>

                {showEntryForm && (
                    <div className="student-entry-card">
                        <h3>Record Your Marks</h3>
                        <div className="entry-grid">
                            <div className="entry-group">
                                <label>Subject</label>
                                <select 
                                    value={studentMarkEntry.subject_code} 
                                    onChange={(e) => setStudentMarkEntry({...studentMarkEntry, subject_code: e.target.value})}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="entry-group">
                                <label>CAT (30)</label>
                                <input 
                                    type="number" max="30" placeholder="0-30"
                                    value={studentMarkEntry.cat_marks}
                                    onChange={(e) => setStudentMarkEntry({...studentMarkEntry, cat_marks: e.target.value})}
                                />
                            </div>
                            <div className="entry-group">
                                <label>Assessment (20)</label>
                                <input 
                                    type="number" max="20" placeholder="0-20"
                                    value={studentMarkEntry.assessment_marks}
                                    onChange={(e) => setStudentMarkEntry({...studentMarkEntry, assessment_marks: e.target.value})}
                                />
                            </div>
                            <div className="entry-group">
                                <label>Semester (50)</label>
                                <input 
                                    type="number" max="50" placeholder="0-50"
                                    value={studentMarkEntry.semester_marks}
                                    onChange={(e) => setStudentMarkEntry({...studentMarkEntry, semester_marks: e.target.value})}
                                />
                            </div>
                            <button className="submit-entry-btn" onClick={handleStudentSaveMarks}>Save Marks</button>
                        </div>
                    </div>
                )}

                {loading ? <p>Loading...</p> : (
                    <div className="results-grid">
                        {myResults.length > 0 ? (
                            <table className="results-table">
                                <thead>
                                    <tr>
                                        <th>Subject</th>
                                        <th>Semester</th>
                                        <th>CAT</th>
                                        <th>Assessment</th>
                                        <th>Exam</th>
                                        <th>Total</th>
                                        <th>Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myResults.map(res => (
                                        <tr key={res.id}>
                                            <td>
                                                <div className="subj-info">
                                                    <span className="subj-name">{res.subject_name}</span>
                                                    <span className="subj-code">{res.subject_code}</span>
                                                </div>
                                            </td>
                                            <td>{res.semester}</td>
                                            <td>{res.cat_marks}</td>
                                            <td>{res.assessment_marks}</td>
                                            <td>{res.semester_marks || res.marks_obtained}</td>
                                            <td><strong>{res.marks_obtained}</strong></td>
                                            <td><span className={`grade-badge grade-${res.grade}`}>{res.grade}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">No results published yet.</div>
                        )}
                    </div>
                )}
                <style>{`
                    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                    .add-marks-btn { background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
                    
                    .student-entry-card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                    .student-entry-card h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #374151; }
                    .entry-grid { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
                    .entry-group { display: flex; flex-direction: column; gap: 0.4rem; }
                    .entry-group label { font-size: 0.85rem; font-weight: 600; color: #6b7280; }
                    .entry-group input, .entry-group select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; }
                    .submit-entry-btn { background: #10b981; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 700; height: 40px; }

                    .results-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                    .results-table th, .results-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                    .results-table th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.9rem; }
                    .subj-info { display: flex; flex-direction: column; }
                    .subj-name { font-weight: 600; color: #111827; }
                    .subj-code { font-size: 0.75rem; color: #6b7280; }
                    
                    .grade-badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; }
                    .grade-O, .grade-A\+, .grade-A { background: #dcfce7; color: #166534; }
                    .grade-B, .grade-C, .grade-P { background: #dbeafe; color: #1e40af; }
                    .grade-F { background: #fee2e2; color: #991b1b; }
                `}</style>
            </div>
        );
    }

    // Render Faculty/Admin View
    return (
        <div className="results-manager">
            <h2>📝 Enter Marks</h2>

            <div className="filters-card">
                <div className="filter-row">
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                        {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                        {['I', 'II', 'III', 'IV'].map(y => <option key={y} value={y}>{y} Year</option>)}
                    </select>
                    <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                        {['A', 'B', 'C'].map(s => <option key={s} value={s}>Section {s}</option>)}
                    </select>
                    <button className="fetch-btn" onClick={fetchClassForEntry}>Load Students</button>
                </div>

                <div className="exam-details-row">
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
                    </select>
                    <select value={examType} onChange={(e) => setExamType(e.target.value)}>
                        <option value="Mid-Term">Mid-Term</option>
                        <option value="Final">Final</option>
                        <option value="Assignment">Assignment</option>
                    </select>
                </div>
            </div>

            {students.length > 0 && (
                <div className="marks-entry-area">
                    <table className="marks-table">
                        <thead>
                            <tr>
                                <th>Reg No</th>
                                <th>Student Name</th>
                                <th>Marks (100)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student.student_id}>
                                    <td>{student.reg_no}</td>
                                    <td>{student.name}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="0"
                                            value={marksData[student.student_id] || ''}
                                            onChange={(e) => setMarksData({ ...marksData, [student.student_id]: e.target.value })}
                                            className="marks-input"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="actions">
                        <button className="save-btn" onClick={handleSubmitMarks}>Save All Marks</button>
                    </div>
                </div>
            )}

            <style>{`
                .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .add-marks-btn { background: var(--primary-color); color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
                
                .student-entry-card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                .student-entry-card h3 { margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; color: #374151; }
                .entry-grid { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
                .entry-group { display: flex; flex-direction: column; gap: 0.4rem; }
                .entry-group label { font-size: 0.85rem; font-weight: 600; color: #6b7280; }
                .entry-group input, .entry-group select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.95rem; }
                .submit-entry-btn { background: #10b981; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 700; height: 40px; }

                .results-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .results-table th, .results-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .results-table th { background: #f9fafb; font-weight: 600; color: #374151; font-size: 0.9rem; }
                .subj-info { display: flex; flex-direction: column; }
                .subj-name { font-weight: 600; color: #111827; }
                .subj-code { font-size: 0.75rem; color: #6b7280; }
                
                .grade-badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; }
                .grade-O, .grade-A\+, .grade-A { background: #dcfce7; color: #166534; }
                .grade-B, .grade-C, .grade-P { background: #dbeafe; color: #1e40af; }
                .grade-F { background: #fee2e2; color: #991b1b; }

                .filters-card { background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .filter-row, .exam-details-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
                select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; min-width: 150px; }
                .fetch-btn { background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; }
                
                .marks-table { width: 100%; border-collapse: collapse; background: white; margin-bottom: 2rem; }
                .marks-table th, .marks-table td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
                .marks-input { padding: 0.5rem; width: 80px; text-align: center; border: 1px solid #d1d5db; border-radius: 4px; font-size: 1rem; }
                
                .actions { display: flex; justify-content: flex-end; }
                .save-btn { background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1.1rem; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4); }
                .save-btn:hover { background: #059669; }
            `}</style>
        </div>
    );
};

export default ResultView;
