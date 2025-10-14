import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function StudentPage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  useEffect(() => {
    axios.get(`/api/children`).then(res => {
      const child = res.data.find(c => c.id === parseInt(id));
      setStudent(child);
    });
    axios.get(`/api/students/${id}/next-lesson`).then(res => setNextLesson(res.data));
  }, [id]);

  if (!student) return <p>Загрузка...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Ученик: {student.name}</h2>
      <p>Монеты: {student.coins}</p>
      <p>Группы: {student.groups.join(", ")}</p>

      <h3 className="text-lg font-semibold mt-4">Следующий урок</h3>
      {nextLesson ? (
        <p>{nextLesson.day} {nextLesson.time} — {nextLesson.subject}</p>
      ) : (
        <p>Уроков нет</p>
      )}
    </div>
  );
}
