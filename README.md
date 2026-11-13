# CQRS Task Management - Simple MERN Exercise

A small full-stack solution to the **CQRS in the MERN Stack** team challenge. The focus is the **Node.js + Express + MongoDB backend**. React is only a simple demonstration.

## 1. What the project does

- Create a task with a required title and optional description.
- List all tasks or filter by completion status.
- Retrieve one task by ID.
- Complete an unfinished task once.
- Persist tasks to MongoDB with Mongoose.

The API follows **CQRS** by putting write logic in `commands/taskCommands.js` and read logic in `queries/taskQueries.js`.

## 2. Requirements

- Node.js 20.19+ (or 22.12+), npm
- MongoDB Community Server running locally **or** a MongoDB Atlas connection
- A terminal and a browser

## 3. Run the backend

Open a terminal in `backend`:

```bash
npm install
```

Copy `.env.example` to `.env`:

- Windows PowerShell: `Copy-Item .env.example .env`
- macOS/Linux: `cp .env.example .env`

Check your `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/cqrs_task_management
PORT=5000
```

If using Atlas, replace `MONGODB_URI` with your own connection string. **Never commit `.env`.** Make sure MongoDB is running, then:

```bash
npm run dev
```

Expected output (when the database connection succeeds):

```text
MongoDB connected.
API running at http://localhost:5000
```

## 4. Run the React frontend

In a **second terminal**, open `frontend`:

```bash
npm install
```

Copy `.env.example` to `.env` (same commands as above). The default value is:

```env
VITE_API_URL=http://localhost:5000
```

Then:

```bash
npm run dev
```

Open the local URL Vite prints (normally `http://127.0.0.1:5173`). Add tasks, filter them and click **Complete**.

## 5. Folder structure

```text
CQRS_MERN_Task_Management/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js                    Express configuration/error handling
│       ├── server.js                 MongoDB connection and server startup
│       ├── errors.js                 Simple HTTP error class
│       ├── models/Task.js            Mongoose schema (shared data)
│       ├── commands/taskCommands.js  Create and complete = WRITES
│       ├── queries/taskQueries.js    Get one and list = READS
│       └── routes/taskRoutes.js      URL-to-mediator mapping
└── frontend/
    ├── .env.example
    ├── package.json
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── style.css
```

## 6. API operations

| HTTP method | URL                            | Handler                  | Success                                           |
| ----------- | ------------------------------ | ------------------------ | ------------------------------------------------- |
| POST        | `/api/tasks`                   | `createTask()` command   | `201` with `{ "id": "..." }`                      |
| PUT         | `/api/tasks/:id/complete`      | `completeTask()` command | `200` with `{ "id": "...", "isCompleted": true }` |
| GET         | `/api/tasks/:id`               | `getTask()` query        | `200` with task details                           |
| GET         | `/api/tasks`                   | `listTasks()` query      | `200` with an array                               |
| GET         | `/api/tasks?isCompleted=true`  | `listTasks()` query      | `200` with completed tasks                        |
| GET         | `/api/tasks?isCompleted=false` | `listTasks()` query      | `200` with incomplete tasks                       |

### Create request

```http
POST /api/tasks
Content-Type: application/json

{ "title": "Learn CQRS", "description": "Finish the task exercise" }
```

The response contains a new MongoDB identifier. A task always starts with `isCompleted: false`, regardless of any attempt to set that field in the request.

### Retrieved task shape

```json
{
  "id": "<mongo-object-id>",
  "title": "Learn CQRS",
  "description": "Finish the task exercise",
  "isCompleted": false,
  "createdAt": "<ISO-date>"
}
```

The actual `id` and `createdAt` values are generated when a task is created.

## 7. Manual checks

Use Postman to test negative cases easily. A second completion should return HTTP `409` and a blank title should return `400`.

| Test                               | Expected result                              |
| ---------------------------------- | -------------------------------------------- |
| Create with nonblank title         | `201`, task ID, stored in MongoDB            |
| Create with `"title": "   "`       | `400`                                        |
| Create with `"isCompleted": true`  | Stored as `false` (server enforces the rule) |
| Complete an incomplete task        | `200`, `isCompleted: true`                   |
| Complete the same task again       | `409`                                        |
| Retrieve/complete nonexistent task | `404`                                        |
| GET all / filter                   | `200`, no task changes                       |
| Filter `?isCompleted=maybe`        | `400`                                        |
| React form, list and complete      | Visible UI workflow                          |

## 8. Mediator alongside CQRS

The Mediator is a small dispatcher between Express routes and the existing handlers.
CQRS still separates writes (commands) from reads (queries); the Mediator simply
selects which handler to call. Business rules and MongoDB access stay in the handlers.

- `backend/src/mediator/Mediator.js` provides `register(requestName, handler)` and asynchronous `send(requestName, payload)`.
- `backend/src/mediator/taskMediator.js` registers `CreateTask` ? `createTask`, `CompleteTask` ? `completeTask`, `GetTask` ? `getTask`, and `ListTasks` ? `listTasks`.
- Routes pass the task body, task ID, or `isCompleted` filter as the payload.

For example, `POST /api/tasks` with `{ "title": "Learn Mediator" }` calls:

```js
await mediator.send("CreateTask", req.body);
```

The Mediator calls `createTask(req.body)`, which validates and saves through Mongoose.
Its `{ id }` result returns to the route for the existing HTTP `201` response.
`send()` returns asynchronous results and lets errors reach Express's existing error
middleware, preserving validation and HTTP status codes.

## 9. Why the structure is CQRS

```text
React / Postman
      |
      v
Express routes
      |
      v
Mediator (send)
      |
      +-- POST / PUT --> command handlers --> Mongoose --> MongoDB  (WRITE)
      |
      +-- GET --------> query handlers ----> Mongoose --> MongoDB  (READ)
```

Both sides use the same Task model and collection. **Separation is in the code responsibilities**, not necessarily the physical storage.
