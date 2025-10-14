import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function GroupPage() {
  const { groupId } = useParams();
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/admin/groups/${groupId}/students`)
      .then(res => setStudents(res.data))
      .catch(err => console.error(err));

    axios.get(`http://localhost:5000/admin/groups/${groupId}/schedule`)
      .then(res => setSchedule(res.data))
      .catch(err => console.error(err));
  }, [groupId]);

  return (
    <div>
      <h1>Группа {groupId}</h1>
      <h2>Ученики</h2>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Логин</th>
            <th>Пароль</th>
            <th>Астракоины</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.login}</td>
              <td>{s.password}</td>
              <td>{s.coins}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Расписание группы</h2>
      <ul>
        {schedule.map(l => (
          <li key={l.id}>
            {l.day}, {l.time} — {l.subject} ({l.link && <a href={l.link} target="_blank" rel="noreferrer">ссылка</a>})
          </li>
        ))}
      </ul>
    </div>
  );
}