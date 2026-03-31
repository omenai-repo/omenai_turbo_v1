# End-to-End Test Summary

## 1. Overview

**Project:** Omenai web app  
**Environment:** staging  
**Tester:** rodolphe@omenai.net

I've been writing tests for the different flows of the app such as login and account flows.

---

## 2. Test Environment

| Component         | Value                       |
| ----------------- | --------------------------- |
| Web App           | Staging                     |
| Browser(s)        | Chromium / WebKit / Firefox |
| Testing Framework | Playwright                  |

---

## 3. Test Scenarios

| Scenario                          | Status    | Notes                                               |
| --------------------------------- | --------- | --------------------------------------------------- |
| Collector login with valid data   | ✅ Passed |                                                     |
| Collector login with invalid data | ✅ Passed |                                                     |
| Gallery login with valid data     | ✅ Passed |                                                     |
| Gallery login with invalid data   | ✅ Passed |                                                     |
| Artist login with valid data      | ✅ Passed |                                                     |
| Artist login with invalid data    | ✅ Passed |                                                     |
| Admin login with valid data       | ✅ Passed |                                                     |
| Admin login with invalid data     | ✅ Passed |                                                     |
| Collector purchase                | ✅ Passed |                                                     |
| Purchase network failure          | ❌ Failed | Timeout                                             |
| Purchase Order existed            | ✅ Passed |                                                     |
| Artwork payment                   | ✅ Passed |                                                     |
| Artwork with invalid data         | ❌ Failed | Failed on WebKit; artwork dropdown icon not visible |

---

## 4. Test Results Summary

| Metric      | Value |
| ----------- | ----- |
| Total Tests | 13    |
| Passed      | 11    |
| Failed      | 2     |

---

## 5. Issues Found

1. Timeout of 30000ms exceeded
2. "Invalid credentials" toast not visible on Firefox and WebKit (gallery login)
3. UI inconsistencies across browsers (dropdown/icon visibility)
4. Network failure not properly handled (timeout instead of error feedback)

---

## 6. Application Recommendations

### 6.1 Improve API Response Time & Reliability

**Issues impacted:**

- Gallery login timeout (Chrome)
- Collector purchase timeout (WebKit)
- Network failure scenario

**Recommendations:**

- Optimize backend endpoints (login, purchase)
  - Target response time: < 1–2 seconds
- Ensure all API requests:
  - always return a response (no hanging requests)
  - return proper HTTP status codes (4xx / 5xx)
- Add backend timeouts and fallback handling

**Priority:** low

---

### 6.2 Standardize Error Handling

**Issues impacted:**

- Missing "Invalid credentials" toast
- Network failure not surfaced to UI

**Recommendations:**

- Implement a centralized error response format:
  ```json
  { "message": "Error description" }
  ```

### 6.8 WebKit-Specific Recommendations

**Issues impacted:**

- Gallery login (invalid) → toast not visible
- Collector purchase → timeout
- Artwork dropdown icon not visible

**Context:**  
WebKit (Safari engine) has stricter and different behavior compared to Chromium/Firefox, especially around rendering, animations, and async UI updates.

---

#### 6.8.1 Fix Rendering & Visibility Issues

**Recommendations:**

- Avoid relying solely on:
  - `opacity: 0/1` for visibility
  - CSS animations to display elements
- Always pair visibility with:
  - `display: none/block` or `visibility: hidden/visible`
- Ensure elements are **mounted in the DOM before interaction**

---

#### 6.8.2 Review CSS Compatibility

**Recommendations:**

- Audit for WebKit-specific issues:
  - `flex` and `grid` rendering inconsistencies
  - `overflow: hidden` clipping elements
  - `position: fixed/absolute` behaving differently
- Add WebKit-safe styles if needed:
  ```css
  -webkit-transform: translateZ(0);
  -webkit-appearance: none;
  ```
