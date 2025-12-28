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

const todayText = document.querySelector(".data-text-today");
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
  todayText.textContent = `${d.getFullYear()}년 ${
    d.getMonth() + 1
  }월 ${d.getDate()}일 (${week[d.getDay()]})`;
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
function calcHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let min = eh * 60 + em - (sh * 60 + sm);
  if (min < 0) min = 0;
  return Math.round((min / 60) * 2) / 2;
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
  resetForm();
  applyForm();
  modal.classList.add("is-open");
};

closeBtn.onclick = () => {
  modal.classList.remove("is-open");
  resetForm();
};

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
    !startTime.value ||
    !endTime.value
  ) {
    alert("모든 값을 입력해주세요");
    return;
  }

  drafts[workDate.value] ??= [];

  const item = {
    id: editingId || crypto.randomUUID(),
    type: mixToggle.checked ? "vacation" : "work",
    dept: dept.value,
    name: emp.value,
    job: job.value,
    jobText: job.options[job.selectedIndex]?.text || "",
    start: startTime.value,
    end: endTime.value,
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
};

/* ======================================================
   렌더
====================================================== */
function render() {
  body.innerHTML = "";

  const draftsToday = drafts[currentDate] || [];
  const savedToday = saved[currentDate] || [];

  // 🔴 휴가 토글 OFF면 휴가 제거
  const allItems = [...savedToday, ...draftsToday].filter((item) => {
    if (!mixToggle.checked) return item.type !== "vacation";
    return true;
  });

  // 🔴 같은 사람끼리 묶기
  const grouped = {};
  allItems.forEach((item) => {
    const key = item.name;
    grouped[key] ??= [];
    grouped[key].push(item);
  });

  Object.values(grouped).forEach((items) => {
    renderRow(items);
  });
}

function renderRow(items) {
  const work = items.find((v) => v.type === "work");
  const vacation = items.find((v) => v.type === "vacation");

  const base = work || vacation;
  if (!base) return;

  // ⭐ draft 여부 판단
  const isDraft = items.some((v) =>
    drafts[currentDate]?.some((d) => d.id === v.id)
  );

  body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="schedule-row ${isDraft ? "draft" : "saved"}">
      <div class="employee">
        <strong>${base.name}</strong>
        <span>${base.dept} / ${items
      .filter((v) => v.type === "work")
      .reduce((sum, v) => sum + calcHours(v.start, v.end), 0)}h</span>
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
      </div>`
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

  if (e.target.classList.contains("draft-delete")) {
    if (confirm("이 근무일정을 삭제하시겠습니까?")) {
      drafts[currentDate] = list.filter((v) => v.id !== id);
    }
  }

  if (e.target.classList.contains("draft-edit")) {
    const item = list.find((v) => v.id === id);
    editingId = id;
    modalTitle.textContent = "근무일정 수정";
    confirmBtn.textContent = "수정 완료";
    applyForm(item.type);
    modal.classList.add("is-open");

    dept.value = item.dept;
    dept.dispatchEvent(new Event("change"));
    emp.value = item.name;
    job.value = item.job;
    startTime.value = item.start;
    endTime.value = item.end;
    fakeStartText.textContent = item.start || "시작 시간";
    fakeEndText.textContent = item.end || "종료 시간";
  }

  render();
};

/* ======================================================
   확정
====================================================== */
saveBtn.onclick = () => {
  Object.keys(drafts).forEach((date) => {
    saved[date] ??= [];
    saved[date].push(...drafts[date]);
    delete drafts[date];
  });
  localStorage.setItem("schedules", JSON.stringify(saved));
  render();
};

/* ======================================================
   휴가 토글
====================================================== */
mixToggle.onchange = (e) => {
  manageMode = e.target.checked ? "vacation" : "work";
  addBtn.textContent =
    manageMode === "vacation" ? "+ 휴가일정 추가하기" : "+ 근무일정 추가하기";
  render();
};

function applyForm() {
  if (manageMode === "vacation") {
    modalTitle.textContent = "휴가일정 추가";
    dateLabel.textContent = "휴가날짜";
    timeLabel.textContent = "휴가시간";
    confirmBtn.textContent = "일정 추가";
    jobLabel.textContent = "휴가";

    job.innerHTML = `
      <option value="">선택</option>
      <option value="vacation">연차</option>
      <option value="vacation">반차</option>
      <option value="vacation">병가</option>
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
    `;
  }
}

/* ======================================================
   초기
====================================================== */
render();
