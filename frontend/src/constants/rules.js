// Правила начисления астракоинов
const rules = {
  absent: { label: "Отсутствие", value: 0, skipIfAbsent: true }, // галочка "отсутствовал" - пропускаем все начисления
  shoes: { label: "Сменная обувь", value: 10, penalty: -5 },    // если галочка не стоит, вычитаем 5
  onTime: { label: "Вовремя пришёл", value: 5 },
  homework: { label: "Домашнее задание", value: 5 }
};

export default rules;
