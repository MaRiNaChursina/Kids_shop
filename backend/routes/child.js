const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const usersFile = './data/users.json';
const productsFile = './data/products.json';

// Получить данные ребенка
router.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(usersFile));
    const child = data.children.find(c => c.id === id);
    if (!child) return res.status(404).json({ message: 'Ребенок не найден' });
    res.json(child);
});

// Получить историю начислений ребёнка с пагинацией
router.get('/:id/history', (req, res) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.query.page) || 1; // номер страницы (по умолчанию 1)
  const limit = parseInt(req.query.limit) || 10; // количество элементов на страницу (по умолчанию 10)

  const data = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  const child = data.children.find(c => c.id === id);
  if (!child) return res.status(404).json({ message: 'Ребенок не найден' });

  const history = (child.history || []).sort((a, b) => new Date(b.date) - new Date(a.date)); // сортировка по дате (новые сверху)
  
  // постраничный вывод
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedHistory = history.slice(start, end);

  res.json({
    total: history.length,      // общее количество записей
    page,                       // текущая страница
    pages: Math.ceil(history.length / limit), // всего страниц
    history: paginatedHistory,  // данные этой страницы
  });
});



router.get('/image-proxy', async (req, res) => {
  const imageUrl = req.query.url;
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send('Ошибка загрузки изображения');
  }
});

// Получить список товаров
router.get('/:id/store', (req, res) => {
    const products = JSON.parse(fs.readFileSync(productsFile));
    res.json(products);
});

const usersFil = path.join(__dirname, '../data/users.json');
const scheduleFile = path.join(__dirname, '../data/schedule.json');

router.get('/:id/next-lesson', (req, res) => {
  try {
    const childId = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    const child = data.children.find(c => c.id === childId);

    if (!child) {
      return res.status(404).json({ message: "Ребёнок не найден" });
    }

    const schedule = fs.existsSync(scheduleFile)
      ? JSON.parse(fs.readFileSync(scheduleFile, "utf-8"))
      : [];

    if (!Array.isArray(schedule)) {
      return res.json(null);
    }

    const lessons = schedule.filter(
      l => Array.isArray(child.groups) && child.groups.includes(l.groupId)
    );

    res.json(lessons[0] || null);
  } catch (err) {
    console.error("Ошибка next-lesson:", err.message);
    res.status(500).json({ message: "Ошибка на сервере", error: err.message });
  }
});


// === Добавим маршруты для избранного ===

// Получить избранное
router.get('/:id/favorites', (req, res) => {
  const id = parseInt(req.params.id);
  const data = JSON.parse(fs.readFileSync(usersFile));
  const child = data.children.find(c => c.id === id);
  if (!child) return res.status(404).json({ message: 'Ребенок не найден' });
  res.json(child.favorites || []);
});

// Добавить или убрать товар из избранного
router.post('/:id/favorites/:productId', (req, res) => {
  const id = parseInt(req.params.id);
  const productId = parseInt(req.params.productId);
  const data = JSON.parse(fs.readFileSync(usersFile));
  const child = data.children.find(c => c.id === id);
  if (!child) return res.status(404).json({ message: 'Ребенок не найден' });

  if (!child.favorites) child.favorites = [];
  const index = child.favorites.indexOf(productId);

  if (index >= 0) {
    // Удаляем из избранного
    child.favorites.splice(index, 1);
  } else {
    // Добавляем в избранное
    child.favorites.push(productId);
  }

  fs.writeFileSync(usersFile, JSON.stringify(data, null, 2));
  res.json(child.favorites);
});



module.exports = router;