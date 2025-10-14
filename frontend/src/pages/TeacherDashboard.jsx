import React, { useEffect, useState } from "react";
import axios from "axios";
import rules from "../constants/rules";
import LogoutButton from "../components/LogoutButton";
import styles from "../styles/TeacherDashboard.module.css";

export default function TeacherDashboard({ user, setUser }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [children, setChildren] = useState([]);
  const [checks, setChecks] = useState({});
  const [salary, setSalary] = useState({ total: 0, history: [] });
  const [showSalar, setShowSalar] = useState(false);
  const localhost = '91.229.9.244';

  const teacherRate = user?.rate ?? 100;

  const getGroupName = (id) => {
      const found = groups.find((g) => g.id === id);
      return found ? found.name : `Группа ${id}`;
    };

  // Загружаем группы
  useEffect(() => {
    axios
      .get(`http://${localhost}:5000/teacher/${user.id}/groups`)
      .then((res) => setGroups(res.data))
      .catch((err) => console.error("Ошибка при загрузке групп:", err));
  }, [user.id]);

  // Загружаем зарплату при старте
  useEffect(() => {
    const saved = localStorage.getItem(`salary_${user.id}`);
    if (saved) {
      setSalary(JSON.parse(saved));
    } else {
      // Если нет в localStorage — подтягиваем с сервера
      axios
        .get(`http://${localhost}:5000/teacher/${user.id}/salary`)
        .then((res) => {
          const data = res.data || { total: 0, history: [] };
          // Сортируем историю: новые сверху
          data.history = (data.history || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setSalary(data);
          localStorage.setItem(`salary_${user.id}`, JSON.stringify(data));
        })
        .catch((err) => console.error("Ошибка при загрузке зарплаты:", err));
    }
  }, [user.id]);

  const loadChildren = (group) => {
    setSelectedGroup(group);
    axios
      .get(`http://${localhost}:5000/teacher/${user.id}/group/${group}`)
      .then((res) => {
        setChildren(res.data);
        setChecks({});
      })
      .catch((err) => console.error("Ошибка при загрузке детей:", err));
  };

  const toggleCheck = (childId, ruleKey) => {
    setChecks((prev) => ({
      ...prev,
      [childId]: { ...prev[childId], [ruleKey]: !prev[childId]?.[ruleKey] },
    }));
  };

  // Проверка: можно ли начислить коины этой группе на этой неделе
  const canAwardThisWeek = () => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);

    return !salary.history.some((h) => {
      const date = new Date(h.date);
      const week = getWeekNumber(date);
      return h.group === selectedGroup && week === currentWeek;
    });
  };

  const getWeekNumber = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNum = d.getDay() || 7;
    d.setDate(d.getDate() + 4 - dayNum);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const saveAwards = async () => {
    if (!canAwardThisWeek()) {
      alert("❌ Коины для этой группы уже начислялись на этой неделе!");
      return;
    }

    const now = new Date().toISOString();

    const awardArr = children
      .map((child) => {
        const state = checks[child.id] || {};
        if (state.absent) return null;

        let coins = 0;
        let reasons = [];

        Object.keys(rules).forEach((ruleKey) => {
          const rule = rules[ruleKey];
          if (state[ruleKey]) {
            coins += rule.value;
            reasons.push(rule.label);
          } else if (rule.penalty) {
            coins += rule.penalty;
            reasons.push(`${rule.label} (штраф)`);
          }
        });

        if (coins === 0) return null;
        return { childId: child.id, coins, reasons, date: now, group: selectedGroup };
      })
      .filter(Boolean);

    if (awardArr.length === 0) {
      alert("Нет начислений для сохранения!");
      return;
    }

    const presentChildren = children.filter((c) => !(checks[c.id]?.absent));
    let salaryAmount = presentChildren.length * teacherRate;
    if (salaryAmount < 650) salaryAmount = 650;

    const newSalary = {
      total: salary.total + salaryAmount,
      history: [
        { date: now, amount: salaryAmount, group: selectedGroup },
        ...salary.history, // новые записи сверху
      ],
    };

    setSalary(newSalary);
    localStorage.setItem(`salary_${user.id}`, JSON.stringify(newSalary));

    try {
      await axios.post(`http://${localhost}:5000/teacher/${user.id}/award`, { awards: awardArr });
      await axios.post(`http://${localhost}:5000/teacher/${user.id}/salary`, {
        amount: salaryAmount,
        group: selectedGroup,
      });

      alert(
        `✅ Астракоины начислены! \nЗП +${salaryAmount} ₽ (${presentChildren.length} учеников × ${teacherRate} ₽)`
      );
    } catch (err) {
      console.error(err);
      alert("Ошибка при начислении астракоинов или зарплаты!");
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Панель преподавателя</h1>
        <div className={styles.headerRight}>
          <div className={styles.salaryBox}>
            💰 {salary.total} ₽
            <button
              onClick={() => setShowSalar(!showSalar)}
              className={styles.showSalaryBtn}
            >
              {showSalar ? "Скрыть" : "История"}
            </button>
          </div>
          <LogoutButton setUser={setUser} />
        </div>
      </header>

      {showSalar && (
        <section className={styles.salaryHistorySection}>
          <p>Ваша ставка: {teacherRate} ₽ за ученика</p>
          <ul>
            {salary.history.map((h, i) => {
              const dateOnly = new Date(h.date).toLocaleDateString("ru-RU");
              return (
                <li key={i}>
                  {dateOnly} — {getGroupName(h.group)}: +{h.amount} ₽
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className={styles.groups}>
        <h2>📚 Группы</h2>
        <div className={styles.groupList}>
          {groups.map((g) => (
            <button
              key={g.id}
              className={`${styles.groupButton} ${selectedGroup === g.id ? styles.activeGroup : ""}`}
              onClick={() => loadChildren(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </section>

      {selectedGroup && (
        <section className={styles.tableSection}>
          <h3>Начисления для группы {selectedGroup}</h3>
          <table className={styles.awardTable}>
            <thead>
              <tr>
                <th>Правило</th>
                {children.map((c) => (
                  <th key={c.id}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(rules).map((ruleKey) => (
                <tr key={ruleKey}>
                  <td>{rules[ruleKey].label}</td>
                  {children.map((c) => (
                    <td key={c.id}>
                      <input
                        type="checkbox"
                        checked={checks[c.id]?.[ruleKey] || false}
                        onChange={() => toggleCheck(c.id, ruleKey)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <button className={styles.saveButton} onClick={saveAwards}>
            💫 Начислить
          </button>
        </section>
      )}
    </div>
  );
}
