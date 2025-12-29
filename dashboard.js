// darkmode
document.getElementById("darkmode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
// page 이동
const menuBtn = document.querySelector(".menu");
const aside = document.querySelector(".aside");
const wrap = document.querySelector(".wrap");

menuBtn.addEventListener("click", () => {
  aside.classList.toggle("open");
  wrap.classList.toggle("menu-open");
});

const navItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.dataset.target;

    aside.classList.remove("open");
    wrap.classList.remove("menu-open");

    navItems.forEach((i) => i.classList.remove("is-active"));
    item.classList.add("is-active");

    sections.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.page === target);
    });
  });
});

const cards = document.querySelectorAll(".card[data-target]");

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const target = card.dataset.target;

    sections.forEach((section) => {
      section.classList.toggle("is-active", section.dataset.page === target);
    });

    navItems.forEach((nav) => {
      nav.classList.toggle("is-active", nav.dataset.target === target);
    });
  });
});

document.querySelectorAll(".progress-bar").forEach((bar) => {
  const value = bar.dataset.value;
  requestAnimationFrame(() => {
    bar.style.width = value + "%";
  });
});

// section - schedule + vacation =========================================
/* ======================================================
   DOM
====================================================== */
const body = document.querySelector(".schedule-body");
const vacationBody = document.querySelector(".vacation-body");
const addBtn = document.querySelector(".schedule-add-btn");
const saveBtn = document.querySelector(".schedule-save");

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
const prevBtn = document.querySelector(".schedule-prev-btn");
const nextBtn = document.querySelector(".schedule-next-btn");
const todayBtn = document.querySelector(".today-btn");

const mixToggle = document.getElementById("mixToggle");

/* ======================================================
   상태
====================================================== */
let currentDate = new Date().toISOString().slice(0, 10);
let manageMode = "work"; // work | vacation
let editingId = null;

const drafts = {};
const saved = JSON.parse(localStorage.getItem("schedules") || "{}");

/* ======================================================
   데이터
====================================================== */
const jobByDept = {
  Management: "Management",
  Sales: "Sales",
  Marketing: "Marketing",
  Design: "Design",
  Production: "Production",
  "R&D": "R&D",
};

const employeesData = {
  Management: ["정희석", "강대희", "이민", "권동주", "김준성", "권동현"],
  Sales: ["이유정", "김민석", "김민지", "이유준", "이은빈", "김태환"],
  Marketing: ["정하늘", "이담희", "정승훈", "김성길", "강대웅"],
  Design: ["하다경", "이기자", "한진수", "박지원", "이은수", "권민지"],
  Production: ["김형선", "이동욱", "이진", "김여원", "박채린"],
  "R&D": ["김민이", "심진우", "진예진", "강민서", "최소윤", "장재영"],
};

/* ======================================================
   날짜
====================================================== */
function updateDateText() {
  const d = new Date(currentDate);
  const week = ["일", "월", "화", "수", "목", "금", "토"];
  const text = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${
    week[d.getDay()]
  })`;

  todayText.forEach((el) => (el.textContent = text));
}

function changeDate(diff) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + diff);
  currentDate = d.toISOString().slice(0, 10);
  updateDateText();
  render();
}

prevBtn.onclick = () => changeDate(-1);
nextBtn.onclick = () => changeDate(1);
todayBtn.onclick = () => {
  currentDate = new Date().toISOString().slice(0, 10);
  updateDateText();
  render();
};

updateDateText();

/* ======================================================
   유틸
====================================================== */
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

function calcPosition(start, end) {
  const startMin = start
    ? Number(start.split(":")[0]) * 60 + Number(start.split(":")[1])
    : 0;
  const endMin = end
    ? Number(end.split(":")[0]) * 60 + Number(end.split(":")[1])
    : startMin;
  const left = (startMin / 1440) * 100;
  const width = ((endMin - startMin) / 1440) * 100;
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

/* ======================================================
   모달
====================================================== */
addBtn.onclick = () => {
  manageMode = "work";
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

/* ======================================================
   select 연동
====================================================== */
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

/* ======================================================
   fake picker
====================================================== */
fakeDate.onclick = () => workDate.showPicker?.() || workDate.click();
fakeStart.onclick = () => startTime.showPicker?.() || startTime.click();
fakeEnd.onclick = () => endTime.showPicker?.() || endTime.click();

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

/* ======================================================
   추가 / 수정
====================================================== */
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

  drafts[workDate.value] ??= [];

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

  if (editingId) {
    const i = drafts[workDate.value].findIndex((v) => v.id === editingId);
    drafts[workDate.value][i] = item;
  } else {
    drafts[workDate.value].push(item);
  }

  modal.classList.remove("is-open");
  resetForm();
  render();

  renderVacation();
};

/* ======================================================
   렌더
====================================================== */
function render() {
  body.innerHTML = "";

  const draftsToday = drafts[currentDate] || [];
  const savedToday = saved[currentDate] || [];

  const ordered = [...draftsToday, ...savedToday].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === "work" ? -1 : 1;
  });

  const allItems = [...savedToday, ...draftsToday].filter((item) => {
    if (!mixToggle.checked) return item.type !== "vacation";
    return true;
  });

  const grouped = {};
  allItems.forEach((item) => {
    const key = item.name;
    grouped[key] ??= [];
    grouped[key].push(item);
  });

  Object.values(grouped).forEach((items) => {
    renderRow(items);
  });

  renderVacation();
}
function renderVacation() {
  if (!vacationBody) return;

  vacationBody.innerHTML = "";

  const draftsToday = drafts[currentDate] || [];
  const savedToday = saved[currentDate] || [];

  // draft + saved 모두 포함
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

  const isDraft = items.some((v) =>
    drafts[currentDate]?.some((d) => d.id === v.id)
  );

  const workHours = calcNetWorkHours(items);
  const hasWork = items.some((v) => v.type === "work");

  target.insertAdjacentHTML(
    "beforeend",
    `
    <div class="schedule-row ${isDraft ? "draft" : "saved"}"
         data-id="${base.id}"
         data-date="${currentDate}">

      <div class="row-check-wrap">
        <input type="checkbox" class="row-check" ${isDraft ? "" : "disabled"} />
      </div>

      <div class="employee">
        <strong>${base.name}</strong>

        <span class="employee-meta">
        <span>${base.dept}</span>

        ${
          hasWork && workHours > 0
            ? `<span class="work-hours"> / ${calcNetWorkHours(items)}h</span>`
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
        ${vacation ? renderShift(vacation, true) : ""}
        ${
          work
            ? renderShift(work, false, vacation && isOverlap(work, vacation))
            : ""
        }
      </div>

        ${
          isDraft
            ? `
          <div class="draft-actions">
              <button class="draft-edit">수정</button>
               <button class="draft-delete">삭제</button>
          </div>
          `
            : ""
        }
      

    </div>
    `
  );
}

function renderShift(item, isVacation, dimmed = false) {
  const { left, width } = calcPosition(item.start, item.end);
  return `
    <div class="shift ${isVacation ? "vacation" : item.job} ${
    dimmed ? "dimmed" : ""
  }"
         style="left:${left}%; width:${width}%; ${
    isVacation ? "z-index:2;" : ""
  }">
      ${item.start} - ${item.end}
      <small>${item.jobText || ""}</small>
    </div>
  `;
}

/* ======================================================
   클릭
====================================================== */
body.onclick = (e) => {
  const row = e.target.closest(".schedule-row");
  if (!row) return;

  const id = row.dataset.id;
  const list = drafts[currentDate] || [];

  if (e.target.classList.contains("row-check")) return;

  if (e.target.classList.contains("draft-delete")) {
    if (confirm("이 근무일정을 삭제하시겠습니까?")) {
      drafts[currentDate] = list.filter((v) => v.id !== id);
      render();
    }
    return;
  }

  if (e.target.classList.contains("draft-edit")) {
    const item = list.find((v) => v.id === id);
    if (!item) return;

    editingId = id;
    modalTitle.textContent = "근무일정 수정";
    confirmBtn.textContent = "수정 완료";
    modal.classList.add("is-open");
    manageMode = item.type;
    applyForm();

    dept.value = item.dept;
    dept.dispatchEvent(new Event("change"));
    emp.value = item.name;
    job.value = item.job;
    startTime.value = item.start;
    endTime.value = item.end;
    fakeStartText.textContent = item.start || "시작 시간";
    fakeEndText.textContent = item.end || "종료 시간";
    return;
  }

  if (row.classList.contains("saved")) {
    openRowActionModal(row);
    return;
  }

  render();
};

function handleRowClick(e) {
  const row = e.target.closest(".schedule-row");
  if (!row) return;

  const id = row.dataset.id;
  const date = row.dataset.date;

  if (e.target.classList.contains("row-check")) return;

  // draft 삭제
  if (e.target.classList.contains("draft-delete")) {
    if (confirm("삭제하시겠습니까?")) {
      drafts[date] = (drafts[date] || []).filter((v) => v.id !== id);
      render();
    }
    return;
  }

  // draft 수정
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
    return;
  }

  // ✅ 확정 일정 클릭
  if (row.classList.contains("saved")) {
    openRowActionModal(row);
  }
}

body.onclick = handleRowClick;
vacationBody.onclick = handleRowClick;

function openEditModal(id, date) {
  const list = saved[date] || [];
  const item = list.find((v) => v.id === id);
  if (!item) return;

  saved[date] = list.filter((v) => v.id !== id);

  drafts[date] ??= [];
  drafts[date].push(item);

  editingId = id;
  manageMode = item.type;
  applyForm();

  modalTitle.textContent = "근무일정 수정";
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

  localStorage.setItem("schedules", JSON.stringify(saved));
  render();
}

function deleteSavedItem(id, date) {
  if (!confirm("이 일정을 삭제할까요?")) return;

  saved[date] = (saved[date] || []).filter((v) => v.id !== id);
  localStorage.setItem("schedules", JSON.stringify(saved));
  render();
}
function openRowActionModal(row) {
  document
    .querySelectorAll(".schedule-row.saved.active")
    .forEach((r) => r.classList.remove("active"));

  // 클릭한 row 활성화
  row.classList.add("active");
  const modal = document.querySelector(".row-action-modal");
  if (!modal) return;

  const titleEl = modal.querySelector(".row-action-modal-title-text");
  const contentEl = modal.querySelector(".row-action-modal-shedule-text");

  const id = row.dataset.id;
  const date = row.dataset.date;

  const items = (saved[date] || []).filter((v) => v.id === id);
  if (!items.length) return;

  const work = items.find((v) => v.type === "work");
  const vacation = items.find((v) => v.type === "vacation");
  const base = work || vacation;

  titleEl.textContent =
    base.type === "vacation" ? "확정 휴가일정 변경" : "확정 근무일정 변경";

  const hoursText = work ? `${calcNetWorkHours(items)}h` : "";

  const subInfo = `
    <span class="sub">
      (${base.dept}${hoursText ? " / " + hoursText : ""})
    </span>
  `;

  const jobClass = base.type === "vacation" ? "job gray" : `job ${base.job}`;

  const jobText = `
    <span class="${jobClass}">
      ${vacation ? vacation.jobText : base.jobText}
    </span>
  `;

  contentEl.innerHTML = `
    <strong class="name">${base.name}</strong>
    ${subInfo}
    ${jobText}
  `;

  modal.classList.remove("is-hidden");

  modal.querySelector(".edit").onclick = () => {
    openEditModal(id, date);
    modal.classList.add("is-hidden");
  };

  modal.querySelector(".delete").onclick = () => {
    deleteSavedItem(id, date);
    modal.classList.add("is-hidden");
  };

  modal.querySelector(".close").onclick = () => {
    modal.classList.add("is-hidden");
  };
}

/* ======================================================
   확정
====================================================== */
saveBtn.onclick = () => {
  const checked = document.querySelectorAll(".row-check:checked");

  if (!checked.length) {
    alert("확정할 일정을 선택해주세요");
    return;
  }

  checked.forEach((chk) => {
    const row = chk.closest(".schedule-row");
    const id = row.dataset.id;
    const date = row.dataset.date;

    const list = drafts[date] || [];
    const item = list.find((v) => v.id === id);
    if (!item) return;

    saved[date] ??= [];
    saved[date].push(item);

    drafts[date] = list.filter((v) => v.id !== id);
  });

  checkAll.checked = false;

  localStorage.setItem("schedules", JSON.stringify(saved));
  render();
  renderVacation();
};

const checkAll = document.getElementById("checkAll");

checkAll.onchange = (e) => {
  document
    .querySelectorAll(".schedule-row.draft .row-check")
    .forEach((chk) => (chk.checked = e.target.checked));
};

/* ======================================================
   연차/반차
====================================================== */
job.onchange = () => {
  if (manageMode === "vacation") {
    startTime.disabled = true;
    endTime.disabled = true;
  } else {
    startTime.disabled = false;
    endTime.disabled = false;
  }
};

/* ======================================================
   휴가 토글
====================================================== */
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
}

/* ======================================================
   초기
====================================================== */
render();
