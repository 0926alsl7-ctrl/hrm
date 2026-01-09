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
// (3) 전자결재
const requestPool = {
  "휴가 신청": [
    "오전 반차 (09:00-13:00)",
    "오후 반차 (13:00-18:00)",
    "연차 휴가",
    "병가 신청",
    "경조 휴가",
  ],
  "근무일정 변경": ["근무 시간 변경", "근무 일자 변경", "유연 근무제 신청"],
  "출장 신청": [
    "가맹점 현장 점검",
    "신규 점주 교육 지원",
    "지역 거점 오피스 출장",
    "본사 교육 연수",
    "지방 출장",
    "해외 출장",
  ],
  "연장근무 신청": [
    "평일 연장근무 (18:00-21:00)",
    "주말/휴일 연장근무",
    "긴급 시스템 점검 (21:00-23:00)",
  ],
  기타: [
    "비품 구매 요청",
    "출장비 정산 결재",
    "경비 정산 결재",
    "부서 이동 신청",
    "명함 제작 요청",
    "사원증 제작 요청",
    "수입결의서 제출",
    "지출결의서 제출",
    "업무 기안서 제출",
  ],
};

const detailedReasons = [
  "본사 교육 참여를 위한 출장 신청입니다.",
  "업무 과다로 인한 연장 근무 협조 부탁드립니다.",
  "긴급 시스템 점검 요청입니다. 승인 부탁드립니다",
  "현장 점검 및 파트너사 미팅 일정입니다.",
  "가족 행사로 인한 급한 연차 신청입니다.",
  "개인사정으로 인한 근무 일정 변경 요청입니다.",
  "인원 부족으로 현장 지원 요청 받았습니다. 승인 부탁드립니다",
  "요청하신 결재 서류 입니다. 승인 부탁드립니다.",
];

// (4) 계약서
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

// (5) 공지사항 템플릿
const noticeTemplates = {
  "notice-edu": {
    title: "[교육] {var} 이수 안내",
    options: [
      "법정 의무교육",
      "개인정보보호 교육",
      "직무 역량 강화 교육",
      "본사 교육",
    ],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 {var} 안내드립니다.\n\n사내 규정에 따라 아래와 같이 {var}를 실시하오니, 대상자께서는 기한 내에 반드시 이수를 완료해 주시기 바랍니다.\n\n- 교육명: {var}\n- 교육 대상: {target}\n- 이수 마감일: {date}\n\n미이수 시 불이익이 있을 수 있으니 유의 바랍니다.\n감사합니다",
  },
  "notice-system": {
    title: "[점검] 시스템 정기 점검 안내",
    options: [
      "06:00-07:00",
      "06:00-08:00",
      "19:00-20:00",
      "19:00-21:00",
      "20:00-22:00",
      "21:00-22:00",
      "21:00-23:00",
      "22:00-24:00",
    ],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 시스템 정기 점검 안내드립니다. 안정적인 서비스 제공을 위해 시스템 점검을 실시합니다.\n\n- 점검일시: {date} {var}\n- 사내 인트라넷 접속이 불가하므로 업무에 참고하시기 바랍니다. \n\n감사합니다",
  },
  "notice-request": {
    title: "[신청] {var} 신청 안내",
    options: [
      "사내 복지금",
      "동아리 활동비",
      "육아 휴직",
      "산재/사고",
      "실업급여",
      "퇴직금",
      "직접 입력",
    ],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 {var} 신청 관련하여 안내드립니다. {target} 분들께서는 {var}를 기한 내에 신청해 주시길 바랍니다. \n\n신청 양식은 첨부파일에 첨부되어 있으며 기간내에 신청하지 못할 경우 대상에서 제외될 수 있습니다.\n\n- 신청 마감일 : {date}\n\n감사합니다.",
  },
  "notice-submit": {
    title: "[제출] {var} 제출 안내",
    options: ["연말정산 서류", "지출결의서", "근무 일정표", "근로 계약서"],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 {var} 제출 관련하여 안내드립니다. {target} 분들께서는 {var}를 기한 내에 제출해 주시기 바랍니다. \n\n제출 양식은 첨부파일에 첨부되어 있으며 기간내에 제출하지 못할 경우 각 부서 팀장에게 미리 연락 부탁 드립니다.\n\n- 제출 마감일 : {date}\n\n감사합니다.",
  },
  "notice-vacation": {
    title: "[휴무] {var} 휴무 안내",
    options: ["설 연휴", "추석 연휴", "공휴일", "창립 기념일"],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 {var} 휴무 일정 안내드립니다.\n\n- 휴무 기간: {date}\n\n즐거운 휴일 되세요.\n감사합니다",
  },
  "notice-schedule": {
    title: "[일정] {var} 일정 공지",
    options: ["워크샵", "근무/휴가", "정기 미팅", "본사 교육 세미나"],
    hasDate: true,
    content:
      "안녕하세요. {target} 분들께 {var} 일정 관련하여 공지드립니다.\n\n- {var} 일정 : {date}\n- 장소 및 세부사항은 아래를 확인해주세요.\n감사합니다.",
  },
  "notice-update": {
    title: "[업데이트] {var} 개편 안내",
    options: ["사내 메신저", "인트라넷", "인사 관리 시스템"],
    content:
      "서비스 개선을 위해 {var}가 업데이트되었습니다.\n\n- 주요내용: {var} 기능 개선 및 UI 개편\n\n더욱 편리한 서비스를 제공하겠습니다.\n감사합니다.",
  },
  "notice-campaign": {
    title: "[캠페인] {var} 참여 안내",
    options: ["전사 환경 정리", "에너지 절약", "개인 보안 강화"],
    content:
      "안녕하세요.\n{target} 여러분\n\n우리 회사는 현재 더 나은 업무 환경을 만들기 위해 {var} 캠페인을 진행하고 있습니다. \n\n{target} 분들의 적극적인 관심과 참여가 큰 힘이 됩니다. 많은 관심 부탁드립니다. \n\n감사합니다.",
  },
  "notice-etc": {
    title: "{var}",
    options: [],
    content: "{var}",
  },
};
// (6) 메시지
const messagesData = [
    {
    from: "정희석",
    to: "하미니(나)",
    text: "하미니님, 이번에 휴가 공지 언제쯤 올릴까요?",
    time: "오후 16:24",
    timestamp: "2026-01-09T16:24:00",
  },
  {
    from: "하미니(나)",
    to: "정희석",
    text: "몰라",
    time: "오후 16:28",
    timestamp: "2026-01-09T16:28:00",
  },
  {
    from: "하다경",
    to: "하미니(나)",
    text: "오늘은 삼겹살 어때용?",
    time: "오후 12:04",
    timestamp: "2026-01-09T12:04:00",
  },
  {
    from: "하미니(나)",
    to: "하다경",
    text: "시러",
    time: "오후 15:18",
    timestamp: "2026-01-09T15:18:00",
  },
  {
    from: "이민",
    to: "하미니(나)",
    text: "하미니님, 새해복 많이 받으세요",
    time: "오후 18:04",
    timestamp: "2025-12-31T18:04:00",
  },
  {
    from: "하미니(나)",
    to: "이민",
    text: "오냐",
    time: "오후 19:32",
    timestamp: "2025-12-31T19:32:00",
  },
  {
    from: "정희석",
    to: "하미니(나)",
    text: "하미니님, 이번에 연말 정산 보고서 언제까지 제출하면 될까요?",
    time: "오후 03:00",
    timestamp: "2026-01-05T15:00:00",
  },
  {
    from: "하미니(나)",
    to: "정희석",
    text: "확인하고 오늘 밤 내로 공지 올리겠습니다.",
    time: "오후 05:28",
    timestamp: "2026-01-05T15:05:00",
  },
  {
    from: "정희석",
    to: "하미니(나)",
    text: "넵, 감사합니다 !",
    time: "오후 05:31",
    timestamp: "2026-01-05T15:31:00",
  },
  {
    from: "이유정",
    to: "하미니(나)",
    text: "오늘 점심 메뉴 뭐예요?",
    time: "오전 11:20",
    timestamp: "2026-01-06T11:20:00",
  },
  {
    from: "하미니(나)",
    to: "이유정",
    text: "몰라 나도",
    time: "오전 11:24",
    timestamp: "2026-01-06T11:24:00",
  },
  {
    from: "정하늘",
    to: "하미니(나)",
    text: "연차휴가 계획서 언제까지 내야되용?ㅠㅠ",
    time: "오후 02:20",
    timestamp: "2026-01-06T14:12:00",
  },
  {
    from: "하미니(나)",
    to: "정하늘",
    text: "몰라 나도",
    time: "오후 06:24",
    timestamp: "2026-01-06T18:24:00",
  },
  {
    from: "정하늘",
    to: "하미니(나)",
    text: "넹",
    time: "오후 06:27",
    timestamp: "2026-01-06T18:27:00",
  },
  {
    from: "하미니(나)",
    to: "팀장 단체방",
    text: "몰라 나도",
    time: "오후 06:28",
    timestamp: "2026-01-03T18:28:00",
  },
  {
    from: "이유정",
    to: "하미니(나)",
    text: "영업부 주간 보고서 공유드립니다.",
    time: "오전 10:30",
    timestamp: "2026-01-06T10:30:00",
  },
  {
    from: "하다경",
    to: "하미니(나)",
    text: "오늘 점심 메뉴 돈까스 어때요?",
    time: "오전 11:45",
    timestamp: "2026-01-06T11:45:00",
  },
  {
    from: "하미니(나)",
    to: "하다경",
    text: "ㄴㄴ",
    time: "오전 11:50",
    timestamp: "2026-01-06T11:50:00",
  },
  {
    from: "김태환",
    to: "하미니(나)",
    text: "미니님, 아까 요청하신 파일 보냈어요.",
    time: "오후 03:20",
    timestamp: "2026-01-06T15:20:00",
  },
  {
    from: "장재영",
    to: "하미니(나)",
    text: "퇴근 전에 잠깐 회의 가능할까요?",
    time: "오후 05:30",
    timestamp: "2026-01-06T17:30:00",
  },
  {
    from: "하미니(나)",
    to: "장재영",
    text: "ㄴㄴ",
    time: "오후 10:42",
    timestamp: "2026-01-06T22:42:00",
  },
  {
    from: "이동욱",
    to: "하미니(나)",
    text: "새해복 많이 받으세요!!",
    time: "오전 00:04",
    timestamp: "2026-01-01T00:04:00",
  },
  {
    from: "이유준",
    to: "하미니(나)",
    text: "새해복 많이 받으시길 바랍니다.",
    time: "오후 12:14",
    timestamp: "2026-01-01T12:14:00",
  },

  {
    from: "운영팀 단체방",
    to: "하미니(나)",
    text: "내일 전직원 워크샵 공지입니다.",
    time: "오후 02:00",
    timestamp: "2026-01-06T14:00:00",
  },
  {
    from: "팀장 단체방",
    to: "하미니(나)",
    text: "저희 이번에 회의 시간 언제로 잡아야 하나요?",
    time: "오후 06:27",
    timestamp: "2026-01-03T18:27:00",
  },
  {
    from: "김형선",
    to: "하미니(나)",
    text: "이동욱 콘서트 가야해요 휴가 낼게요ㅂㅂ",
    time: "오전 01:22",
    timestamp: "2026-01-04T01:22:00",
  },
  {
    from: "하미니(나)",
    to: "김형선",
    text: "그래라",
    time: "오전 01:29",
    timestamp: "2026-01-04T01:29:00",
  },
  {
    from: "정하늘",
    to: "하미니(나)",
    text: "점심 언제드실껀가요?",
    time: "오전 11:12",
    timestamp: "2026-01-06T11:12:00",
  },
  {
    from: "하미니(나)",
    to: "정하늘",
    text: "몰라 나도",
    time: "오전 11:24",
    timestamp: "2026-01-06T11:24:00",
  },
];
