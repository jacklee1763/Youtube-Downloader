const pptxgen = require("pptxgenjs");
const SK = "/root/.claude/skills/synced/e0a52d5c-e6e1-4af0-bc8e-93b3bfb5d588_b5287e50-13a9-4d8f-ae72-14d758d331d0/pptx";
const { applyTheme } = require(SK + "/scripts/apply_theme.js");
const FONT = "Noto Sans KR";
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


// ───────── 아이콘 / 도형 도우미 ─────────
const React = require("react"), ReactDOMServer = require("react-dom/server"), sharp = require("sharp");
const fa = require("react-icons/fa");
const ICON = {};
const ICON_NAMES = ["FaFolder","FaFileCode","FaTerminal","FaCog","FaExclamationTriangle","FaCheckCircle","FaPuzzlePiece","FaKey","FaServer","FaConciergeBell","FaPen","FaStamp","FaCodeBranch","FaBoxOpen","FaFileSignature","FaUser","FaCommentDots","FaShieldAlt","FaRobot","FaBook","FaPlug","FaGoogleDrive","FaStickyNote","FaListUl","FaCloud"];
async function loadIcons() {
  for (const n of ICON_NAMES) for (const c of ["FFFFFF", NAVY]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[n], { color: "#" + c, size: 256 }));
    const buf = await sharp(Buffer.from(svg), { density: 300 }).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    ICON[n + c] = "image/png;base64," + buf.toString("base64");
  }
}
function disc(s, name, cx, cy, d, bg, fg, label) {
  s.addShape(pres.ShapeType.ellipse, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: bg }, line: { type: "none" }, objectName: "아이콘 원 " + label });
  const k = d * 0.52;
  s.addImage({ data: ICON[name + (fg || "FFFFFF")], x: cx - k / 2, y: cy - k / 2, w: k, h: k, altText: label });
}
function zone(s, x, y, w, h, label, lc) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.18, fill: { color: TINT }, line: { color: lc || "94A3B8", width: 1.25, dashType: "dash" }, objectName: "구역 " + label });
  s.addText(label, { x: x + 0.25, y: y + 0.12, w: w - 0.5, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: lc ? "334155" : "334155", margin: 0, valign: "middle", isTextBox: true, objectName: "구역 이름" });
}
function iconCard(s, x, y, w, h, icon, bg, title, sub, line, d) {
  d = d || 0.8;
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: "FFFFFF" }, line: { color: line || LINE, width: 1.5 }, objectName: "카드 " + title });
  disc(s, icon, x + 0.25 + d / 2, y + h / 2, d, bg, "FFFFFF", title);
  const runs = [{ text: title, options: { bold: true, fontSize: d < 0.7 ? 16 : 18, color: NAVY, breakLine: !!sub } }];
  if (sub) runs.push({ text: sub, options: { fontSize: 15, color: INK } });
  s.addText(runs, { x: x + 0.45 + d, y, w: w - 0.6 - d, h, fontFace: FONT, valign: "middle", margin: 0, isTextBox: true, objectName: "카드 글 " + title });
}
function stackCard(s, x, y, w, h, icon, bg, title, sub, line) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.14, fill: { color: "FFFFFF" }, line: { color: line || LINE, width: 1.5 }, objectName: "카드 " + title });
  disc(s, icon, x + w / 2, y + 0.6, 0.8, bg, "FFFFFF", title);
  const runs = [{ text: title, options: { bold: true, fontSize: 18, color: NAVY, align: "center", breakLine: !!sub } }];
  if (sub) runs.push({ text: sub, options: { fontSize: 15, color: INK, align: "center" } });
  s.addText(runs, { x: x + 0.1, y: y + 1.1, w: w - 0.2, h: h - 1.2, fontFace: FONT, valign: "top", margin: 0, isTextBox: true, objectName: "카드 글 " + title });
}
function lbl(s, t, x, y, w, color, size, align) {
  s.addText(t, { x, y, w, h: 0.4, fontFace: FONT, fontSize: size || 16, bold: true, color: color || NAVY, align: align || "center", valign: "middle", margin: 0, isTextBox: true, objectName: "라벨 " + t });
}
function arrR(s, x, y, w, h) { s.addShape(pres.ShapeType.rightArrow, { x, y, w, h: h || 0.4, fill: { color: SLATE }, line: { type: "none" }, objectName: "화살표" }); }
function arrL(s, x, y, w, h) { s.addShape(pres.ShapeType.leftArrow, { x, y, w, h: h || 0.4, fill: { color: SLATE }, line: { type: "none" }, objectName: "화살표" }); }
function note(s, t, x, y, w) { s.addText(t, { x, y, w, h: 0.75, fontFace: FONT, fontSize: 16, color: INK, valign: "top", margin: 0, isTextBox: true, objectName: "구역 설명" }); }
const GREEN = "22C55E";

function diagram(caption, title, notes) { return light("용어", caption, title, notes); }

function diagG1() {
  const s = diagram("1 / 4  기본 개념 · 도해", "명령하면 코드가 실행되고 결과가 나옵니다",
    "왼쪽은 '코드가 사는 곳', 오른쪽은 '코드를 움직이는 곳'입니다. 터미널에 명령어 한 줄을 보내면 컴퓨터가 코드를 읽고 일합니다. 결과는 두 가지뿐입니다: 잘 되면 프로그램(앱), 안 되면 에러라는 안내문. 에러는 고장이 아니라 '여기를 고쳐 주세요'라는 쪽지라는 점을 강조해 주세요.");
  zone(s, 0.8, 1.9, 5.0, 4.8, "프로젝트 = 폴더 (서랍)");
  [0, 1, 2].forEach(i => stackCard(s, 1.05 + i * 1.55, 2.85, 1.4, 2.0, "FaFileCode", TEAL, "파일", "코드가 적힘"));
  note(s, "코드(설명서)가 적힌 파일들을\n한 폴더에 모아 둡니다", 1.05, 5.3, 4.5);
  arrR(s, 5.88, 3.85, 0.38, 0.45);
  zone(s, 6.3, 1.9, 6.2, 4.8, "터미널에서 실행");
  s.addShape(pres.ShapeType.roundRect, { x: 6.55, y: 2.85, w: 2.0, h: 2.0, rectRadius: 0.14, fill: { color: NAVY }, line: { type: "none" }, objectName: "터미널 창" });
  s.addImage({ data: ICON["FaTerminal" + "FFFFFF"], x: 7.25, y: 3.05, w: 0.6, h: 0.6, altText: "터미널" });
  s.addText([{ text: "명령어", options: { bold: true, fontSize: 20, color: "FFFFFF", align: "center", breakLine: true } }, { text: "터미널 창", options: { fontSize: 15, color: "CBD5E1", align: "center" } }], { x: 6.6, y: 3.8, w: 1.9, h: 0.95, fontFace: FONT, valign: "top", margin: 0, isTextBox: true, objectName: "터미널 글" });
  lbl(s, "실행", 8.6, 3.2, 0.6, "B45309", 16);
  arrR(s, 8.62, 3.7, 0.55, 0.4);
  iconCard(s, 9.25, 2.55, 3.1, 1.55, "FaCheckCircle", GREEN, "프로그램/앱", "일하는 결과물", GREEN);
  iconCard(s, 9.25, 4.35, 3.1, 1.55, "FaExclamationTriangle", AMBER, "오류(에러)", "고장이 아닌 안내문", AMBER);
  note(s, "명령어 한 줄을 보내면 컴퓨터가 코드를 읽고 일합니다", 6.55, 6.05, 5.7);
}
function diagG2() {
  const s = diagram("2 / 4  도구와 부품 · 도해", "내 컴퓨터가 부품과 서버를 빌려 씁니다",
    "왼쪽 구역은 내 컴퓨터, 오른쪽 구역은 클라우드(인터넷 너머 컴퓨터)입니다. 부품(라이브러리)은 설치해서 내 프로젝트에 끼워 쓰고, 멀리 있는 서버에는 API라는 주문 창구로 부탁합니다. 창구를 쓰려면 API 키(비밀번호)가 필요해서 열쇠 아이콘을 화살표 위에 두었습니다. 열쇠는 절대 채팅에 붙여 넣지 않도록 한 번 더 강조하세요.");
  zone(s, 0.8, 1.9, 5.4, 4.3, "내 컴퓨터");
  stackCard(s, 1.1, 2.75, 2.0, 2.3, "FaFolder", TEAL, "내 프로젝트", "내가 만드는 폴더");
  arrL(s, 3.17, 3.7, 0.35, 0.4);
  stackCard(s, 3.6, 2.75, 2.3, 2.3, "FaPuzzlePiece", AMBER, "라이브러리", "패키지, 남이 만든 부품");
  note(s, "필요한 부품은 설치(받아 두기)해서\n가져다 씁니다", 1.1, 5.35, 4.9);
  arrR(s, 6.3, 3.85, 0.9, 0.4);
  disc(s, "FaKey", 6.75, 3.15, 0.7, AMBER, "FFFFFF", "API 키");
  lbl(s, "API 키", 6.25, 4.35, 1.0, "B45309", 15);
  zone(s, 7.3, 1.9, 5.2, 4.3, "클라우드 (빌려 쓰는 컴퓨터)");
  stackCard(s, 7.6, 2.75, 1.95, 2.3, "FaConciergeBell", TEAL, "API", "주문 창구");
  arrR(s, 9.62, 3.7, 0.45, 0.4);
  stackCard(s, 10.15, 2.75, 2.1, 2.3, "FaServer", NAVY, "서버", "24시간 켜진 컴퓨터");
  note(s, "창구(API)에 부탁하면 서버가 일해 줍니다", 7.6, 5.35, 4.7);
}
function diagG3() {
  const s = diagram("3 / 4  저장과 보관 · 도해", "내 컴퓨터에서 저장하고, 사물함에 올립니다",
    "왼쪽 구역은 내 작업 컴퓨터 안, 오른쪽 구역은 인터넷의 GitHub 사물함입니다. ①고치고 ②커밋(저장 도장)을 찍는 것까지는 내 컴퓨터 안에서만 일어나고, ③푸시를 해야 사물함에 올라갑니다. 풀은 반대로 내려받는 일입니다. 브랜치는 원본(위 줄)은 그대로 두고 아래 줄에서 따로 연습하는 복사본입니다. ④PR은 연습한 결과를 본판에 합쳐 달라고 신청하는 단계입니다. 오늘 푸시가 막힌 상황은 가운데 위 화살표(③)가 열쇠 부족으로 막힌 것이라고 설명하세요.");
  zone(s, 0.8, 1.9, 6.0, 4.8, "내 작업 컴퓨터 · Git (저장 기록 일기장)");
  s.addShape(pres.ShapeType.line, { x: 1.55, y: 3.4, w: 4.95, h: 0, line: { color: SLATE, width: 3 }, objectName: "본 줄기" });
  disc(s, "FaPen", 1.55, 3.4, 0.8, TEAL, "FFFFFF", "고친다");
  lbl(s, "① 고친다", 0.95, 3.85, 1.2, NAVY, 15);
  [3.0, 4.4, 5.8].forEach((cx, i) => disc(s, "FaStamp", cx, 3.4, 0.75, AMBER, "FFFFFF", "커밋 " + (i + 1)));
  lbl(s, "② 커밋", 2.35, 3.85, 1.3, NAVY, 15);
  s.addShape(pres.ShapeType.line, { x: 4.4, y: 3.8, w: 0, h: 1.2, line: { color: SLATE, width: 3 }, objectName: "브랜치 갈래" });
  s.addShape(pres.ShapeType.line, { x: 4.4, y: 5.0, w: 2.1, h: 0, line: { color: SLATE, width: 3, dashType: "dash" }, objectName: "브랜치 줄기" });
  [5.1, 5.9].forEach((cx, i) => disc(s, "FaStamp", cx, 5.0, 0.6, TEAL, "FFFFFF", "브랜치 커밋 " + (i + 1)));
  s.addText([{ text: "브랜치", options: { bold: true, fontSize: 16, color: NAVY, breakLine: true } }, { text: "원본은 두고 연습하는 줄기", options: { fontSize: 15, color: INK } }],
    { x: 1.2, y: 4.55, w: 3.0, h: 0.9, fontFace: FONT, valign: "middle", margin: 0, isTextBox: true, objectName: "브랜치 설명" });
  lbl(s, "③ 푸시", 6.85, 2.55, 1.05, "B45309", 16);
  arrR(s, 6.9, 3.05, 0.95, 0.42);
  arrL(s, 6.9, 4.1, 0.95, 0.42);
  lbl(s, "풀", 6.85, 4.58, 1.05, "334155", 16);
  zone(s, 7.9, 1.9, 4.6, 4.8, "GitHub · 인터넷 사물함");
  iconCard(s, 8.2, 2.75, 4.0, 1.65, "FaBoxOpen", NAVY, "사물함", "저장 기록을 인터넷에 보관", LINE);
  iconCard(s, 8.2, 4.7, 4.0, 1.65, "FaFileSignature", AMBER, "④ PR", "본판에 합쳐 달라는 신청서", AMBER);
}
function diagG4() {
  const s = diagram("4 / 4  Claude Code 사용법 · 도해", "내가 요청하고, 승인으로 통제합니다",
    "왼쪽 '나'가 프롬프트(요청 글)를 보내면 가운데 세션(작업 시간)에서 Claude가 일합니다. 스킬은 Claude 옆에 꽂아 둔 작업 설명서입니다. 두 화살표 위의 방패(권한 승인)와 목록(허용 목록)이 안전장치입니다. 내가 승인해야 Claude가 손대고, 허용된 주소로만 바깥에 나갑니다. 오른쪽은 커넥터/플러그인으로 연결한 구글 드라이브, 노션 같은 외부 도구입니다.");
  zone(s, 0.8, 1.9, 2.4, 4.8, "나 (사용자)");
  stackCard(s, 1.0, 2.6, 2.0, 1.75, "FaUser", TEAL, "사용자");
  stackCard(s, 1.0, 4.5, 2.0, 1.95, "FaCommentDots", AMBER, "프롬프트", "요청 글");
  disc(s, "FaShieldAlt", 3.75, 3.05, 0.65, AMBER, "FFFFFF", "권한 승인");
  arrR(s, 3.3, 3.6, 0.9, 0.4);
  lbl(s, "승인", 3.3, 4.1, 0.9, "B45309", 16);
  zone(s, 4.3, 1.9, 4.4, 4.8, "세션 (작업 시간)");
  iconCard(s, 4.55, 2.6, 3.9, 1.6, "FaRobot", NAVY, "Claude", "요청을 받아 일합니다", LINE);
  iconCard(s, 4.55, 4.45, 3.9, 1.6, "FaBook", TEAL, "스킬", "미리 알려 둔 설명서", LINE);
  disc(s, "FaListUl", 9.25, 3.05, 0.65, TEAL, "FFFFFF", "허용 목록");
  arrR(s, 8.8, 3.6, 0.9, 0.4);
  lbl(s, "허용 목록", 8.7, 4.1, 1.1, "0F766E", 14);
  zone(s, 9.8, 1.9, 2.7, 4.8, "외부 도구");
  stackCard(s, 10.0, 2.6, 2.3, 1.95, "FaPlug", TEAL, "커넥터", "플러그인");
  iconCard(s, 10.0, 4.75, 2.3, 0.75, "FaGoogleDrive", NAVY, "드라이브", null, LINE, 0.5);
  iconCard(s, 10.0, 5.65, 2.3, 0.75, "FaStickyNote", NAVY, "노션", null, LINE, 0.5);
}

function cap(s, t) { s.addText(t, { x: 0.8, y: 0.35, w: 8, h: 0.32, fontFace: FONT, fontSize: 14, bold: true, color: "B45309", margin: 0, isTextBox: true, objectName: "구분 캡션" }); }
function light(section, caption, title, notes) {
  const s = pres.addSlide({ masterName: "LIGHT", sectionTitle: section });
  cap(s, caption); s.addText(title, { x: 0.8, y: 0.7, w: 11.7, h: 0.9, fontFace: FONT, fontSize: 32, bold: true, color: NAVY, valign: "middle", margin: 0, isTextBox: true, objectName: "제목" }); s.addNotes(notes); return s;
}

// 1. 표지
function build() {
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
diagG1();
tableSlide("2 / 4  도구와 부품", "도구와 부품: 남이 만든 것을 빌려 씁니다", [
  ["설치", "필요한 프로그램을 컴퓨터에 받아 두는 일"],
  ["라이브러리 / 패키지", "남이 만든 기능 부품, 가져다 쓰면 끝"],
  ["API", "다른 서비스에 일을 부탁하는 주문 창구"],
  ["API 키", "그 창구를 쓰는 비밀번호, 채팅에 붙여 넣기 금지"],
  ["서버", "24시간 켜져서 요청에 답하는 컴퓨터"],
  ["클라우드", "인터넷 너머의 컴퓨터를 빌려 쓰는 것"] ],
  "API를 식당 주문 창구로 비유하면 이해가 빠릅니다. 보안 포인트: API 키는 집 열쇠와 같아서 채팅이나 공개 저장소에 올리면 안 됩니다. Claude가 키가 필요하면 안전한 입력 창을 따로 띄워 줍니다.");
diagG2();
tableSlide("3 / 4  저장과 보관", "저장과 보관: 저장 도장을 찍고, 사물함에 올립니다", [
  ["Git", "파일의 저장 기록 일기장"],
  ["커밋 (commit)", "'여기까지 저장!' 하고 찍는 저장 도장"],
  ["브랜치", "원본은 그대로 두고 따로 연습하는 복사본 줄기"],
  ["GitHub", "저장 기록을 인터넷에 보관하는 사물함"],
  ["푸시 (push)", "내 저장 기록을 사물함에 올리는 일"],
  ["풀 (pull)", "사물함의 최신 기록을 내려받는 일"],
  ["PR (풀 리퀘스트)", "'이 수정을 본판에 합쳐 주세요' 하는 신청서"] ],
  "게임 저장에 비유하세요. Git은 저장 파일 시스템, GitHub는 클라우드 저장소. 수강생이 가장 헷갈리는 구간이라 다음 장에서 흐름을 그림으로 다시 보여 줍니다.");

diagG3();

tableSlide("4 / 4  Claude Code 사용법", "Claude Code 사용법: 승인 버튼으로 내가 통제합니다", [
  ["세션", "Claude와 한 번 이어서 일하는 작업 시간"],
  ["권한 (승인)", "Claude가 하려는 일을 허락하는 버튼"],
  ["허용 목록", "작업 환경이 접속해도 되는 인터넷 주소 명단"],
  ["커넥터 / 플러그인", "구글 드라이브, 노션 같은 외부 도구 연결 부품"],
  ["프롬프트", "Claude에게 보내는 요청 글"],
  ["스킬", "'이 작업은 이렇게 해'라고 미리 알려 둔 설명서"] ],
  "승인 버튼은 Claude가 내 파일이나 외부 서비스에 손댈 때 내가 허락하는 안전장치라고 강조하세요. 모르는 요청은 내용을 읽고 판단하거나 '쉽게 설명해 줘'라고 되물으면 됩니다. 허용 목록은 이번 영상 작업에서 음성 서버 접속이 막힌 사례로 보여 주면 와닿습니다.");
diagG4();

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

}

(async () => {
  await loadIcons();
  build();
  const out = process.argv[2];
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log("ok", out);
})();
