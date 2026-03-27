# End-to-End Test Summary

## 1. Overview

**Project:** Omenai web app  
**Environment:** staging
**Tester:** rodolphe@omenai.net

I've been writting test for the different flows of the apps like login, and account flows

---

## 2. Test Environment

| Component         | Value                       |
| ----------------- | --------------------------- |
| web app           | staging                     |
| Browser(s)        | Chromium / Webkit / Firefox |
| Testing Framework | Playwright                  |

---

## 3. Test Scenarios

| Scenario                          | Status    | Notes                                             |
| --------------------------------- | --------- | ------------------------------------------------- |
| Collector login with valid data   | ✅ Passed |                                                   |
| Collector login with invalid data | ✅ Passed |                                                   |
| Gallery login with valid data     | ❌ Failed | Failed on chrome; timeout                         |
| Gallery login with invalid data   | ❌ Failed | Failed on firefox and webkit; toaster not visible |
| Artist login with valid data      | ✅ Passed |                                                   |
| Artist login with invalid data    | ✅ Passed |                                                   |
| Admin login with valid data       | ✅ Passed |                                                   |
| Admin login with invalid data     | ✅ Passed |                                                   |
| Collector purchase                | ❌ Failed | Failed on webkit ; timeout                        |
| Purchase network failure          | ❌ Failed | timeout                                           |
| Purchase Order existed            | ✅ Passed |                                                   |
| Artwork payment                   | ✅ Passed |                                                   |
| Artwork with invalid data         | ✅ Passed |                                                   |

---

## 4. Test Results Summary

| Metric      | Value |
| ----------- | ----- |
| Total Tests | 12    |
| Passed      | 8     |
| Failed      | 4     |

---

## 5. Issues Found

1. Timeout of 30000ms exceeded
2. Toaster test "Invalid credentials" not visible on firefox and webkit for gallery login
3.
