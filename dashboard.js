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

// section02 - schedule =========================================
const scheduleAddBtn = document.querySelector(".schedule-add-btn");
const scheduleAdd = document.querySelector(".schedule-add-modal");
const closeModalBtn = document.querySelector(".schedule-close-modal");
const body = document.querySelector(".schedule-body");

const deptSelect = document.getElementById("depart");
const empSelect = document.getElementById("employee");
const job = document.getElementById("job");

const workDate = document.getElementById("workDate");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const setToday = document.getElementById("setToday");

const fakeDate = document.getElementById("fakeDate");
const fakeDateText = document.getElementById("fakeDateText");
const fakeStart = document.getElementById("fakeStart");
const fakeStartText = document.getElementById("fakeStartText");
const fakeEnd = document.getElementById("fakeEnd");
const fakeEndText = document.getElementById("fakeEndText");

let editingSource = "draft";
let currentDate = new Date().toISOString().slice(0, 10);
const schedulesDraft = {};
const schedules = {};

const savedData = localStorage.getItem("schedules");
if (savedData) {
  Object.assign(schedules, JSON.parse(savedData));
}
renderSchedule();
// // 오늘 날짜 불러오기 ====
const todayText = document.querySelector(".data-text-today");

function updateDateText() {
  const d = new Date(currentDate);
  const week = ["일", "월", "화", "수", "목", "금", "토"];

  todayText.textContent = `${d.getFullYear()}년 ${
    d.getMonth() + 1
  }월 ${d.getDate()}일 (${week[d.getDay()]})`;
}

// // 날짜 바꾸기
function changeDate(diff) {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + diff);
  currentDate = d.toISOString().slice(0, 10);

  updateDateText();
  renderSchedule();
  renderScheduleDraft();
}

updateDateText();

// ===== modal
scheduleAddBtn?.addEventListener("click", () => {
  scheduleAdd.classList.add("is-open");
  resetScheduleForm();
});
closeModalBtn?.addEventListener("click", () => {
  scheduleAdd.classList.remove("is-open");
  resetScheduleForm();
});

// ===== employee select
deptSelect.addEventListener("change", () => {
  empSelect.innerHTML = `<option value="">선택</option>`;

  job.selectedIndex = 0;

  if (jobByDept[deptSelect.value]) {
    [...job.options].forEach((opt) => {
      opt.selected = opt.textContent === jobByDept[deptSelect.value];
    });
  }

  if (!employeesData[deptSelect.value]) return;

  employeesData[deptSelect.value].forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    empSelect.appendChild(opt);
  });
});

// ===== fake picker
fakeDate.onclick = () => workDate.showPicker?.() || workDate.click();
fakeStart.onclick = () => startTime.showPicker?.() || startTime.click();
fakeEnd.onclick = () => endTime.showPicker?.() || endTime.click();

// ===== today
setToday.onclick = () => {
  const today = new Date().toISOString().slice(0, 10);
  workDate.value = today;
  workDate.dispatchEvent(new Event("change"));
};

// ===== value sync
workDate.onchange = () => {
  const d = new Date(workDate.value);
  fakeDateText.textContent = `${d.getMonth() + 1}월 ${d.getDate()}일`;
};
startTime.onchange = () => (fakeStartText.textContent = startTime.value);
endTime.onchange = () => (fakeEndText.textContent = endTime.value);

// ===== add
document.querySelector(".confirm-add").onclick = () => {
  if (
    !workDate.value ||
    !empSelect.value ||
    !startTime.value ||
    !endTime.value
  ) {
    alert("모든 값을 입력해주세요.");
    return;
  }

  const jobText = job.options[job.selectedIndex].text;

  // ===== 수정 모드 =====
  if (editingDraftId) {
    // ----- draft 수정 -----
    if (editingSource === "draft") {
      const list = schedulesDraft[workDate.value] ?? [];
      const idx = list.findIndex((v) => v.id === editingDraftId);

      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          dept: deptSelect.value,
          name: empSelect.value,
          job: job.value,
          jobText,
          start: startTime.value,
          end: endTime.value,
        };
      }
    }

    // ----- saved 수정 -----
    if (editingSource === "saved") {
      const list = schedules[workDate.value] ?? [];
      const idx = list.findIndex((v) => v.id === editingDraftId);

      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          dept: deptSelect.value,
          name: empSelect.value,
          job: job.value,
          jobText,
          start: startTime.value,
          end: endTime.value,
        };
        saveToStorage();
      }
    }

    editingDraftId = null;
    editingSource = "draft";
  }

  // ===== 추가 모드 (신규 draft) =====
  else {
    schedulesDraft[workDate.value] ??= [];
    schedulesDraft[workDate.value].push({
      id: crypto.randomUUID(),
      dept: deptSelect.value,
      name: empSelect.value,
      job: job.value,
      jobText,
      start: startTime.value,
      end: endTime.value,
    });
  }

  renderSchedule();
  renderScheduleDraft();
  scheduleAdd.classList.remove("is-open");
  resetScheduleForm();
};

// ===== helpers
function calcWorkHours(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  let minutes = eh * 60 + em - (sh * 60 + sm);
  if (minutes < 0) minutes = 0;

  return Math.floor(minutes / 60);
}

function resetScheduleForm() {
  deptSelect.value = "";
  empSelect.innerHTML = `<option value="">부서 선택</option>`;
  job.selectedIndex = 0;

  workDate.value = startTime.value = endTime.value = "";
  fakeDateText.textContent = "날짜 선택";
  fakeStartText.textContent = "시작 시간";
  fakeEndText.textContent = "종료 시간";

  editingSource = "draft";
  editingDraftId = null;
}

// ===== render
function renderSchedule() {
  body.innerHTML = "";
  (schedules[currentDate] || []).forEach((item) => {
    const hours = calcWorkHours(item.start, item.end);
    const left = (Number(item.start.split(":")[0]) / 24) * 100;
    const width = (hours / 24) * 100;

    body.insertAdjacentHTML(
      "beforeend",
      `
  <div class="schedule-row saved" data-id="${item.id}">
    <div class="employee">
      <strong>${item.name}</strong>
      <span>${item.dept} / ${hours}h </span>
    </div>

    <div class="timeline">
      <div class="shift ${item.job}" style="left:${left}%; width:${width}%">
        <div>${item.start} - ${item.end}</div>
        <small>${item.jobText}</small>
      </div>
    </div>

    <div class="draft-actions">
      <button class="draft-edit">수정</button>
      <button class="draft-delete">삭제</button>
    </div>
  </div>
  `
    );
  });
}

function renderScheduleDraft() {
  // body.innerHTML = "";

  (schedulesDraft[currentDate] || []).forEach((item) => {
    const hours = calcWorkHours(item.start, item.end);
    const left = (Number(item.start.split(":")[0]) / 24) * 100;
    const width = (hours / 24) * 100;

    body.insertAdjacentHTML(
      "beforeend",
      `
      <div class="schedule-row draft" data-id="${item.id}">
        <div class="employee">
          <strong>${item.name}</strong>
          <span>${item.dept} / ${hours}h (임시)</span>
        </div>
        <div class="timeline">
          <div class="shift ${item.job}" style="left:${left}%; width:${width}%">
            <div>${item.start} - ${item.end}</div>
            <small>${item.jobText}</small>
          </div>
        </div>

           <div class="draft-actions">
      <button class="draft-edit">수정</button>
      <button class="draft-delete">삭제</button>
    </div>
      </div>
      `
    );
  });
}
function deleteDraft(id) {
  schedulesDraft[currentDate] = schedulesDraft[currentDate].filter(
    (v) => v.id !== id
  );

  renderSchedule();
  renderScheduleDraft();
}

let editingDraftId = null;

function openEditModal(item) {
  editingDraftId = item.id;

  scheduleAdd.classList.add("is-open");

  deptSelect.value = item.dept;
  deptSelect.dispatchEvent(new Event("change"));

  job.value = item.job;
  empSelect.value = item.name;

  workDate.value = currentDate;
  startTime.value = item.start;
  endTime.value = item.end;

  workDate.dispatchEvent(new Event("change"));
  startTime.dispatchEvent(new Event("change"));
  endTime.dispatchEvent(new Event("change"));
}

// next/prev
document.querySelector(".schedule-prev-btn").onclick = () => changeDate(-1);
document.querySelector(".schedule-next-btn").onclick = () => changeDate(1);
document.querySelector(".today-btn").onclick = () => {
  currentDate = new Date().toISOString().slice(0, 10);
  updateDateText();
  renderSchedule();
  renderScheduleDraft();
};

// save
document.querySelector(".schedule-save").onclick = () => {
  Object.keys(schedulesDraft).forEach((date) => {
    schedules[date] ??= [];
    schedules[date].push(
      ...schedulesDraft[date].map((v) => ({
        ...v,
        id: crypto.randomUUID(),
      }))
    );
  });

  Object.keys(schedulesDraft).forEach((k) => delete schedulesDraft[k]);

  renderSchedule();
  renderScheduleDraft();
  saveToStorage();
};

// data
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
  Design: [
    "하다경",
    "이기자",
    "한진수",
    "박지원",
    "이은수",
    "권민지",
    "이호철",
  ],
  Production: ["김형선", "이동욱", "이진", "김여원", "박채린", "김형석"],
  "R&D": [
    "김민이",
    "심진우",
    "진예진",
    "강민서",
    "최소윤",
    "신현호",
    "강석현",
    "강민지",
  ],
};
body.addEventListener("click", (e) => {
  const row = e.target.closest(".schedule-row");
  if (!row) return;

  const id = row.dataset.id;

  // ===== draft =====
  if (row.classList.contains("draft")) {
    const list = schedulesDraft[currentDate];
    if (!list) return;

    const item = list.find((v) => v.id === id);
    if (!item) return;

    if (e.target.classList.contains("draft-edit")) {
      editingSource = "draft";
      openEditModal(item);
    }

    if (e.target.classList.contains("draft-delete")) {
      deleteDraft(id);
    }
  }

  // ===== saved =====
  if (row.classList.contains("saved")) {
    const list = schedules[currentDate];
    if (!list) return;

    const item = list.find((v) => v.id === id);
    if (!item) return;

    if (e.target.classList.contains("draft-edit")) {
      editingSource = "saved";
      openEditModal(item);
    }

    if (e.target.classList.contains("draft-delete")) {
      deleteSaved(id);
    }
  }
});

function saveToStorage() {
  localStorage.setItem("schedules", JSON.stringify(schedules));
}
function deleteDraft(id) {
  if (!schedulesDraft[currentDate]) return;

  schedulesDraft[currentDate] = schedulesDraft[currentDate].filter(
    (v) => v.id !== id
  );

  renderSchedule();
  renderScheduleDraft();
}

function deleteSaved(id) {
  if (!schedules[currentDate]) return;

  schedules[currentDate] = schedules[currentDate].filter((v) => v.id !== id);

  saveToStorage();
  renderSchedule();
}
