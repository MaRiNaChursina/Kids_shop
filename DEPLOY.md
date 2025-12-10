# Инструкция по обновлению Frontend на сервере

## Информация о сервере

- **Хостинг**: cloud.reg.ru
- **ОС**: Ubuntu 24.04 LTS
- **Ресурсы**: 1 vCPU, 1 ГБ RAM, 10 ГБ диск
- **IP**: 91.229.9.244

## Первоначальная настройка сервера

### 1. Установка необходимого ПО

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Git (если не установлен)
sudo apt install git -y

# Установка Node.js (рекомендуется использовать nvm для управления версиями)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts

# Или установка Node.js через apt (Ubuntu 24.04)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка nginx
sudo apt install nginx -y

# Проверка версий
git --version
node --version
npm --version
nginx -v
```

### 1.1. Настройка Git на сервере

```bash
# Настройка Git (если еще не настроен)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Клонирование репозитория (если проект еще не на сервере)
cd ~
git clone https://github.com/MaRiNaChursina/Kids_shop.git kids_shop
cd kids_shop

# Или если проект уже есть, настройте remote:
cd /path/to/kids_shop
git remote -v  # Проверка текущего remote
# Если нужно изменить:
# git remote set-url origin https://github.com/MaRiNaChursina/Kids_shop.git
```

### 2. Настройка прав доступа

```bash
# Убедитесь, что у пользователя есть права на директорию проекта
sudo chown -R $USER:$USER /path/to/kids_shop

# Дайте права на выполнение скрипта деплоя
chmod +x /path/to/kids_shop/deploy.sh
```

### 3. Настройка nginx (первый раз)

Следуйте инструкциям в разделе "Настройка nginx" ниже.

## Проблема: Frontend не обновляется

Если после деплоя изменения не видны, это обычно связано с:
1. **Кешированием браузера** - браузер использует старые файлы
2. **Кешированием nginx** - неправильная настройка заголовков кеширования
3. **Старыми файлами в папке build** - сборка не была пересоздана

## Решение

### Вариант 1: Автоматический деплой (рекомендуется)

1. Подключитесь к серверу по SSH:
```bash
ssh user@91.229.9.244
```

2. Перейдите в директорию проекта:
```bash
cd /path/to/kids_shop
```

3. Запустите скрипт деплоя:
```bash
chmod +x deploy.sh
./deploy.sh
```

Скрипт автоматически:
- **Обновит код из Git репозитория** (git pull)
- Установит зависимости (если нужно)
- Удалит старую сборку
- Создаст новую сборку
- Перезагрузит nginx

### Вариант 2: Ручной деплой

1. Подключитесь к серверу по SSH

2. Перейдите в директорию frontend:
```bash
cd /path/to/kids_shop/frontend
```

3. Установите зависимости (если нужно):
```bash
npm install
```

4. Удалите старую сборку:
```bash
rm -rf build
```

5. Создайте новую сборку:
```bash
npm run build
```

6. Проверьте конфигурацию nginx:
```bash
sudo nginx -t
```

7. Перезагрузите nginx (Ubuntu 24.04 использует systemd):
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка через systemctl (рекомендуется для Ubuntu 24.04)
sudo systemctl reload nginx

# Или альтернативный способ
sudo nginx -s reload
```

### Настройка nginx

1. Скопируйте файл `nginx.conf` в директорию конфигурации nginx:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/kids_shop
```

2. Создайте символическую ссылку:
```bash
sudo ln -s /etc/nginx/sites-available/kids_shop /etc/nginx/sites-enabled/
```

3. **ВАЖНО**: Отредактируйте путь в конфигурации:
```bash
sudo nano /etc/nginx/sites-available/kids_shop
```

Измените строку:
```
root /path/to/kids_shop/frontend/build;
```

На реальный путь к вашей папке build, например:
```
root /home/user/kids_shop/frontend/build;
```

4. Проверьте конфигурацию:
```bash
sudo nginx -t
```

5. Перезагрузите nginx (Ubuntu 24.04):
```bash
# Проверка конфигурации
sudo nginx -t

# Перезагрузка через systemctl
sudo systemctl reload nginx
```

## Проверка обновлений

После деплоя:

1. **Очистите кеш браузера**:
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Firefox: `Ctrl + Shift + Delete`
   - Или используйте режим инкогнито

2. **Проверьте заголовки ответа**:
```bash
curl -I http://91.229.9.244/index.html
```

Должны быть заголовки:
```
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

3. **Проверьте версию файлов**:
   - Откройте DevTools (F12)
   - Перейдите на вкладку Network
   - Обновите страницу (Ctrl+F5)
   - Проверьте, что загружаются файлы с новыми хешами

## Частые проблемы

### Проблема: Изменения все еще не видны

**Решение:**
1. Убедитесь, что папка `build` действительно обновилась:
```bash
ls -la frontend/build/static/js/
```

2. Проверьте дату модификации файлов - они должны быть свежими

3. Очистите кеш nginx (если используется):
```bash
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

4. Проверьте, что nginx действительно перезагрузился:
```bash
sudo systemctl status nginx
```

### Проблема: Ошибка при сборке

**Решение:**
1. Проверьте версию Node.js:
```bash
node --version
```

2. Удалите node_modules и переустановите:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Проблема: Nginx не перезагружается

**Решение:**
1. Проверьте статус nginx:
```bash
sudo systemctl status nginx
```

2. Проверьте логи ошибок:
```bash
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u nginx -f  # Альтернативный способ для systemd
```

3. Проверьте синтаксис конфигурации:
```bash
sudo nginx -t
```

## Оптимизация для маломощного сервера (1 ГБ RAM)

### 1. Ограничение использования памяти при сборке

При сборке frontend может потребоваться много памяти. Если сборка падает:

```bash
# Увеличьте лимит памяти для Node.js
export NODE_OPTIONS="--max-old-space-size=512"
npm run build
```

Или добавьте в `package.json`:
```json
"scripts": {
  "build": "NODE_OPTIONS='--max-old-space-size=512' react-scripts build"
}
```

### 2. Мониторинг ресурсов

```bash
# Проверка использования памяти
free -h

# Проверка использования диска
df -h

# Мониторинг процессов
htop  # или top
```

### 3. Очистка старых сборок

Регулярно очищайте старые файлы для экономии места:

```bash
# Очистка старых логов nginx
sudo journalctl --vacuum-time=7d

# Очистка кеша npm (если нужно)
npm cache clean --force
```

## Автоматизация деплоя через Git

Можно настроить автоматический деплой при push в репозиторий:

1. Создайте файл `.github/workflows/deploy.yml` (для GitHub Actions)
2. Или используйте Git hooks на сервере
3. Или используйте CI/CD систему (GitLab CI, Jenkins и т.д.)

## Контакты и логи

При возникновении проблем проверьте:
- Логи nginx: `/var/log/nginx/kids_shop_error.log`
- Логи nginx через systemd: `sudo journalctl -u nginx -n 50`
- Логи backend: проверьте вывод `pm2 logs` или системные логи
- Статус сервисов: `sudo systemctl status nginx`

