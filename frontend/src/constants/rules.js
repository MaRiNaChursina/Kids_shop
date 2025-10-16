// Правила начисления астракоинов
const rules = {
  absent: { label: "Отсутствие", value: 0, skipIfAbsent: true }, // галочка "отсутствовал" - пропускаем все начисления
  shoes: { label: "Сменная обувь", value: 5, penalty: -5 },    // если галочка не стоит, вычитаем 5
  onTime: { label: "Вовремя пришёл", value: 5 },
  remarks: { label: "Не более 2х замечаний", value: 10 },
  homework: { label: "Дополнительное задание", value: 15 }
};

export default rules;

export const autoRules = {
  regularAttendance: {
    label: "4 занятия подряд без пропусков",
    value: 30,
    condition: "4_no_absences", // технический ключ для проверки
    auto: true,
  },
  shortcuts: { label: "Знание 20+ горячих клавиш", value: 30, oncePerYear: true },
  parentReview: { label: "Отзыв от родителей", value: 60, oncePerYear: true },
  personalProject: { label: "Свой проект вне урока", value: 30, oncePerYear: true },
  postPublication: { label: "Публикация на нашей странице", value: 50, oncePerPost: true },
  repost: { label: "Репост с упоминанием", value: 30, oncePerPost: true },
};