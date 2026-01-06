const allStaff = Object.values(employeesData).flat();
const teamLeaders = Object.values(employeesData).map((dept) => dept[0]);
const noticeAuthors = ["하미니(나)", ...teamLeaders];

let notices = Array.from({ length: 20 }, (_, i) => {
  const keys = Object.keys(noticeTemplates);
  const tKey = keys[i % (keys.length - 1)];
  const template = noticeTemplates[tKey];
  const randVar = template.options[0];
  const randTarget = ["전체", "Design", "Sales"][i % 3];
  const randDate = `2025-12-${String(15 - i).padStart(2, "0")}`;

  return {
    id: 0,
    title: template.title.replace("{var}", randVar),
    author: noticeAuthors[i % noticeAuthors.length],
    date: randDate,
    read: Math.floor(Math.random() * 50) + 200,
    total: 308,
    content: template.content
      .replace(/{target}/g, randTarget)
      .replace(/{var}/g, randVar)
      .replace(/{date}/g, randDate),
    templateKey: tKey,
    targetKey: randTarget === "전체" ? "All" : randTarget,
  };
});

function renderNoticeList() {
  const listBody = document.getElementById("noticeListBody");
  if (!listBody) return;

  notices.sort((a, b) => new Date(b.date) - new Date(a.date));
  listBody.innerHTML = notices
    .map((n, idx) => {
      n.id = notices.length - idx;
      return `
      <tr data-id="${n.id}">
        <td>${n.id}</td>
        <td class="notice-t-title">${n.title}</td>
        <td>${n.author}</td>
        <td>${n.date}</td>
        <td><span class="read-count">${n.read}</span>/${n.total}</td>
        <td style="text-align:center;">
          <input type="checkbox" class="notice-del-edit-chk modal-request-checkbox" value="${idx}">
        </td>
      </tr>
    `;
    })
    .join("");
  updateControlButtons();
}

function updateControlButtons() {
  const checked = document.querySelectorAll(".notice-del-edit-chk:checked");
  const editBtn = document.querySelector(".notice-edit-btn");
  if (editBtn) {
    if (checked.length > 1) editBtn.classList.add("is-disabled");
    else editBtn.classList.remove("is-disabled");
  }
}

function initNoticeSystem() {
  const modal = document.querySelector(".notice-add-modal");
  const templateSel = document.getElementById("notice-add-template-select");
  const detailSel = document.getElementById("notice-add-detail-select");
  const targetSel = document.getElementById("notice-target-select");
  const titleInput = modal.querySelector(
    ".notice-add-modal-row input[type='text']"
  );
  const contentArea = document.getElementById("notice-content-input");
  const previewArea = document.querySelector(".notice-add-content-right");
  const submitBtn = modal.querySelector(".approval");

  let currentEditIdx = null;

  function resetModalUI() {
    currentEditIdx = null;
    titleInput.value = "";
    contentArea.value = "";
    templateSel.value = "";
    targetSel.value = "";
    detailSel.innerHTML = '<option value="">선택</option>';
    modal.querySelectorAll(".dynamic-row").forEach((el) => el.remove());
    previewArea.innerHTML =
      '<div class="empty-preview">템플릿을 선택하면 미리보기가 나타납니다.</div>';
    modal.querySelector(".modal-title-text").innerText = "공지사항 추가";
    submitBtn.style.display = "block";
    submitBtn.innerText = "추가하기";

    modal.querySelector(".notice-add-content-left").style.display = "block";
    modal.querySelector(".notice-preview").style.display = "block";
    modal.querySelector(".notice-add-content-right").style.padding = "16px";
    modal.querySelector(".notice-add-content-right").style.background =
      "#f2f4f6";
    modal.querySelector(".notice-add-content-right").style.justifyContent =
      "center";
  }

  function applyTemplate() {
    const data = noticeTemplates[templateSel.value];
    if (!data) return;

    if (templateSel.value === "notice-etc") {
      detailSel.disabled = true;
      detailSel.value = "";
      updatePreview();
      return;
    } else {
      detailSel.disabled = false;
    }

    let targetVal = targetSel.options[targetSel.selectedIndex].text || "{대상}";
    if (targetSel.value === "All") targetVal = "전 임직원";

    let varVal = detailSel.value;
    const direct = modal.querySelector(".direct-input");
    if (varVal === "direct") varVal = direct ? direct.value : "{내용}";
    if (!varVal) varVal = "{변수}";

    let dateVal = "{날짜}";
    const dateInput = modal.querySelector(".dynamic-date");
    if (dateInput) dateVal = dateInput.value || "{날짜}";

    titleInput.value = data.title.replace("{var}", varVal);
    contentArea.value = data.content
      .replace(/{target}/g, targetVal)
      .replace(/{var}/g, varVal)
      .replace(/{date}/g, dateVal);
    updatePreview();
  }

  titleInput.oninput = updatePreview;
  contentArea.oninput = updatePreview;

  function updatePreview() {
    previewArea.innerHTML = `
      <div class="noti-preview">
        <h4 class="noti-preview-title">${titleInput.value}</h4>
        <div class="noti-preview-content">${contentArea.value}</div>
      </div>`;
  }

  templateSel.onchange = () => {
    const data = noticeTemplates[templateSel.value];

    titleInput.value = "";
    contentArea.value = "";

    detailSel.innerHTML = '<option value="">선택</option>';
    modal.querySelectorAll(".dynamic-row").forEach((el) => el.remove());

    if (data) {
      data.options.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt;
        o.innerText = opt;
        detailSel.appendChild(o);
      });
      const directOpt = document.createElement("option");
      directOpt.value = "direct";
      directOpt.innerText = "직접 입력";
      detailSel.appendChild(directOpt);

      if (data.hasDate) {
        const row = document.createElement("div");
        row.className = "notice-add-modal-row dynamic-row";
        row.innerHTML = `<h5 class="modal-subtitle-text">날짜</h5><input type="date" class="dynamic-date">`;
        row.querySelector("input").onchange = applyTemplate;
        detailSel.closest(".notice-add-modal-row").after(row);
      }
      applyTemplate();
    }
  };

  detailSel.onchange = () => {
    modal.querySelectorAll(".direct-row").forEach((el) => el.remove());
    if (detailSel.value === "direct") {
      const row = document.createElement("div");
      row.className = "notice-add-modal-row dynamic-row direct-row";
      row.innerHTML = `<h5 class="modal-subtitle-text">내용</h5><input type="text" class="direct-input" placeholder="내용을 직접 입력하세요">`;
      row.querySelector("input").oninput = applyTemplate;
      detailSel.closest(".notice-add-modal-row").after(row);
    }
    applyTemplate();
  };

  targetSel.onchange = applyTemplate;
  modal.querySelector(".notice-preview").onclick = updatePreview;

  document.querySelector(".notice-edit-btn").onclick = function () {
    const checked = document.querySelectorAll(".notice-del-edit-chk:checked");
    if (checked.length !== 1) return;

    currentEditIdx = checked[0].value;
    const target = notices[currentEditIdx];

    modal.querySelector(".modal-title-text").innerText = "공지사항 수정";
    submitBtn.innerText = "수정하기";

    templateSel.value = target.templateKey;
    templateSel.dispatchEvent(new Event("change"));
    targetSel.value = target.targetKey || "All";
    titleInput.value = target.title;
    contentArea.value = target.content;

    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
    updatePreview();
  };

  document.querySelector(".notice-del-btn").onclick = () => {
    const checked = document.querySelectorAll(".notice-del-edit-chk:checked");
    if (checked.length === 0) return alert("항목을 선택해주세요.");
    if (confirm("정말 삭제하시겠습니까?")) {
      const indices = Array.from(checked).map((c) => parseInt(c.value));
      notices = notices.filter((_, idx) => !indices.includes(idx));
      renderNoticeList();
      alert("삭제되었습니다.");
    }
  };

  const entireTh = document.querySelector(".noti-chk-all");
  entireTh.onclick = () => {
    entireTh.classList.toggle("is-active");
    const allCheckboxes = document.querySelectorAll(".notice-del-edit-chk");
    const isAllChecked = entireTh.classList.contains("is-active");
    allCheckboxes.forEach((c) => (c.checked = isAllChecked));
    updateControlButtons();
  };

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("notice-t-title")) {
      const tr = e.target.closest("tr");
      const idx = tr.querySelector(".notice-del-edit-chk").value;
      const target = notices[idx];

      modal.querySelector(".modal-title-text").innerText = "공지사항 상세";
      modal.querySelector(".notice-add-content-left").style.display = "none";
      modal.querySelector(".notice-preview").style.display = "none";
      modal.querySelector(".notice-add-content-right").style.padding = "0";
      modal.querySelector(".notice-add-content-right").style.background =
        "#fff";
      modal.querySelector(".notice-add-content-right").style.justifyContent =
        "flex-start";
      submitBtn.style.display = "none";

      titleInput.value = target.title;
      contentArea.value = target.content;

      modal.classList.remove("is-hidden");
      modal.style.display = "flex";
      updatePreview();
    }
  });

  submitBtn.onclick = () => {
    const dataTemplate = noticeTemplates[templateSel.value];
    const dateInput = modal.querySelector(".dynamic-date");
    const directInput = modal.querySelector(".direct-input");

    if (!templateSel.value) return alert("템플릿을 선택해주세요.");
    if (!targetSel.value) return alert("공지 대상을 선택해주세요.");
    if (!titleInput.value.trim()) return alert("공지 제목을 입력해주세요.");

    if (templateSel.value !== "notice-etc") {
      if (dataTemplate.hasDate && (!dateInput || !dateInput.value))
        return alert("날짜를 선택해주세요.");
      if (
        detailSel.value === "direct" &&
        (!directInput || !directInput.value.trim())
      )
        return alert("선택 항목의 내용을 직접 입력해주세요.");
      if (!detailSel.value) return alert("선택 항목을 골라주세요.");
    }

    if (!contentArea.value.trim()) return alert("공지 내용을 입력해주세요.");

    const confirmMsg =
      currentEditIdx !== null
        ? "정말 수정하시겠습니까?"
        : "공지를 추가하시겠습니까?";
    if (!confirm(confirmMsg)) return;

    const data = {
      title: titleInput.value,
      author: "하미니(나)",
      date: new Date().toISOString().split("T")[0],
      read: 0,
      total: 308,
      content: contentArea.value,
      templateKey: templateSel.value,
      targetKey: targetSel.value,
    };

    if (currentEditIdx !== null) {
      notices[currentEditIdx] = data;
      alert("수정 완료되었습니다.");
    } else {
      notices.unshift(data);
      alert("추가 완료되었습니다.");
    }

    modal.style.display = "none";
    modal.classList.add("is-hidden");
    renderNoticeList();
    resetModalUI();
  };

  const closeHandler = () => {
    modal.style.display = "none";
    modal.classList.add("is-hidden");
    resetModalUI();
  };
  modal.querySelector(".close").onclick = closeHandler;
  modal.querySelector(".cancel").onclick = closeHandler;

  document.querySelector(".notice-add-btn").onclick = () => {
    resetModalUI();
    modal.classList.remove("is-hidden");
    modal.style.display = "flex";
  };

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("notice-del-edit-chk"))
      updateControlButtons();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNoticeList();
  initNoticeSystem();
});
// message section =================================================
/* ======================================================
   메시지 섹션 최종 통합 완성본 (기존 기능 + 신규 5종 기능)
====================================================== */

let activeChatTarget = null;
let favorites = []; // 즐겨찾기 명단 저장용

// (2) 과거 대화 데이터 (하미니와 정희석의 대화 데이터 예시 포함)
let messagesData = [
  {
    from: "정희석",
    to: "하미니(나)",
    text: "하민씨, 오늘 회의록 정리됐나요?",
    time: "오전 10:30",
  },
  {
    from: "하미니(나)",
    to: "정희석",
    text: "네! 방금 메일로 공유드렸습니다.",
    time: "오전 10:35",
  },
  {
    from: "이유정",
    to: "하미니(나)",
    text: "안녕하세요! 영업팀 이유정입니다.",
    time: "오후 02:00",
  },
];

// 1. 부서 키 변환 (CSS 클래스용)
function getDeptClass(dept) {
  const mapping = {
    Management: "Management",
    Sales: "Sales",
    Marketing: "Marketing",
    Design: "Design",
    Production: "Production",
    "R&D": "RD",
  };
  return mapping[dept] || "Management";
}

// 2. 채팅 내역 그리기 (하이라이트 기능 포함)
function renderMessages(keyword = "") {
  const display = document.getElementById("chatDisplay");
  if (!display || !activeChatTarget) return;

  const currentMsgs = messagesData.filter(
    (m) =>
      (m.from === "하미니(나)" && m.to === activeChatTarget.name) ||
      (m.from === activeChatTarget.name && m.to === "하미니(나)")
  );

  if (currentMsgs.length === 0) {
    display.innerHTML = `<div class="msg-empty-state">${activeChatTarget.name}님과 대화를 시작해보세요.</div>`;
  } else {
    display.innerHTML = currentMsgs
      .map((m) => {
        let textContent = m.text;
        // (4) 대화 검색 하이라이트 처리
        if (keyword) {
          const regex = new RegExp(`(${keyword})`, "gi");
          textContent = textContent.replace(
            regex,
            `<span class="highlight">$1</span>`
          );
        }
        return `
          <div class="bubble ${m.from === "하미니(나)" ? "mine" : "yours"}">
            <div class="msg-text">${textContent}</div>
            <div class="msg-time">${m.time}</div>
          </div>
        `;
      })
      .join("");
  }
  display.scrollTop = display.scrollHeight;
}

// (1) 즐겨찾기 토글 함수
function toggleFavorite(name, dept) {
  const index = favorites.findIndex((f) => f.name === name);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push({ name, dept });
  }
  updateChatHeader(name, dept);
  renderRecentTrack(); // 왼쪽 즐겨찾기 목록 갱신
}

// (1) 즐겨찾기 전용 렌더링 (최근 대화 트랙 활용)
function renderRecentTrack() {
  const recentList = document.getElementById("recentUserList");
  if (!recentList) return;

  favorites.forEach((fav) => {
    const deptClass = getDeptClass(fav.dept);
    const favItem = document.createElement("div");
    favItem.className = "recent-user-item";
    favItem.onclick = () => startChat(fav.name, fav.dept);
    favItem.innerHTML = `
      <div class="chat-avatar avatar-${deptClass}">${fav.name[0]}</div>
      <span>${fav.name}</span>
    `;
    recentList.appendChild(favItem);
  });
}

// 3. 상단 헤더 업데이트 (별 버튼 클래스 토글 추가)
function updateChatHeader(name, dept) {
  const header = document.getElementById("chatHeader");
  if (!header) return;
  const deptClass = getDeptClass(dept);
  const isFav = favorites.some((f) => f.name === name); // 현재 즐겨찾기 여부

  header.innerHTML = `
    <div class="header-left">
      <div class="chat-avatar avatar-${deptClass}">${name[0]}</div>
      <div class="header-info">
        <h3>${name}</h3>
        <span>${dept}</span>
      </div>
    </div>
    <div class="header-right">
      <div class="fav-star-btn ${
        isFav ? "fill" : ""
      }" onclick="toggleFavorite('${name}', '${dept}')"></div>
    </div>
  `;
}

// 4. 왼쪽 대화 목록 업데이트
function updateChatRoomList(name, dept) {
  const chatRoomList = document.getElementById("chatRoomList");
  if (!chatRoomList) return;

  const existingRoom = chatRoomList.querySelector(`[data-name="${name}"]`);
  if (existingRoom) existingRoom.remove();

  const deptClass = getDeptClass(dept);
  const newRoom = document.createElement("div");
  newRoom.className = "chat-room-item";
  newRoom.setAttribute("data-name", name);
  newRoom.onclick = () => startChat(name, dept);
  newRoom.innerHTML = `
    <div class="chat-avatar avatar-${deptClass}">${name[0]}</div>
    <div class="room-info" style="display:flex; flex-direction:column; align-items:flex-start;">
      <span class="room-name">${name}</span>
      <span class="room-dept">${dept}</span>
    </div>`;
  chatRoomList.prepend(newRoom);
}

// 5. 채팅 시작
function startChat(name, dept) {
  activeChatTarget = { name, dept };
  updateChatHeader(name, dept);
  renderMessages();
  updateChatRoomList(name, dept);
}

// (3) 조직도 렌더링 (아코디언 애니메이션 대응)
function renderStaffDirectory() {
  const container = document.getElementById("deptStaffList");
  if (!container) return;
  container.innerHTML = "";

  for (const [dept, staffs] of Object.entries(employeesData)) {
    const deptDiv = document.createElement("div");
    deptDiv.className = "dept-group-wrapper";
    deptDiv.innerHTML = `
      <div class="dept-group-title" onclick="this.classList.toggle('is-open')">${dept}</div>
      <div class="dept-items">
        ${staffs
          .map(
            (s) => `
          <div class="staff-item" onclick="startChat('${s}', '${dept}')">
            <span class="status-dot"></span> ${s}
          </div>
        `
          )
          .join("")}
      </div>`;
    container.appendChild(deptDiv);
  }
}

// 7. 메시지 전송
function sendChatMessage() {
  const input = document.getElementById("msgInput");
  if (!activeChatTarget || !input.value.trim()) return;

  messagesData.push({
    from: "하미니(나)",
    to: activeChatTarget.name,
    text: input.value,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  renderMessages();
  input.value = "";
}

// 8. 초기화 로직
document.addEventListener("DOMContentLoaded", () => {
  renderStaffDirectory();

  // (자동 로드) 첫 번째 사원과 자동 채팅 시작
  const firstDept = Object.keys(employeesData)[0];
  const firstName = employeesData[firstDept][0];
  startChat(firstName, firstDept);

  // 전송 버튼 이벤트
  const sendBtn = document.getElementById("msgSendBtn");
  if (sendBtn) sendBtn.onclick = sendChatMessage;

  // 엔터키 전송
  const msgInput = document.getElementById("msgInput");
  if (msgInput) {
    msgInput.onkeypress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    };
  }

  // 조직도 직원 검색
  const staffSearch = document.getElementById("staffSearchInput");
  if (staffSearch) {
    staffSearch.oninput = (e) => {
      const val = e.target.value.toLowerCase();
      document.querySelectorAll(".staff-item").forEach((item) => {
        item.style.display = item.innerText.toLowerCase().includes(val)
          ? "flex"
          : "none";
      });
    };
  }

  // (4) 대화 내용 검색 (채팅방 내부 단어 검색)
  const chatSearch = document.getElementById("chatSearchInput");
  if (chatSearch) {
    chatSearch.oninput = (e) => {
      const keyword = e.target.value.trim();
      renderMessages(keyword); // 키워드를 넘겨서 렌더링
    };
  }
});
