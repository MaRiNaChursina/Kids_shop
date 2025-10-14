import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    axios.get("/api/schedule").then(res => setSchedule(res.data));
    axios.get("/api/groups").then(res => setGroups(res.data));
  }, []);

  const getGroupName = (id) => {
    const g = groups.find(gr => gr.id === id);
    return g ? g.name : "Неизвестная группа";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Расписание занятий</h2>
      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">День</th>
            <th className="p-2">Время</th>
            <th className="p-2">Предмет</th>
            <th className="p-2">Группа</th>
            <th className="p-2">Ссылка</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(lesson => (
            <tr key={lesson.id} className="border-b">
              <td className="p-2">{lesson.day}</td>
              <td className="p-2">{lesson.time}</td>
              <td className="p-2">{lesson.subject}</td>
              <td className="p-2">
                <a
                  href={`/groups/${lesson.groupId}`}
                  className="text-blue-500 underline"
                >
                  {getGroupName(lesson.groupId)}
                </a>
              </td>
              <td className="p-2">
                <a href={lesson.link} target="_blank" rel="noreferrer">Перейти</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
