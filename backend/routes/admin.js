const express = require('express');
const fs = require('fs');
const router = express.Router();
const usersFile = './data/users.json';
const productsFile = './data/products.json';
const scheduleFile = './data/schedule.json';
const groupsFile = './data/groups.json';

// --- ПРОДУКТЫ ---

// Получить все продукты
router.get('/products', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsFile));
    res.json(products);
});

// Добавить продукт
router.post('/addProduct', (req, res) => {
    const { name, price, image } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile));
    const newProduct = { id: Date.now(), name, price, image };
    products.push(newProduct);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    res.json({ message: 'Продукт добавлен', product: newProduct });
});

// Изменить продукт
router.put('/editProduct/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, image } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile));
    const product = products.find(p => p.id === id);
    if (!product) return res.status(404).json({ message: 'Продукт не найден' });
    if(name) product.name = name;
    if(price) product.price = price;
    if(image) product.image = image;
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    res.json({ message: 'Продукт обновлен', product });
});

// Удалить продукт
router.delete('/deleteProduct/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let products = JSON.parse(fs.readFileSync(productsFile));
    products = products.filter(p => p.id !== id);
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    res.json({ message: 'Продукт удален' });
});

// --- ГРУППЫ ---

// Получить все группы
router.get('/groups', (req, res) => {
    const groups = JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
    res.json(groups);
});

// Получить студентов по id группы
router.get('/groups/:id/students', (req, res) => {
    const groupId = parseInt(req.params.id);
    const groups = JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')).children;

    const group = groups.find(g => g.id === groupId);
    if (!group) return res.status(404).json({ message: 'Группа не найдена' });

    const students = users.filter(u => group.students.includes(u.id));
    res.json(students);
});

// Получить детей группы
router.get('/:id/group/:groupId', (req, res) => {
    const groupId = parseInt(req.params.groupId);
    const data = JSON.parse(fs.readFileSync(usersFile));

    const children = data.children.filter(c => c.groups && c.groups.includes(groupId));
    res.json(children);
});

// Получить расписание для группы
router.get('/groups/:id/schedule', (req, res) => {
    const groupId = parseInt(req.params.id);
    const schedule = readScheduleSafe();
    const lessons = schedule.filter(s => s.groupId === groupId || s.group === groupId);
    res.json(lessons);
});

// Следующий урок ребёнка
router.get('/students/:id/next-lesson', (req, res) => {
    const studentId = parseInt(req.params.id);
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const child = users.children.find(c => c.id === studentId);
    if (!child) return res.status(404).json({ message: 'Ребёнок не найден' });

    const schedule = readScheduleSafe();

    // все уроки по группам ребёнка
    const lessons = schedule.filter(l => 
        (l.groupId && child.group.includes(l.groupId)) || 
        (l.group && child.group.includes(l.group))
    );

    // сортировка: день → время
    const ordered = lessons.sort((a, b) => {
        if(a.day === b.day) return a.time.localeCompare(b.time);
        return a.day.localeCompare(b.day);
    });

    res.json(ordered[0] || null);
});

// --- ДЕТИ ---

router.get('/children', (req, res) => {
    const data = JSON.parse(fs.readFileSync(usersFile));
    res.json(data.children);
});

router.post('/addChild', (req, res) => {
    const { name, login, password, group, coins } = req.body;
    const data = JSON.parse(fs.readFileSync(usersFile));
    const newChild = { id: Date.now(), name, login, password, group, coins: coins || 0 };
    data.children.push(newChild);
    fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
    res.json({ message: 'Ребенок добавлен', child: newChild });
});

// --- РАСПИСАНИЕ ---

function readScheduleSafe() {
    try {
        if (!fs.existsSync(scheduleFile)) {
            console.log("Файл расписания не найден, создаем новый");
            fs.writeFileSync(scheduleFile, JSON.stringify([], null, 2));
            return [];
        }
        let raw = fs.readFileSync(scheduleFile, 'utf8');
        // убираем BOM и невидимые символы
        raw = raw.replace(/^\uFEFF/, '').trim();
        return JSON.parse(raw || "[]");
    } catch (err) {
        console.error("Ошибка при чтении schedule.json:", err.message);
        return [];
    }
}

function writeScheduleSafe(data) {
    fs.writeFileSync(scheduleFile, JSON.stringify(data, null, 2), 'utf8');
}

// Получить расписание
router.get('/schedule', (req, res) => {
    const schedule = readScheduleSafe();
    res.json(schedule);
});
router.get('/schedule/:day', (req, res) => {
    const day = req.params.day;
    const schedule = readScheduleSafe();
    const filtered = schedule.filter(lesson => lesson.day.toLowerCase() === day.toLowerCase());
    res.json(filtered);
});

// Добавить занятие
router.post('/schedule/add', (req, res) => {
    const { day, time, subject, group, link } = req.body;
    const schedule = readScheduleSafe();
    const newLesson = { id: Date.now(), day, time, subject, group, link };
    schedule.push(newLesson);
    writeScheduleSafe(schedule);
    res.json({ message: 'Занятие добавлено', lesson: newLesson });
});

router.put('/schedule/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { day, time, subject, group, link } = req.body;
    let schedule = readScheduleSafe();
    const lesson = schedule.find(l => l.id === id);

    if (!lesson) {
        return res.status(404).json({ message: 'Занятие не найдено' });
    }

    if (day) lesson.day = day;
    if (time) lesson.time = time;
    if (subject) lesson.subject = subject;
    if (group) lesson.group = group;
    if (link) lesson.link = link;

    writeScheduleSafe(schedule);
    res.json({ message: 'Занятие обновлено', lesson });
});

// Удалить занятие
router.delete('/schedule/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let schedule = readScheduleSafe();
    schedule = schedule.filter(l => l.id !== id);
    writeScheduleSafe(schedule);
    res.json({ message: 'Занятие удалено' });
});

// --- ПРЕПОДАВАТЕЛИ ---
router.get('/teachers', (req, res) => {
  const data = JSON.parse(fs.readFileSync(usersFile));
  res.json(data.teachers);
});

router.post('/addTeacher', (req, res) => {
  const { name, login, password, groups } = req.body;
  const data = JSON.parse(fs.readFileSync(usersFile));
  const newTeacher = { id: Date.now(), name, login, password, groups };
  data.teachers.push(newTeacher);
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  res.json({ message: 'Преподаватель добавлен', teacher: newTeacher });
});

router.delete('/deleteTeacher/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let data = JSON.parse(fs.readFileSync(usersFile));
  data.teachers = data.teachers.filter(t => t.id !== id);
  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  res.json({ message: 'Преподаватель удален' });
});


module.exports = router;
