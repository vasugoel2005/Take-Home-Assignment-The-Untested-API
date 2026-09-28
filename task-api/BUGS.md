# Bug Report

## Bug: Pagination starts from the wrong page

### Expected Behavior

When requesting:

GET /tasks?page=1&limit=2

the API should return the first two tasks.

### Actual Behavior

The API skips the first two tasks and returns the third task.

### How It Was Discovered

The bug was discovered while writing an integration test using Supertest.

The test created three tasks and requested:

GET /tasks?page=1&limit=2

The test expected two tasks but received only one.

### Root Cause

The `getPaginated` function calculates the offset as:

```js
const offset = (page - 1) * limit;