const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const usersFile = "./data/users.json";
const groupsFile = path.join(__dirname, "../data/groups.json");


// Получить список групп преподавателя (с названиями)
router.get("/:id/groups", (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFile, "utf8"));
    const groupsData = JSON.parse(fs.readFileSync(groupsFile, "utf8"));

    const teacher = usersData.teachers.find((t) => t.id === id);
    if (!teacher) return res.status(404).json({ message: "Преподаватель не найден" });

    // Собираем группы с именами
    const teacherGroups = teacher.groups.map((groupId) => {
      const group = groupsData.find((g) => g.id === groupId);
      return group
        ? { id: group.id, name: group.name }
        : { id: groupId, name: `Группа ${groupId}` };
    });

    res.json(teacherGroups);
  } catch (err) {
    console.error("Ошибка при загрузке групп:", err.message);
    res.status(500).json({ message: "Ошибка на сервере", error: err.message });
  }
});


// Получить детей группы
router.get("/:id/group/:groupId", (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const data = JSON.parse(fs.readFileSync(usersFile));

  const children = data.children.filter((c) => c.groups?.includes(groupId));
  res.json(children);
});
// Получить историю зарплаты преподавателя
router.get("/:id/salary", (req, res) => {
  const id = parseInt(req.params.id);
  const data = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const teacher = data.teachers.find((t) => t.id === id);
  if (!teacher) return res.status(404).json({ message: "Преподаватель не найден" });

  // Возвращаем историю и общий заработок
  const total = teacher.history
    ? teacher.history.reduce((sum, entry) => sum + (entry.amount || 0), 0)
    : 0;

  res.json({
    total,
    history: teacher.history || [],
  });
});

// Начисление астракоинов
router.post("/:id/award", (req, res) => {
  const { awards } = req.body; // [{ childId, coins, reasons }]
  const data = JSON.parse(fs.readFileSync(usersFile));

  if (!awards || !Array.isArray(awards)) {
    return res.status(400).json({ message: "Некорректные данные" });
  }

  const now = new Date().toLocaleString("ru-RU");

  awards.forEach((a) => {
    // защита: если coins === null или undefined → пропускаем
    if (a.coins === null || a.coins === undefined) return;

    const child = data.children.find((c) => c.id === a.childId);
    if (child) {
      child.coins += a.coins;

      if (!child.history) child.history = [];
      child.history.push({
        date: now,
        reasons: a.reasons || [],
        coins: a.coins,
      });
    }
  });

  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  res.json({ message: "Астракоины начислены" });
});

// Начисление зарплаты преподавателю
router.post("/:id/salary", (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, group } = req.body; // сумма зарплаты и группа
  const data = JSON.parse(fs.readFileSync(usersFile));
  const teacher = data.teachers.find((t) => t.id === id);

  if (!teacher) return res.status(404).json({ message: "Преподаватель не найден" });

  const now = new Date().toISOString(); // сохраняем дату с временем

  if (!teacher.history) teacher.history = [];
  teacher.history.push({
    date: now,
    amount,
    group
  });

  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  res.json({ message: "Зарплата сохранена" });
});


module.exports = router;
