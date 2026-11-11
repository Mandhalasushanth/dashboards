# Finsolz Validation Rules

This document details all client-side validation rules, pattern specifications, cross-field dependency checks, and associated error messages implemented in the Finsolz platform.

---

## 1. Authentication

| Field | Rule | Error Message |
| --- | --- | --- |
| **Email / Username** | Required; valid email address format | *"Email is required."* / *"Enter a valid email address."* |
| **Password** | Required; minimum 8 characters | *"Password is required."* / *"Password must be at least 8 characters."* |

---

## 2. Indian Business & Statutory Identifiers

| Identifier | Format / Regex | Rule Details | Error Message |
| --- | --- | --- | --- |
| **PAN** | `^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$` | 10 alphanumeric characters. 4th character denotes holder type (P = Individual, C = Company, F = Firm/LLP). | *"Enter a valid 10-character PAN, e.g. AAACT1234F."* |
| **GSTIN** | `^(0[1-9]\|[1-2]\d\|3[0-8])[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$` | 15 characters: 2-digit state code (01–38) + 10-char PAN + 1-char entity number + 'Z' + 1 checksum character. | *"Enter a valid 15-character GSTIN, e.g. 27AAACT1234F1Z5."* |
| **CIN / LLPIN** | `^([LU]\d{5}[A-Z]{2}\d{4}(PLC\|PTC\|FTC\|GOI\|NPL\|OPC\|SGC\|GAP\|GAT\|ULL\|ULT\|FLC)\d{6}\|[A-Z]{3}-\d{4})$` | 21-character Corporate Identification Number or LLP Identification Number (e.g., `AAB-1234`). | *"Enter a valid 21-character CIN or an LLPIN like AAB-1234."* |
| **ICAI FRN** | `^\d{6}[CENSW]$` | 6 digits followed by region letter (C, E, N, S, W). | *"Enter a valid ICAI FRN, e.g. 123456W."* |
| **SAC** | `^99\d{4}$` | Services Accounting Code for GST: 6 digits starting with `99`. | *"SAC must be 6 digits starting with 99, e.g. 998221."* |

---

## 3. Contact & Regional Fields

| Field | Format / Regex | Error Message |
| --- | --- | --- |
| **Mobile Number** | `^[6-9]\d{9}$` (after stripping spaces, hyphens, and optional `+91` / `0`) | *"Enter a valid 10-digit Indian mobile number."* |
| **Email Address** | `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | *"Enter a valid email address."* |
| **Website URL** | Valid `https://` URI with valid hostname containing dots | *"Enter a full https:// web address."* |
| **PIN Code** | `^[1-9]\d{5}$` (6 digits; Indian postal codes never start with 0) | *"Enter a valid 6-digit PIN code."* |
| **Address** | `^[A-Za-z0-9][A-Za-z0-9 ,./#&()':-]{1,119}$` | *"Address may contain letters, digits, spaces and , . / # & ( ) ' : - only."* |
| **City** | `^[A-Za-z][A-Za-z .'-]{1,59}$` | *"City may contain letters, spaces, dots and hyphens only."* |

---

## 4. Banking & Financial Details

| Field | Format / Regex | Error Message |
| --- | --- | --- |
| **IFSC Code** | `^[A-Z]{4}0[A-Z0-9]{6}$` (4 letters + 0 + 6 alphanumeric branch code) | *"Enter a valid 11-character IFSC, e.g. HDFC0001234."* |
| **Bank Account** | `^\d{9,18}$` (9 to 18 digits) | *"Account number must be 9 to 18 digits."* |
| **UPI ID** | `^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$` | *"Enter a valid UPI ID, e.g. finsolz@hdfcbank."* |
| **Invoice Prefix** | `^[A-Z0-9][A-Z0-9/-]{1,9}$` | *"Use 2–10 capital letters, digits, \"/\" or \"-\", e.g. TE/INV-."* |

---

## 5. Cross-Field Dependency Validations

Cross-field rules compare multiple settings within the same section and validate organizational consistency:

### Organization Settings
1. **GSTIN vs. PAN Consistency**:
   - Characters 3–12 of GSTIN must strictly match the 10-character PAN.
   - *Error*: *"GSTIN characters 3–12 must match the firm PAN."*
2. **GSTIN vs. State Code**:
   - Characters 1–2 of GSTIN must match the selected state's 2-digit official GST code (e.g., `27` for Maharashtra, `07` for Delhi).
   - *Error*: *"This GSTIN is not registered in `<State>` (state code `<Code>`)."*
3. **PAN vs. Entity Constitution**:
   - 4th character of PAN must correspond to entity constitution:
     - `PROPRIETORSHIP`: 4th character must be `P` (Individual).
     - `PARTNERSHIP` / `LLP`: 4th character must be `F` (Firm).
     - `PRIVATE_LIMITED` / `PUBLIC_LIMITED`: 4th character must be `C` (Company).
   - *Error*: *"PAN must belong to `<entity-type>`."*
4. **Registration Number vs. Entity Constitution**:
   - `PROPRIETORSHIP` & `PARTNERSHIP`: Must leave registration number empty.
   - `LLP`: Requires LLPIN format (`^[A-Z]{3}-\d{4}$`).
   - `PRIVATE_LIMITED`: Requires private CIN starting with `U` and containing `PTC` or `OPC`.
   - `PUBLIC_LIMITED`: Requires public CIN starting with `L` or `U` and containing `PLC`.

### Billing Settings
1. **Invoice Length Cap (GST Rule)**:
   - `invoicePrefix.length + nextInvoiceNumber.length <= 16`.
   - *Error*: *"Prefix plus number must fit in 16 characters (GST rule)."*
2. **Bank Detail Completeness**:
   - All three fields (`bankAccountName`, `bankAccountNumber`, `ifsc`) must either be completely filled or completely empty.
   - *Error*: *"Complete all bank details, or leave all three empty."*

### Security Settings
1. **Password Expiry**:
   - Value must be `0` (never expires) or at least `30` days.
   - *Error*: *"Use 0 (never) or at least 30 days."*
2. **IP Allow List**:
   - Each non-empty line must match valid IPv4 or CIDR notation.
   - *Error*: *"\"<entry>\" is not a valid IPv4 address or CIDR range."*

### Workflow & SLA Settings
1. **Escalation Threshold**:
   - Escalation threshold (in hours) must be strictly less than the shortest turnaround SLA (converted to hours: `min(caFilingSlaDays, loanProcessingSlaDays) * 24`).
   - *Error*: *"Escalate before the shortest turnaround (under <N> hours)."*

### Notification Settings
1. **Daily Digest Schedule**:
   - If `dailyDigestEnabled` is checked, `dailyDigestTime` must be selected.
   - *Error*: *"Choose when the daily summary is sent."*

---

## 6. Communication & Notifications

- **Message Body**: Must be between 1 and 1,000 characters.
- **Notification Model**: Validated against typed category enum (`APPLICATION`, `DOCUMENT`, `PAYMENT`, `SYSTEM`, `SLA`).
