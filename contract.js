// 1. 계약 데이터 (현실적인 샘플)
const contractData = [
  {
    id: 1,
    name: "2024년 연봉계약서",
    status: "signed",
    turn: "완료",
    requester: "인사팀",
    part: "나, 김팀장",
    type: "contract-salary",
  },
  {
    id: 2,
    name: "정보보호 서약서",
    status: "pending",
    turn: "내 차례",
    requester: "보안팀",
    part: "나",
    type: "contract-protect",
  },
];

// 2. 계약 보드 렌더링
function renderContractBoard(filter = "contract-all") {
  const container = document.querySelector(".contract-board-body");
  if (!container) return;
  container.innerHTML = "";

  const filtered = contractData.filter(
    (d) => filter === "contract-all" || d.type === filter
  );

  filtered.forEach((item) => {
    const row = document.createElement("div");
    row.className = "contract-board-body-row"; // CSS는 위 모바일 적용됨
    row.style.display = "grid";
    row.style.gridTemplateColumns = "1fr 100px 100px 120px 120px"; // PC 버전 기본값

    row.innerHTML = `
      <div class="contract-name"><span class="approval-body-txt">${
        item.name
      }</span></div>
      <div class="contract-status"><button class="approval-status-wait">${
        item.status === "signed" ? "체결완료" : "진행중"
      }</button></div>
      <div class="contract-turn"><span class="approval-body-txt">${
        item.turn
      }</span></div>
      <div class="contract-request"><span class="approval-body-txt">${
        item.requester
      }</span></div>
      <div class="contract-part"><span class="approval-body-txt">${
        item.part
      }</span></div>
    `;
    container.appendChild(row);
  });
}

// 3. 이벤트 바인딩 (DOMContentLoaded 안에 넣으세요)
document.addEventListener("DOMContentLoaded", () => {
  renderContractBoard();

  // "전자계약서 요청" 버튼 클릭 시 모달 오픈
  const reqBtn = document.querySelector(".contract-request-btn");
  if (reqBtn) {
    reqBtn.onclick = () =>
      document
        .querySelector(".contract-request-modal")
        .classList.remove("is-hidden");
  }

  // 계약 종류 필터 클릭
  document.querySelectorAll(".contract-item").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".contract-item")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderContractBoard(btn.dataset.item);
    };
  });
});
// [추가] 모달에서 입력된 값으로 새 계약서를 생성하는 함수
function createNewContract() {
  const modal = document.querySelector(".contract-request-modal");

  // 입력값 가져오기
  const templateSelect = modal.querySelector(
    ".contract-request-modal-row:nth-of-type(1) select"
  );
  const signEmployeeSelect = modal.querySelector(
    ".contract-request-modal-row:nth-of-type(2) select"
  );
  const messageInput = modal.querySelector("#contract-request-message");

  const contractName =
    templateSelect.options[templateSelect.selectedIndex].text;
  const requestedBy =
    signEmployeeSelect.options[signEmployeeSelect.selectedIndex].text;
  const message = messageInput.value.trim();

  // 간단한 유효성 검사
  if (contractName === "선택" || requestedBy === "선택") {
    alert("템플릿과 서명 요청할 직원을 선택해주세요.");
    return;
  }

  // 새 계약서 객체 생성
  const newContract = {
    id: contractData.length + 1, // 고유 ID 부여
    name: contractName,
    status: "pending", // 새로 요청했으니 '진행중'
    turn: "내 차례", // 초기 요청자는 본인 차례로 설정
    requester: "나", // 현재 로그인 사용자라고 가정
    part: requestedBy === "전체" ? "전체 직원" : requestedBy, // "전체"면 "전체 직원"으로 표시
    type: templateSelect.value, // 필터링을 위한 값
  };

  contractData.push(newContract); // 데이터 배열에 추가
  renderContractBoard(); // 리스트 다시 그리기
  closeModal(); // 모달 닫기

  alert("전자계약 요청이 완료되었습니다!");

  // 모달 입력 필드 초기화 (선택사항)
  templateSelect.value = "";
  signEmployeeSelect.value = "";
  messageInput.value = "";
}

// [수정] DOMContentLoaded 이벤트 리스너 안에 '요청하기' 버튼 클릭 이벤트 추가
document.addEventListener("DOMContentLoaded", () => {
  // ... (기존 approval 및 contract 관련 초기화 코드들) ...

  // "전자계약서 요청" 모달의 '요청하기' 버튼에 이벤트 연결
  const contractRequestConfirmBtn = document.querySelector(
    ".contract-request-action .approval"
  );
  if (contractRequestConfirmBtn) {
    contractRequestConfirmBtn.onclick = createNewContract;
  }
});

// [수정] renderContractBoard 함수 안의 상태 버튼 텍스트 변경 (pending 상태 추가)
function renderContractBoard(filter = "contract-all") {
  // ... (기존 코드) ...
  filtered.forEach((item) => {
    // ... (기존 코드) ...
    row.innerHTML = `
            <div class="contract-name"><span class="approval-body-txt">${
              item.name
            }</span></div>
            <div class="contract-status">
                <button class="approval-status-wait">
                    ${
                      item.status === "signed"
                        ? "체결완료"
                        : item.status === "pending"
                        ? "진행중"
                        : "알 수 없음"
                    }
                </button>
            </div>
            <div class="contract-turn"><span class="approval-body-txt">${
              item.turn
            }</span></div>
            <div class="contract-request"><span class="approval-body-txt">${
              item.requester
            }</span></div>
            <div class="contract-part"><span class="approval-body-txt">${
              item.part
            }</span></div>
        `;
    container.appendChild(row);
  });
}
