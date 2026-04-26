# DECEPTION: MURDER IN HONG KONG — GAME DESIGN SPEC (Online Version) — v2

> Tài liệu luật chơi chi tiết cho implement online. Cập nhật theo PDF Event cards + cơ chế pha đêm mới.
> Mọi chỗ `[CẦN XÁC NHẬN]` cần chốt trước khi code.

---

## 1. TỔNG QUAN

- **Thể loại**: Social deduction / Hidden role
- **Số người chơi**: 4 – 12
- **Thời lượng**: không giới hạn
- **Thắng phe thiện**: Điều tra viên buộc tội đúng Hung thủ + đúng hung khí + đúng manh mối → săn đúng Nhân chứng (nếu có).
- **Thắng phe ác**: Che giấu hết 3 vòng, hoặc làm Điều tra viên buộc tội nhầm Tòng phạm, hoặc săn đúng Nhân chứng khi Hung thủ bị lộ.

---

## 2. PHÂN BỔ VAI

| Tổng | Pháp y | Hung thủ | Tòng phạm | Nhân chứng | Điều tra viên thường |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 4  | 1 | 1 | 0 | 0 | 2 |
| 5  | 1 | 1 | 0 | 0 | 3 |
| 6  | 1 | 1 | 1 | 1 | 2 |
| 7  | 1 | 1 | 1 | 1 | 3 |
| 8  | 1 | 1 | 1 | 1 | 4 |
| 9  | 1 | 1 | 1 | 1 | 5 |
| 10 | 1 | 1 | 1 | 1 | 6 |
| 11 | 1 | 1 | 1 | 1 | 7 |
| 12 | 1 | 1 | 1 | 1 | 8 |

**Chế độ AI Pháp y**: AI thay Pháp y → số Điều tra viên thường cộng 1.

---

## 3. VAI TRÒ

### 3.1. Pháp y (Forensic Scientist)
- Biết: Hung thủ, Tòng phạm, bộ thật của Hung thủ, bộ của Tòng phạm.
- Im lặng tuyệt đối: disable voice + text chat + emoji suốt ván.
- Chỉ giao tiếp qua đặt / dời marker trên Scene Tiles.
- Marker dựa trên **bộ thật của Hung thủ**, KHÔNG dựa trên bộ Tòng phạm.

### 3.2. Hung thủ (Murderer) — phe ác
- Chọn 1 Means + 1 Clue từ tay mình → **bộ thật**.
- Biết đầy đủ về Tòng phạm (danh tính + bộ bài).
- Trao đổi với Tòng phạm trong pha đêm qua private channel.

### 3.3. Tòng phạm (Accomplice) — phe ác (chỉ khi ≥6 người)
- Biết đầy đủ về Hung thủ (danh tính + bộ bài).
- Chọn 1 Means + 1 Clue từ tay mình → **bộ mồi nhử**.
- Bị buộc tội trúng → phe ác thắng ngay.

### 3.4. Nhân chứng (Witness) — phe thiện (chỉ khi ≥6 người)
- Thấy danh tính Hung thủ + Tòng phạm trong pha đêm.
- KHÔNG biết bộ bài nào là thật.
- Là mục tiêu Witness Hunt khi Hung thủ bị lộ.

### 3.5. Điều tra viên thường (Investigator)
- Không biết gì ngoài gợi ý công khai.

---

## 4. COMPONENTS

### 4.1. Thẻ Means (Hung khí) — xanh
- Deck tổng: `[CẦN XÁC NHẬN, đề xuất 48]`. Chia 4/người cho mọi Điều tra viên.

### 4.2. Thẻ Clue (Manh mối) — đỏ
- Deck tổng: `[CẦN XÁC NHẬN, đề xuất 48]`. Chia 4/người.

### 4.3. Scene Tiles — 3 loại

| Loại | Ví dụ tiêu đề | Vai trò trong ván |
|---|---|---|
| **Location tile** (địa điểm) | "Nơi xảy ra án" | 1 slot cố định, chỉ bỏ được bằng Event #2 hoặc #6 |
| **Cause tile** (nguyên nhân) | "Nguyên nhân tử vong" | 1 slot cố định |
| **Clue tile** (gợi ý) | "Dấu vết", "Giờ gây án", "Sở thích nạn nhân"... | 4 slots, bị thay ở vòng 2/3 |

Mỗi tile có tiêu đề + 4 lựa chọn, Pháp y đặt marker lên 1 lựa chọn.

Deck tile: `[CẦN XÁC NHẬN, đề xuất 30 loc + 30 cause + 60 clue]`.

### 4.4. Event Cards (6 lá)
- Xáo **chung vào deck Clue tile** (không xáo với location/cause).
- Chỉ active ở vòng 2/3 khi Pháp y rút thay thế.
- Rút trúng → thực hiện action → loại event khỏi deck.
- Chi tiết: §8.4.

---

## 5. LUỒNG GAME (STATE MACHINE)

```
LOBBY
  └─> ROLE_ASSIGN
        └─> NIGHT_PHASE
              └─> ROUND_1_INVESTIGATION
                    ├─> ACCUSATION (bất kỳ lúc nào)
                    │     ├─> CORRECT → WITNESS_HUNT (nếu có NC) / GAME_END
                    │     └─> WRONG → continue
                    └─> ROUND_2_INVESTIGATION
                          └─> ROUND_3_INVESTIGATION
                                └─> GAME_END (phe ác thắng nếu chưa ai đoán đúng)
```

---

## 6. PHA SETUP

1. Random vai theo bảng §2.
2. Nếu AI Pháp y mode: AI nhận vai Pháp y.
3. Chia bài: mỗi Điều tra viên nhận 4 Means + 4 Clue random.
4. Rút Scene Tiles vòng 1:
   - 1 Location (random từ pool location)
   - 1 Cause (random từ pool cause)
   - 4 Clue tiles (random từ pool clue đã xáo với 6 Event cards). Nếu rút trúng Event ở bước này → trả lại, rút lại (Event chỉ active vòng 2/3).
5. Phát 1 huy hiệu (accusation token) cho mỗi Điều tra viên.

---

## 7. PHA ĐÊM

### 7.1. Chế độ 4-5 người (không có Tòng phạm + Nhân chứng)

1. Tất cả nhắm mắt.
2. Hung thủ mở mắt, chọn 1 Means + 1 Clue từ tay → bộ thật.
3. Hung thủ nhắm mắt.
4. Pháp y mở mắt, ghi nhận bộ thật.
5. Pháp y nhắm mắt. Tất cả mở mắt.

### 7.2. Chế độ ≥6 người (có Tòng phạm + Nhân chứng)

1. Tất cả nhắm mắt.
2. **Hung thủ + Tòng phạm cùng mở mắt đồng thời.**
3. UI hiển thị: danh tính đối phương + **bài của đối phương (4 Means + 4 Clue)**.
4. Mở private channel Hung thủ ↔ Tòng phạm (voice + text) để thảo luận.
   - Timer: 5 phút.
5. Mỗi người chọn 1 Means + 1 Clue từ tay mình:
   - Hung thủ → **bộ thật**
   - Tòng phạm → **bộ mồi nhử**
6. Cả hai confirm → nhắm mắt, UI đánh dấu "đang giơ tay".
7. **Nhân chứng mở mắt** → UI highlight 2 người đang giơ tay. KHÔNG thấy bài.
8. Nhân chứng nhắm mắt.
9. **Pháp y mở mắt** → UI hiển thị toàn bộ info (2 người ác + 2 bộ bài).
10. Pháp y nhắm mắt. Tất cả mở mắt. → INVESTIGATION.

**Timeouts**: thảo luận 60s, chọn bài 30s (auto random nếu hết giờ).

---

## 8. PHA ĐIỀU TRA — 3 VÒNG

### 8.1. Vòng 1
- Pháp y đặt marker lên 1 option/tile cho cả 6 tiles, dựa trên bộ thật.
- Marker tiết lộ công khai khi Pháp y confirm.
- Pha thảo luận: `[CẦN XÁC NHẬN, đề xuất 4 phút]`.
- Pháp y im lặng. Điều tra viên thảo luận công khai.
- Buộc tội có thể xảy ra bất kỳ lúc nào (xem §9).

### 8.2. Vòng 2 & Vòng 3

Đầu vòng: Pháp y **rút 1 thẻ từ deck Clue tile (đã xáo với Event cards)**:

- **Rút trúng Clue tile**: chọn 1 Clue tile đang trên bàn để thay thế (không được thay Location/Cause). Đặt marker lên tile mới. **Có thể** dời marker các tile khác (tùy chọn).
- **Rút trúng Event card**: thực hiện action của event (§8.4), loại event khỏi deck. **Không thay tile**.

Sau xử lý → pha thảo luận: vòng 2 đề xuất 3 phút, vòng 3 đề xuất 2 phút.

### 8.3. Kết thúc sau vòng 3
Qua hết vòng 3 chưa ai đoán đúng → **phe ác thắng**.

### 8.4. Chi tiết 6 Event Cards

#### Event #1 — COUNTDOWN (Đếm ngược)
- **Action**: Pháp y rút 2 Scene Tiles mới, thay cho 2 tile BẤT KỲ trên bàn.
- **Hệ quả**: Game kết thúc ngay sau pha thảo luận hiện tại (skip vòng còn lại).
- **Logic**:
  ```
  draw 2 new tiles (any category)
  replace 2 arbitrary tiles on board
  forensic adjusts markers
  after current discussion ends: game_end()
  ```

#### Event #2 — SECRET TESTIMONY (Lời khai bí mật)
- **Điều kiện**: chỉ có tác dụng khi có Nhân chứng.
- **Action**: Nhân chứng chọn 1 tile BẤT KỲ (bao gồm Location — đây là cách DUY NHẤT bỏ Location tile) để vứt. Pháp y rút tile mới cùng loại thay.
- **Logic**:
  ```
  witness.choose_tile_to_discard()   # private, không lộ danh tính
  draw new tile same category
  forensic places marker
  ```
- UI: Nhân chứng chọn riêng, người khác chỉ thấy tile đổi, không biết ai chỉ định.

#### Event #3 — ERRONEOUS INFORMATION (Thông tin sai lệch)
- **Action**: Pháp y chọn 1 tile đang trên bàn, **bắt buộc** dời marker sang lựa chọn khác trên cùng tile (không được giữ nguyên).
- **Logic**:
  ```
  forensic selects tile
  forensic moves marker (enforce: new_option != current)
  ```

#### Event #4 — RULED OUT EVIDENCE (Loại trừ vật chứng)
- **Action**: Mỗi người (trừ Pháp y) lật úp 1 thẻ Clue của mình → loại khỏi vòng nghi vấn.
- **Ràng buộc**: Hung thủ **KHÔNG được úp thẻ Clue thật của mình** — hệ thống disable nút đó.
  - `[CẦN XÁC NHẬN]`: Tòng phạm có được úp thẻ Clue mồi nhử của mình không? Đề xuất: **được** (để tránh lộ).
- **Đồng thời**: tất cả chọn cùng lúc, không thảo luận, timer 30s.
- **Logic**:
  ```
  for each investigator simultaneously:
    show own clues (murderer cannot select true_clue button)
    select clue to flip (timer 30s)
  reveal all simultaneously
  flipped clues marked as excluded from accusation
  ```

#### Event #5 — A GOOD TWIST (Bước ngoặt bất ngờ)
- **Điều kiện**: Lobby có lịch sử ván trước VÀ ván trước có người buộc tội đúng.
- **Action (nếu áp dụng liên ván trong lobby)**: Người đã đoán đúng ván gần nhất được tặng 1 lượt buộc tội miễn phí (không tốn huy hiệu).
- **Fallback**: Không đủ điều kiện → loại event, Pháp y rút tile khác.
- `[CẦN XÁC NHẬN]`: (a) áp dụng liên ván trong lobby / (b) bỏ event #5 trong online

#### Event #6 — A USEFUL CLUE (Manh mối hữu ích)
- **Action**: Pháp y rút 5 tile mới, xem hết, chọn 1 (không được là event) để thay cho 1 tile bất kỳ trên bàn. 4 tile còn lại shuffle về deck.
- **Logic**:
  ```
  draw_5 = deck.draw(5)
  valid = [t for t in draw_5 if not is_event(t)]
  forensic picks one from valid
  forensic chooses tile on board to replace (any category)
  shuffle remaining 4 back to deck
  ```

---

## 9. BUỘC TỘI (ACCUSATION)

### 9.1. Huy hiệu
- Mỗi Điều tra viên có **1 huy hiệu** cả ván.
- Buộc tội = tiêu 1 huy hiệu.
- Event #5 có thể cấp huy hiệu bonus (không tốn slot chính).

### 9.2. Thao tác
Chọn 3 thứ: 1 người chơi + 1 thẻ Clue từ tay target + 1 thẻ Means từ tay target.

### 9.3. Resolve logic

```python
def resolve_accusation(accuser, target, clue_card, means_card):
    # CASE 1: Trúng Tòng phạm → phe ác thắng ngay
    if target.role == "ACCOMPLICE":
        return EVIL_WINS_ACCOMPLICE_FRAMED

    # CASE 2: Trúng Hung thủ + đúng cả 2 thẻ
    if (target.role == "MURDERER"
        and clue_card == murderer.true_clue
        and means_card == murderer.true_means):
        if game.has_witness:
            return TRIGGER_WITNESS_HUNT
        else:
            return GOOD_WINS

    # CASE 3: Còn lại (sai người / đúng người sai thẻ / trúng witness / trúng investigator thường)
    accuser.badge -= 1
    if all_investigators_out_of_badges():
        return EVIL_WINS_NO_BADGES_LEFT
    return CONTINUE_GAME
```

### 9.4. Sau khi hết huy hiệu
Vẫn thảo luận, tư vấn được. Pháp y vẫn im lặng.

---

## 10. WITNESS HUNT (PHA SĂN NHÂN CHỨNG)

### 10.1. Kích hoạt
Điều tra viên buộc tội đúng Hung thủ + đúng cả 2 thẻ VÀ ván có Nhân chứng (≥6 người).

### 10.2. Cơ chế (timer 5 phút)
- Private channel Hung thủ ↔ Tòng phạm: voice + text.
- Hung thủ xem lại toàn bộ public chat log.
- Những người khác (Pháp y, Nhân chứng, Điều tra viên còn lại): **disable voice + chat**, chỉ thấy timer + UI.

### 10.3. Quyết định
- **Chỉ Hung thủ** bấm nút chọn mục tiêu.
- Tòng phạm chỉ tư vấn, không có nút bấm.
- Danh sách target: toàn bộ người chơi TRỪ Hung thủ, Pháp y, Tòng phạm.
- Chọn 1 lần duy nhất, không sửa.
- Hết 5 phút chưa chọn → tự tính sai.

### 10.4. Kết quả
- Trúng NC → phe ác thắng (comeback).
- Sai → phe thiện thắng.

---

## 11. BẢNG ĐIỀU KIỆN KẾT THÚC

| # | Điều kiện | Kết quả |
|:---:|:---|:---:|
| 1 | Buộc tội đúng, không có NC (4-5 người) | **THIỆN** |
| 2 | Buộc tội đúng + săn đúng NC | **ÁC** (comeback) |
| 3 | Buộc tội đúng + săn sai NC | **THIỆN** |
| 4 | Buộc tội trúng Tòng phạm | **ÁC** |
| 5 | Tất cả hết huy hiệu | **ÁC** |
| 6 | Hết vòng 3 không ai đoán đúng | **ÁC** |
| 7 | Event #1 trigger → kết thúc sớm, không ai đoán đúng | **ÁC** |

---

## 12. HAI CHẾ ĐỘ PHÁP Y

### 12.1. Human Pháp y
- Lobby flag chọn mode.
- Random 1 người làm Pháp y (hoặc volunteer).
- Client Pháp y: mute mic + disable chat + UI đặt marker riêng.
- Timer Pháp y ra quyết định: `[CẦN XÁC NHẬN, đề xuất 60s/vòng]`.

### 12.2. AI Pháp y
- Không có slot Pháp y.
- AI input: bộ thật (2 thẻ) + 6 Scene Tiles (mỗi tile 4 options) + pool Event.
- AI output: option chọn cho mỗi tile + xử lý event tự động.
- **Implementation**:
  - Option A: Mapping thủ công (keywords + match score)
  - Option B: LLM structured output (đề xuất — bạn đã có Anthropic API)
  - Option C: Embedding cosine similarity

---

## 13. DATA MODEL (schema đề xuất)

```typescript
type Role = 'FORENSIC' | 'MURDERER' | 'ACCOMPLICE' | 'WITNESS' | 'INVESTIGATOR'

interface Player {
  id: string
  name: string
  role: Role
  hand: {
    means: MeansCard[]       // 4 thẻ
    clues: ClueCard[]        // 4 thẻ
    flippedClues: string[]   // id đã bị úp (Event #4)
  }
  trueMeans?: string         // chỉ set cho MURDERER / ACCOMPLICE
  trueClue?: string
  badges: number             // bắt đầu 1
  extraBadges: number        // từ Event #5
}

interface Game {
  id: string
  mode: 'HUMAN_FORENSIC' | 'AI_FORENSIC'
  players: Player[]
  currentRound: 1 | 2 | 3
  state: GameState
  sceneTiles: {
    location: SceneTile
    cause: SceneTile
    clues: SceneTile[]       // length = 4
  }
  markers: Record<string, number>   // tileId -> optionIndex
  tileDeck: SceneTile[]             // clue pool + events
  eventsUsed: EventType[]
  countdownTriggered: boolean       // Event #1
  publicChatLog: ChatMessage[]
  accusations: Accusation[]
  witnessHunt?: {
    triggeredBy: string             // accuser id
    deadline: timestamp
    targetChoice?: string           // player id
  }
}

type GameState =
  | 'LOBBY'
  | 'ROLE_ASSIGN'
  | 'NIGHT_EVIL_DISCUSS'
  | 'NIGHT_EVIL_CHOOSE_CARDS'
  | 'NIGHT_WITNESS_REVEAL'
  | 'NIGHT_FORENSIC_REVEAL'
  | 'INVESTIGATION_ROUND_1'
  | 'INVESTIGATION_ROUND_2'
  | 'INVESTIGATION_ROUND_3'
  | 'EVENT_RESOLVING'
  | 'ACCUSATION_RESOLVING'
  | 'WITNESS_HUNT'
  | 'GAME_END'
```

---

## 14. CHỐT TRƯỚC KHI CODE

| # | Câu hỏi | Đề xuất mặc định |
|:---:|:---|:---|
| 1 | Số thẻ Means / Clue / Location / Cause / Clue tile | 48 / 48 / 30 / 30 / 60 |
| 2 | Timer pha đêm: thảo luận / chọn bài | 60s / 30s |
| 3 | Timer thảo luận vòng 1 / 2 / 3 | 4p / 3p / 2p |
| 4 | Timer Pháp y đặt marker mỗi vòng | 60s |
| 5 | Event #5 áp dụng sao trong online? | (a) liên ván cùng lobby |
| 6 | Tòng phạm có được úp Clue mồi khi Event #4 kích hoạt? | Có |
| 7 | Disconnect xử lý | Bot take over, 3p timeout trước khi forfeit |
| 8 | Matchmaking: private room / public | Cả hai |
| 9 | AI Pháp y method A/B/C? | B (LLM structured output) |
| 10 | Observer mode cho người xem? | Có |

---

## 15. STACK KHUYẾN NGHỊ

- **Real-time**: Supabase Realtime (đã có connector) hoặc Socket.io
- **State**: server-authoritative, client chỉ nhận delta
- **Info hiding**: role & card info chỉ gửi cho client có quyền (anti-cheat)
- **Voice**: WebRTC via LiveKit hoặc Agora (cần cho pha đêm + Witness Hunt private channel)
- **DB**: Postgres (Supabase) với schema §13
- **AI Pháp y**: Anthropic API — prompt structured JSON output