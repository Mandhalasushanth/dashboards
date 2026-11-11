
 
/// <reference types="node" />
/**
 * Batch 3 regression tests: Create Account field validation (BUG-CP-001 to BUG-CP-011).
 * Run with: node scripts/run-auth-lockout-tests.cjs src/tests/unit/profileValidation.test.ts
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
 
import {
  CITY_RULES,
  FATHER_SPOUSE_NAME_RULES,
  FULL_NAME_RULES,
  PROFILE_FIELD_LIMITS,
  REGISTRATION_MIN_AGE_YEARS,
  collapseTypingSpaces,
  normalizeSpaces,
  validateAddressLine,
  validateDobForRegistration,
  validateEmailAddress,
  validateFullAddressLength,
  validateNameField,
} from "../../shared/validators/profileValidators";
import {
  describePanError,
  validateEmail,
  validateFullName,
  validatePan,
} from "../../shared/validators/indianTaxValidators";
import {
  REQUIRED_FIELDS,
  checkFormValidity,
  cleanFieldOnCommit,
  cleanFieldWhileTyping,
  validateField,
  validateFormAddressLength,
  validateRealTimeField,
} from "../../components/screens/create-profile/createProfileValidation";
import {
  buildRegistrationProfile,
  formatSignupAddress,
} from "../../components/screens/create-profile/createProfile.helpers";
import type { SignupForm } from "../../components/screens/create-profile/types";
 
const word = (n: number) => "a".repeat(n);
 
// ===============================================================================================
// BUG-CP-001: mandatory fields are marked
// ===============================================================================================
 
const ALL_KEYS: (keyof SignupForm)[] = [
  "name", "email", "mobileNumber", "gender", "dob", "fatherSpouseName", "pan", "aadhaar",
  "addressLine1", "addressLine2", "city", "pincode", "state", "password", "confirmPassword", "customerType",
];
 
test("every required field reports 'Required' when empty", () => {
  for (const key of REQUIRED_FIELDS) {
    assert.equal(validateField(key, ""), "Required", key);
  }
  // Whitespace-only text is 'Required' too (digit-only and picker fields cannot hold spaces).
  for (const key of ["name", "email", "dob", "fatherSpouseName", "pan", "addressLine1", "city"] as const) {
    assert.equal(validateField(key, "   "), "Required", key);
  }
});
 
test("optional fields accept an empty value", () => {
  for (const key of ALL_KEYS.filter((k) => !REQUIRED_FIELDS.includes(k) && k !== "customerType")) {
    assert.equal(validateField(key, ""), "", key);
  }
  assert.deepEqual(
    ALL_KEYS.filter((k) => !REQUIRED_FIELDS.includes(k)).sort(),
    ["addressLine2", "customerType", "mobileNumber"],
    "customerType is chosen on the previous step; mobileNumber is the verified number",
  );
});
 
test("the register screen marks exactly the required fields with *", () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/modules/authentication/screens/Register/RegisterScreen.tsx"), "utf8");
  const marked = [
    'label="Full Name" required',
    'label="Email" required',
    '<FieldLabel label="Gender" required />',
    /label="Date of Birth"\s+required/,
    'label="Father\'s / Spouse Name" required',
    'label="PAN Number" required',
    'label="Aadhaar Number" required',
    'label="Address Line 1" required',
    'label="City" required',
    'label="PIN Code" required',
    '<FieldLabel label="State / UT" required />',
    'label="Passcode" required',
    'label="Confirm Passcode" required',
  ];
  for (const m of marked) {
    assert.ok(typeof m === "string" ? source.includes(m) : m.test(source), `missing required marker: ${String(m)}`);
  }
  const line2 = source.indexOf('label="Address Line 2 (Optional)"');
  assert.ok(line2 > -1);
  assert.equal(source.slice(line2, line2 + 60).includes("required"), false, "Address Line 2 is optional and unmarked");
  assert.ok(source.includes("Please provide the required details to create your Finsolz account."), "the legend explains required details");
  assert.equal(source.includes('"Address Line 1 *"'), false, "no hand-typed asterisk labels remain");
});
 
// ===============================================================================================
// BUG-CP-002 / CP-003: full name spacing and length
// ===============================================================================================
 
test("normalizeSpaces trims and collapses", () => {
  assert.equal(normalizeSpaces("  Asha   Rao  "), "Asha Rao");
  assert.equal(normalizeSpaces("Asha\t\nRao"), "Asha Rao");
  assert.equal(normalizeSpaces("   "), "");
});
 
test("typing cleanup removes leading and doubled spaces but keeps one trailing space", () => {
  assert.equal(collapseTypingSpaces(" Asha"), "Asha");
  assert.equal(collapseTypingSpaces("Asha  Rao"), "Asha Rao");
  assert.equal(collapseTypingSpaces("Asha "), "Asha ");
  assert.equal(cleanFieldWhileTyping("name", "  Asha   "), "Asha ");
  assert.equal(cleanFieldWhileTyping("email", " a@b.com "), "a@b.com");
  assert.equal(cleanFieldWhileTyping("pan", "ABC DE"), "ABC DE", "other fields are untouched");
});
 
test("leaving a field normalises it fully", () => {
  assert.equal(cleanFieldOnCommit("name", "  Asha   Rao "), "Asha Rao");
  assert.equal(cleanFieldOnCommit("city", " New   Delhi "), "New Delhi");
  assert.equal(cleanFieldOnCommit("email", " a@b.com "), "a@b.com");
});
 
test("a name with stray spaces is accepted once normalised, and the payload carries the clean value", () => {
  const form = makeForm({ name: "  Asha    Rao  ", fatherSpouseName: " Ram   Rao ", city: "  New   Delhi ", addressLine1: " 12   Main  Road ", addressLine2: "  Near   Park " });
  assert.equal(validateField("name", form.name), "");
  const payload = buildRegistrationProfile(form, formatSignupAddress(form), "9876543210");
  assert.equal(payload.name, "Asha Rao");
  assert.equal(payload.fatherSpouseName, "Ram Rao");
  assert.equal(payload.city, "New Delhi");
  assert.equal(payload.addressLine1, "12 Main Road");
  assert.equal(payload.addressLine2, "Near Park");
  assert.equal(payload.address, "12 Main Road, Near Park, New Delhi, Maharashtra - 411001");
});
 
test("name length: 100 characters is accepted, 101 is rejected", () => {
  assert.equal(PROFILE_FIELD_LIMITS.fullName, 100);
  assert.equal(validateNameField(word(100), FULL_NAME_RULES), "");
  assert.equal(validateNameField(word(101), FULL_NAME_RULES), "Name cannot be longer than 100 characters");
  assert.equal(validateField("name", word(101)), "Name cannot be longer than 100 characters");
});
 
test("name length is measured after normalising spaces and in whole characters", () => {
  const padded = `   ${word(100)}   `;
  assert.equal(validateNameField(padded, FULL_NAME_RULES), "");
  assert.equal(validateNameField("é".repeat(100), FULL_NAME_RULES), "");
  assert.equal(validateNameField("𝒜".repeat(101), FULL_NAME_RULES) !== "", true);
});
 
test("legitimate Indian and international names are accepted", () => {
  for (const name of [
    "Asha Rao", "K. Ramesh", "A.P.J. Abdul Kalam", "A. P. J. Abdul Kalam", "Ramesh K.", "D'Souza", "O’Brien",
    "Mary-Ann Joseph", "Venkata Subba Rao", "राम कुमार", "ராமன்", "శ్రీనివాస్", "മോഹൻലാൽ", "Ñandú Pérez", "Li Wei", "Jo",
  ]) {
    assert.equal(validateNameField(name, FULL_NAME_RULES), "", name);
    assert.equal(validateFullName(name), true, name);
  }
});
 
test("names with digits, symbols, emoji or malformed punctuation are rejected", () => {
  const digits = "Name cannot contain numbers";
  const chars = "Name can contain only letters, spaces and . ' -";
  const cases: [string, string][] = [
    ["John3", digits], ["3John", digits], ["A", "Name is too short"],
    ["Asha😀", chars], ["Asha_Rao", chars], ["<script>", chars], ["Asha@Rao", chars], ["Asha, Rao", chars],
    ["-Asha", chars], ["Asha-", chars], ["Asha--Rao", chars], ["Asha..Rao", chars], ["Asha.-Rao", chars], [".Asha", chars], ["'Asha", chars],
  ];
  for (const [name, message] of cases) {
    assert.equal(validateNameField(name, FULL_NAME_RULES), message, name);
    assert.equal(validateFullName(name), false, name);
  }
});
 
test("a blank name is 'Required', not a format error", () => {
  assert.equal(validateField("name", ""), "Required");
  assert.equal(validateField("name", "     "), "Required");
});
 
test("real-time feedback flags digits and symbols but not unfinished names", () => {
  const form = makeForm({});
  assert.equal(validateRealTimeField("name", "Asha1", form), "Name cannot contain numbers");
  assert.equal(validateRealTimeField("name", "Asha😀", form), "Name can contain only letters, spaces and . ' -");
  assert.equal(validateRealTimeField("name", "Mary-", form), "");
  assert.equal(validateRealTimeField("name", "A", form), "");
  assert.equal(validateRealTimeField("name", "", form), "");
});
 
// ===============================================================================================
// BUG-CP-004 / CP-005: email
// ===============================================================================================
 
test("legitimate email addresses are accepted", () => {
  for (const email of [
    "a@b.co", "asha.rao@example.com", "first.last+tag@sub.example.co.in", "user_name@example-domain.com",
    "o'brien@example.com", "x@a-b.org", "UPPER@EXAMPLE.COM", "n1@e2.io", "a@xn--bcher-kva.example", "user@example.xn--p1ai",
    "  padded@example.com  ", "a@b.travel", `${word(64)}@example.com`,
  ]) {
    assert.equal(validateEmailAddress(email), "", email);
    assert.equal(validateEmail(email), true, email);
  }
});
 
test("malformed email addresses are rejected with a specific message", () => {
  const cases: [string, string][] = [
    ["plain", "Email must contain @"],
    ["a@@b.com", "Email can contain only one @"],
    ["a@b@c.com", "Email can contain only one @"],
    ["@b.com", "Enter the part of the email before @"],
    ["a@", "Enter the email domain after @"],
    ["a b@c.com", "Email cannot contain spaces"],
    ["a@b c.com", "Email cannot contain spaces"],
    [".a@b.com", "Enter a valid email address"],
    ["a.@b.com", "Enter a valid email address"],
    ["a..b@b.com", "Enter a valid email address"],
    ["a(b)@c.com", "Enter a valid email address"],
    ["a,b@c.com", "Enter a valid email address"],
    ["ä@example.com", "Enter a valid email address"],
    [`${word(65)}@example.com`, "Enter a valid email address"],
  ];
  for (const [email, message] of cases) {
    assert.equal(validateEmailAddress(email), message, email);
    assert.equal(validateEmail(email), false, email);
  }
});
 
test("invalid email domain syntax is rejected", () => {
  const dotted = "Email domain must include a dot, for example gmail.com";
  const bad = "Email domain is not valid";
  const ending = "Email domain ending is not valid";
  const cases: [string, string][] = [
    ["a@b", dotted], ["a@localhost", dotted],
    ["a@b.", bad], ["a@.com", bad], ["a@b..com", bad], ["a@-b.com", bad], ["a@b-.com", bad], ["a@b_c.com", bad], ["a@ex!ample.com", bad],
    [`a@${word(64)}.com`, bad],
    ["a@b.c", ending], ["a@b.c0m", ending], ["a@b.123", ending], ["a@b.com-", bad], ["a@b.c-m", ending],
  ];
  for (const [email, message] of cases) {
    assert.equal(validateEmailAddress(email), message, email);
  }
});
 
test("email length is capped at the server column size", () => {
  const ok = `${word(60)}@${word(30)}.com`;
  assert.ok(ok.length <= 100);
  assert.equal(validateEmailAddress(ok), "");
  const long = `${word(60)}@${word(36)}.com`;
  assert.equal(long.length, 101);
  assert.equal(validateEmailAddress(long), "Email cannot be longer than 100 characters");
});
 
test("an empty email is 'Required' in the form, and real-time feedback waits for a complete-looking domain", () => {
  assert.equal(validateField("email", ""), "Required");
  assert.equal(validateField("email", "a@b..com"), "Email domain is not valid");
  const form = makeForm({});
  assert.equal(validateRealTimeField("email", "asha", form), "");
  assert.equal(validateRealTimeField("email", "asha@exa", form), "");
  assert.equal(validateRealTimeField("email", "asha@b..com", form), "Email domain is not valid");
});
 
// ===============================================================================================
// BUG-CP-006: father's / spouse's name
// ===============================================================================================
 
test("father's / spouse's name follows the name rules with its own label", () => {
  assert.equal(validateField("fatherSpouseName", ""), "Required");
  assert.equal(validateField("fatherSpouseName", "  "), "Required");
  assert.equal(validateField("fatherSpouseName", "Ram Prasad"), "");
  assert.equal(validateField("fatherSpouseName", "S. Venkata Rao"), "");
  assert.equal(validateField("fatherSpouseName", "रामप्रसाद"), "");
  assert.equal(validateField("fatherSpouseName", "Ram3"), "Father's / Spouse name cannot contain numbers");
  assert.equal(validateField("fatherSpouseName", "Ram😀"), "Father's / Spouse name can contain only letters, spaces and . ' -");
  assert.equal(validateField("fatherSpouseName", "Ram@Rao"), "Father's / Spouse name can contain only letters, spaces and . ' -");
  assert.equal(validateField("fatherSpouseName", "R"), "Father's / Spouse name is too short");
  assert.equal(validateField("fatherSpouseName", word(100)), "");
  assert.equal(validateField("fatherSpouseName", word(101)), "Father's / Spouse name cannot be longer than 100 characters");
  assert.equal(validateNameField("--", FATHER_SPOUSE_NAME_RULES) !== "", true);
});
 
// ===============================================================================================
// BUG-CP-007: PAN
// ===============================================================================================
 
test("PANs with every valid fourth-character category are accepted", () => {
  for (const category of "ABCFGHJLPT") {
    const pan = `ABC${category}E1234F`;
    assert.equal(validatePan(pan), true, pan);
    assert.equal(validateField("pan", pan), "", pan);
  }
  assert.equal(validatePan("abcpe1234f"), true, "case is normalised");
  assert.equal(validatePan(" ABCPE1234F "), true);
});
 
test("a PAN whose fourth character is not a taxpayer category is rejected", () => {
  const message = "4th character of PAN must be one of A, B, C, F, G, H, J, L, P, T";
  for (const category of "DEIKMNOQRSUVWXYZ") {
    const pan = `ABC${category}E1234F`;
    assert.equal(validatePan(pan), false, pan);
    assert.equal(describePanError(pan), message, pan);
    assert.equal(validateField("pan", pan), message, pan);
  }
});
 
test("malformed PANs are rejected with the right message", () => {
  assert.equal(validateField("pan", ""), "Required");
  assert.equal(validateField("pan", "ABCPE1234"), "PAN must be 10 characters, for example ABCPE1234F");
  assert.equal(validateField("pan", "ABCPE1234FF"), "PAN must be 10 characters, for example ABCPE1234F");
  const shape = "PAN must be 5 letters, 4 digits, then 1 letter";
  for (const pan of ["ABCPE12345", "ABCP11234F", "1BCPE1234F", "ABCPE1234$", "ABCPE12A4F", "ABC-E1234F"]) {
    assert.equal(validateField("pan", pan), shape, pan);
    assert.equal(validatePan(pan), false, pan);
  }
});
 
test("real-time PAN feedback flags a wrong category as soon as the fourth character is typed", () => {
  const form = makeForm({});
  assert.equal(validateRealTimeField("pan", "ABC", form), "");
  assert.equal(validateRealTimeField("pan", "ABCP", form), "");
  assert.equal(validateRealTimeField("pan", "ABCD", form), "4th character of PAN must be one of A, B, C, F, G, H, J, L, P, T");
  assert.equal(validateRealTimeField("pan", "ABCPE1234", form), "");
  assert.equal(validateRealTimeField("pan", "ABCPE1234F", form), "");
});
 
// ===============================================================================================
// BUG-CP-008 / CP-009: address lines
// ===============================================================================================
 
test("legitimate address punctuation is accepted", () => {
  for (const line of [
    "12/B, Gandhi Road (Near Post Office)", "Flat #4-B, St. Mary's Apt. & Co.", "Plot No. 5; Sector-9: Block A",
    "H.No. 1-2-3/4, Kavuri Hills", "१२ गांधी रोड", "No. 7, 3rd Cross", "A", "Door 5 / Street 2", "O’Neil Lane",
    "Tower-B, Unit-1204, 12th Floor", "Opp. Bus Stand, NH-48",
  ]) {
    assert.equal(validateAddressLine(line, "Address Line 1"), "", line);
    assert.equal(validateField("addressLine1", line), "", line);
  }
});
 
test("invalid address input is rejected", () => {
  const only = "Address Line 1 can contain only letters, numbers, spaces and , . - / # ( ) & ' :";
  const mixed = "Address Line 1 has misplaced or repeated punctuation";
  const needs = "Address Line 1 must contain letters or numbers";
  const cases: [string, string][] = [
    ["🏠 12 Road", only], ["12 <Road>", only], ["House {5}", only], ["Road | 5", only], ["Road_5", only], ["Road*5", only], ["Road\\5", only],
    ["Road,, Pune", mixed], ["Road, , Pune", mixed], ["Road -- 5", mixed], ["Road // 5", mixed], ["Road.. Pune", mixed], [", Road", mixed], [". Road", mixed],
    ["---", needs], ["...", needs], [",,,", needs], ["()", needs], ["#", needs], ["&", needs], ["1,,2", mixed],
  ];
  for (const [line, message] of cases) {
    assert.equal(validateAddressLine(line, "Address Line 1"), message, line);
  }
});
 
test("address line 1 is required, address line 2 is optional but validated when present", () => {
  assert.equal(validateField("addressLine1", ""), "Required");
  assert.equal(validateField("addressLine1", "   "), "Required");
  assert.equal(validateField("addressLine2", ""), "");
  assert.equal(validateField("addressLine2", "   "), "");
  assert.equal(validateField("addressLine2", "Near Park, Sector-9"), "");
  assert.equal(validateField("addressLine2", "Near 😀 Park"), "Address Line 2 can contain only letters, numbers, spaces and , . - / # ( ) & ' :");
  assert.equal(validateField("addressLine2", "Near,, Park"), "Address Line 2 has misplaced or repeated punctuation");
});
 
test("address line length: 255 accepted, 256 rejected", () => {
  assert.equal(validateAddressLine(word(255), "Address Line 1"), "");
  assert.equal(validateAddressLine(word(256), "Address Line 1"), "Address Line 1 cannot be longer than 255 characters");
});
 
test("the joined address must fit the server's 500-character column", () => {
  assert.equal(validateFullAddressLength(word(500)), "");
  assert.equal(validateFullAddressLength(word(501)), "Address is too long. Please shorten it.");
  const form = makeForm({ addressLine1: word(255), addressLine2: word(255) });
  assert.equal(validateFormAddressLength(form), "Address is too long. Please shorten it.");
  assert.equal(checkFormValidity(form, true, "9876543210"), false);
  assert.equal(validateFormAddressLength(makeForm({})), "");
});
 
test("real-time address feedback reports forbidden symbols only, not unfinished punctuation", () => {
  const form = makeForm({});
  assert.equal(validateRealTimeField("addressLine1", "12 Road 😀", form), "Address Line 1 can contain only letters, numbers, spaces and , . - / # ( ) & ' :");
  assert.equal(validateRealTimeField("addressLine1", "12 Road,", form), "");
  assert.equal(validateRealTimeField("addressLine1", "12 Road,,", form), "");
});
 
// ===============================================================================================
// BUG-CP-010: city
// ===============================================================================================
 
test("legitimate city names are accepted", () => {
  for (const city of [
    "Pune", "Navi Mumbai", "St. Thomas Mount", "Hubballi-Dharwad", "Visakhapatnam", "Ur", "Greater Noida", "Thiruvananthapuram",
    "बेंगलुरु", "Coimbatore", "Sri Ganganagar", "Shahid Bhagat Singh Nagar", "Dharamshala",
  ]) {
    assert.equal(validateField("city", city), "", city);
  }
});
 
test("cities with emoji, digits or malformed special characters are rejected", () => {
  const only = "City can contain only letters, spaces and . ' -";
  const cases: [string, string][] = [
    ["Pune😀", only], ["😀", only], ["Pune!!", only], ["Pune#1", "City cannot contain numbers"], ["Pune123", "City cannot contain numbers"],
    ["Pu..ne", only], ["Pune--", only], ["---", only], ["Pune,", only], ["@@Pune", only], ["Pune_City", only], ["A", "City is too short"],
    [word(101), "City cannot be longer than 100 characters"],
  ];
  for (const [city, message] of cases) {
    assert.equal(validateField("city", city), message, city);
  }
  assert.equal(validateField("city", ""), "Required");
  assert.equal(validateField("city", word(100)), "");
  assert.equal(validateNameField("Pune", CITY_RULES), "");
});
 
test("real-time city feedback flags emoji and digits immediately", () => {
  const form = makeForm({});
  assert.equal(validateRealTimeField("city", "Pune😀", form), "City can contain only letters, spaces and . ' -");
  assert.equal(validateRealTimeField("city", "Pune1", form), "City cannot contain numbers");
  assert.equal(validateRealTimeField("city", "Pune", form), "");
});
 
// ===============================================================================================
// BUG-CP-011: date of birth
// ===============================================================================================
 
const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
const NOW = new Date(2026, 5, 15, 14, 30); // 15 June 2026, afternoon
 
test("the minimum age constant follows the existing 18+ taxpayer rule", () => {
  assert.equal(REGISTRATION_MIN_AGE_YEARS, 18);
});
 
test("a person who turns 18 today is accepted; one day younger is not", () => {
  assert.equal(validateDobForRegistration("15-06-2008", 18, NOW), "");
  assert.equal(validateDobForRegistration("16-06-2008", 18, NOW), "You must be at least 18 years old to create an account");
  assert.equal(validateDobForRegistration("14-06-2008", 18, NOW), "");
  assert.equal(validateDobForRegistration("15-06-2007", 18, NOW), "");
});
 
test("future dates are rejected with their own message", () => {
  const future = "Date of birth cannot be in the future";
  assert.equal(validateDobForRegistration("16-06-2026", 18, NOW), future);
  assert.equal(validateDobForRegistration("01-01-2027", 18, NOW), future);
  assert.equal(validateDobForRegistration("15-06-2030", 18, NOW), future);
  assert.equal(validateDobForRegistration("15-06-2026", 18, NOW), "You must be at least 18 years old to create an account");
});
 
test("under-age dates are rejected", () => {
  const young = "You must be at least 18 years old to create an account";
  for (const dob of ["01-01-2020", "15-06-2025", "31-12-2010", "02-02-2009"]) {
    assert.equal(validateDobForRegistration(dob, 18, NOW), young, dob);
  }
});
 
test("calendar validity: impossible and malformed dates are rejected", () => {
  const bad = "Enter a valid date of birth (DD-MM-YYYY)";
  for (const dob of ["31-04-1990", "29-02-2001", "00-01-1990", "32-01-1990", "15-13-1990", "1990", "15/06/1990", "abc", "1-1-1990"]) {
    assert.equal(validateDobForRegistration(dob, 18, NOW), bad, dob);
  }
  assert.equal(validateDobForRegistration("29-02-2000", 18, NOW), "", "leap day");
  assert.equal(validateDobForRegistration("1990-01-31", 18, NOW), "", "API format YYYY-MM-DD");
});
 
test("implausibly old dates are rejected at the 120-year boundary", () => {
  assert.equal(validateDobForRegistration("15-06-1906", 18, NOW), "");
  assert.equal(validateDobForRegistration("14-06-1906", 18, NOW), "");
  assert.equal(validateDobForRegistration("14-06-1905", 18, NOW), "Enter a valid date of birth");
});
 
test("the form validator applies the same rule against today's date", () => {
  const today = new Date();
  const exactly18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), 1);
  const age17 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
  assert.equal(validateField("dob", fmt(exactly18)), "");
  assert.equal(validateField("dob", fmt(age17)), "You must be at least 18 years old to create an account");
  assert.equal(validateField("dob", fmt(tomorrow)), "Date of birth cannot be in the future");
  assert.equal(validateField("dob", fmt(nextYear)), "Date of birth cannot be in the future");
  assert.equal(validateField("dob", ""), "Required");
  assert.equal(validateRealTimeField("dob", fmt(age17), makeForm({})), "You must be at least 18 years old to create an account");
  assert.equal(validateRealTimeField("dob", "15-06", makeForm({})), "", "no feedback until a full date is entered");
});
 
// ===============================================================================================
// The whole form
// ===============================================================================================
 
function makeForm(overrides: Partial<SignupForm>): SignupForm {
  return {
    name: "Asha Rao",
    email: "asha.rao@example.com",
    mobileNumber: "9876543210",
    gender: "Female",
    dob: "01-01-1990",
    fatherSpouseName: "Ram Rao",
    pan: "ABCPE1234F",
    aadhaar: "234567890123",
    addressLine1: "12/B, Gandhi Road",
    addressLine2: "",
    city: "Pune",
    pincode: "411001",
    state: "Maharashtra",
    password: "246810",
    confirmPassword: "246810",
    customerType: "Individual",
    ...overrides,
  };
}
 
test("a fully valid form passes", () => {
  assert.equal(checkFormValidity(makeForm({}), true, "9876543210"), true);
  assert.equal(checkFormValidity(makeForm({ addressLine2: "Near Park" }), true, "9876543210"), true);
});
 
test("the form is invalid when the terms are not accepted", () => {
  assert.equal(checkFormValidity(makeForm({}), false, "9876543210"), false);
});
 
test("the form is invalid when any single required field is empty", () => {
  for (const key of REQUIRED_FIELDS) {
    assert.equal(checkFormValidity(makeForm({ [key]: "" }), true, "9876543210"), false, key);
  }
});
 
test("the form is invalid for each newly validated field", () => {
  const bad: Partial<SignupForm>[] = [
    { name: "Asha3" }, { name: word(101) }, { email: "a@b..com" }, { email: "a@b" }, { fatherSpouseName: "Ram3" },
    { pan: "ABCDE1234F" }, { addressLine1: "🏠 Road" }, { addressLine2: "Road,, Pune" }, { city: "Pune😀" }, { dob: "01-01-2020" },
    { dob: "01-01-2999" },
  ];
  for (const override of bad) {
    assert.equal(checkFormValidity(makeForm(override), true, "9876543210"), false, JSON.stringify(override));
  }
});
 
test("registration payload field names are unchanged", () => {
  const form = makeForm({});
  const payload = buildRegistrationProfile(form, formatSignupAddress(form), "9876543210");
  assert.deepEqual(Object.keys(payload).sort(), [
    "aadhaar", "address", "addressLine1", "addressLine2", "city", "customerType", "dob", "email",
    "fatherSpouseName", "gender", "mobileNumber", "name", "pan", "pincode", "state",
  ]);
});
 