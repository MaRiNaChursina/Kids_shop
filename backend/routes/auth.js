const express = require('express');
const fs = require('fs');
const router = express.Router();
const usersFile = './data/users.json';

router.post('/login', (req, res) => {
  const { login, password } = req.body;
  const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

  const child = data.children.find(c => c.login === login && c.password === password);
  if (child) return res.json({ role: 'child', id: child.id });

  const teacher = data.teachers.find(t => t.login === login && t.password === password);
  if (teacher) return res.json({ role: 'teacher', id: teacher.id, rate: teacher.rate});

  const admin = data.admins.find(a => a.login === login && a.password === password);
  if (admin) return res.json({ role: 'admin', id: admin.id });

  res.status(401).json({ message: 'Неверный логин или пароль' });
});

module.exports = router;


router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Ошибка при удалении сессии:", err);
      return res.status(500).json({ message: "Ошибка при выходе" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Вы успешно вышли" });
  });
});

module.exports = router;