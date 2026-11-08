#!/usr/bin/env python3
"""PLB 멤버십 설명 영상 생성기 (Pillow + ffmpeg).

사용: python3 -I build_video.py <출력폴더>
결과: <출력폴더>/plb_membership.mp4, plb_membership.srt
음성이 없는 자막형 영상입니다. 자막 타이밍은 낭독 속도 기준 추정값입니다.
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
FD = "/usr/share/fonts/truetype/nanum/"
BG, PANEL, PANEL2 = (11, 18, 32), (22, 32, 54), (33, 46, 74)
TXT, DIM = (241, 245, 249), (148, 163, 184)
TEAL, GOLD, GREEN, RED = (45, 212, 191), (251, 191, 36), (34, 197, 94), (239, 68, 68)
TIER = {"비기너": (148, 163, 184), "베이직": (96, 165, 250), "엘리트": (45, 212, 191),
        "프리미엄": (192, 132, 252), "VIP": (251, 191, 36)}


def F(size, bold=True):
    return ImageFont.truetype(FD + ("NanumSquareRoundB.ttf" if bold else "NanumSquareRoundR.ttf"), size)


def tc(d, x, y, s, size, fill=TXT, bold=True):
    d.text((x, y), s, font=F(size, bold), fill=fill, anchor="mm")


def tl(d, x, y, s, size, fill=TXT, bold=True):
    d.text((x, y), s, font=F(size, bold), fill=fill, anchor="lm")


def rr(d, box, fill=PANEL, outline=None, r=28, w=3):
    d.rounded_rectangle(box, r, fill=fill, outline=outline, width=w)


def arrow(d, x1, y, x2, fill=DIM):
    d.line((x1, y, x2 - 14, y), fill=fill, width=6)
    d.polygon([(x2, y), (x2 - 26, y - 17), (x2 - 26, y + 17)], fill=fill)


def card(d, cx, cy, w, h, title, sub=None, color=TEAL, tsize=44, fill=PANEL):
    rr(d, (cx - w // 2, cy - h // 2, cx + w // 2, cy + h // 2), fill, color)
    if sub:
        tc(d, cx, cy - 22, title, tsize, TXT)
        tc(d, cx, cy + 36, sub, 30, DIM, False)
    else:
        tc(d, cx, cy, title, tsize, TXT)


def title(d, s, sub=None, y=90):
    tl(d, 100, y, s, 54, TXT)
    if sub:
        tl(d, 100, y + 60, sub, 30, DIM, False)


STEPS = ["참여 조건", "등급 확정", "보상 계산", "월 1회 지급"]


def strip(d, active):
    x0 = 100
    for i, s in enumerate(STEPS, 1):
        on = (i == active) if active != "all" else True
        x = x0 + (i - 1) * 440
        rr(d, (x, 40, x + 410, 100), PANEL2 if on else PANEL, GOLD if on else None, 30, 3)
        tl(d, x + 28, 70, f"{i}  {s}", 30, GOLD if on else DIM)


# ───────────────────────── 장면 ─────────────────────────
def scene_news(d, s):
    if s <= 2:
        title(d, "매일 쏟아지는 뉴스" if s < 2 else "뉴스가 나오면 남는 질문")
    items = [("경기 결과", "누가 이길까?"), ("금리", "오를까, 내릴까?"), ("새 정책", "무엇이 달라질까?")]
    if s <= 1:
        for i, (a, b) in enumerate(items[: 2 if s == 0 else 3]):
            card(d, 380 + i * 580, 430, 500, 260, a, b, TEAL, 56)
    if s == 2:
        tc(d, 960, 480, "정말 그렇게 될까?", 130, GOLD)
    if s == 3:
        title(d, "질문이 시장이 됩니다")
        card(d, 430, 480, 560, 220, "정말 그렇게 될까?", None, GOLD, 52)
        arrow(d, 740, 480, 1000)
        rr(d, (1040, 330, 1560, 630), PANEL, TEAL)
        tc(d, 1300, 390, "거래 가능한 시장", 44)
        rr(d, (1090, 470, 1290, 570), GREEN, None, 24); tc(d, 1190, 520, "예", 52, BG)
        rr(d, (1310, 470, 1510, 570), RED, None, 24); tc(d, 1410, 520, "아니오", 52, TXT)


def scene_market(d, s):
    if s == 0:
        title(d, "이벤트 마켓")
        for i, c in enumerate(["스포츠", "경제", "정치"]):
            card(d, 420 + i * 540, 360, 440, 150, c, None, TEAL, 56)
        d.polygon([(960, 600), (920, 540), (1000, 540)], fill=DIM)
        rr(d, (560, 650, 940, 800), GREEN, None, 30); tc(d, 750, 725, "예", 76, BG)
        rr(d, (980, 650, 1360, 800), RED, None, 30); tc(d, 1170, 725, "아니오", 76, TXT)
        return
    title(d, "하나의 질문 = 하나의 시장", "예: 한국 경기")
    rr(d, (360, 210, 1560, 830), PANEL, TEAL)
    tc(d, 960, 300, "이 경기에서 한국이 승리할까?", 58)
    yes = {1: 52, 2: 52, 3: 61, 4: 100}[s]
    no = 100 - yes
    bx0, bx1, by0, by1 = 440, 1480, 520, 600
    split = bx0 + (bx1 - bx0) * yes // 100
    rr(d, (bx0, by0, bx1, by1), RED if no else GREEN, None, 18)
    if yes:
        d.rounded_rectangle((bx0, by0, max(split, bx0 + 40), by1), 18, fill=GREEN)
    tl(d, bx0 + 24, by0 + 40, f"예  {yes}%", 40, BG)
    if no:
        d.text((bx1 - 24, by0 + 40), f"아니오  {no}%", font=F(40), fill=TXT, anchor="rm")
    if s == 2:
        for i in range(4):
            cx = 480 + i * 110
            d.ellipse((cx - 28, 690, cx + 28, 746), fill=GREEN); d.ellipse((cx - 14, 700, cx + 14, 728), fill=BG)
            cx2 = 1090 + i * 110
            d.ellipse((cx2 - 28, 690, cx2 + 28, 746), fill=RED); d.ellipse((cx2 - 14, 700, cx2 + 14, 728), fill=BG)
        tc(d, 960, 400, "내 정보와 판단으로 한쪽을 선택", 40, DIM, False)
    if s == 3:
        tc(d, 960, 400, "참여가 쌓일수록 가격이 움직입니다", 40, GOLD)
        tc(d, 960, 700, "예 52% → 61%", 52, TXT)
    if s == 4:
        tc(d, 960, 400, "결과 확정: 예", 44, GOLD)
        rr(d, (560, 660, 940, 770), PANEL2, GREEN); tc(d, 750, 715, "예 보유 → 정산 지급", 34)
        rr(d, (980, 660, 1360, 770), PANEL2, RED); tc(d, 1170, 715, "아니오 보유 → 정산 없음", 34, DIM)


def scene_fee(d, s):
    title(d, "플랫폼 수익 구조")
    xs = [330, 960, 1590]
    for x, t in zip(xs, ["거래 운영", "거래 수수료", "플랫폼 수익"]):
        card(d, x, 400, 440, 160, t, None, TEAL, 50)
    arrow(d, 560, 400, 740); arrow(d, 1190, 400, 1370)
    if s >= 1:
        d.line((1590, 480, 1590, 620), fill=GOLD, width=6)
        d.polygon([(1590, 650), (1565, 610), (1615, 610)], fill=GOLD)
        rr(d, (1090, 660, 1830, 860), PANEL2, GOLD)
        tc(d, 1460, 725, "수익의 5%", 64, GOLD)
        tc(d, 1460, 810, "PLB 멤버십 회원 보상금", 34)


def scene_steps_q(d, s):
    title(d, "멤버십 참여부터 보상까지")
    for i, t in enumerate(STEPS, 1):
        cx = 280 + (i - 1) * 453
        card(d, cx, 500, 400, 300, t, f"STEP {i}", GOLD, 52)
    tc(d, 960, 800, "어떤 순서로 받게 될까요?", 56, TEAL)


def scene_table(d, s):
    strip(d, 1)
    title(d, "STEP 1  참여 조건", "등급별 PLB 보유·스테이킹 기준 수량과 정원", 170)
    tiers = [("비기너", "1만 개", "300명"), ("베이직", "5만 개", "90명"), ("엘리트", "8만 개", "45명"),
             ("프리미엄", "15만 개", "30명"), ("VIP", "30만 개", "10명")]
    tl(d, 260, 320, "등급", 32, DIM); tl(d, 760, 320, "기준 수량 (PLB)", 32, DIM); tl(d, 1300, 320, "정원", 32, DIM)
    for i, (n, q, p) in enumerate(tiers):
        y = 410 + i * 100
        rr(d, (200, y - 42, 1720, y + 42), PANEL, TIER[n], 24, 3)
        tl(d, 260, y, n, 44, TIER[n])
        qn = {1: 3, 2: 5}.get(s, 5 if s >= 2 else 0)
        pn = {3: 3, 4: 5}.get(s, 5 if s >= 4 else 0)
        if i < qn:
            tl(d, 760, y, q, 44)
        if i < pn:
            tl(d, 1300, y, p, 44)
    if s == 4:
        tc(d, 960, 880, "빈자리가 생기면 승급 · 대기 절차 운영", 38, GOLD)


def scene_s2(d, s):
    strip(d, 2)
    title(d, "STEP 2  등급 확정", None, 170)
    card(d, 560, 500, 640, 280, "매월 자격 확인", "PLB 보유·스테이킹 조건", TEAL, 56)
    arrow(d, 920, 500, 1060)
    card(d, 1360, 500, 560, 280, "그달 등급 확정", "해당 월 적용 등급", GOLD, 56)


def scene_s3(d, s):
    strip(d, 3)
    title(d, "STEP 3  보상 계산", "그달의 실제 플랫폼 수익 기준", 170)
    if s == 0:
        card(d, 960, 520, 1000, 300, "실제 플랫폼 수익 → 5% → 보상금", "회원에게 나눌 금액을 계산", GOLD, 56)
    elif s == 1:
        card(d, 400, 500, 520, 260, "월 수익", "1,000,000 USDT", TEAL, 50)
        arrow(d, 680, 500, 840); tc(d, 760, 440, "× 5%", 40, GOLD)
        card(d, 1160, 500, 520, 260, "전체 보상금", "50,000 USDT", GOLD, 50, PANEL2)
        tc(d, 960, 800, "예시", 34, DIM, False)
    else:
        rr(d, (200, 280, 920, 800), PANEL, GREEN); rr(d, (1000, 280, 1720, 800), PANEL, RED)
        d.ellipse((520, 320, 600, 400), fill=GREEN); tc(d, 560, 360, "O", 50, BG)
        d.ellipse((1320, 320, 1400, 400), fill=RED); tc(d, 1360, 360, "X", 50, TXT)
        tc(d, 560, 520, "플랫폼 수익에서", 46); tc(d, 560, 590, "떼어 놓는 비율", 46)
        tc(d, 1360, 520, "내 PLB 보유량에 대한", 46); tc(d, 1360, 590, "5% 수익이 아님", 46)
        tc(d, 560, 700, "수익의 5%", 80, GOLD, True); tc(d, 1360, 700, "보유 PLB × 5%", 56, DIM)


def scene_alloc(d, s):
    title(d, "등급별 보상 배분", "플랫폼 수익 대비 비율")
    rows = [("비기너", 0.5), ("베이직", 0.5), ("엘리트", 0.5), ("프리미엄", 1.5), ("VIP", 2.0)]
    show = 3 if s == 0 else 5
    for i, (n, v) in enumerate(rows[:show]):
        y = 290 + i * 110
        hi = s == 2 and n in ("엘리트", "베이직")
        tl(d, 120, y, n, 44, TIER[n])
        d.rounded_rectangle((400, y - 32, 400 + int(v * 400), y + 32), 14, fill=TIER[n],
                            outline=GOLD if hi else None, width=6)
        tl(d, 400 + int(v * 400) + 30, y, f"{v}%", 44)
    if s >= 1:
        rr(d, (1400, 250, 1840, 400), PANEL2, GOLD)
        tc(d, 1620, 300, "합계", 36, DIM); tc(d, 1620, 360, "5%", 70, GOLD)
    if s == 2:
        rr(d, (1400, 450, 1840, 820), PANEL, TEAL)
        tc(d, 1620, 520, "엘리트 회원", 40, TEAL)
        tc(d, 1620, 590, "엘리트 + 베이직 수익", 38)
        tc(d, 1620, 680, "노력 1.5배", 50, TXT); tc(d, 1620, 760, "수익 3배", 62, GOLD)


def scene_calc(d, s):
    title(d, "개인별 지급액 계산", "프리미엄 등급 예시")
    if s >= 1:
        card(d, 330, 470, 460, 260, "월 수익", "1,000,000 USDT", TEAL, 46)
        arrow(d, 580, 470, 700); tc(d, 640, 410, "× 1.5%", 36, GOLD)
        card(d, 960, 470, 440, 260, "프리미엄 배정", "15,000 USDT", PIL_P, 46)
    if s >= 2:
        arrow(d, 1190, 470, 1310); tc(d, 1250, 410, "÷ 30명", 36, GOLD)
        card(d, 1590, 470, 440, 260, "1인당", "500 USDT", GOLD, 56, PANEL2)
    if s == 3:
        rr(d, (260, 740, 1660, 880), PANEL, GOLD)
        tc(d, 960, 785, "계산 방법을 보여주는 예시입니다", 40, GOLD)
        tc(d, 960, 840, "실제 보상금은 플랫폼 수익 · 회원 자격 · 운영 조건에 따라 달라집니다", 30, DIM, False)


PIL_P = TIER["프리미엄"]


def scene_pay(d, s):
    if s == 0:
        strip(d, 4)
        title(d, "STEP 4  월 1회 지급", None, 170)
        card(d, 560, 500, 520, 280, "개인별 지급액 확정", None, TEAL, 48)
        arrow(d, 840, 500, 1000); tc(d, 920, 440, "월 1회", 36, GOLD)
        card(d, 1360, 500, 520, 280, "회원 지갑", "보상금 지급", GOLD, 56, PANEL2)
    elif s == 1:
        strip(d, "all")
        title(d, "PLB 멤버십 운영 구조", None, 170)
        tc(d, 960, 520, "참여 조건을 갖춘 회원에게", 56)
        tc(d, 960, 620, "실제 거래 수수료 수익의 일부를 나눕니다", 56, GOLD)
    else:
        tc(d, 960, 400, "PLB 멤버십", 120, GOLD)
        tc(d, 960, 560, "가격 상승만 기다리지 않고", 56)
        tc(d, 960, 640, "보유 수량에 따라 매달 보상", 56, TEAL)


# (장면함수, step, 자막)
CHUNKS = [
    (scene_news, 0, "우리는 매일 수많은 뉴스를 봅니다. 경기 결과가 어떻게 나올지, 금리가 어떻게 결정될지."),
    (scene_news, 1, "새로운 정책이 어떤 변화를 만들지. 그런데 뉴스가 나오면, 늘 하나의 질문이 남습니다."),
    (scene_news, 2, "정말 그렇게 될까?"),
    (scene_news, 3, "이벤트 마켓은 이 질문을 하나의 거래 가능한 시장으로 바꿉니다."),
    (scene_market, 0, "스포츠부터 경제, 정치까지. 현실의 이슈가 예와 아니오, 두 선택의 시장이 됩니다."),
    (scene_market, 1, "예를 들어, ‘이 경기에서 한국이 승리할까?’ 같은 질문이 하나의 시장이 됩니다."),
    (scene_market, 2, "참여자는 자신이 가진 정보와 판단을 바탕으로 두 선택 가운데 하나에 참여합니다."),
    (scene_market, 3, "그리고 참여가 쌓일수록, 시장 가격은 계속 움직입니다."),
    (scene_market, 4, "이벤트의 결과가 확정되면, 그 결과와 참여자가 보유한 선택에 따라 정산이 이뤄집니다."),
    (scene_fee, 0, "플랫폼은 이 거래를 운영하면서 수수료를 받습니다. 이 수수료가 플랫폼의 수익이 됩니다."),
    (scene_fee, 1, "그리고 이 수익의 5%를 PLB 멤버십 회원에게 지급할 보상금으로 배정합니다."),
    (scene_steps_q, 0, "그렇다면 멤버십에는 어떻게 참여하고, 보상은 어떤 순서로 받게 될까요?"),
    (scene_table, 0, "첫째, 멤버십 참여 조건을 갖춥니다. 등급마다 정해진 PLB 보유·스테이킹 조건을 충족해야 합니다."),
    (scene_table, 1, "등급별 기준 수량은 비기너 1만 개, 베이직 5만 개, 엘리트 8만 개입니다."),
    (scene_table, 2, "프리미엄은 15만 개, 브이아이피는 30만 개입니다."),
    (scene_table, 3, "각 등급에는 정원도 있습니다. 비기너 300명, 베이직 90명, 엘리트 45명입니다."),
    (scene_table, 4, "프리미엄은 30명, 브이아이피는 10명입니다. 빈자리가 생기면 승급과 대기 절차를 운영합니다."),
    (scene_s2, 0, "둘째, 매월 회원의 자격을 확인하고 그달에 적용할 멤버십 등급을 확정합니다."),
    (scene_s3, 0, "셋째, 그달의 실제 플랫폼 수익을 기준으로 회원에게 나눌 보상금을 계산합니다."),
    (scene_s3, 1, "예를 들어, 한 달 수익이 100만 테더라면 그중 5%인 5만 테더가 전체 보상금입니다."),
    (scene_s3, 2, "여기서 5%는 플랫폼 수익에서 떼어 놓는 비율입니다. 내가 보유한 PLB에 5%의 수익을 준다는 뜻은 아닙니다."),
    (scene_alloc, 0, "이 보상금은 등급별로 나눕니다. 비기너, 베이직, 엘리트에는 플랫폼 수익의 0.5%씩을 배정합니다."),
    (scene_alloc, 1, "프리미엄에는 플랫폼 수익의 1.5%, 브이아이피에는 2%를 배정합니다. 모두 합하면 5%입니다."),
    (scene_alloc, 2, "여기서 엘리트에 해당되는 분들은 베이직 수익도 함께 드리니, 노력은 1.5배, 수익은 세 배입니다. 참고하시길 바랍니다."),
    (scene_calc, 0, "개인이 받을 금액은 어떻게 계산할까요? 프리미엄 등급을 예로 들어보겠습니다."),
    (scene_calc, 1, "월 수익이 100만 테더라면, 프리미엄에 배정되는 금액은 1.5%인 1만 5천 테더입니다."),
    (scene_calc, 2, "이를 프리미엄 정원 30명으로 나누면, 한 사람당 500테더가 됩니다."),
    (scene_calc, 3, "이 금액은 계산 방법을 보여주는 예시입니다. 실제 보상금은 플랫폼 수익과 회원 자격, 운영 조건에 따라 달라집니다."),
    (scene_pay, 0, "마지막으로, 개인별 지급액이 정해지면 월 1회 회원 지갑으로 보상금을 지급합니다."),
    (scene_pay, 1, "PLB 멤버십은 이렇게 운영됩니다. 참여 조건을 갖춘 회원에게 실제 거래 수수료 수익의 일부를 나누는 구조입니다."),
    (scene_pay, 2, "PLB는 코인 가격 상승만 애타게 기다리는 것이 아니라, 보유 수량에 따라 매달 배당을 받을 수 있으니 즐겁게 기다릴 수 있습니다."),
]


def wrap(text, font, maxw, d):
    lines, cur = [], ""
    for word in text.split(" "):
        t = (cur + " " + word).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur); cur = word
    lines.append(cur)
    return lines


def subtitle(d, text):
    f = F(46, False)
    lines = wrap(text, f, 1640, d)
    h = 70 * len(lines) + 30
    y0 = 1040 - h
    d.rectangle((0, y0 - 10, W, H), fill=(0, 0, 0))
    for i, ln in enumerate(lines):
        d.text((960, y0 + 40 + i * 70), ln, font=f, fill=(255, 255, 255), anchor="mm")


def dur(text):
    n = len(text.replace(" ", ""))
    return max(2.4, n / 5.0 + 0.6)


def ts(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60)
    return f"{int(h):02}:{int(m):02}:{int(s):02},{int((s % 1) * 1000):03}"


def main(out):
    fr = os.path.join(out, "frames"); os.makedirs(fr, exist_ok=True)
    lst, srt, t = [], [], 0.0
    for i, (fn, st, text) in enumerate(CHUNKS, 1):
        im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
        fn(d, st); subtitle(d, text)
        p = os.path.join(fr, f"{i:02}.png"); im.save(p)
        dd = dur(text)
        lst.append(f"file '{p}'\nduration {dd:.2f}")
        srt.append(f"{i}\n{ts(t)} --> {ts(t + dd - 0.1)}\n{text}\n")
        t += dd
    lst.append(f"file '{p}'")
    with open(os.path.join(out, "list.txt"), "w") as f:
        f.write("\n".join(lst))
    with open(os.path.join(out, "plb_membership.srt"), "w", encoding="utf-8") as f:
        f.write("\n".join(srt))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", os.path.join(out, "list.txt"),
                    "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
                    "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "20", "-c:a", "aac",
                    os.path.join(out, "plb_membership.mp4")], check=True)
    print("총 길이(초):", round(t, 1))


if __name__ == "__main__":
    main(sys.argv[1])
