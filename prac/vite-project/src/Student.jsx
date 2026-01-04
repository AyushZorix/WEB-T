import { useState } from "react";
import "./Student.css";

function Student() {
  const [student, setStudent] = useState({
    name: "",
    email: "",
    course: ""
  });

  const [studentsList, setStudentsList] = useState([]);

  const handleChange = (e) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStudentsList([...studentsList, student]);

    // clear form
    setStudent({ name: "", email: "", course: "" });
  };

  return (
    <div className="container">
      <h2>Student Registration</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={student.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={student.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="course"
          placeholder="Course"
          value={student.course}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Student</button>
      </form>

      {studentsList.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
            </tr>
          </thead>
          <tbody>
            {studentsList.map((s, i) => (
              <tr key={i}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.course}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Student;


