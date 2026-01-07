/* ======================================================
   DOM
====================================================== */
const body = document.querySelector(".schedule-body");
const vacationBody = document.querySelector(".vacation-body");
const addBtn = document.querySelector(".schedule-add-btn");
const saveBtns = document.querySelectorAll(".schedule-save");

const modal = document.querySelector(".schedule-add-modal");
const closeBtn = document.querySelector(".schedule-close-modal");
const confirmBtn = document.querySelector(".confirm-add");
const modalTitle = document.querySelector(".schedule-add-modal-head h3");
const dateLabel = document.querySelector(".form-group.inline label");
const timeLabel = document.querySelectorAll(".form-group.inline label")[1];
const jobLabel = document.getElementById("jobLabel");

const dept = document.querySelector(".depart");
const emp = document.querySelector(".employee");
const job = document.querySelector(".job");

const workDate = document.querySelector(".workDate");
const startTime = document.querySelector(".startTime");
const endTime = document.querySelector(".endTime");
const setToday = document.querySelector(".setToday");

const fakeDate = document.querySelector(".fakeDate");
const fakeDateText = document.querySelector(".fakeDateText");
const fakeStart = document.querySelector(".fakeStart");
const fakeStartText = document.querySelector(".fakeStartText");
const fakeEnd = document.querySelector(".fakeEnd");
const fakeEndText = document.querySelector(".fakeEndText");

const todayText = document.querySelectorAll(".data-text-today");
const prevBtns = document.querySelectorAll(".schedule-prev-btn");
const nextBtns = document.querySelectorAll(".schedule-next-btn");
const todayBtns = document.querySelectorAll(".today-btn");

const mixToggle = document.getElementById("mixToggle");
const scheduleHeaderMain = document.getElementById("scheduleHeaderMain");

let viewMode = "day";
let currentDate = new Date().toISOString().slice(0, 10);
let manageMode = "work"; // work | vacation
let editingId = null;

const drafts = {};
const saved = JSON.parse(localStorage.getItem("schedules") || "{}");

function updateDateText() {
  const d = new Date(currentDate);
  const week = ["일", "월", "화", "수", "목", "금", "토"];
  const text = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${
    week[d.getDay()]
  })`;

  if (viewMode === "week") {
    const weekStart = getWeekOfMonth(d);
    todayText.forEach(
      (el) =>
        (el.textContent = `${d.getFullYear()}년 ${
          d.getMonth() + 1
        }월 ${weekStart}주차`)
    );
    return;
  }

  if (viewMode === "month") {
    todayText.forEach(
      (el) => (el.textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월`)
    );
    return;
  }

  todayText.forEach((el) => (el.textContent = text));
}

function changeDate(diff) {
  const d = new Date(currentDate);

  if (viewMode === "day") {
    d.setDate(d.getDate() + diff);
  }
  if (viewMode === "week") {
    d.setDate(d.getDate() + diff * 7);
  }
  if (viewMode === "month") {
    d.setMonth(d.getMonth() + diff);
  }

  currentDate = d.toISOString().slice(0, 10);
  updateDateText();
  renderTimeHeader();
  render();
}

prevBtns.forEach((btn) => {
  btn.onclick = () => changeDate(-1);
});
nextBtns.forEach((btn) => {
  btn.onclick = () => changeDate(1);
});
todayBtns.forEach((btn) => {
  btn.onclick = () => {
    currentDate = new Date().toISOString().slice(0, 10);
    updateDateText();
    render();
  };
});

updateDateText();

function calcNetWorkHours(items) {
  const work = items.find((v) => v.type === "work");
  const vacation = items.find((v) => v.type === "vacation");

  if (!work) return 0;

  let workMinutes = calcMinutes(work.start, work.end);

  if (vacation) {
    if (vacation.job.startsWith("half")) {
      workMinutes -= 240;
    } else if (isOverlap(work, vacation)) {
      workMinutes -= calcOverlapMinutes(work, vacation);
    }
  }

  return Math.max(0, Math.round((workMinutes / 60) * 2) / 2);
}
function calcMinutes(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

function calcOverlapMinutes(a, b) {
  const s1 = calcMinutes("00:00", a.start);
  const e1 = calcMinutes("00:00", a.end);
  const s2 = calcMinutes("00:00", b.start);
  const e2 = calcMinutes("00:00", b.end);

  return Math.max(0, Math.min(e1, e2) - Math.max(s1, s2));
}
function isOverlap(a, b) {
  if (!a.start || !a.end || !b.start || !b.end) return false;

  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  return toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
}

const DAY_START = 1 * 60;
const DAY_END = 24 * 60;
const DAY_RANGE = DAY_END - DAY_START;

function calcPosition(start, end) {
  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const startMin = Math.max(toMin(start), DAY_START);
  const endMin = Math.min(toMin(end), DAY_END);

  const left = ((startMin - DAY_START) / DAY_RANGE) * 100;
  const width = ((endMin - startMin) / DAY_RANGE) * 100;

  return { left, width };
}

function calcPositonWeek(item) {
  const itemDate = new Date(item.date); // item 자체가 가진 날짜를 써야 함
  const dayIndex = itemDate.getDay(); // 0(일) ~ 6(토)

  const left = (dayIndex / 7) * 100;
  const width = (1 / 7) * 100; // 한 칸의 너비는 무조건 1/7
  return { left, width };
}

function resetForm() {
  editingId = null;
  dept.value = "";
  emp.innerHTML = `<option value="">부서 선택</option>`;
  job.selectedIndex = 0;
  workDate.value = startTime.value = endTime.value = "";
  fakeDateText.textContent = "날짜 선택";
  fakeStartText.textContent = "시작 시간";
  fakeEndText.textContent = "종료 시간";
  confirmBtn.textContent = "일정 추가";
}

function showMonthTooltip(target, item) {
  let tip = document.querySelector(".month-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "month-tooltip";
    document.body.appendChild(tip);
  }

  const safeDept = item.dept.replace(/[^a-zA-Z0-9_-]/g, "");

  tip.innerHTML = `
    <div class = line1>
    <strong>${item.name}</strong>
    <span class="dept-${safeDept}">(${item.dept})</span>
    </div>
    <div class = line2>
    <span>${item.jobText}</span>
    (${item.start} - ${item.end})
    </div>
  `;

  const rect = target.getBoundingClientRect();
  tip.style.top = rect.top + window.scrollY + "px";
  tip.style.left = rect.right + 8 + "px";
  tip.classList.add("show");
}

function hideMonthTooltip() {
  const tip = document.querySelector(".month-tooltip");
  if (tip) tip.classList.remove("show");
}

addBtn.onclick = () => {
  manageMode = mixToggle.checked ? "vacation" : "work";
  resetForm();
  applyForm();
  modal.classList.add("is-open");
};

closeBtn.onclick = () => {
  modal.classList.remove("is-open");
  resetForm();
};

const vacationAddBtn = document.querySelector(".vacation-add-btn");

if (vacationAddBtn) {
  vacationAddBtn.onclick = () => {
    manageMode = "vacation";
    resetForm();
    applyForm();
    modal.classList.add("is-open");
  };
}

dept.onchange = () => {
  emp.innerHTML = `<option value="">선택</option>`;
  if (jobByDept[dept.value]) {
    [...job.options].forEach(
      (o) => (o.selected = o.textContent === jobByDept[dept.value])
    );
  }
  employeesData[dept.value]?.forEach((name) => {
    const o = document.createElement("option");
    o.value = name;
    o.textContent = name;
    emp.appendChild(o);
  });
};

fakeDate.onclick = () => workDate.showPicker?.() || workDate.click();
fakeStart.onclick = () => {
  if (startTime.disabled) return;
  startTime.showPicker?.() || startTime.click();
};

fakeEnd.onclick = () => {
  if (endTime.disabled) return;
  endTime.showPicker?.() || endTime.click();
};

setToday.onclick = () => {
  workDate.value = new Date().toISOString().slice(0, 10);
  workDate.dispatchEvent(new Event("change"));
};

workDate.onchange = () => {
  const d = new Date(workDate.value);
  fakeDateText.textContent = `${d.getMonth() + 1}월 ${d.getDate()}일`;
};
startTime.onchange = () => (fakeStartText.textContent = startTime.value);
endTime.onchange = () => (fakeEndText.textContent = endTime.value);

confirmBtn.onclick = () => {
  if (
    !workDate.value ||
    !emp.value ||
    !job.value ||
    !dept.value ||
    (manageMode === "work" && (!startTime.value || !endTime.value))
  ) {
    alert("모든 값을 입력해주세요");
    return;
  }

  let start = startTime.value;
  let end = endTime.value;

  if (manageMode === "vacation") {
    if (job.value === "half-am") {
      start = "09:00";
      end = "13:00";
    } else if (job.value === "half-pm") {
      start = "13:00";
      end = "18:00";
    } else {
      start = "09:00";
      end = "18:00";
    }
  }

  const item = {
    id: editingId || crypto.randomUUID(),
    type: manageMode,
    date: workDate.value,
    dept: dept.value,
    name: emp.value,
    job: job.value,
    jobText:
      job.value === "half-am"
        ? "반차(오전)"
        : job.value === "half-pm"
        ? "반차(오후)"
        : job.value === "full"
        ? "연차"
        : job.options[job.selectedIndex]?.text || "",
    start,
    end,
  };

  if (viewMode === "month" || viewMode === "week") {
    saved[workDate.value] ??= [];
    saved[workDate.value].push(item);
    localStorage.setItem("schedules", JSON.stringify(saved));
  } else {
    drafts[workDate.value] ??= [];
    if (editingId) {
      const i = drafts[workDate.value].findIndex((v) => v.id === editingId);
      drafts[workDate.value][i] = item;
    } else {
      drafts[workDate.value].push(item);
    }
  }

  modal.classList.remove("is-open");
  resetForm();
  render();
};

function render() {
  const activeSection = document.querySelector(".section.is-active");
  if (!activeSection) return;

  const isVacationPage = activeSection.dataset.page === "vacation";
  const targetBody = isVacationPage ? vacationBody : body;
  const targetHeader = activeSection.querySelector(".schedule-header-main");

  if (!targetBody) return;
  targetBody.innerHTML = "";

  if (targetHeader) {
    if (viewMode === "day") targetHeader.innerHTML = getDayHeaderHTML();
    else if (viewMode === "week") targetHeader.innerHTML = getWeekHeaderHTML();
    else targetHeader.innerHTML = "";
  }

  if (viewMode === "month") {
    renderMonth(targetBody, isVacationPage);
    return;
  }

  let dates = [];
  if (viewMode === "day") {
    dates = [currentDate];
  } else if (viewMode === "week") {
    const start = getWeekStart(currentDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
  }

  const allItems = [];
  dates.forEach((date) => {
    if (viewMode === "day" && drafts[date]) allItems.push(...drafts[date]);
    if (saved[date]) allItems.push(...saved[date]);
  });

  const filtered = allItems.filter((item) => {
    if (isVacationPage) return item.type === "vacation";
    return mixToggle && mixToggle.checked
      ? item.type === "vacation"
      : item.type === "work";
  });

  const grouped = {};
  filtered.forEach((item) => {
    grouped[item.name] ??= [];
    grouped[item.name].push(item);
  });

  Object.values(grouped).forEach((items) => {
    renderRow(items, targetBody);
  });
}

function renderVacation() {
  if (!vacationBody) return;

  vacationBody.innerHTML = "";

  const draftsToday = drafts[currentDate] || [];
  const savedToday = saved[currentDate] || [];

  const all = [...draftsToday, ...savedToday];

  const vacationItems = all.filter((v) => v.type === "vacation");

  const grouped = {};
  vacationItems.forEach((item) => {
    grouped[item.name] ??= [];
    grouped[item.name].push(item);
  });

  Object.values(grouped).forEach((items) => {
    renderRow(items, vacationBody);
  });
}

function renderRow(items, target = body) {
  const work = items.find((v) => v.type === "work");
  const vacation = items.find((v) => v.type === "vacation");
  const base = work || vacation;
  if (!base) return;

  const rowDate = base.date;
  const isDraft = drafts[rowDate]?.some((d) => d.id === base.id);
  const statusClass = isDraft ? "draft" : "saved";

  // [에러 해결] 변수 선언 추가
  const workHours = calcNetWorkHours(items);
  const hasWork = items.some((v) => v.type === "work");

  // 주 모드에서는 체크박스/버튼 숨기기
  const hideControls = viewMode === "week";

  target.insertAdjacentHTML(
    "beforeend",
    `
    <div class="schedule-row ${statusClass}" data-id="${base.id}" data-name="${
      base.name
    }" data-date="${rowDate}">
      
      <div class="row-check-wrap" style="${hideControls ? "display:none" : ""}">
        <input type="checkbox" class="row-check" 
        data-type="${base.type}" data-name="${base.name}" data-date="${rowDate}"
        ${isDraft ? "" : "disabled"} />
      </div>

      <div class="employee">
        <strong>${base.name}</strong>
        <span class="employee-meta">
          <span>${base.dept}</span>
            ${
              hasWork && workHours > 0
                ? base.job === "teal"
                  ? `<span class="work-hours"> / ${workHours}h (출장)</span>`
                  : `<span class="work-hours"> / ${workHours}h</span>`
                : ""
            }
         ${
           vacation
             ? `<span class="vacation-type"> / ${vacation.jobText}</span>`
             : ""
         }
        </span>
      </div>

      <div class="timeline">
        ${items
          .map((item) => renderShift(item, item.type === "vacation"))
          .join("")}
      </div>

      ${
        isDraft && !hideControls
          ? `<div class="draft-actions">
                <button class="draft-edit">수정</button>
                <button class="draft-delete">삭제</button>
             </div>`
          : ""
      }
    </div>
    `
  );
}

function renderShift(item, isVacation, dimmed = false) {
  let pos;

  if (viewMode === "day") {
    pos = calcPosition(item.start, item.end);
  } else if (viewMode === "week") {
    const itemDate = new Date(item.date);
    const dayIndex = itemDate.getDay(); 

    pos = {
      left: (dayIndex / 7) * 100 + 0.6,
      width: (1 / 7) * 100 - 1.2,
    };
  } else {
    const d = new Date(currentDate);
    const daysInMonth = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).getDate();
    pos = {
      left: (d.getDate() / daysInMonth) * 100,
      width: 1.5,
    };
  }

  return `
  <div class="shift ${isVacation ? "vacation" : item.job} ${
    dimmed ? "dimmed" : ""
  }"
    data-id="${item.id}"
    data-date="${item.date}"
    style="left:${pos.left}%; width:${pos.width}%; ${
    isVacation ? "z-index:2;" : ""
  }">
    ${
      viewMode === "week"
        ? `<small>${item.jobText || ""}</small>`
        : `${item.start} - ${item.end}<small>${item.jobText || ""}</small>`
    }
    </div>
  `;
}

function renderMonth(target, isVacationPage) {
  if (!target) return;
  target.innerHTML = `
    <div class="month-calendar">
      <div class="month-header">
        <span>일</span><span>월</span><span>화</span><span>수</span>
        <span>목</span><span>금</span><span>토</span>
      </div>
      <div class="month-grid"></div>
    </div>
  `;

  const grid = target.querySelector(".month-grid");
  const baseDate = new Date(currentDate);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < startDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const cell = document.createElement("div");
    const isToday = dateStr === todayStr;
    cell.className = `month-day ${isToday ? "is-today" : ""}`;
    cell.innerHTML = `<div class="date">${d}</div>`;

    const items = saved[dateStr] || [];

    // [수정] 필터링 로직: 휴가 페이지면 무조건 휴가만, 아니면 토글 상태에 따라
    const filtered = items.filter((item) => {
      if (isVacationPage) return item.type === "vacation";
      return mixToggle.checked
        ? item.type === "vacation"
        : item.type === "work";
    });

    if (filtered.length > 0) {
      cell
        .querySelector(".date")
        .insertAdjacentHTML(
          "beforeend",
          `<span class="count-dot">${filtered.length}</span>`
        );
    }

    filtered.slice(0, 3).forEach((item) => {
      const el = document.createElement("div");
      el.className = "month-item";
      const text =
        item.type === "vacation"
          ? `${item.name}(${item.jobText})`
          : `${item.name}<span class="m-time">(${item.start}~${item.end})</span>`;
      const dotClass = item.type === "vacation" ? "gray" : item.job;
      el.innerHTML = `<span class="dot ${dotClass}"></span><span class="text">${text}</span>`;

      el.onclick = (e) => {
        e.stopPropagation();
        openMonthSavedModal(dateStr, isVacationPage);
      };
      cell.appendChild(el);
    });

    cell.onclick = () => openMonthSavedModal(dateStr, isVacationPage);
    grid.appendChild(cell);
  }
}

function openMonthSavedModal(date, isVacationPage = false) {
  const modal = document.querySelector(".month-saved-modal");
  const titleEl = modal.querySelector(".month-saved-modal-text");
  const content = modal.querySelector(".month-saved-modal-content");
  const checkAllBtn = modal.querySelector(".check-all-btn"); // 전체 선택 버튼
  const editBtn = modal.querySelector(".edit");
  const deleteBtn = modal.querySelector(".delete");

  if (!modal || !content) return;

  if (checkAllBtn) checkAllBtn.classList.remove("active");

  const isVacationMode = isVacationPage || (mixToggle && mixToggle.checked);

  let filterWrap = modal.querySelector(".month-dept-filter");
  if (!filterWrap) {
    filterWrap = document.createElement("div");
    filterWrap.className = "month-dept-filter";
    modal.querySelector(".modal-card").insertBefore(filterWrap, checkAllBtn);
  }

  const depts = [
    "전체",
    "Management",
    "Sales",
    "Marketing",
    "Design",
    "Production",
    "R&D",
  ];
  let currentFilter = "전체";

  const d = new Date(date);
  const titleDate = `${String(d.getFullYear()).slice(2)}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;

  titleEl.textContent = `${titleDate} ${
    isVacationMode ? "휴가일정 변경" : "근무일정 변경"
  }`;

  function renderFilteredItems() {
    if (checkAllBtn) checkAllBtn.classList.remove("active");

    const allItems = (saved[date] || []).filter((item) =>
      isVacationMode ? item.type === "vacation" : item.type === "work"
    );

    const filteredItems = allItems.filter(
      (item) => currentFilter === "전체" || item.dept === currentFilter
    );

    content.innerHTML = filteredItems
      .map((item) => {
        const safeDept = item.dept.replace(/[^a-zA-Z0-9_-]/g, "");
        return `
        <label class="month-item-row">
          <input type="checkbox" data-id="${item.id}" />
          <span class="check-ui"></span>
          <span class="name">
            ${item.name} <span class="dept dept-${safeDept}">(${
          item.dept
        })</span>
          </span>
          <span class="job">[${item.jobText || ""}]</span>
          <span class="time">${item.start} ~ ${item.end}</span>
        </label>
      `;
      })
      .join("");

    const checkboxes = [...content.querySelectorAll("input[type='checkbox']")];

    const updateButtonState = () => {
      const checkedCount = checkboxes.filter((c) => c.checked).length;
      editBtn.disabled = checkedCount !== 1;
      editBtn.classList.toggle("disabled", checkedCount !== 1);
      deleteBtn.disabled = checkedCount === 0;
      deleteBtn.classList.toggle("disabled", checkedCount === 0);

      if (checkAllBtn) {
        checkAllBtn.classList.toggle(
          "active",
          checkboxes.length > 0 && checkedCount === checkboxes.length
        );
      }
    };

    checkboxes.forEach((chk) => (chk.onchange = updateButtonState));

    if (checkAllBtn) {
      checkAllBtn.onclick = () => {
        const allChecked =
          checkboxes.length > 0 && checkboxes.every((c) => c.checked);
        checkboxes.forEach((c) => (c.checked = !allChecked));
        updateButtonState();
      };
    }

    updateButtonState();
  }

  filterWrap.innerHTML = depts
    .map(
      (deptName) =>
        `<button type="button" class="dept-filter-btn ${
          currentFilter === deptName ? "active" : ""
        }" data-dept="${deptName}">${deptName}</button>`
    )
    .join("");

  filterWrap.onclick = (e) => {
    const btn = e.target.closest(".dept-filter-btn");
    if (!btn) return;
    currentFilter = btn.dataset.dept;
    filterWrap
      .querySelectorAll(".dept-filter-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderFilteredItems();
  };

  editBtn.onclick = () => {
    const checked = content.querySelector("input[type='checkbox']:checked");
    if (!checked) return;
    openEditModal(checked.dataset.id, date);
    modal.classList.add("is-hidden");
  };

  deleteBtn.onclick = () => {
    const checked = [
      ...content.querySelectorAll("input[type='checkbox']:checked"),
    ];
    if (!checked.length || !confirm("선택한 일정을 삭제하시겠습니까?")) return;
    saved[date] = saved[date].filter(
      (v) => !checked.some((c) => c.dataset.id === v.id)
    );
    localStorage.setItem("schedules", JSON.stringify(saved));
    modal.classList.add("is-hidden");
    render();
  };

  modal.querySelector(".close").onclick = () =>
    modal.classList.add("is-hidden");

  renderFilteredItems();
  modal.classList.remove("is-hidden");
}

function getDayHeaderHTML() {
  return `
    <div class="day-header">
      <div class="am-pm">
        <div>AM</div>
        <div>PM</div>
      </div>
      <div class="time-scale">
        ${Array.from({ length: 24 }, (_, i) => `<span>${i + 1}</span>`).join(
          ""
        )}
      </div>
    </div>
  `;
}

function getWeekHeaderHTML() {
  const start = getWeekStart(currentDate);
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date(currentDate).getMonth();
  const weekOfMonth = getWeekOfMonth(new Date(currentDate));

  return `
    <div class="week-header">
      <div class="week-title">
        ${dates[0].getMonth() + 1}월 ${weekOfMonth}주차
      </div>

      <div class="week-dates">
        ${dates
          .map((d) => {
            const isToday = d.toISOString().slice(0, 10) === todayStr;
            const isOutside = d.getMonth() !== currentMonth;

            return `<span class="
              ${isOutside ? "is-outside" : ""}
              ${isToday ? "is-today" : ""}
            ">
              ${d.getMonth() + 1}/${d.getDate()}
            </span>`;
          })
          .join("")}
      </div>

      <div class="week-days">
        ${dates
          .map((d) => {
            const isToday = d.toISOString().slice(0, 10) === todayStr;
            const isOutside = d.getMonth() !== currentMonth;

            return `<span class="
              ${isOutside ? "is-outside" : ""}
              ${isToday ? "is-today" : ""}
            ">
              ${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]}
            </span>`;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderTimeHeader() {
  if (!scheduleHeaderMain) return;

  if (viewMode === "day") {
    scheduleHeaderMain.innerHTML = getDayHeaderHTML();
  } else if (viewMode === "week") {
    scheduleHeaderMain.innerHTML = getWeekHeaderHTML();
  } else if (viewMode === "month") {
    scheduleHeaderMain.innerHTML = "";
  }
}

function handleRowClick(e) {
  const clickedShift = e.target.closest(".shift");
  const row = e.target.closest(".schedule-row");
  if (!row) return;

  if (
    mixToggle.checked &&
    clickedShift &&
    !clickedShift.classList.contains("vacation")
  ) {
    return;
  }

  const id = clickedShift ? clickedShift.dataset.id : row.dataset.id;
  const date = clickedShift ? clickedShift.dataset.date : row.dataset.date;

  if (e.target.classList.contains("row-check")) return;

  if (e.target.classList.contains("draft-delete")) {
    if (confirm("삭제하시겠습니까?")) {
      drafts[date] = (drafts[date] || []).filter((v) => v.id !== id);
      render();
    }
    return;
  }

  if (e.target.classList.contains("draft-edit")) {
    const item = (drafts[date] || []).find((v) => v.id === id);
    if (!item) return;

    editingId = id;
    manageMode = item.type;
    applyForm();

    modalTitle.textContent = "일정 수정";
    confirmBtn.textContent = "수정 완료";
    modal.classList.add("is-open");

    dept.value = item.dept;
    dept.dispatchEvent(new Event("change"));
    emp.value = item.name;
    job.value = item.job;
    startTime.value = item.start;
    endTime.value = item.end;

    fakeStartText.textContent = item.start;
    fakeEndText.textContent = item.end;
    workDate.value = date;
    fakeDateText.textContent = `${new Date(date).getMonth() + 1}월 ${new Date(
      date
    ).getDate()}일`;

    return;
  }

  if (row.classList.contains("saved") && clickedShift) {
    openRowActionModal(row, clickedShift, id, date);
    return;
  }

  render();
}

body.onclick = handleRowClick;
if (vacationBody) vacationBody.onclick = handleRowClick;

function openEditModal(id, date) {
  const list = saved[date] || [];
  const item = list.find((v) => v.id === id);
  if (!item) return;

  editingId = id;
  manageMode = item.type;
  applyForm();

  modalTitle.textContent =
    item.type === "vacation" ? "휴가일정 수정" : "근무일정 수정";
  confirmBtn.textContent = "수정 완료";
  modal.classList.add("is-open");

  dept.value = item.dept;
  dept.dispatchEvent(new Event("change"));
  emp.value = item.name;
  job.value = item.job;
  startTime.value = item.start;
  endTime.value = item.end;
  fakeStartText.textContent = item.start;
  fakeEndText.textContent = item.end;
}

function deleteSavedItem(id, date) {
  if (!confirm("이 일정을 삭제할까요?")) return;

  saved[date] = (saved[date] || []).filter((v) => v.id !== id);
  localStorage.setItem("schedules", JSON.stringify(saved));
  render();
}
function openRowActionModal(row, clickedShift, targetId, targetDate) {
  if (!clickedShift) return;
  document
    .querySelectorAll(".schedule-row.saved.active")
    .forEach((r) => r.classList.remove("active"));
  row.classList.add("active");

  const modal = document.querySelector(".row-action-modal");
  if (!modal) return;

  const titleEl = modal.querySelector(".row-action-modal-title-text");
  const contentEl = modal.querySelector(".row-action-modal-shedule-text");

  const dayItems = saved[targetDate] || [];
  const targetItem = dayItems.find((item) => item.id === targetId);

  if (!targetItem) return;

  titleEl.textContent =
    targetItem.type === "vacation"
      ? "확정 휴가일정 변경"
      : "확정 근무일정 변경";

  const jobClass =
    targetItem.type === "vacation" ? "job gray" : `job ${targetItem.job}`;
  const jobText = `<span class="${jobClass}">${targetItem.jobText}</span>`;
  const timeText = `${targetItem.start} ~ ${targetItem.end}`;

  contentEl.innerHTML = `
    <div class="modal-row line1">
      <strong class="name">${targetItem.name}</strong>
      <span class="sub">(${targetItem.dept})</span>
    </div>
    <div class="modal-row line2">
      ${jobText} <span class="time">${timeText}</span>
    </div>
  `;

  modal.classList.remove("is-hidden");

  modal.querySelector(".edit").onclick = () => {
    openEditModal(targetId, targetDate);
    modal.classList.add("is-hidden");
  };

  modal.querySelector(".delete").onclick = () => {
    deleteSavedItem(targetId, targetDate);
    modal.classList.add("is-hidden");
  };

  modal.querySelector(".close").onclick = () => {
    modal.classList.add("is-hidden");
  };
}

saveBtns.forEach((saveBtn) => {
  saveBtn.onclick = () => {
    const checked = document.querySelectorAll(".row-check:checked");

    if (!checked.length) {
      alert("확정할 일정을 선택해주세요");
      return;
    }

    checked.forEach((chk) => {
      const { name, date } = chk.dataset;
      const list = drafts[date] || [];
      const idx = list.findIndex((v) => v.name === name);
      if (idx === -1) return;

      const newItem = list[idx];

      if (saved[date]) {
        saved[date].forEach((existingItem) => {
          if (existingItem.name === name && existingItem.type === "work") {
            if (
              existingItem.start < newItem.start &&
              existingItem.end > newItem.start
            ) {
              existingItem.end = newItem.start;
            } else if (
              existingItem.start < newItem.end &&
              existingItem.end > newItem.end
            ) {
              existingItem.start = newItem.end;
            }
          }
        });
      }

      saved[date] ??= [];
      saved[date].push(newItem);
      list.splice(idx, 1);
    });

    localStorage.setItem("schedules", JSON.stringify(saved));
    render();
    renderVacation();

    document
      .querySelectorAll(".row-check")
      .forEach((chk) => (chk.checked = false));
    document
      .querySelectorAll(".check-all input")
      .forEach((all) => (all.checked = false));
  };
});

document.querySelectorAll(".check-all").forEach((checkAll) => {
  checkAll.onchange = (e) => {
    const scope = e.target.dataset.scope;

    const container =
      scope === "vacation"
        ? document.querySelector(".vacation-body")
        : document.querySelector(".schedule-body");

    container
      .querySelectorAll(".schedule-row.draft .row-check")
      .forEach((chk) => {
        chk.checked = e.target.checked;
      });
  };
});

job.onchange = () => {
  if (manageMode === "vacation") {
    startTime.disabled = true;
    endTime.disabled = true;
  } else {
    startTime.disabled = false;
    endTime.disabled = false;
  }
};

if (mixToggle) {
  mixToggle.onchange = (e) => {
    manageMode = e.target.checked ? "vacation" : "work";
    document.body.classList.toggle("show-vacation", e.target.checked);

    addBtn.textContent =
      manageMode === "vacation" ? "+ 휴가일정 추가하기" : "+ 근무일정 추가하기";
    render();
  };
}

function applyForm() {
  if (manageMode === "vacation") {
    modalTitle.textContent = "휴가일정 추가";
    dateLabel.textContent = "휴가날짜";
    timeLabel.textContent = "휴가시간";
    confirmBtn.textContent = "일정 추가";
    jobLabel.textContent = "휴가";

    job.innerHTML = `
      <option value="">선택</option>
      <option value="full">연차</option>
      <option value="half-am">반차(오전)</option>
      <option value="half-pm">반차(오후)</option>
      <option value="sick">병가</option>
      <option value="vacation">휴가</option>
    `;
  } else {
    modalTitle.textContent = "근무일정 추가";
    dateLabel.textContent = "근무날짜";
    timeLabel.textContent = "근무시간";
    confirmBtn.textContent = editingId ? "근무일정 수정" : "일정 추가";
    jobLabel.textContent = "직무";

    job.innerHTML = `
      <option value="">선택</option>
      <option value="red">Management</option>
      <option value="blue">Sales</option>
      <option value="purple">Marketing</option>
      <option value="yellow">Design</option>
      <option value="green">Production</option>
      <option value="orange">R&D</option>
      <option value="teal">출장</option>
    `;
  }

  startTime.disabled = manageMode === "vacation";
  endTime.disabled = manageMode === "vacation";
}

document.querySelectorAll(".schedule .view-mode").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll(".schedule .view-mode")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    viewMode = btn.classList.contains("day")
      ? "day"
      : btn.classList.contains("week")
      ? "week"
      : "month";

    document.body.dataset.viewMode = viewMode;

    updateDateText();
    renderTimeHeader();
    render();
  };
});
document.querySelectorAll(".vacation .view-mode").forEach((btn) => {
  btn.onclick = () => {
    document
      .querySelectorAll(".vacation .view-mode")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    viewMode = btn.classList.contains("day")
      ? "day"
      : btn.classList.contains("week")
      ? "week"
      : "month";

    document.body.dataset.viewMode = viewMode;

    updateDateText();
    renderTimeHeader();
    render();
  };
});

function getWeekStart(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}
function getWeekOfMonth(date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
}

updateDateText();
renderTimeHeader();
render();

// section - vacation
// 요소 선택
const vRateBtn = document.querySelector(".vacation-rate-btn");
const vRateModal = document.querySelector(".vacation-rate-modal");
const vCloseBtns = document.querySelectorAll(
  ".close-rate-modal, .vacation-rate-modal .confirm, .vacation-rate-modal .cancel"
);
const vPromoteBtn = vRateModal?.querySelector(".promote-btn");
const vDeptSelect = vRateModal?.querySelector(".depart");
const vEmpSelect = vRateModal?.querySelector(".employee");

function resetVacationRateModal() {
  if (!vRateModal) return;
  if (vDeptSelect) vDeptSelect.value = "";
  if (vEmpSelect) {
    vEmpSelect.innerHTML = '<option value="">선택</option>';
    vEmpSelect.value = "";
  }
  vRateModal
    .querySelectorAll(".employee-rate-item")
    .forEach((i) => i.classList.remove("active"));
  vRateModal.classList.add("is-hidden");
}

if (vRateBtn) {
  vRateBtn.onclick = () => {
    vRateModal.classList.remove("is-hidden");

    const bar = vRateModal.querySelector(".progress-bar");
    if (bar) {
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = bar.dataset.value + "%";
      }, 200);
    }

    const listContainer = vRateModal.querySelector(".rate-employee-list");
    if (listContainer) {
      listContainer.innerHTML =
        '<span class="list-title">연차휴가 사용 촉진 대상</span>';

      const allEmps = [];
      if (typeof employeesData !== "undefined") {
        Object.keys(employeesData).forEach((deptName) => {
          employeesData[deptName].forEach((name) =>
            allEmps.push({ name, dept: deptName })
          );
        });
      }

      allEmps
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .forEach((empData) => {
          const fakeRate = Math.floor(Math.random() * 30) + 5;
          const item = document.createElement("div");
          item.className = "employee-rate-item";
          item.innerHTML = `
          <div class="emp-info"><strong>${empData.name}</strong> <span>${empData.dept}</span></div>
          <div class="emp-graph">
            <span>${fakeRate}%</span>
          </div>
        `;

          item.onclick = () => {
            vRateModal
              .querySelectorAll(".employee-rate-item")
              .forEach((i) => i.classList.remove("active"));
            item.classList.add("active");

            if (vDeptSelect) {
              vDeptSelect.value = empData.dept;
              vDeptSelect.dispatchEvent(new Event("change"));
              if (vEmpSelect) vEmpSelect.value = empData.name;
            }
          };
          listContainer.appendChild(item);
        });
    }
  };
}

if (vDeptSelect && vEmpSelect) {
  vDeptSelect.onchange = () => {
    const selectedDept = vDeptSelect.value;
    vEmpSelect.innerHTML = '<option value="">선택</option>';

    if (
      selectedDept &&
      typeof employeesData !== "undefined" &&
      employeesData[selectedDept]
    ) {
      employeesData[selectedDept].forEach((name) => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        vEmpSelect.appendChild(opt);
      });
    }
  };
}

vCloseBtns.forEach((btn) => {
  btn.onclick = resetVacationRateModal;
});

// vacation.js 내의 if (vPromoteBtn) 블록을 아래로 교체
if (vPromoteBtn) {
  vPromoteBtn.onclick = () => {
    const selectedName = vEmpSelect?.value;
    const selectedDept = vDeptSelect?.value;
    if (!selectedName) return alert("직원을 선택해주세요.");

    resetVacationRateModal();
    openModal(".contract-request-modal");

    const tSelect = document.getElementById("contract-template-select");
    tSelect.value = "contract-vacation";

    const vacationOpt = document.querySelector(
      "#contract-template-select option[value='contract-vacation']"
    );
    if (vacationOpt) vacationOpt.disabled = false;

    const targetDept = document.getElementById("target-dept-select");
    const targetEmp = document.getElementById("target-emp-select");

    if (targetDept && targetEmp) {
      targetDept.value = selectedDept;
      targetDept.dispatchEvent(new Event("change"));
      setTimeout(() => {
        targetEmp.value = selectedName;
        renderTemplateFields(
          "contract-vacation",
          "#dynamic-form-fields-request",
          false,
          {
            p1: selectedName,
            dept: selectedDept,
            phone: getRandomPhone(),
            address: getRandomAddr(),
          }
        );
      }, 100);
    }

    const targetType = document.getElementById("contract-target-select");
    if (targetType) {
      targetType.value = "Personal";
      targetType.dispatchEvent(new Event("change"));
    }

    const msgArea = document.getElementById("contract-request-message");
    const config = templateFields["contract-vacation"];
    if (msgArea && config) msgArea.value = config.msg;
  };
}
/* ======================================================
   Attendance (출퇴근기록) 통합 로직
====================================================== */

let currentAttDept = "all";

function updateAttendanceDateText() {
  const d = new Date(currentDate);
  const textEl = document.querySelector(".attendance-today-txt");
  if (textEl) {
    textEl.textContent = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
  }
}

function renderAttendanceBoard() {
  const activeSection = document.querySelector(
    'section[data-page="attendance"]'
  );
  if (!activeSection || activeSection.classList.contains("is-hidden")) return;

  const body = document.getElementById("attBody");
  const header = document.getElementById("attHeaderDays");
  if (!body || !header) return;

  const d = new Date(currentDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const now = new Date();
  const tYear = now.getFullYear();
  const tMonth = now.getMonth();
  const tDate = now.getDate();

  // 1. 헤더 렌더링
  let headerHtml = "";
  for (let i = 1; i <= lastDate; i++) {
    const targetDate = new Date(year, month, i);
    const dayIdx = targetDate.getDay();
    const isToday = year === tYear && month === tMonth && i === tDate;
    const weekendClass = dayIdx === 0 ? "sun" : dayIdx === 6 ? "sat" : "";
    const todayClass = isToday ? "is-today" : "";

    headerHtml += `
      <div class="att-day-col ${weekendClass} ${todayClass}">
        <div style="font-weight: bold;">${i}</div>
        <div style="font-size: 10px;">${dayNames[dayIdx]}</div>
      </div>`;
  }
  header.innerHTML = headerHtml;

  // 2. 바디 렌더링 (부서 필터 포함)
  let bodyHtml = "";
  const deptsToRender =
    currentAttDept === "all" ? Object.keys(employeesData) : [currentAttDept];

  deptsToRender.forEach((dept) => {
    if (!employeesData[dept]) return;
    employeesData[dept].forEach((name) => {
      bodyHtml += `
        <div class="attendance-body-row">
          <div class="emp-info-sticky">
            <div class="emp-info-sticky-strong">${name}</div>
            <div style="font-size:10px; color:var(--grayColor500);">${dept}</div>
          </div>
          <div class="att-records-wrap">
            ${Array.from({ length: lastDate }, (_, i) => {
              const dayNum = i + 1;
              const targetDate = new Date(year, month, dayNum);
              const isFuture =
                targetDate.setHours(0, 0, 0, 0) > now.setHours(0, 0, 0, 0);

              let timeIn = "-",
                timeOut = "-",
                tag = "",
                cls = "";

              if (!isFuture) {
                const isWeekend =
                  targetDate.getDay() === 0 || targetDate.getDay() === 6;
                if (!isWeekend) {
                  const rand = Math.random();
                  const inMin = Math.floor(Math.random() * 20) - 10;
                  timeIn =
                    inMin > 5
                      ? `09:${String(inMin).padStart(2, "0")}`
                      : `08:${String(60 + inMin).slice(-2)}`;
                  timeOut = `18:${String(
                    Math.floor(Math.random() * 30)
                  ).padStart(2, "0")}`;

                  if (inMin > 5) {
                    tag = "지각";
                    cls = "tag-late";
                  } else if (rand > 0.92) {
                    tag = "미체크";
                    timeOut = "--:--";
                    cls = "tag-missing";
                  } else if (rand > 0.88) {
                    tag = "휴가";
                    timeIn = "-";
                    timeOut = "-";
                    cls = "tag-vacation";
                  }
                }
              }

              return `
                <div class="att-day-col ${isFuture ? "is-future" : ""}">
                  <div class="att-record-box">
                    ${tag ? `<span class="att-tag ${cls}">${tag}</span>` : ""}
                    <div class="t-in ${
                      tag === "지각" ? "late" : ""
                    }">${timeIn}</div>
                    <div class="t-out">${timeOut}</div>
                  </div>
                </div>`;
            }).join("")}
          </div>
        </div>`;
    });
  });
  body.innerHTML = bodyHtml;
}

document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.querySelector(".attendance-prev-btn");
  const nextBtn = document.querySelector(".attendance-next-btn");
  const attTodayBtn = document.querySelector(
    'section[data-page="attendance"] .today-btn'
  );

  if (prevBtn) {
    prevBtn.onclick = () => {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() - 1);
      currentDate = d.toISOString().slice(0, 10);
      updateAttendanceDateText();
      renderAttendanceBoard();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      const d = new Date(currentDate);
      d.setMonth(d.getMonth() + 1);
      currentDate = d.toISOString().slice(0, 10);
      updateAttendanceDateText();
      renderAttendanceBoard();
    };
  }

  if (attTodayBtn) {
    attTodayBtn.onclick = () => {
      currentDate = new Date().toISOString().slice(0, 10);
      updateAttendanceDateText();
      renderAttendanceBoard();
    };
  }

  const deptFilter = document.getElementById("attDeptFilter");
  if (deptFilter) {
    deptFilter.onchange = (e) => {
      currentAttDept = e.target.value;
      renderAttendanceBoard();
    };
  }

  updateAttendanceDateText();
  renderAttendanceBoard();
});
