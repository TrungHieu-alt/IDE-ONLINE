# Edge Case Analysis - Focused
## Online Code Editor Platform

**Phiên bản:** 2.0 (Condensed)  
**Ngày:** Tháng 3 năm 2025  
**Tổng số edge case:** 15 quan trọng nhất

---

## 📊 BẢNG TÓM TẮT (All Edge Cases)

| # | Tên Edge Case | Nhóm | Severity | Ảnh Hưởng | Giải Pháp |
|---|---------------|------|----------|-----------|-----------|
| 1 | Output có thừa whitespace | Execution | 🟡 HIGH | WA sai (42 vs 42 ) | Trim before compare |
| 2 | Floating point precision | Execution | 🔴 CRITICAL | WA sai (0.3333 vs 0.3334) | Epsilon compare 1e-6 |
| 3 | Output quá dài (>100MB) | Execution | 🔴 CRITICAL | Crash, timeout | Limit output size |
| 4 | Timeout boundary (9.9s vs 10.1s) | Execution | 🟡 HIGH | Công bằng điểm | Verify chính xác 10s |
| 5 | Realtime event out-of-order | Realtime | 🔴 CRITICAL | Viewer thấy sai code | Version-based ordering |
| 6 | Duplicate event | Realtime | 🔴 CRITICAL | Code duplicate | Dedup by event ID |
| 7 | Out-of-sync (checksum ≠) | Realtime | 🟡 HIGH | Inconsistent | Checksum verify + resync |
| 8 | Network disconnect 30s | Realtime | 🟡 HIGH | Loss updates | Queue + full snapshot |
| 9 | Concurrent submit (click 5x) | Database | 🔴 CRITICAL | Stats sai (1 thay vì 5) | Atomic transaction |
| 10 | Judge0 callback race | Database | 🔴 CRITICAL | Duplicate/loss result | Idempotent handler |
| 11 | JWT signature tampered | Auth | 🔴 CRITICAL | Auth bypass | Verify signature |
| 12 | Viewer try to edit | Realtime | 🔴 CRITICAL | Security breach | Role check in backend |
| 13 | Email verification link expired | Registration | 🟡 HIGH | Resend needed | 24h token + resend button |
| 14 | Role change at runtime | Auth | 🟡 HIGH | Inconsistent | Check DB not just JWT |
| 15 | Soft delete user → history | Database | 🟡 HIGH | Orphan data | Define clear policy |

---

## 🔴 CRITICAL (6) - MUST TEST

1. **#2: Floating Point Precision** → Physics/Math problem
2. **#3: Output Quá Dài** → System crash
3. **#5: Event Out-of-Order** → Realtime core feature
4. **#6: Duplicate Event** → Data corruption
5. **#9: Concurrent Submit Race** → Data inconsistency
6. **#10: Judge0 Callback Race** → Duplicate/lost submission
7. **#11: JWT Tampered** → Security breach
8. **#12: Viewer Edit No Perm** → Security breach

---

## 🟡 HIGH (7) - SHOULD TEST

1. **#1: Output Whitespace** → Wrong Answer incorrect
2. **#4: Timeout Boundary** → Fairness in grading
3. **#7: Out-of-Sync** → Realtime consistency
4. **#8: Network Disconnect** → Reliability
5. **#13: Email Link Expired** → Registration flow
6. **#14: Role Change Runtime** → Permission consistency
7. **#15: Soft Delete User** → Data policy

---

## 🎯 PHẦN DETAIL: 15 Edge Cases

---

## EXECUTION & JUDGE0 (4 cases)

### 1. Output có thừa whitespace
**Vấn đề:** Expected "42", code output "42 " (thừa space)

```python
# Code
print(42)  # Output: "42\n"

# Expected: "42"
# Actual: "42 \n" (thừa space)
# Result: WA ❌ (sai, nhưng không công bằng)
```

**Giải pháp:**
```javascript
function normalizeOutput(output) {
  return output.trim().replace(/\s+/g, ' ');
}
expect(normalizeOutput("42 \n")).toBe("42");
```

**Severity:** 🟡 HIGH

---

### 2. Floating point precision (CRITICAL)
**Vấn đề:** So sánh số thực có sai số

```python
# Physics problem: calculate 1/3
# Expected: 0.3333333333333333
# Code output: 0.3333333334
# Result: WA ❌ (nhưng cơ bản đúng)
```

**Giải pháp:**
```javascript
function floatCompare(a, b, epsilon = 1e-6) {
  return Math.abs(a - b) < epsilon;
}
// Test
expect(floatCompare(0.3333333334, 0.3333333333)).toBe(true);
```

**Severity:** 🔴 CRITICAL (bài khoa học không test sẽ fail)

---

### 3. Output quá dài (CRITICAL)
**Vấn đề:** Code in 1GB output → crash hệ thống

```python
for i in range(100000000):
    print(i)  # Print 100 triệu dòng = GB size
```

**Giải pháp:**
```javascript
const MAX_OUTPUT = 10 * 1024 * 1024;  // 10MB
if (stdout.length > MAX_OUTPUT) {
  return { status: "RE", message: "Output quá lớn" };
}
```

**Test:**
```javascript
const hugeCode = 'for i in range(1000000): print(i)';
const result = await submitCode(hugeCode);
expect(result.status).toBe("RE");
```

**Severity:** 🔴 CRITICAL

---

### 4. Timeout boundary
**Vấn đề:** Code 9.9s accept, 10.1s TLE → công bằng?

```javascript
// Config: timeout = 10 seconds
Code A: 9.9s → Accepted ✅
Code B: 10.1s → TLE ❌

// Test: verify boundary chính xác
```

**Giải pháp:**
```javascript
// Config Judge0
const timeLimit = 10000;  // millisecond, chính xác

// Test: code chạy đúng 10s should pass
```

**Severity:** 🟡 HIGH

---

## REALTIME COLLABORATION (4 cases)

### 5. Event out-of-order (CRITICAL)
**Vấn đề:** 3 event gửi A→B→C nhưng nhận C→A→B → sai

```
Coder type:
  1. "def " (v=1, t=0ms)
  2. "hello" (v=2, t=100ms)
  3. "():" (v=3, t=200ms)

Network delay → arrive: C, A, B

Without fix: viewer see "():def hello():" ❌
With fix: viewer see "def hello():" ✅
```

**Giải pháp:**
```javascript
// Version-based ordering
let lastVersion = 0;
function applyEvent(event) {
  if (event.version <= lastVersion) {
    return;  // Discard old
  }
  lastVersion = event.version;
  updateCode(event.code);
}
```

**Test:**
```javascript
const events = [
  { v: 3, code: "():" },
  { v: 1, code: "def " },
  { v: 2, code: "hello" }
];
events.forEach(e => applyEvent(e));
expect(finalCode).toBe("def hello():");
```

**Severity:** 🔴 CRITICAL

---

### 6. Duplicate event (CRITICAL)
**Vấn đề:** Event gửi 2 lần → apply 2 lần → code duplicate

```
Event A: { id: "uuid1", code: "x = 5" }
Gửi lần 1 ✅
Network fail, retry:
Gửi lần 2 ✅ (duplicate!)

Viewer: code = "x = 5x = 5" ❌
```

**Giải pháp:**
```javascript
// Dedup by event ID
const eventSet = new Set();

function applyEvent(event) {
  if (eventSet.has(event.id)) {
    return;  // Already applied
  }
  eventSet.add(event.id);
  updateCode(event.code);
}
```

**Test:**
```javascript
const event = { id: "uuid1", code: "x = 5" };
applyEvent(event);  // Apply
applyEvent(event);  // Apply again → skip
expect(code).toBe("x = 5");  // Not duplicate
```

**Severity:** 🔴 CRITICAL

---

### 7. Out-of-sync (checksum mismatch)
**Vấn đề:** Client code ≠ server code → reset

```
Coder local: "abc"
Server state: "abd" (miss 1 event)

Client checksum: hash("abc") = 0xabc
Server checksum: hash("abd") = 0xabd
→ Mismatch! Request full snapshot
```

**Giải pháp:**
```javascript
// Client: checksum mỗi 10s
setInterval(async () => {
  const localChecksum = hash(localCode);
  const serverChecksum = await api.getChecksum();
  
  if (localChecksum !== serverChecksum) {
    const fullCode = await api.getFullSnapshot();
    localCode = fullCode;  // Reset
  }
}, 10000);
```

**Test:**
```javascript
// Simulate mismatch
clientChecksum = hash("abc");
serverChecksum = hash("abd");
expect(clientChecksum).not.toBe(serverChecksum);
// Trigger resync → code update to "abd"
```

**Severity:** 🟡 HIGH

---

### 8. Network disconnect & reconnect
**Vấn đề:** Viewer mất mạng 30s → reconnect → cần gì?

```
Viewer connected: t=0
Viewer disconnect: t=10s
Server queue events 10-40s: 30 events
Viewer reconnect: t=40s
→ Send 30 events or full snapshot?
```

**Giải pháp:**
```javascript
const MAX_QUEUE = 100;

// Viewer disconnect
clearConnection();

// Server queue events
queueEvent(event);  // max 100

// Viewer reconnect
if (missedEvents < MAX_QUEUE) {
  sendMissedEvents();  // Send all 30
} else {
  sendFullSnapshot();  // Send full code
}
```

**Test:**
```javascript
// Disconnect 30s, miss 50 events
const missedCount = 50;
if (missedCount < 100) {
  await viewer.waitForMissedEvents(50);
  expect(viewer.code).toBe(expectedCode);
}
```

**Severity:** 🟡 HIGH

---

## DATABASE & CONCURRENCY (2 cases)

### 9. Concurrent submit race (CRITICAL)
**Vấn đề:** User click Run 5 lần nhanh → stats sai

```
User click Run (5x) → 5 request cùng lúc
→ 5 INSERT submission
→ 5 UPDATE user.total_submit
→ Race condition: total_submit = 1 (thay vì 5)
```

**Giải pháp:**
```sql
-- GOOD: Atomic transaction
BEGIN;
  INSERT INTO submissions (user_id, code, status)
  VALUES (1, '...', 'PENDING');
  
  UPDATE users SET total_submit = total_submit + 1
  WHERE id = 1;
COMMIT;

-- All or nothing
```

**Test:**
```javascript
const promises = Array(5).fill(null).map(() => submitCode());
await Promise.all(promises);

const user = await db.users.findOne(userId);
expect(user.total_submit).toBe(5);  // Not 1
```

**Severity:** 🔴 CRITICAL

---

### 10. Judge0 callback race (CRITICAL)
**Vấn đề:** Callback arrive trước DB insert hoàn tất → duplicate?

```
Thread 1: INSERT INTO submissions (status='PENDING')
  - Halfway through

Thread 2 (callback): SELECT submission (NOT FOUND!)
  - Insert duplicate? Or fail?

Thread 1: Finish insert → submission.id = 123
Thread 2: Insert → submission.id = 124 ❌ DUPLICATE!
```

**Giải pháp:**
```javascript
// Callback handler: check submission exists
async function handleCallback(token, result) {
  let submission = await db.submissions.findOne({ token });
  
  if (!submission) {
    // Not exist yet, queue for retry
    await queue.push({ token, result });
    return;
  }
  
  // Update existing
  submission.status = result.status;
  submission.stdout = result.stdout;
  await submission.save();
}
```

**Test:**
```javascript
// Simulate callback race
const submitPromise = submitCode();
const callbackPromise = judgeCallback({ token, result });

await Promise.all([submitPromise, callbackPromise]);

// Verify: only 1 submission exists
const count = await db.submissions.count();
expect(count).toBe(1);
```

**Severity:** 🔴 CRITICAL

---

## AUTHENTICATION & RBAC (3 cases)

### 11. JWT signature tampered (CRITICAL)
**Vấn đề:** User modify JWT → signature mismatch → reject

```
Original JWT: eyJhbGc...abc123
User modify role: "Coder" → "Admin"
→ New JWT: eyJhbGc...xyz789
→ Signature invalid (không match secret)
→ Return 401
```

**Giải pháp:**
```javascript
// Always verify JWT signature
try {
  const decoded = jwt.verify(token, secret);
  // If success → token valid
} catch (err) {
  // Signature invalid → 401
  return res.status(401).json({ error: "Invalid token" });
}
```

**Test:**
```javascript
const token = jwt.sign({ user_id: 1, role: "Coder" }, secret);
const tampered = token.slice(0, -5) + "xxxxx";

expect(() => jwt.verify(tampered, secret)).toThrow();
```

**Severity:** 🔴 CRITICAL

---

### 12. Viewer try to edit (CRITICAL)
**Vấn đề:** Viewer gửi edit event → backend allow? → breach

```
Viewer: { role: "Viewer", socket connected }
Try emit: { action: "edit", code: "..." }
→ Backend: allow or reject?
→ If allow → viewer modified code ❌ BREACH!
```

**Giải pháp:**
```javascript
// Backend: check role before allow edit
socket.on("edit", (event) => {
  const user = getUser(socket.id);
  
  if (user.role !== "Coder") {
    socket.emit("error", { message: "Unauthorized" });
    return;
  }
  
  // Allow only Coder
  broadcastUpdate(event);
});
```

**Test:**
```javascript
const viewer = { role: "Viewer" };
socket.emit("edit", { code: "..." });
// Should receive error, not apply
expect(viewerSocket.hasError()).toBe(true);
```

**Severity:** 🔴 CRITICAL

---

### 14. Role change at runtime
**Vấn đề:** Admin downgrade role → old JWT still admin

```
User JWT: { user_id: 5, role: "Admin" }
Admin: UPDATE users SET role='Viewer' WHERE id=5

User with old JWT:
→ Try create question
→ JWT says "Admin" ✅
→ But DB has role = "Viewer" ❌
→ Inconsistent!
```

**Giải pháp:**
```javascript
// Check role từ DB, not just JWT
async function canCreateQuestion(userId) {
  const user = await db.users.findOne(userId);
  return user.role === "Admin";
}
```

**Test:**
```javascript
// Before: Admin can create question
await user.createQuestion({ ... });

// Admin downgrade
await admin.updateRole(userId, "Viewer");

// After: should fail even with old JWT
expect(async () => await user.createQuestion({ ... })).rejects();
```

**Severity:** 🟡 HIGH

---

## REGISTRATION (1 case)

### 13. Email verification link expired
**Vấn đề:** User register → link sau 24h → expired

```
Register: t=0, send link (exp = 24h)
User click link: t=25h
→ Token expired
→ Server: "Link hết hạn"
→ User: resend email
```

**Giải pháp:**
```javascript
// Token: 24 hour expiration
const token = jwt.sign(
  { email, type: "verify" },
  secret,
  { expiresIn: '24h' }
);

// Verify endpoint
app.get('/verify/:token', (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, secret);
    // Valid, activate account
  } catch (err) {
    // Expired → error
    return res.json({ error: "Link expired" });
  }
});
```

**Test:**
```javascript
const token = generateVerifyToken(24 * 60 * 60);  // 24h
await sleep(25 * 60 * 60 * 1000);  // Wait 25h
const result = await verify(token);
expect(result.error).toBe("Link expired");
```

**Severity:** 🟡 HIGH

---

## GENERAL DATA (1 case)

### 15. Soft delete user → history orphan
**Vấn đề:** Delete user → old submissions orphan atau hidden?

```
User: id=1, deleted_at=null
User submit: submission.user_id=1

Admin soft delete: UPDATE users SET deleted_at=NOW()

Query submissions:
- Direct query: SELECT * FROM submissions WHERE user_id=1 → Found ✅
- With join: SELECT * FROM users JOIN submissions
  WHERE users.deleted_at IS NULL → User hidden, submission orphan ❌
```

**Giải pháp:**
```javascript
// Define policy clearly:
// Option A: Hide submissions of deleted user
// Option B: Keep submissions under "Deleted User" account

// Option A (recommend)
async function getUserSubmissions(userId) {
  const submissions = await db.submissions.find({ user_id: userId });
  const user = await db.users.findOne(userId);
  
  // Filter if user deleted
  if (user.deleted_at) {
    return [];  // Hide
  }
  
  return submissions;
}
```

**Test:**
```javascript
// Before delete
const subs = await getSubmissions(userId);
expect(subs.length).toBe(5);

// Admin delete
await deleteUser(userId);

// After delete
const subsAfter = await getSubmissions(userId);
expect(subsAfter.length).toBe(0);  // Or keep, define behavior
```

**Severity:** 🟡 HIGH


---
