import React, { useEffect, useState } from "react";
import axios from "axios";
import {rules, autoRules} from "../constants/rules";
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
      .get(`/teacher/${user.id}/groups`)
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
        .get(`/teacher/${user.id}/salary`)
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
      .get(`/teacher/${user.id}/group/${group}`)
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
       const autoBonusesPromises = children.map((child) => checkAutoBonuses(child));
        const autoBonuses = (await Promise.all(autoBonusesPromises)).flat();

        const finalAwards = [...awardArr, ...autoBonuses].filter(Boolean);

     if (finalAwards.length === 0) {
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
      await axios.post(`/teacher/${user.id}/award`, { awards: finalAwards  });
      await axios.post(`/teacher/${user.id}/salary`, {
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

    // Проверка автоматических бонусов
  const checkAutoBonuses = async (child) => {
    try {
      const res = await axios.get(`/child/${child.id}/attendance`);
      const history = res.data || [];

      // Последние 4 записи и нет пропусков?
      const last4 = history.slice(-4);
      const allPresent = last4.length === 4 && last4.every(h => !h.absent);

      const bonuses = [];

      if (allPresent) {
        bonuses.push({
          childId: child.id,
          coins: autoRules.regularAttendance.value,
          reason: autoRules.regularAttendance.label,
          date: new Date().toISOString(),
          type: "auto"
        });
      }

      // Здесь можно добавить проверку других условий (например, project, review и т.д.)
      return bonuses;
    } catch (err) {
      console.error("Ошибка при проверке авто-бонусов:", err);
      return [];
    }
  };

  const handleOneTimeAward = async (key) => {
    try {
      const now = new Date().toISOString();
      const award = autoRules[key];
      const selected = children.map((c) => ({
        childId: c.id,
        coins: award.value,
        reason: award.label,
        date: now,
        group: selectedGroup,
      }));

      await axios.post(`/teacher/${user.id}/award`, { awards: selected });
      alert(`🎉 Начислен бонус: ${award.label} (+${award.value}) каждому ученику`);
    } catch (err) {
      console.error("Ошибка при начислении бонуса:", err);
      alert("Ошибка при начислении бонуса!");
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

          <section className={styles.oneTimeAwards}>
            <h3>🎁 Единоразовые бонусы</h3>
            {Object.keys(autoRules)
              .filter(k => autoRules[k].oncePerYear || autoRules[k].oncePerPost)
              .map((key) => (
                <button
                  key={key}
                  onClick={() => handleOneTimeAward(key)}
                  className={styles.oneTimeBtn}
                >
                  {autoRules[key].label} (+{autoRules[key].value})
                </button>
              ))}
          </section>

          <button className={styles.saveButton} onClick={saveAwards}>
            💫 Начислить
          </button>
        </section>
      )}
    </div>
  );
}
