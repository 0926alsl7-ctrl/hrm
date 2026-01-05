// (1) 직무
const jobByDept = {
  Management: "Management",
  Sales: "Sales",
  Marketing: "Marketing",
  Design: "Design",
  Production: "Production",
  "R&D": "R&D",
};

// (2) 직원
const employeesData = {
  Management: ["정희석", "강대희", "이민", "권동주", "김준성", "권동현"],
  Sales: ["이유정", "김민석", "김민지", "이유준", "이은빈", "김태환"],
  Marketing: ["정하늘", "이담희", "정승훈", "김성길", "강대웅"],
  Design: ["하다경", "이기자", "한진수", "박지원", "이은수", "권민지"],
  Production: ["김형선", "이동욱", "이진", "김여원", "박채린"],
  "R&D": ["김민이", "심진우", "진예진", "강민서", "최소윤", "장재영"],
};

// 직원 상세 정보
const getRandomPhone = () =>
  `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;
const getRandomAddr = () => {
  const addrs = [
    "서울시 강남구 테헤란로",
    "서울시 영등포구 여의도동",
    "경기도 성남시 분당구",
    "서울시 서초구 서초동",
  ];
  return (
    addrs[Math.floor(Math.random() * addrs.length)] +
    " " +
    (Math.floor(Math.random() * 100) + 1) +
    "번지"
  );
};

// (3) 계약서
const templateMap = {
  "contract-work": "근로계약서",
  "contract-protect": "정보보호 서약서",
  "contract-vacation": "연차휴가 사용 촉진서",
  "contract-salary": "연봉계약서",
  "contract-internal": "사내 업무 협조 요청서",
  "contract-personal-info": "근로자 개인정보 수집/활용 동의서",
  "contract-vacation-plan1": "연차 휴가 사용 계획서 1차",
  "contract-vacation-plan2": "연차 휴가 사용 계획서 2차",
};

// 계약서 내용
const internalMsgs = {
  "확인 요청":
    "안녕하세요 {dept} 팀 {name} 입니다.\n다름이 아니라, 내일 오전 공유 일정이 있기 때문에 결재 관련 보고서 관련해서 확인 부탁드립니다.\n\n확인 요청 자료 : A, B\n\n자료는 오늘 오후 5시까지 전달 부탁드리며...",
  "승인 요청":
    "안녕하세요 {dept} 팀 {name} 입니다.\n다름이 아니라, 어제 커머스 상품 주문 건 진행 방향 승인 요청드립니다.\n내일 발송 일정이라 오늘 승인 결정이 필요합니다...",
  "협조 요청":
    "안녕하세요 {dept} 팀 {name} 입니다.\n다름이 아니라, 자사가 내일부터 감사여서 내일까지 모회사에 가결산 연결 재무제표를 보내야 합니다...",
  "일정 조율":
    "안녕하세요 {dept} 팀 {name} 입니다.\n상품 제작 및 마케팅 회의 관련해서 일정 조율 부탁드립니다...",
  기타: "안녕하세요 {dept} 팀 {name} 입니다.\n급하게 확인 요청드립니다. 방금 일정 변경이 생겨서 오늘 내로 반영이 필요합니다...",
};

const templateFields = {
  "contract-work": {
    fields: [
      { label: "성명", type: "emp-select", name: "empName" },
      { label: "근로개시일", type: "date", name: "startDate" },
      {
        label: "근무장소",
        type: "select",
        name: "location",
        options: ["본사", "여의도지사", "강남지사"],
      },
      { label: "전화", type: "text", name: "phone", readonly: true },
    ],
    msg: "근로기준법에 의거하여 근로계약서를 발송합니다. 근로계약서 확인 후 기한 내 서명을 요청드립니다.",
  },
  "contract-protect": {
    fields: [
      { label: "성명", type: "emp-select", name: "empName" },
      { label: "소속(부서)", type: "text", name: "deptName", readonly: true },
      { label: "서명날짜", type: "date", name: "signDate" },
    ],
    msg: "개인정보보호법에 의거하여 정보보호 서약서를 발송합니다. 정보보호 서약서 확인 후 기한 내 서명을 요청드립니다.",
  },
  "contract-vacation": {
    fields: [
      { label: "성명", type: "emp-select", name: "empName" },
      { label: "소속(부서)", type: "text", name: "deptName", readonly: true },
      { label: "연차 신청기간(시작)", type: "date", name: "vacStart" },
      {
        label: "연차 신청기간(종료)",
        type: "text",
        name: "vacEnd",
        readonly: true,
      },
      { label: "발생일수", type: "number", name: "totalDays", readonly: true },
      { label: "사용한 연차", type: "number", name: "usedDays" },
      { label: "잔여일수", type: "number", name: "remainDays", readonly: true },
    ],
    msg: "근로기준법 제61조에 의거하여 연차 유급휴가 사용 촉진서를 발송합니다. 연차휴가 사용 촉진서 확인 후 기한 내 서명을 요청드립니다.",
  },
  "contract-salary": {
    fields: [
      { label: "성명", type: "emp-select", name: "empName" },
      { label: "근로 계약기간", type: "date", name: "conStart" },
      {
        label: "연봉 계약기간",
        type: "text",
        name: "salPeriod",
        readonly: true,
        defaultValue: "2026.01.01 - 2026.12.31",
      },
      {
        label: "임금 지급일",
        type: "text",
        name: "payDay",
        readonly: true,
        defaultValue: "익월 19일",
      },
      { label: "서명 날짜", type: "date", name: "signDate" },
    ],
    msg: "근로기준법에 의거하여 연봉계약서를 발송합니다.",
  },
  "contract-internal": {
    fields: [
      { label: "요청자", type: "emp-select", name: "reqName" },
      { label: "요청부서", type: "text", name: "deptName", readonly: true },
      {
        label: "요청 제목",
        type: "select",
        name: "reqTitle",
        options: ["확인 요청", "승인 요청", "협조 요청", "일정 조율", "기타"],
      },
      { label: "담당자", type: "emp-select", name: "managerName" },
      { label: "요청 기한", type: "date", name: "deadline" },
    ],
    msg: "사내 업무 협조 요청서입니다. 요청 기한까지 제출 부탁드립니다. 감사합니다.",
  },
  "contract-personal-info": {
    fields: [
      { label: "성명", type: "emp-select", name: "empName" },
      { label: "부서", type: "text", name: "deptName", readonly: true },
      { label: "주소", type: "text", name: "address", readonly: true },
      { label: "전화", type: "text", name: "phone", readonly: true },
    ],
    msg: "근로기준법에 의거하여 개인정보 수집/활용 동의서를 발송합니다.",
  },
};
