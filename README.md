# Support Ticket API

## Problem Statement

You are given a partially built Express.js application that manages **support tickets** in memory.
Complete the implementation so that all the tests in `test/test.js` pass when you run:

```
npm install && npm test
```

### Files you need to change

| File | What to do |
| ---- | ---------- |
| `controllers/ticket.js` | Implement the `create`, `list`, `get`, `updateStatus` and `remove` methods of the `Tickets` class. |
| `routes/tickets.js` | Implement the five route handlers (look for the `TODO` comments). |
| `app.js` | Import the tickets router and register it at the `/tickets` path. |

> **Do not modify** `test/test.js`. It is read-only and is used for scoring.

### Ticket model

```json
{ "id": 1, "title": "Cannot log in", "priority": "low", "status": "open" }
```

| Field | Rules |
| ----- | ----- |
| `id` | Unique integer, auto-incremented starting at `1`. IDs of deleted tickets are never reused. |
| `title` | Required, non-empty string (leading/trailing spaces are trimmed). |
| `priority` | One of `low`, `medium`, `high`. Defaults to `low`. |
| `status` | One of `open`, `in_progress`, `closed`. New tickets are always `open`. |

### Controller: `controllers/ticket.js`

| Method | Behaviour |
| ------ | --------- |
| `create(title, priority)` | Returns the new ticket and stores it. Returns `null` if the title is missing/blank/not a string, or the priority is invalid (an invalid call must not consume an ID). |
| `list(status)` | Returns all tickets, or only those with the given status when `status` is provided. |
| `get(id)` | Returns the ticket, or `undefined` if it does not exist. `id` may be a number or a numeric string. |
| `updateStatus(id, status)` | Returns `undefined` if the ticket does not exist, `null` if the status is invalid, otherwise updates and returns the ticket. |
| `remove(id)` | Deletes the ticket. Returns `true` if it was deleted, `false` if it was not found. |

### REST API: `routes/tickets.js`

| Endpoint | Success | Errors |
| -------- | ------- | ------ |
| `POST /tickets` body `{ title, priority? }` | `201` + created ticket | `400` invalid title or priority |
| `GET /tickets` optional `?status=` | `200` + array of tickets | `400` if `status` is not a valid status |
| `GET /tickets/:id` | `200` + ticket | `404` not found |
| `PUT /tickets/:id` body `{ status }` | `200` + updated ticket | `404` not found, `400` invalid status |
| `DELETE /tickets/:id` | `204` with no body | `404` not found |

For `PUT`, check that the ticket exists **before** validating the status (an unknown ticket is a `404`, even if the status is also invalid).

### Running the project

```
npm install     # install dependencies
npm start       # start the server on port 3000
npm test        # run the tests (writes unit.xml)
```
