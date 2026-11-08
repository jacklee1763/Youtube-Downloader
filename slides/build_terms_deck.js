const pptxgen = require("pptxgenjs");
const SK = "/root/.claude/skills/synced/e0a52d5c-e6e1-4af0-bc8e-93b3bfb5d588_b5287e50-13a9-4d8f-ae72-14d758d331d0/pptx";
const { applyTheme } = require(SK + "/scripts/apply_theme.js");
const FONT = "Malgun Gothic";
const NAVY = "0F172A", SLATE = "64748B", TEAL = "14B8A6", AMBER = "F59E0B", INK = "1E293B", TINT = "F1F5F9", LINE = "E2E8F0";
const THEME = { name: "Claude Code 용어 지도", headFontFace: FONT, bodyFontFace: FONT,
  colors: { dk1: NAVY, lt1: "FFFFFF", dk2: INK, lt2: TINT, accent1: TEAL, accent2: AMBER, accent3: "6366F1",
    accent4: "EF4444", accent5: "22C55E", accent6: SLATE, hlink: "0EA5E9", folHlink: "7C3AED" } };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = "코딩을 몰라도 시작하는 Claude Code 용어";

pres.defineSlideMaster({ title: "DARK", background: { color: NAVY }, objects: [],
  slideNumber: undefined
 });
pres.defineSlideMaster({ title: "LIGHT", background: { color: "FFFFFF" }, objects: [],
  slideNumber: { x: 12.2, y: 6.95, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 11, color: SLATE, align: "right" }
 });

function cap(s, t) { s.addText(t, { x: 0.8, y: 0.35, w: 8, h: 0.32, fontFace: FONT, fontSize: 14, bold: true, color: "B45309", margin: 0, isTextBox: true, objectName: "구분 캡션" }); }
function light(section, caption, title, notes) {
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: section });
  cap(s, caption); s.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.9, fontFace: FONT, fontSize: 32, bold: true, color: NAVY, valign: "middle", margin: 0, isTextBox: true, objectName: "제목" }); s.addNotes(notes); return s;
}

// 1. 표지
pres.addSection({ title: "시작" });
pres.addSection({ title: "용어" });
pres.addSection({ title: "마무리" });
let s = pres.addSlide({ masterName: "DARK", sectionTitle: "시작" });
s.addText("코딩을 몰라도 시작하는\nClaude Code 용어", { x: 0.8, y: 2.3, w: 11.7, h: 1.8, fontFace: FONT, fontSize: 48, bold: true, color: "FFFFFF", valign: "middle", margin: 0, isTextBox: true, objectName: "제목" });
s.addText("초등학생도 이해하는 4묶음 용어 지도", { x: 0.8, y: 4.3, w: 11.7, h: 0.9, fontFace: FONT, fontSize: 22, color: "CBD5E1", valign: "top", margin: 0, isTextBox: true, objectName: "부제" });
s.addNotes("오늘의 목표: 코딩을 전혀 몰라도 Claude Code 화면에서 만나는 말을 겁내지 않게 만드는 것. 총 27개 용어를 4묶음으로 나눠 비유로 설명합니다. 외우기보다 '이런 말이 있구나' 하고 지나가도 괜찮다고 먼저 안심시켜 주세요.");

// 2. 한눈에 보기
s = light("시작", "한눈에 보기", "용어는 4묶음이면 충분합니다",
  "27개를 한 번에 외우게 하지 말고 4묶음 지도를 먼저 보여 주세요. 질문 예: '코드는 뭐라고 생각하세요?' 로 시작하면 참여가 올라갑니다. 묶음 순서는 실제로 Claude Code를 쓰며 만나는 순서입니다.");
const groups = [["1", "기본 개념", "코드, 에러, 터미널", "8개"], ["2", "도구와 부품", "설치, API, 서버", "6개"],
  ["3", "저장과 보관", "Git, 커밋, GitHub", "7개"], ["4", "Claude Code 사용법", "세션, 권한, 스킬", "6개"]];
groups.forEach((g, i) => {
  const x = 0.8 + i * 2.99;
  s.addShape(pres.ShapeType.roundRect, { x, y: 2.0, w: 2.75, h: 4.0, rectRadius: 0.15, fill: { color: TINT }, line: { color: LINE, width: 1 }, objectName: "묶음 카드 " + g[0] });
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 2.25, w: 0.8, h: 0.8, fill: { color: i % 2 ? AMBER : TEAL }, line: { type: "none" }, objectName: "번호 원 " + g[0] });
  s.addText(g[0], { x: x + 0.2, y: 2.25, w: 0.8, h: 0.8, fontFace: FONT, fontSize: 28, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(g[1], { x: x + 0.2, y: 3.35, w: 2.35, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: NAVY, valign: "top", margin: 0, isTextBox: true });
  s.addText(g[2], { x: x + 0.2, y: 4.3, w: 2.35, h: 0.8, fontFace: FONT, fontSize: 18, color: INK, valign: "top", margin: 0, isTextBox: true });
  s.addText("용어 " + g[3], { x: x + 0.2, y: 5.3, w: 2.35, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: SLATE, margin: 0, isTextBox: true });
});

// 표 슬라이드
function tableSlide(cap_, title, rows, notes, accent) {
  const sl = light("용어", cap_, title, notes);
  const head = ["용어", "쉬운 뜻"].map(t => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: NAVY }, fontSize: 18, fontFace: FONT } }));
  const body = rows.map((r, i) => {
    const fill = { color: i % 2 ? TINT : "FFFFFF" };
    return [{ text: r[0], options: { bold: true, color: NAVY, fill, fontSize: 20, fontFace: FONT } },
            { text: r[1], options: { color: INK, fill, fontSize: 18, fontFace: FONT } }];
  });
  sl.addTable([head, ...body], { x: 0.8, y: 1.85, w: 11.7, colW: [3.1, 8.6], rowH: Math.min(0.7, 4.9 / (rows.length + 1)), valign: "middle",
    border: { type: "solid", pt: 0.75, color: LINE }, margin: [0, 0.15, 0, 0.15], objectName: "용어 표" });
  return sl;
}
tableSlide("1 / 4  기본 개념", "기본 개념: 코드는 설명서, 에러는 안내문입니다", [
  ["코드", "컴퓨터에게 시키는 일을 적은 설명서"],
  ["프로그램 / 앱", "코드가 모여 실제로 일하는 결과물"],
  ["파일 / 폴더", "파일은 문서 한 장, 폴더는 문서를 담는 서랍"],
  ["프로젝트", "한 가지 목표를 위해 모아 둔 폴더"],
  ["실행", "코드를 컴퓨터가 읽고 일하게 시키는 일"],
  ["오류 (에러)", "컴퓨터가 보내는 '못 하겠어요' 안내문, 고장이 아님"],
  ["터미널", "마우스 대신 글자로 명령하는 창"],
  ["명령어", "터미널에 입력하는 한 줄짜리 지시"] ],
  "핵심 한 줄: 코드는 설명서, 에러는 안내문. 에러가 나면 당황하지 말고 '안내문을 읽어 보자'고 말해 주세요. Claude에게 에러 메시지를 그대로 붙여 넣으면 해결해 준다는 점도 알려 주세요.");
tableSlide("2 / 4  도구와 부품", "도구와 부품: 남이 만든 것을 빌려 씁니다", [
  ["설치", "필요한 프로그램을 컴퓨터에 받아 두는 일"],
  ["라이브러리 / 패키지", "남이 만든 기능 부품, 가져다 쓰면 끝"],
  ["API", "다른 서비스에 일을 부탁하는 주문 창구"],
  ["API 키", "그 창구를 쓰는 비밀번호, 채팅에 붙여 넣기 금지"],
  ["서버", "24시간 켜져서 요청에 답하는 컴퓨터"],
  ["클라우드", "인터넷 너머의 컴퓨터를 빌려 쓰는 것"] ],
  "API를 식당 주문 창구로 비유하면 이해가 빠릅니다. 보안 포인트: API 키는 집 열쇠와 같아서 채팅이나 공개 저장소에 올리면 안 됩니다. Claude가 키가 필요하면 안전한 입력 창을 따로 띄워 줍니다.");
tableSlide("3 / 4  저장과 보관", "저장과 보관: 저장 도장을 찍고, 사물함에 올립니다", [
  ["Git", "파일의 저장 기록 일기장"],
  ["커밋 (commit)", "'여기까지 저장!' 하고 찍는 저장 도장"],
  ["브랜치", "원본은 그대로 두고 따로 연습하는 복사본 줄기"],
  ["GitHub", "저장 기록을 인터넷에 보관하는 사물함"],
  ["푸시 (push)", "내 저장 기록을 사물함에 올리는 일"],
  ["풀 (pull)", "사물함의 최신 기록을 내려받는 일"],
  ["PR (풀 리퀘스트)", "'이 수정을 본판에 합쳐 주세요' 하는 신청서"] ],
  "게임 저장에 비유하세요. Git은 저장 파일 시스템, GitHub는 클라우드 저장소. 수강생이 가장 헷갈리는 구간이라 다음 장에서 흐름을 그림으로 다시 보여 줍니다.");

// 흐름 슬라이드
s = light("용어", "3 / 4  저장과 보관", "고치고, 저장하고, 올리고, 합칩니다",
  "왼쪽 두 단계는 내 작업 컴퓨터 안에서만 일어나고, 푸시부터 인터넷(GitHub)으로 나갑니다. 오늘 사례처럼 '커밋은 됐는데 푸시가 안 된다'는 말은 3번 단계에서 열쇠(연결 권한)가 없어 막힌 상태라고 설명할 수 있습니다.");
const flow = [["1", "고친다", "파일을 만들거나 바꾼다"], ["2", "커밋", "저장 도장을 찍는다"], ["3", "푸시", "사물함에 올린다"], ["4", "PR", "합쳐 달라고 신청한다"]];
flow.forEach((f, i) => {
  const x = 0.8 + i * 3.05;
  s.addShape(pres.ShapeType.roundRect, { x, y: 2.1, w: 2.55, h: 2.6, rectRadius: 0.15, fill: { color: TINT }, line: { color: LINE, width: 1 }, objectName: "흐름 카드 " + f[0] });
  s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 2.3, w: 0.6, h: 0.6, fill: { color: i < 2 ? TEAL : AMBER }, line: { type: "none" }, objectName: "흐름 번호 " + f[0] });
  s.addText(f[0], { x: x + 0.2, y: 2.3, w: 0.6, h: 0.6, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(f[1], { x: x + 0.2, y: 3.05, w: 2.15, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: NAVY, valign: "middle", margin: 0, isTextBox: true });
  s.addText(f[2], { x: x + 0.2, y: 3.7, w: 2.15, h: 0.8, fontFace: FONT, fontSize: 18, color: INK, valign: "top", margin: 0, isTextBox: true });
  if (i < 3) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.62, y: 3.15, w: 0.36, h: 0.4, fill: { color: SLATE }, line: { type: "none" }, objectName: "화살표 " + (i + 1) });
});
s.addShape(pres.ShapeType.roundRect, { x: 0.8, y: 5.2, w: 5.55, h: 0.8, rectRadius: 0.4, fill: { color: "CCFBF1" }, line: { type: "none" }, objectName: "위치 표시 내 컴퓨터" });
s.addText("내 작업 컴퓨터 안에서만 일어남", { x: 0.8, y: 5.2, w: 5.55, h: 0.8, fontFace: FONT, fontSize: 18, bold: true, color: "115E59", align: "center", valign: "middle", margin: 0, isTextBox: true });
s.addShape(pres.ShapeType.roundRect, { x: 6.9, y: 5.2, w: 5.6, h: 0.8, rectRadius: 0.4, fill: { color: "FEF3C7" }, line: { type: "none" }, objectName: "위치 표시 GitHub" });
s.addText("GitHub (인터넷 사물함)로 나감", { x: 6.9, y: 5.2, w: 5.6, h: 0.8, fontFace: FONT, fontSize: 18, bold: true, color: "92400E", align: "center", valign: "middle", margin: 0, isTextBox: true });

tableSlide("4 / 4  Claude Code 사용법", "Claude Code 사용법: 승인 버튼으로 내가 통제합니다", [
  ["세션", "Claude와 한 번 이어서 일하는 작업 시간"],
  ["권한 (승인)", "Claude가 하려는 일을 허락하는 버튼"],
  ["허용 목록", "작업 환경이 접속해도 되는 인터넷 주소 명단"],
  ["커넥터 / 플러그인", "구글 드라이브, 노션 같은 외부 도구 연결 부품"],
  ["프롬프트", "Claude에게 보내는 요청 글"],
  ["스킬", "'이 작업은 이렇게 해'라고 미리 알려 둔 설명서"] ],
  "승인 버튼은 Claude가 내 파일이나 외부 서비스에 손댈 때 내가 허락하는 안전장치라고 강조하세요. 모르는 요청은 내용을 읽고 판단하거나 '쉽게 설명해 줘'라고 되물으면 됩니다. 허용 목록은 이번 영상 작업에서 음성 서버 접속이 막힌 사례로 보여 주면 와닿습니다.");

// 마무리
s = pres.addSlide({ masterName: "DARK", sectionTitle: "마무리" });
s.addText("처음엔 이것만 기억하세요", { x: 0.8, y: 0.9, w: 11.7, h: 1.0, fontFace: FONT, fontSize: 40, bold: true, color: "FFFFFF", margin: 0, isTextBox: true, objectName: "마무리 제목" });
[["코드는 설명서, 에러는 안내문", TEAL], ["커밋은 저장, 푸시는 사물함에 올리기", AMBER], ["모르면 '쉽게 설명해 줘'라고 말하기", TEAL]].forEach((r, i) => {
  const y = 2.4 + i * 1.4;
  s.addShape(pres.ShapeType.ellipse, { x: 0.8, y, w: 0.9, h: 0.9, fill: { color: r[1] }, line: { type: "none" }, objectName: "기억 번호 " + (i + 1) });
  s.addText(String(i + 1), { x: 0.8, y, w: 0.9, h: 0.9, fontFace: FONT, fontSize: 30, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0, isTextBox: true });
  s.addText(r[0], { x: 2.0, y, w: 10.5, h: 0.9, fontFace: FONT, fontSize: 30, color: "FFFFFF", valign: "middle", margin: 0, isTextBox: true });
});
s.addNotes("마무리 질문: '오늘 말 중에 가장 헷갈렸던 것은 무엇인가요?' 수강생이 고른 용어를 다시 비유로 설명해 주며 끝내면 기억에 오래 남습니다.");

(async () => {
  const out = process.argv[2];
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("ok", out);
})();
