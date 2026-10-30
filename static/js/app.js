// TaskFlow Pro Core Orchestrator & Modal Controllers

// ================= Task Modal (Create / Edit) =================
window.TaskModal = {
  currentTask: null,
  subtasksList: [],

  open(task = null) {
    this.currentTask = task;
    this.subtasksList = [];

    const modal = document.getElementById("task-modal");
    const titleEl = document.getElementById("task-modal-title");
    const form = document.getElementById("task-form");

    titleEl.textContent = task && task.id ? "Edit Task" : "Create New Task";

    // Populate Fields
    document.getElementById("task-input-title").value = (task && task.title) || "";
    document.getElementById("task-input-desc").value = (task && task.description) || "";
    document.getElementById("task-input-status").value = (task && task.status) || "todo";
    document.getElementById("task-input-priority").value = (task && task.priority) || "medium";
    document.getElementById("task-input-tags").value = (task && task.tags) || "";

    // Due Date
    if (task && task.due_date) {
      const d = new Date(task.due_date);
      // Format as YYYY-MM-DDTHH:MM
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - offset).toISOString().slice(0, 16);
      document.getElementById("task-input-due").value = localISOTime;
    } else {
      document.getElementById("task-input-due").value = "";
    }

    // Populate Assignee Select
    const assigneeSelect = document.getElementById("task-input-assignee");
    assigneeSelect.innerHTML = `<option value="">Unassigned</option>`;
    state.users.forEach((u) => {
      const opt = document.createElement("option");
      opt.value = u.id;
      opt.textContent = `${u.full_name} (${u.role})`;
      if (task && task.assignee_id === u.id) {
        opt.selected = true;
      }
      assigneeSelect.appendChild(opt);
    });

    // Subtasks builder (for creation mode)
    const subtasksContainer = document.getElementById("task-modal-subtasks-section");
    if (!task || !task.id) {
      subtasksContainer.classList.remove("hidden");
      this.renderSubtaskList();
    } else {
      subtasksContainer.classList.add("hidden");
    }

    modal.classList.remove("hidden");
    document.getElementById("task-input-title").focus();
  },

  close() {
    document.getElementById("task-modal").classList.add("hidden");
    this.currentTask = null;
    this.subtasksList = [];
  },

  renderSubtaskList() {
    const listEl = document.getElementById("modal-subtasks-list");
    listEl.innerHTML = this.subtasksList
      .map(
        (st, idx) => `
        <div class="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <span class="text-slate-700 dark:text-slate-300">${st}</span>
          <button type="button" class="text-slate-400 hover:text-rose-500 remove-subtask-item" data-index="${idx}">
            ${Icons.close("w-3.5 h-3.5")}
          </button>
        </div>
      `
      )
      .join("");

    listEl.querySelectorAll(".remove-subtask-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-index"));
        this.subtasksList.splice(idx, 1);
        this.renderSubtaskList();
      });
    });
  },

  addSubtaskItem(title) {
    if (title && title.trim()) {
      this.subtasksList.push(title.trim());
      this.renderSubtaskList();
    }
  },

  async save() {
    const title = document.getElementById("task-input-title").value.trim();
    if (!title) {
      Components.showToast("Task title is required", "error");
      return;
    }

    const description = document.getElementById("task-input-desc").value.trim();
    const statusVal = document.getElementById("task-input-status").value;
    const priority = document.getElementById("task-input-priority").value;
    const tags = document.getElementById("task-input-tags").value.trim();
    const dueVal = document.getElementById("task-input-due").value;
    const due_date = dueVal ? new Date(dueVal).toISOString() : null;
    const assigneeVal = document.getElementById("task-input-assignee").value;
    const assignee_id = assigneeVal ? parseInt(assigneeVal) : null;

    try {
      if (this.currentTask && this.currentTask.id) {
        // Update Task
        await API.updateTask(this.currentTask.id, {
          title,
          description,
          status: statusVal,
          priority,
          tags,
          due_date,
          assignee_id
        });
        Components.showToast("Task updated successfully", "success");
      } else {
        // Create Task
        await API.createTask({
          title,
          description,
          status: statusVal,
          priority,
          tags,
          due_date,
          assignee_id,
          subtasks: this.subtasksList
        });
        Components.showToast("Task created successfully", "success");
      }
      this.close();
      App.refreshView();
    } catch (err) {
      Components.showToast(err.message, "error");
    }
  }
};

// ================= Task Detail Drawer =================
window.TaskDetailDrawer = {
  activeTaskId: null,
  taskData: null,

  async open(taskId) {
    this.activeTaskId = taskId;
    state.activeTaskId = taskId;
    const drawer = document.getElementById("task-detail-drawer");
    const content = document.getElementById("task-detail-content");

    drawer.classList.remove("hidden");
    content.innerHTML = `
      <div class="h-64 flex items-center justify-center">
        <div class="animate-spin text-indigo-600">${Icons.refresh("w-8 h-8")}</div>
      </div>
    `;

    await this.refresh();
  },

  close() {
    document.getElementById("task-detail-drawer").classList.add("hidden");
    this.activeTaskId = null;
    state.activeTaskId = null;
  },

  async refresh() {
    if (!this.activeTaskId) return;
    try {
      this.taskData = await API.getTask(this.activeTaskId);
      this.render();
    } catch (err) {
      Components.showToast(`Error loading task: ${err.message}`, "error");
      this.close();
    }
  },

  render() {
    const task = this.taskData;
    const content = document.getElementById("task-detail-content");

    const formattedDate = task.due_date
      ? new Date(task.due_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      : "No due date set";

    content.innerHTML = `
      <div class="p-6 space-y-6">
        <!-- Top Status & Actions Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <select id="drawer-status-select" class="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
              <option value="backlog" ${task.status === "backlog" ? "selected" : ""}>Backlog</option>
              <option value="todo" ${task.status === "todo" ? "selected" : ""}>To Do</option>
              <option value="in_progress" ${task.status === "in_progress" ? "selected" : ""}>In Progress</option>
              <option value="in_review" ${task.status === "in_review" ? "selected" : ""}>In Review</option>
              <option value="completed" ${task.status === "completed" ? "selected" : ""}>Completed</option>
            </select>

            <select id="drawer-priority-select" class="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500">
              <option value="urgent" ${task.priority === "urgent" ? "selected" : ""}>🔥 Urgent</option>
              <option value="high" ${task.priority === "high" ? "selected" : ""}>🔺 High</option>
              <option value="medium" ${task.priority === "medium" ? "selected" : ""}>⚡ Medium</option>
              <option value="low" ${task.priority === "low" ? "selected" : ""}>🔹 Low</option>
            </select>
          </div>

          <div class="flex items-center gap-1">
            <button id="drawer-edit-btn" class="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Edit Full Task">
              ${Icons.edit("w-4 h-4")}
            </button>
            <button id="drawer-delete-btn" class="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="Delete Task">
              ${Icons.trash("w-4 h-4")}
            </button>
            <button id="drawer-close-btn" class="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition">
              ${Icons.close("w-5 h-5")}
            </button>
          </div>
        </div>

        <!-- Task Title -->
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-50 leading-snug">
            ${task.title}
          </h2>
          <p class="text-xs text-slate-400 mt-1">
            Created on ${new Date(task.created_at).toLocaleDateString()} by ${task.creator ? task.creator.full_name : "Team"}
          </p>
        </div>

        <!-- Metadata Grid -->
        <div class="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div>
            <span class="text-slate-400 font-medium block mb-1">Assignee</span>
            <div class="flex items-center gap-2">
              ${Components.renderAvatar(task.assignee, "w-6 h-6 text-[10px]")}
              <span class="font-semibold text-slate-700 dark:text-slate-200">
                ${task.assignee ? task.assignee.full_name : "Unassigned"}
              </span>
            </div>
          </div>
          <div>
            <span class="text-slate-400 font-medium block mb-1">Due Date</span>
            <span class="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              ${Icons.calendar("w-4 h-4 text-slate-400")}
              ${formattedDate}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</h4>
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            ${task.description || "<span class='text-slate-400 italic'>No description provided.</span>"}
          </div>
        </div>

        <!-- Subtasks / Checklist -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Checklist (${task.subtask_completed_count}/${task.subtask_count})
            </h4>
          </div>

          <div class="space-y-2 mb-3">
            ${
              task.subtasks && task.subtasks.length > 0
                ? task.subtasks
                    .map(
                      (st) => `
                    <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 group">
                      <label class="flex items-center gap-2.5 cursor-pointer text-xs flex-1">
                        <input type="checkbox" class="subtask-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" data-subtask-id="${st.id}" ${
                        st.is_completed ? "checked" : ""
                      } />
                        <span class="font-medium text-slate-700 dark:text-slate-200 ${
                          st.is_completed ? "line-through opacity-50" : ""
                        }">${st.title}</span>
                      </label>
                      <button class="delete-subtask-btn opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition" data-subtask-id="${st.id}">
                        ${Icons.close("w-3.5 h-3.5")}
                      </button>
                    </div>
                  `
                    )
                    .join("")
                : `<p class="text-xs text-slate-400 italic py-1">No checklist items yet.</p>`
            }
          </div>

          <!-- Add new subtask input -->
          <div class="flex items-center gap-2">
            <input type="text" id="new-subtask-input" placeholder="+ Add a subtask item..." class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
            <button id="add-subtask-btn" class="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition">
              Add
            </button>
          </div>
        </div>

        <!-- Discussion / Comments -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            ${Icons.message("w-4 h-4")}
            <span>Discussion & Comments</span>
          </h4>

          <div id="drawer-comments-container" class="space-y-3 mb-4">
            ${
              task.comments && task.comments.length > 0
                ? task.comments
                    .map(
                      (c) => `
                    <div class="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                      ${Components.renderAvatar(c.user, "w-7 h-7 text-[10px] mt-0.5")}
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <span class="font-semibold text-slate-800 dark:text-slate-200">
                            ${c.user ? c.user.full_name : "User"}
                          </span>
                          <span class="text-[10px] text-slate-400">
                            ${new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          ${c.content}
                        </p>
                      </div>
                    </div>
                  `
                    )
                    .join("")
                : `<p class="text-xs text-slate-400 italic py-2">No comments yet. Start the conversation!</p>`
            }
          </div>

          <!-- Add Comment Box -->
          <div class="flex items-center gap-2">
            <input type="text" id="new-comment-input" placeholder="Write a comment..." class="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500" />
            <button id="post-comment-btn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm">
              Send
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  },

  addCommentToView(comment) {
    if (!this.activeTaskId || this.activeTaskId !== comment.task_id) return;
    const container = document.getElementById("drawer-comments-container");
    if (!container) return;

    const div = document.createElement("div");
    div.className =
      "flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs toast-enter";
    div.innerHTML = `
      ${Components.renderAvatar(comment.user, "w-7 h-7 text-[10px] mt-0.5")}
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-slate-800 dark:text-slate-200">
            ${comment.user ? comment.user.full_name : "User"}
          </span>
          <span class="text-[10px] text-slate-400">just now</span>
        </div>
        <p class="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          ${comment.content}
        </p>
      </div>
    `;
    container.appendChild(div);
  },

  attachEvents() {
    const task = this.taskData;

    // Close button
    document.getElementById("drawer-close-btn").addEventListener("click", () => this.close());

    // Status change
    document.getElementById("drawer-status-select").addEventListener("change", async (e) => {
      try {
        await API.updateTaskStatus(task.id, e.target.value);
        Components.showToast("Task status updated", "success");
      } catch (err) {
        Components.showToast(err.message, "error");
      }
    });

    // Priority change
    document.getElementById("drawer-priority-select").addEventListener("change", async (e) => {
      try {
        await API.updateTask(task.id, { priority: e.target.value });
        Components.showToast("Task priority updated", "success");
      } catch (err) {
        Components.showToast(err.message, "error");
      }
    });

    // Full Edit
    document.getElementById("drawer-edit-btn").addEventListener("click", () => {
      window.TaskModal.open(task);
    });

    // Delete
    document.getElementById("drawer-delete-btn").addEventListener("click", () => {
      Components.confirm("Delete Task", `Are you sure you want to delete "${task.title}"?`, async () => {
        try {
          await API.deleteTask(task.id);
          this.close();
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    });

    // Subtask toggles
    document.querySelectorAll(".subtask-checkbox").forEach((cb) => {
      cb.addEventListener("change", async (e) => {
        const subtaskId = parseInt(cb.getAttribute("data-subtask-id"));
        try {
          await API.updateSubtask(task.id, subtaskId, { is_completed: e.target.checked });
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    });

    // Delete subtask
    document.querySelectorAll(".delete-subtask-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const subtaskId = parseInt(btn.getAttribute("data-subtask-id"));
        try {
          await API.deleteSubtask(task.id, subtaskId);
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    });

    // Add Subtask
    const newSubtaskInput = document.getElementById("new-subtask-input");
    const addSubtaskBtn = document.getElementById("add-subtask-btn");
    const handleAddSubtask = async () => {
      const title = newSubtaskInput.value.trim();
      if (!title) return;
      try {
        await API.addSubtask(task.id, title);
        newSubtaskInput.value = "";
      } catch (err) {
        Components.showToast(err.message, "error");
      }
    };
    addSubtaskBtn.addEventListener("click", handleAddSubtask);
    newSubtaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAddSubtask();
    });

    // Add Comment
    const commentInput = document.getElementById("new-comment-input");
    const postCommentBtn = document.getElementById("post-comment-btn");
    const handleAddComment = async () => {
      const content = commentInput.value.trim();
      if (!content) return;
      try {
        await API.addComment(task.id, content);
        commentInput.value = "";
      } catch (err) {
        Components.showToast(err.message, "error");
      }
    };
    postCommentBtn.addEventListener("click", handleAddComment);
    commentInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAddComment();
    });
  }
};

// ================= Auth Modal =================
window.AuthModal = {
  mode: "login", // "login" | "register"

  open(mode = "login") {
    this.mode = mode;
    const modal = document.getElementById("auth-modal");
    modal.classList.remove("hidden");
    this.render();
  },

  close() {
    document.getElementById("auth-modal").classList.add("hidden");
  },

  render() {
    const isLogin = this.mode === "login";
    document.getElementById("auth-modal-title").textContent = isLogin ? "Sign In to TaskFlow" : "Create Account";
    document.getElementById("auth-submit-btn").textContent = isLogin ? "Sign In" : "Register";
    document.getElementById("auth-register-name-row").style.display = isLogin ? "none" : "block";
    document.getElementById("auth-switch-prompt").textContent = isLogin
      ? "Don't have an account?"
      : "Already have an account?";
    document.getElementById("auth-switch-link").textContent = isLogin ? "Sign Up" : "Sign In";
  },

  switchMode() {
    this.mode = this.mode === "login" ? "register" : "login";
    this.render();
  },

  async quickDemoLogin(email) {
    try {
      await API.login(email, "password123");
      Components.showToast("Signed in successfully!", "success");
      this.close();
      await App.initSession();
    } catch (err) {
      Components.showToast(err.message, "error");
    }
  },

  async submit() {
    const email = document.getElementById("auth-input-email").value.trim();
    const password = document.getElementById("auth-input-password").value;

    if (!email || !password) {
      Components.showToast("Please provide both email and password", "error");
      return;
    }

    try {
      if (this.mode === "login") {
        await API.login(email, password);
      } else {
        const name = document.getElementById("auth-input-name").value.trim();
        if (!name) {
          Components.showToast("Full name is required", "error");
          return;
        }
        await API.register(name, email, password);
      }
      Components.showToast("Welcome to TaskFlow!", "success");
      this.close();
      await App.initSession();
    } catch (err) {
      Components.showToast(err.message, "error");
    }
  }
};

// ================= Main App Application Controller =================
const App = {
  async init() {
    console.log("🚀 Initializing TaskFlow Pro Application...");

    // Apply saved theme
    state.setTheme(state.theme);

    // Bind Global Keyboard Shortcuts
    this.bindKeyboardShortcuts();

    // Subscribe to state changes
    state.subscribe((event, payload) => {
      if (event === "tasks_updated" || event === "filters_changed") {
        this.refreshView();
      } else if (event === "view_changed") {
        this.updateViewNavigation(payload);
        this.refreshView();
      } else if (event === "presence_updated") {
        this.updatePresenceBadge();
      }
    });

    // Listen for WS status updates
    window.addEventListener("taskflow:ws_status", (e) => {
      this.updateWsStatusBadge(e.detail);
    });

    // Listen for unauthorized event
    window.addEventListener("taskflow:unauthorized", () => {
      socketClient.disconnect();
      AuthModal.open("login");
    });

    // Check if token exists
    if (API.getToken()) {
      await this.initSession();
    } else {
      AuthModal.open("login");
    }

    this.bindDOMEvents();
  },

  async initSession() {
    try {
      const user = await API.getMe();
      state.currentUser = user;

      // Load team users
      state.users = await API.getUsers();

      // Connect real-time WebSocket
      socketClient.connect();
      socketClient.on("TASK_CREATED", (d) => state.handleWsEvent("TASK_CREATED", d));
      socketClient.on("TASK_UPDATED", (d) => state.handleWsEvent("TASK_UPDATED", d));
      socketClient.on("TASK_MOVED", (d) => state.handleWsEvent("TASK_MOVED", d));
      socketClient.on("TASK_DELETED", (d) => state.handleWsEvent("TASK_DELETED", d));
      socketClient.on("SUBTASK_ADDED", (d) => state.handleWsEvent("SUBTASK_ADDED", d));
      socketClient.on("SUBTASK_UPDATED", (d) => state.handleWsEvent("SUBTASK_UPDATED", d));
      socketClient.on("SUBTASK_DELETED", (d) => state.handleWsEvent("SUBTASK_DELETED", d));
      socketClient.on("COMMENT_ADDED", (d) => state.handleWsEvent("COMMENT_ADDED", d));
      socketClient.on("PRESENCE_UPDATE", (d) => state.handleWsEvent("PRESENCE_UPDATE", d));

      // Update User profile UI in top navbar
      this.updateUserUI();

      // Fetch Tasks
      state.tasks = await API.getTasks();

      // Render initial view
      this.refreshView();
    } catch (err) {
      console.warn("Session init error:", err);
      AuthModal.open("login");
    }
  },

  updateUserUI() {
    const user = state.currentUser;
    if (!user) return;

    const userBtn = document.getElementById("user-menu-btn");
    userBtn.innerHTML = `
      ${Components.renderAvatar(user, "w-8 h-8 text-xs")}
      <div class="hidden md:flex flex-col text-left">
        <span class="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">${user.full_name}</span>
        <span class="text-[10px] text-slate-400 capitalize mt-0.5">${user.role}</span>
      </div>
    `;
  },

  updateWsStatusBadge(status) {
    const badge = document.getElementById("ws-status-badge");
    if (!badge) return;

    if (status === "connected") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-500 live-indicator-glow"></span>
        <span class="hidden sm:inline font-medium text-emerald-600 dark:text-emerald-400">Live</span>
      `;
      badge.title = "Real-time sync connected";
    } else if (status === "connecting") {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span class="hidden sm:inline font-medium text-amber-600 dark:text-amber-400">Syncing...</span>
      `;
      badge.title = "Connecting to sync server...";
    } else {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span class="hidden sm:inline font-medium text-rose-600 dark:text-rose-400">Offline</span>
      `;
      badge.title = "Real-time sync disconnected";
    }
  },

  updatePresenceBadge() {
    const countEl = document.getElementById("presence-count");
    if (countEl) {
      countEl.textContent = `${state.onlineUsersCount} online`;
    }
  },

  refreshView() {
    const container = document.getElementById("view-container");
    if (state.currentView === "kanban") {
      KanbanView.render(container);
    } else if (state.currentView === "list") {
      ListView.render(container);
    } else if (state.currentView === "calendar") {
      CalendarView.render(container);
    } else if (state.currentView === "dashboard") {
      DashboardView.render(container);
    }
  },

  updateViewNavigation(view) {
    document.querySelectorAll(".view-nav-btn").forEach((btn) => {
      const v = btn.getAttribute("data-view");
      if (v === view) {
        btn.classList.add("bg-white", "dark:bg-slate-800", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
        btn.classList.remove("text-slate-600", "dark:text-slate-400");
      } else {
        btn.classList.remove("bg-white", "dark:bg-slate-800", "text-indigo-600", "dark:text-indigo-400", "shadow-sm");
        btn.classList.add("text-slate-600", "dark:text-slate-400");
      }
    });

    document.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
      const v = btn.getAttribute("data-view");
      if (v === view) {
        btn.classList.add("text-indigo-600", "dark:text-indigo-400");
        btn.classList.remove("text-slate-400");
      } else {
        btn.classList.remove("text-indigo-600", "dark:text-indigo-400");
        btn.classList.add("text-slate-400");
      }
    });
  },

  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ignore if user is inside an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
        if (e.key === "Escape") {
          document.activeElement.blur();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) searchInput.focus();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        TaskModal.open();
      } else if (e.key === "Escape") {
        TaskModal.close();
        TaskDetailDrawer.close();
      }
    });
  },

  bindDOMEvents() {
    // Theme toggle
    document.getElementById("theme-toggle-btn").addEventListener("click", () => {
      state.toggleTheme();
    });

    // New Task primary button
    document.getElementById("primary-new-task-btn").addEventListener("click", () => {
      TaskModal.open();
    });

    // View Navigation Buttons (Desktop)
    document.querySelectorAll(".view-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.setView(btn.getAttribute("data-view"));
      });
    });

    // View Navigation Buttons (Mobile)
    document.querySelectorAll(".mobile-nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.setView(btn.getAttribute("data-view"));
      });
    });

    // Global Search
    const searchInput = document.getElementById("global-search-input");
    searchInput.addEventListener("input", (e) => {
      state.setFilters({ search: e.target.value });
    });

    // Filter Priority
    document.getElementById("filter-priority").addEventListener("change", (e) => {
      state.setFilters({ priority: e.target.value });
    });

    // Filter Assignee
    document.getElementById("filter-assignee").addEventListener("change", (e) => {
      state.setFilters({ assignee: e.target.value });
    });

    // Task Modal Save & Close
    document.getElementById("task-modal-save").addEventListener("click", () => TaskModal.save());
    document.getElementById("task-modal-close").addEventListener("click", () => TaskModal.close());
    document.getElementById("task-modal-cancel").addEventListener("click", () => TaskModal.close());

    // Task Modal Subtask Add on Enter
    const modalSubtaskInput = document.getElementById("modal-subtask-input");
    const modalAddSubtaskBtn = document.getElementById("modal-add-subtask-btn");
    const addSubtaskFromModal = () => {
      TaskModal.addSubtaskItem(modalSubtaskInput.value);
      modalSubtaskInput.value = "";
    };
    modalAddSubtaskBtn.addEventListener("click", addSubtaskFromModal);
    modalSubtaskInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addSubtaskFromModal();
      }
    });

    // User Profile Dropdown Toggle
    const userMenuBtn = document.getElementById("user-menu-btn");
    const userDropdown = document.getElementById("user-dropdown");
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      userDropdown.classList.add("hidden");
    });

    // Reseed Demo Data
    document.getElementById("reseed-data-btn").addEventListener("click", () => {
      Components.confirm("Reset Demo Data", "Reset database with fresh realistic tasks and demo users?", async () => {
        try {
          await API.reseed(true);
          Components.showToast("Database restored with fresh demo tasks!", "success");
          state.tasks = await API.getTasks();
          App.refreshView();
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    });

    // Logout
    document.getElementById("logout-btn").addEventListener("click", () => {
      API.setToken(null);
      socketClient.disconnect();
      state.currentUser = null;
      Components.showToast("Signed out", "info");
      AuthModal.open("login");
    });

    // Auth Modal Handlers
    document.getElementById("auth-submit-btn").addEventListener("click", () => AuthModal.submit());
    document.getElementById("auth-switch-link").addEventListener("click", () => AuthModal.switchMode());
    document.getElementById("demo-login-alex").addEventListener("click", () => AuthModal.quickDemoLogin("alex@example.com"));
    document.getElementById("demo-login-sarah").addEventListener("click", () => AuthModal.quickDemoLogin("sarah@example.com"));
  }
};

// Launch Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => App.init());
