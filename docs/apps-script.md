# Google Apps Script — full code

Paste this **entire file** into your Apps Script project (replacing whatever's there), then **Deploy → Manage deployments → ⚙ → New version → Deploy**.

```javascript
// Constants — change these
const SHEET_NAME = "Sheet1";
const READ_SECRET = "REPLACE-WITH-A-LONG-RANDOM-STRING"; // must match PORTEA_LEADS_READ_SECRET on Vercel

// Sheet header row (A1:U1). If you change order here, also update HEADERS in
// /src/app/api/v1/admin/leads.csv/route.ts.
const HEADERS = [
  "received_at",
  "kind",
  "vertical",
  "full_name",
  "phone",
  "city",
  "elder_name",
  "condition",
  "needs",
  "relationship",
  "ab_variant",
  "status",
  "care_manager",
  "follow_up_date",
  "notes",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "referrer",
  "landing_path",
];

// ---------- POST: write lead OR update lead ----------
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const body = JSON.parse(e.postData.contents);

    // Branch: status / CM update
    if (body.action === "update_lead") {
      if (body.secret !== READ_SECRET) {
        return _json({ ok: false, error: "unauthorized" });
      }
      const found = _findRow(body.received_at, body.phone);
      if (!found) return _json({ ok: false, error: "lead not found" });
      const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
      const row = found.row;

      if (body.status) _setByHeader(sheet, row, "status", body.status);
      if (body.care_manager) _setByHeader(sheet, row, "care_manager", body.care_manager);
      if (body.follow_up_date) _setByHeader(sheet, row, "follow_up_date", body.follow_up_date);

      // Append note to the notes column with a timestamp.
      if (body.note && String(body.note).trim()) {
        const noteCol = _headerIndex("notes");
        if (noteCol > 0) {
          const existing = sheet.getRange(row, noteCol).getValue() || "";
          const stamped = new Date().toISOString().slice(0, 16).replace("T", " ");
          const next = existing
            ? existing + "\n[" + stamped + "] " + body.note
            : "[" + stamped + "] " + body.note;
          sheet.getRange(row, noteCol).setValue(next);
        }
      }

      return _json({ ok: true });
    }

    // Default branch: new lead from the landing page
    const a = body.attribution || {};
    const rowData = [
      body.created_at || new Date().toISOString(),
      body.kind || "",
      body.vertical || "",
      body.full_name || "",
      body.phone || "",
      body.city || "",
      body.elder_name || "",
      body.condition || "",
      body.needs || "",
      body.relationship || "",
      body.ab_variant || "",
      body.status || "new",     // status defaults to "new"
      "",                       // care_manager
      "",                       // follow_up_date
      "",                       // notes
      a.utm_source || "",
      a.utm_medium || "",
      a.utm_campaign || "",
      a.utm_term || "",
      a.utm_content || "",
      a.gclid || "",
      a.fbclid || "",
      a.referrer || "",
      a.landing_path || "",
    ];
    SpreadsheetApp.getActive().getSheetByName(SHEET_NAME).appendRow(rowData);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// ---------- GET: read leads for /admin dashboard ----------
function doGet(e) {
  const provided = (e && e.parameter && e.parameter.secret) || "";
  if (provided !== READ_SECRET) {
    return _json({ ok: false, error: "unauthorized" });
  }
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return _json({ ok: true, rows: [] });
  const headers = values[0];
  const rows = values.slice(1).map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  });
  rows.reverse();
  const limit = parseInt((e.parameter && e.parameter.limit) || "500", 10);
  return _json({ ok: true, rows: rows.slice(0, limit) });
}

// ---------- helpers ----------
function _json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function _headerIndex(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === name) return i + 1;
  }
  return -1;
}

function _setByHeader(sheet, row, name, value) {
  const col = _headerIndex(name);
  if (col > 0) sheet.getRange(row, col).setValue(value);
}

function _findRow(receivedAtIso, phone) {
  if (!receivedAtIso && !phone) return null;
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return null;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const idxReceived = headers.indexOf("received_at");
  const idxPhone = headers.indexOf("phone");
  if (idxReceived < 0 || idxPhone < 0) return null;
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  const targetMs = receivedAtIso ? new Date(receivedAtIso).getTime() : NaN;

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const rowReceived = row[idxReceived];
    let rowMs = NaN;
    if (rowReceived instanceof Date) rowMs = rowReceived.getTime();
    else if (rowReceived) rowMs = new Date(rowReceived).getTime();

    const phoneMatch = phone && String(row[idxPhone]).replace(/\D/g, "") === String(phone).replace(/\D/g, "");
    const timeMatch = !isNaN(rowMs) && !isNaN(targetMs) && Math.abs(rowMs - targetMs) < 60_000;
    // Match if both phone and time line up; phone alone if we don't have time.
    if (phoneMatch && (timeMatch || isNaN(targetMs))) {
      return { row: i + 2, data: row };
    }
  }
  return null;
}
```

## What changed vs your current Apps Script

1. `doPost` now branches on `action === "update_lead"` and edits an existing row instead of appending.
2. `_findRow` matches a lead by **phone + received_at** (within a 1-minute window) so a CM update from `/admin/leads` lands on the right row.
3. `doGet` is unchanged — still reads all rows for the dashboard.
4. The `HEADERS` array now includes `care_manager`, `follow_up_date`, `notes`. Make sure your Sheet has those three columns (positions 13, 14, 15 → cells M1, N1, O1). The doPost helper writes new leads using positional appendRow so the column order matters.

## Sheet setup (one-time)

Open the Google Sheet, click cell **M1** and type these three headers across M, N, O:

```
care_manager      follow_up_date     notes
```

Then add the UTM columns starting at P1:

```
utm_source  utm_medium  utm_campaign  utm_term  utm_content  gclid  fbclid  referrer  landing_path
```

(If you already have these UTM columns elsewhere, leave them — but adjust the `HEADERS` array above to match your column order.)

## After paste

- **Deploy → Manage deployments → ⚙ → New version → Deploy.**
- Use the **same Web app URL** you already have. No env-var changes needed on Vercel — `PORTEA_LEADS_WEBHOOK_URL` and `PORTEA_LEADS_READ_SECRET` are already what the update route uses.
- Smoke test: open `/admin/leads`, click any patient row, change status from "new" to "cm contacted", add a note, click **Save update**. Refresh — the new status and the timestamped note should both be visible in the Sheet.
