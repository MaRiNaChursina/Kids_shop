const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const childRoutes = require('./routes/child');
const teacherRoutes = require('./routes/teacher');
const adminRoutes = require('./routes/admin');
const local = "localhost:3000"
const server= "http://91.229.9.244:3000"
const app = express();
app.use('/images', express.static('public/images'));

// Настройка CORS с поддержкой cookies
app.use(cors({
  origin: server, // фронтенд
  credentials: true
}));

app.use(express.json());

// Настройка сессий
app.use(session({
  secret: "astracoins_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5 * 60 * 1000, // 5 минут
  },
}));

// Промежуточный обработчик для обновления сессии при активности
app.use((req, res, next) => {
  if (req.session) {
    req.session._garbage = Date();
    req.session.touch();
  }
  next();
});

// Роуты
app.use('/auth', authRoutes);
app.use('/child', childRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
