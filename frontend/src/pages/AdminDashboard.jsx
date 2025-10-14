import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard({ user }) {
  const [children, setChildren] = useState([]);
  const [products, setProducts] = useState([]);
  const [newChild, setNewChild] = useState({ name:'', login:'', password:'', group:'', coins:0 });
  const [newProduct, setNewProduct] = useState({ name:'', price:'', image:'' });
  const [schedule, setSchedule] = useState([]);
  const [newLesson, setNewLesson] = useState({ time:'', subject:'', group:'' });

  const loadChildren = async () => {
    const res = await axios.get('http://localhost:5000/admin/children');
    setChildren(res.data);
  };

  const loadProducts = async () => {
    const res = await axios.get('http://localhost:5000/admin/products');
    setProducts(res.data);
  };

  const loadSchedule = async () => {
    const res = await axios.get('http://localhost:5000/admin/schedule');
    setSchedule(res.data);
  };

  useEffect(() => {
    loadChildren();
    loadProducts();
    loadSchedule();
  }, []);

  const addChild = async () => {
    await axios.post('http://localhost:5000/admin/addChild', newChild);
    loadChildren();
  };

  const addProduct = async () => {
    await axios.post('http://localhost:5000/admin/addProduct', newProduct);
    setNewProduct({ name:'', price:'', image:'' });
    loadProducts();
  };

  const editProduct = async (id, updated) => {
    await axios.put(`http://localhost:5000/admin/editProduct/${id}`, updated);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:5000/admin/deleteProduct/${id}`);
    loadProducts();
  };

  const addLesson = async () => {
    await axios.post('http://localhost:5000/admin/schedule/add', newLesson);
    setNewLesson({ time:'', subject:'', group:'' });
    loadSchedule();
  };

  const deleteLesson = async (id) => {
    await axios.delete(`http://localhost:5000/admin/schedule/delete/${id}`);
    loadSchedule();
  };

  const handleEdit = (lesson) => {
  const updated = {
    ...lesson,
    subject: prompt("Введите новый предмет:", lesson.subject) || lesson.subject,
    day: prompt("Введите новый день:", lesson.day) || lesson.day,
    time: prompt("Введите новое время:", lesson.time) || lesson.time,
    group: prompt("Введите новую группу:", lesson.group) || lesson.group,
    link: prompt("Введите новую ссылку:", lesson.link) || lesson.link,
  };

  axios.put(`http://localhost:5000/admin/schedule/edit/${lesson.id}`, updated)
    .then(res => {
      alert(res.data.message);
      setSchedule(schedule.map(l => l.id === lesson.id ? updated : l));
    })
    .catch(err => console.error(err));
};

const handleDelete = (id) => {
  axios.delete(`http://localhost:5000/admin/schedule/delete/${id}`)
    .then(res => {
      alert(res.data.message);
      setSchedule(schedule.filter(l => l.id !== id));
    })
    .catch(err => console.error(err));
};

const [teachers, setTeachers] = useState([]);
const loadTeachers = async () => {
  const res = await axios.get('http://localhost:5000/admin/teachers');
  setTeachers(res.data);
};
useEffect(() => { loadTeachers(); }, []);

  return (
    <div>
      <h1>Панель администратора</h1>
      <h2>Преподаватели</h2>
      {teachers.map(t => (
        <div key={t.id}>
          {t.name} | группы: {t.groups.join(", ")}
          <button onClick={() => axios.delete(`http://localhost:5000/admin/deleteTeacher/${t.id}`).then(loadTeachers)}>Удалить</button>
        </div>
      ))}

      <h2>Дети</h2>
      {children.map(c => <p key={c.id}>{c.name} | {c.group} | {c.coins} астракоинов</p>)}

      <h3>Добавить ребенка</h3>
      <input placeholder="Имя" onChange={e=>setNewChild({...newChild,name:e.target.value})}/>
      <input placeholder="Логин" onChange={e=>setNewChild({...newChild,login:e.target.value})}/>
      <input placeholder="Пароль" onChange={e=>setNewChild({...newChild,password:e.target.value})}/>
      <input placeholder="Группа" onChange={e=>setNewChild({...newChild,group:e.target.value})}/>
      <input placeholder="Астракоины" type="number" onChange={e=>setNewChild({...newChild,coins:+e.target.value})}/>
      <button onClick={addChild}>Добавить ребенка</button>

      <h2>Продукты</h2>
      {products.map(p => (
        <div key={p.id}>
          {p.name} | {p.price} астракоинов
          <button onClick={()=>editProduct(p.id,{name:p.name+'*'})}>Изменить</button>
          <button onClick={()=>deleteProduct(p.id)}>Удалить</button>
        </div>
      ))}

      <h3>Добавить продукт</h3>
      <input placeholder="Название" onChange={e=>setNewProduct({...newProduct,name:e.target.value})}/>
      <input placeholder="Цена" type="number" onChange={e=>setNewProduct({...newProduct,price:+e.target.value})}/>
      <input placeholder="Ссылка на изображение" onChange={e=>setNewProduct({...newProduct,image:e.target.value})}/>
      <button onClick={addProduct}>Добавить продукт</button>

      <table className="table">
        <thead>
          <tr>
            <th>День</th>
            <th>Время</th>
            <th>Предмет</th>
            <th>Группа</th>
            <th>Ученики</th>
            <th>Ссылка</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map(lesson => (
            <tr key={lesson.id}>
              <td>{lesson.day}</td>
              <td>{lesson.time}</td>
              <td>{lesson.subject}</td>
              <td>
                <Link to={`/group/${lesson.groupId || lesson.group}`}>
                  {lesson.groupId || lesson.group}
                </Link>
              </td>
              <td>
                {children.filter(c => 
                  (c.groups && c.groups.includes(lesson.groupId)) ||
                  (c.group && c.group === lesson.group)
                ).length}
              </td>
              <td><a href={lesson.link} target="_blank" rel="noreferrer">Перейти</a></td>
              <td>
                <button onClick={() => handleEdit(lesson)}>✏️</button>
                <button onClick={() => handleDelete(lesson.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Добавить занятие</h3>
      <input placeholder="Время" onChange={e=>setNewLesson({...newLesson,time:e.target.value})}/>
      <input placeholder="Предмет" onChange={e=>setNewLesson({...newLesson,subject:e.target.value})}/>
      <input placeholder="Группа" onChange={e=>setNewLesson({...newLesson,group:e.target.value})}/>
      <button onClick={addLesson}>Добавить занятие</button>
    </div>
  );
}