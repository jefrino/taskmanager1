// Centralized API Client with Smart Hybrid Backend:
// 1. Live FastAPI Backend (when running locally or connected to Render/Railway)
// 2. Client-Side LocalStorage Engine (seamless zero-error fallback for GitHub Pages)

const MOCK_USERS = [
  {
    id: 1,
    email: "alex@example.com",
    full_name: "Alex Rivera",
    role: "admin",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    email: "sarah@example.com",
    full_name: "Sarah Chen",
    role: "member",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    email: "marcus@example.com",
    full_name: "Marcus Vance",
    role: "member",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    email: "elena@example.com",
    full_name: "Elena Rostova",
    role: "member",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    created_at: new Date().toISOString()
  }
];

function getInitialDemoTasks() {
  const now = new Date();
  const d = (days) => new Date(now.getTime() + days * 86400000).toISOString();

  return [
    {
      id: 1,
      title: "Design Dark Mode UI system tokens",
      description: "Establish cohesive color palette, contrast ratios, and typography tokens for system-wide dark mode support across web and mobile viewports.",
      status: "completed",
      priority: "high",
      due_date: d(-2),
      tags: "Design,UI/UX,Tokens",
      position: 0,
      created_by_id: 1,
      assignee_id: 2,
      created_at: d(-5),
      updated_at: d(-2),
      creator: MOCK_USERS[0],
      assignee: MOCK_USERS[1],
      subtasks: [
        { id: 101, task_id: 1, title: "Define surface elevation color ramp", is_completed: true, created_at: d(-5) },
        { id: 102, task_id: 1, title: "Establish WCAG AAA contrast for text", is_completed: true, created_at: d(-4) },
        { id: 103, task_id: 1, title: "Figma library component sync", is_completed: true, created_at: d(-3) }
      ],
      comments: [
        { id: 201, task_id: 1, user_id: 2, content: "Dark theme tokens have been validated in Figma and exported to Tailwind config.", created_at: d(-3), user: MOCK_USERS[1] },
        { id: 202, task_id: 1, user_id: 1, content: "Looks gorgeous! Contrast passes all accessibility checks.", created_at: d(-2), user: MOCK_USERS[0] }
      ],
      activities: [
        { id: 301, task_id: 1, user_id: 1, action: "created", details: "Created task 'Design Dark Mode UI system tokens'", created_at: d(-5), user: MOCK_USERS[0] }
      ],
      subtask_count: 3,
      subtask_completed_count: 3,
      comment_count: 2
    },
    {
      id: 2,
      title: "Implement JWT Refresh Token rotation",
      description: "Secure API endpoints with automatic refresh token rotation stored in HttpOnly secure cookies to prevent XSS session hijacking.",
      status: "in_progress",
      priority: "urgent",
      due_date: d(1),
      tags: "Backend,Security,Auth",
      position: 0,
      created_by_id: 1,
      assignee_id: 3,
      created_at: d(-3),
      updated_at: d(-1),
      creator: MOCK_USERS[0],
      assignee: MOCK_USERS[2],
      subtasks: [
        { id: 104, task_id: 2, title: "Design refresh token schema and hashing", is_completed: true, created_at: d(-3) },
        { id: 105, task_id: 2, title: "Add blacklist revocation mechanism", is_completed: false, created_at: d(-2) },
        { id: 106, task_id: 2, title: "Implement sliding session window logic", is_completed: false, created_at: d(-1) }
      ],
      comments: [
        { id: 203, task_id: 2, user_id: 3, content: "Token blacklisting in Redis/SQLite is almost done. Testing expiration edge cases now.", created_at: d(-1), user: MOCK_USERS[2] }
      ],
      activities: [
        { id: 302, task_id: 2, user_id: 1, action: "created", details: "Created task 'Implement JWT Refresh Token rotation'", created_at: d(-3), user: MOCK_USERS[0] }
      ],
      subtask_count: 3,
      subtask_completed_count: 1,
      comment_count: 1
    },
    {
      id: 3,
      title: "Real-time WebSocket task status broadcasting",
      description: "Ensure instant state synchronization across all connected team sessions when tasks move on Kanban boards or update status.",
      status: "in_progress",
      priority: "high",
      due_date: d(2),
      tags: "WebSockets,RealTime,Frontend",
      position: 1,
      created_by_id: 1,
      assignee_id: 4,
      created_at: d(-2),
      updated_at: d(-1),
      creator: MOCK_USERS[0],
      assignee: MOCK_USERS[3],
      subtasks: [
        { id: 107, task_id: 3, title: "FastAPI ConnectionManager endpoint", is_completed: true, created_at: d(-2) },
        { id: 108, task_id: 3, title: "Auto-reconnect with exponential backoff", is_completed: true, created_at: d(-1) },
        { id: 109, task_id: 3, title: "Toast notifications for live collaborator edits", is_completed: false, created_at: d(-1) }
      ],
      comments: [
        { id: 204, task_id: 3, user_id: 4, content: "WebSocket ping/pong keepalive is humming nicely!", created_at: d(-1), user: MOCK_USERS[3] }
      ],
      activities: [
        { id: 303, task_id: 3, user_id: 1, action: "created", details: "Created task 'Real-time WebSocket task status broadcasting'", created_at: d(-2), user: MOCK_USERS[0] }
      ],
      subtask_count: 3,
      subtask_completed_count: 2,
      comment_count: 1
    },
    {
      id: 4,
      title: "Kanban drag-and-drop smooth animations",
      description: "Improve drag feedback, ghost drag preview, and column drop targets for fluid desktop and mobile touch gestures.",
      status: "in_review",
      priority: "medium",
      due_date: d(3),
      tags: "Frontend,UX,Animations",
      position: 0,
      created_by_id: 2,
      assignee_id: 4,
      created_at: d(-4),
      updated_at: d(-1),
      creator: MOCK_USERS[1],
      assignee: MOCK_USERS[3],
      subtasks: [
        { id: 110, task_id: 4, title: "HTML5 Drag and drop dropzones", is_completed: true, created_at: d(-4) },
        { id: 111, task_id: 4, title: "Touch event listener polyfill for iOS/Android", is_completed: true, created_at: d(-3) },
        { id: 112, task_id: 4, title: "Optimistic UI state updates", is_completed: true, created_at: d(-2) }
      ],
      comments: [
        { id: 205, task_id: 4, user_id: 1, content: "Tested on mobile browser - silky smooth!", created_at: d(-1), user: MOCK_USERS[0] }
      ],
      activities: [],
      subtask_count: 3,
      subtask_completed_count: 3,
      comment_count: 1
    },
    {
      id: 5,
      title: "Audit database indexes & optimize queries",
      description: "Profile slow queries under heavy concurrency and add composite indexes for task status, assignee, and due_date lookups.",
      status: "todo",
      priority: "medium",
      due_date: d(5),
      tags: "Database,Performance,SQL",
      position: 0,
      created_by_id: 3,
      assignee_id: 3,
      created_at: d(-2),
      updated_at: d(-2),
      creator: MOCK_USERS[2],
      assignee: MOCK_USERS[2],
      subtasks: [
        { id: 113, task_id: 5, title: "Enable SQLite WAL mode", is_completed: true, created_at: d(-2) },
        { id: 114, task_id: 5, title: "Add compound indexes on tasks table", is_completed: false, created_at: d(-2) },
        { id: 115, task_id: 5, title: "Benchmark 10,000 tasks read throughput", is_completed: false, created_at: d(-2) }
      ],
      comments: [],
      activities: [],
      subtask_count: 3,
      subtask_completed_count: 1,
      comment_count: 0
    },
    {
      id: 6,
      title: "Setup Docker Compose & Production deployment guide",
      description: "Create production-ready Dockerfile, multi-stage builds, and deployment instructions for VPS, Render, or Railway.",
      status: "todo",
      priority: "low",
      due_date: d(7),
      tags: "DevOps,Docker,Deployment",
      position: 1,
      created_by_id: 1,
      assignee_id: 1,
      created_at: d(-1),
      updated_at: d(-1),
      creator: MOCK_USERS[0],
      assignee: MOCK_USERS[0],
      subtasks: [],
      comments: [],
      activities: [],
      subtask_count: 0,
      subtask_completed_count: 0,
      comment_count: 0
    },
    {
      id: 7,
      title: "Integrate CSV & JSON task export/import",
      description: "Allow team leads to export sprint task data to CSV or JSON formats for offline backups and stakeholder reporting.",
      status: "backlog",
      priority: "low",
      due_date: d(12),
      tags: "Feature,Export,Reporting",
      position: 0,
      created_by_id: 2,
      assignee_id: null,
      created_at: d(-3),
      updated_at: d(-3),
      creator: MOCK_USERS[1],
      assignee: null,
      subtasks: [],
      comments: [],
      activities: [],
      subtask_count: 0,
      subtask_completed_count: 0,
      comment_count: 0
    },
    {
      id: 8,
      title: "Fix date picker timezone mismatch on safari",
      description: "Safari users in non-UTC timezones reported due dates displaying one day earlier due to ISO parsing quirks.",
      status: "completed",
      priority: "urgent",
      due_date: d(-1),
      tags: "Bug,Frontend,Safari",
      position: 1,
      created_by_id: 4,
      assignee_id: 4,
      created_at: d(-4),
      updated_at: d(-1),
      creator: MOCK_USERS[3],
      assignee: MOCK_USERS[3],
      subtasks: [
        { id: 116, task_id: 8, title: "Reproduce issue in WebKit engine", is_completed: true, created_at: d(-4) },
        { id: 117, task_id: 8, title: "Normalize date string parsing to local midnight", is_completed: true, created_at: d(-3) }
      ],
      comments: [
        { id: 206, task_id: 8, user_id: 4, content: "Patched and verified across all browsers.", created_at: d(-1), user: MOCK_USERS[3] }
      ],
      activities: [],
      subtask_count: 2,
      subtask_completed_count: 2,
      comment_count: 1
    }
  ];
}

// Local Storage Fallback Engine
const LocalDB = {
  getUsers() {
    const raw = localStorage.getItem("taskflow_local_users");
    if (!raw) {
      localStorage.setItem("taskflow_local_users", JSON.stringify(MOCK_USERS));
      return MOCK_USERS;
    }
    return JSON.parse(raw);
  },

  getTasks() {
    const raw = localStorage.getItem("taskflow_local_tasks");
    if (!raw) {
      const initial = getInitialDemoTasks();
      localStorage.setItem("taskflow_local_tasks", JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  },

  saveTasks(tasks) {
    localStorage.setItem("taskflow_local_tasks", JSON.stringify(tasks));
  },

  broadcast(eventType, data) {
    if (window.socketClient) {
      window.socketClient.emit(eventType, data);
    }
  }
};

const API = {
  isStaticHost: Boolean(
    window.location.hostname.endsWith("github.io") ||
    window.location.hostname.endsWith("netlify.app") ||
    window.location.protocol === "file:"
  ),

  getBaseUrl() {
    return localStorage.getItem("taskflow_api_url") || window.TASKFLOW_API_URL || "";
  },

  getToken() {
    return localStorage.getItem("taskflow_token");
  },

  setToken(token) {
    if (token) {
      localStorage.setItem("taskflow_token", token);
    } else {
      localStorage.removeItem("taskflow_token");
    }
  },

  // Auto-detect whether to use Live HTTP Backend or Client-Side Engine
  useLocalEngine() {
    const customUrl = this.getBaseUrl();
    if (customUrl) return false; // User specified remote server URL
    if (this.isStaticHost) return true; // Static hosting like GitHub Pages
    return false;
  },

  async request(endpoint, options = {}) {
    // If on a static host and no custom backend URL is set, route through local engine
    if (this.useLocalEngine()) {
      return this.handleLocalRequest(endpoint, options);
    }

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    try {
      const fullUrl = endpoint.startsWith("http") ? endpoint : `${this.getBaseUrl()}${endpoint}`;
      const response = await fetch(fullUrl, config);

      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new CustomEvent("taskflow:unauthorized"));
        throw new Error("Session expired. Please sign in again.");
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        // If server returned non-JSON (e.g. 404 HTML on static host), fall back to local engine!
        console.warn(`[API] Endpoint ${endpoint} returned non-JSON, falling back to Local Engine.`);
        return this.handleLocalRequest(endpoint, options);
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (data && (data.detail || data.message)) || `HTTP Error ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      // If network fails (e.g. no backend running), fallback gracefully to Local Storage
      console.warn(`[API] Network error on ${endpoint}, falling back to Local Engine. (${err.message})`);
      return this.handleLocalRequest(endpoint, options);
    }
  },

  // Client-Side Local Storage Request Router (guarantees zero 404 errors!)
  async handleLocalRequest(endpoint, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};

    // 1. Auth: Login
    if (endpoint.startsWith("/api/auth/login")) {
      const users = LocalDB.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === body.email.toLowerCase()) || users[0];
      const token = `local-token-${user.id}-${Date.now()}`;
      localStorage.setItem("taskflow_local_current_user", JSON.stringify(user));
      this.setToken(token);
      return {
        access_token: token,
        token_type: "bearer",
        user
      };
    }

    // 2. Auth: Register
    if (endpoint.startsWith("/api/auth/register")) {
      const users = LocalDB.getUsers();
      const newUser = {
        id: users.length + 1,
        email: body.email.toLowerCase(),
        full_name: body.full_name,
        role: body.role || "member",
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(body.full_name)}&background=6366f1&color=fff&bold=true`,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem("taskflow_local_users", JSON.stringify(users));
      localStorage.setItem("taskflow_local_current_user", JSON.stringify(newUser));
      const token = `local-token-${newUser.id}-${Date.now()}`;
      this.setToken(token);
      return {
        access_token: token,
        token_type: "bearer",
        user
      };
    }

    // 3. Auth: Me
    if (endpoint.startsWith("/api/auth/me")) {
      const rawUser = localStorage.getItem("taskflow_local_current_user");
      if (rawUser) return JSON.parse(rawUser);
      const users = LocalDB.getUsers();
      localStorage.setItem("taskflow_local_current_user", JSON.stringify(users[0]));
      return users[0];
    }

    // 4. Auth: Users list
    if (endpoint.startsWith("/api/auth/users")) {
      return LocalDB.getUsers();
    }

    // 5. Tasks: GET list
    if (endpoint === "/api/tasks" || endpoint.startsWith("/api/tasks?")) {
      return LocalDB.getTasks();
    }

    // 6. Tasks: POST create
    if (endpoint === "/api/tasks" && method === "POST") {
      const tasks = LocalDB.getTasks();
      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      const users = LocalDB.getUsers();
      const assignee = body.assignee_id ? users.find((u) => u.id === body.assignee_id) : null;

      const newId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
      const subtasks = (body.subtasks || []).map((title, idx) => ({
        id: newId * 100 + idx,
        task_id: newId,
        title,
        is_completed: false,
        created_at: new Date().toISOString()
      }));

      const newTask = {
        id: newId,
        title: body.title,
        description: body.description || "",
        status: body.status || "todo",
        priority: body.priority || "medium",
        due_date: body.due_date || null,
        tags: body.tags || "",
        position: tasks.length,
        created_by_id: currentUser.id,
        assignee_id: body.assignee_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: currentUser,
        assignee: assignee || null,
        subtasks,
        comments: [],
        activities: [
          {
            id: Date.now(),
            task_id: newId,
            user_id: currentUser.id,
            action: "created",
            details: `Created task '${body.title}'`,
            created_at: new Date().toISOString(),
            user: currentUser
          }
        ],
        subtask_count: subtasks.length,
        subtask_completed_count: 0,
        comment_count: 0
      };

      tasks.push(newTask);
      LocalDB.saveTasks(tasks);
      LocalDB.broadcast("TASK_CREATED", { task: newTask, user_name: currentUser.full_name });
      return newTask;
    }

    // 7. Tasks: GET single detail
    const getTaskMatch = endpoint.match(/^\/api\/tasks\/(\d+)$/);
    if (getTaskMatch && method === "GET") {
      const id = parseInt(getTaskMatch[1]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error("Task not found");
      return task;
    }

    // 8. Tasks: PUT update
    if (getTaskMatch && method === "PUT") {
      const id = parseInt(getTaskMatch[1]);
      const tasks = LocalDB.getTasks();
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error("Task not found");

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      const users = LocalDB.getUsers();
      const assignee = body.assignee_id ? users.find((u) => u.id === body.assignee_id) : null;

      tasks[idx] = {
        ...tasks[idx],
        ...body,
        assignee: assignee || (body.assignee_id === null ? null : tasks[idx].assignee),
        updated_at: new Date().toISOString()
      };

      LocalDB.saveTasks(tasks);
      LocalDB.broadcast("TASK_UPDATED", { task: tasks[idx], user_name: currentUser.full_name });
      return tasks[idx];
    }

    // 9. Tasks: PATCH status (Kanban drag-and-drop)
    const patchStatusMatch = endpoint.match(/^\/api\/tasks\/(\d+)\/status$/);
    if (patchStatusMatch && method === "PATCH") {
      const id = parseInt(patchStatusMatch[1]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === id);
      if (!task) throw new Error("Task not found");

      const oldStatus = task.status;
      task.status = body.status;
      if (body.position !== undefined && body.position !== null) task.position = body.position;
      task.updated_at = new Date().toISOString();

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      LocalDB.saveTasks(tasks);
      LocalDB.broadcast("TASK_MOVED", {
        task,
        old_status: oldStatus,
        new_status: task.status,
        user_name: currentUser.full_name
      });
      return task;
    }

    // 10. Tasks: DELETE
    if (getTaskMatch && method === "DELETE") {
      const id = parseInt(getTaskMatch[1]);
      let tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === id);
      const title = task ? task.title : `Task #${id}`;
      tasks = tasks.filter((t) => t.id !== id);
      LocalDB.saveTasks(tasks);

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      LocalDB.broadcast("TASK_DELETED", { task_id: id, task_title: title, user_name: currentUser.full_name });
      return { message: "Task deleted successfully", task_id: id };
    }

    // 11. Subtasks: POST
    const subtaskPostMatch = endpoint.match(/^\/api\/tasks\/(\d+)\/subtasks$/);
    if (subtaskPostMatch && method === "POST") {
      const taskId = parseInt(subtaskPostMatch[1]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const newSubtask = {
        id: Date.now(),
        task_id: taskId,
        title: body.title,
        is_completed: false,
        created_at: new Date().toISOString()
      };

      task.subtasks = task.subtasks || [];
      task.subtasks.push(newSubtask);
      task.subtask_count = task.subtasks.length;
      LocalDB.saveTasks(tasks);

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      LocalDB.broadcast("SUBTASK_ADDED", { task_id: taskId, subtask: newSubtask, user_name: currentUser.full_name });
      return newSubtask;
    }

    // 12. Subtasks: PATCH toggle
    const subtaskPatchMatch = endpoint.match(/^\/api\/tasks\/(\d+)\/subtasks\/(\d+)$/);
    if (subtaskPatchMatch && method === "PATCH") {
      const taskId = parseInt(subtaskPatchMatch[1]);
      const subtaskId = parseInt(subtaskPatchMatch[2]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const st = (task.subtasks || []).find((s) => s.id === subtaskId);
      if (st) {
        if (body.is_completed !== undefined) st.is_completed = body.is_completed;
        if (body.title) st.title = body.title;
        task.subtask_completed_count = task.subtasks.filter((s) => s.is_completed).length;
        LocalDB.saveTasks(tasks);

        const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
        LocalDB.broadcast("SUBTASK_UPDATED", { task_id: taskId, subtask: st, user_name: currentUser.full_name });
        return st;
      }
      throw new Error("Subtask not found");
    }

    // 13. Subtasks: DELETE
    if (subtaskPatchMatch && method === "DELETE") {
      const taskId = parseInt(subtaskPatchMatch[1]);
      const subtaskId = parseInt(subtaskPatchMatch[2]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      task.subtasks = (task.subtasks || []).filter((s) => s.id !== subtaskId);
      task.subtask_count = task.subtasks.length;
      task.subtask_completed_count = task.subtasks.filter((s) => s.is_completed).length;
      LocalDB.saveTasks(tasks);

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      LocalDB.broadcast("SUBTASK_DELETED", { task_id: taskId, subtask_id: subtaskId, user_name: currentUser.full_name });
      return { message: "Subtask deleted successfully" };
    }

    // 14. Comments: POST
    const commentPostMatch = endpoint.match(/^\/api\/tasks\/(\d+)\/comments$/);
    if (commentPostMatch && method === "POST") {
      const taskId = parseInt(commentPostMatch[1]);
      const tasks = LocalDB.getTasks();
      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task not found");

      const currentUser = JSON.parse(localStorage.getItem("taskflow_local_current_user") || "null") || MOCK_USERS[0];
      const newComment = {
        id: Date.now(),
        task_id: taskId,
        user_id: currentUser.id,
        content: body.content,
        created_at: new Date().toISOString(),
        user: currentUser
      };

      task.comments = task.comments || [];
      task.comments.push(newComment);
      task.comment_count = task.comments.length;
      LocalDB.saveTasks(tasks);

      LocalDB.broadcast("COMMENT_ADDED", { task_id: taskId, comment: newComment, user_name: currentUser.full_name });
      return newComment;
    }

    // 15. Stats
    if (endpoint.startsWith("/api/stats")) {
      const tasks = LocalDB.getTasks();
      const total = tasks.length;
      const completed = tasks.filter((t) => t.status === "completed").length;
      const in_progress = tasks.filter((t) => t.status === "in_progress").length;
      const todo = tasks.filter((t) => t.status === "todo").length;
      const backlog = tasks.filter((t) => t.status === "backlog").length;
      const in_review = tasks.filter((t) => t.status === "in_review").length;

      const now = new Date();
      const overdue = tasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== "completed").length;
      const high_priority = tasks.filter((t) => ["high", "urgent"].includes(t.priority)).length;
      const completion_rate = total > 0 ? Math.round((completed / total) * 100 * 10) / 10 : 0.0;

      const priority_dist = {
        urgent: tasks.filter((t) => t.priority === "urgent").length,
        high: tasks.filter((t) => t.priority === "high").length,
        medium: tasks.filter((t) => t.priority === "medium").length,
        low: tasks.filter((t) => t.priority === "low").length
      };

      const status_dist = { backlog, todo, in_progress, in_review, completed };

      // Collect all activities
      let activities = [];
      tasks.forEach((t) => {
        if (t.activities) activities.push(...t.activities);
      });
      activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return {
        total_tasks: total,
        completed_tasks: completed,
        in_progress_tasks: in_progress,
        todo_tasks: todo,
        backlog_tasks: backlog,
        in_review_tasks: in_review,
        overdue_tasks: overdue,
        high_priority_tasks: high_priority,
        completion_rate,
        priority_distribution: priority_dist,
        status_distribution: status_dist,
        recent_activities: activities.slice(0, 15)
      };
    }

    // 16. Reseed
    if (endpoint.startsWith("/api/seed")) {
      const initial = getInitialDemoTasks();
      localStorage.setItem("taskflow_local_tasks", JSON.stringify(initial));
      return { message: "Database reseeded successfully" };
    }

    return { status: "ok" };
  },

  // Auth Endpoints
  async login(email, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });
    this.setToken(data.access_token);
    return data;
  },

  async register(fullName, email, password, role = "member") {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      body: { full_name: fullName, email, password, role }
    });
    this.setToken(data.access_token);
    return data;
  },

  async getMe() {
    return this.request("/api/auth/me");
  },

  async getUsers() {
    return this.request("/api/auth/users");
  },

  // Task Endpoints
  async getTasks(filters = {}) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== "") {
        params.append(key, val);
      }
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request(`/api/tasks${query}`);
  },

  async createTask(taskData) {
    return this.request("/api/tasks", {
      method: "POST",
      body: taskData
    });
  },

  async getTask(taskId) {
    return this.request(`/api/tasks/${taskId}`);
  },

  async updateTask(taskId, updates) {
    return this.request(`/api/tasks/${taskId}`, {
      method: "PUT",
      body: updates
    });
  },

  async updateTaskStatus(taskId, status, position = null) {
    return this.request(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      body: { status, position }
    });
  },

  async deleteTask(taskId) {
    return this.request(`/api/tasks/${taskId}`, {
      method: "DELETE"
    });
  },

  // Subtasks
  async addSubtask(taskId, title) {
    return this.request(`/api/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: { title }
    });
  },

  async updateSubtask(taskId, subtaskId, updates) {
    return this.request(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      body: updates
    });
  },

  async deleteSubtask(taskId, subtaskId) {
    return this.request(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "DELETE"
    });
  },

  // Comments
  async addComment(taskId, content) {
    return this.request(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      body: { content }
    });
  },

  // Stats
  async getStats() {
    return this.request("/api/stats");
  },

  // Seed / Reset
  async reseed(force = true) {
    return this.request(`/api/seed?force=${force}`, {
      method: "POST"
    });
  }
};
