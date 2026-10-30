// Reactive Application State Store
const state = {
  currentUser: null,
  users: [],
  tasks: [],
  stats: null,
  currentView: "kanban", // "kanban" | "list" | "calendar" | "dashboard"
  activeTaskId: null,
  activeTaskDetail: null,
  theme: localStorage.getItem("taskflow_theme") || "dark",
  onlineUsersCount: 1,

  filters: {
    search: "",
    status: "",
    priority: "",
    assignee: "", // "" (all) | "mine" | userId
    tag: "",
    sortBy: "position",
    sortOrder: "asc"
  },

  listeners: new Set(),

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  notify(event, payload) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch (e) {
        console.error("State listener error:", e);
      }
    });
  },

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem("taskflow_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    this.notify("theme_changed", theme);
  },

  toggleTheme() {
    this.setTheme(this.theme === "dark" ? "light" : "dark");
  },

  setView(view) {
    this.currentView = view;
    this.notify("view_changed", view);
  },

  setFilters(partialFilters) {
    this.filters = { ...this.filters, ...partialFilters };
    this.notify("filters_changed", this.filters);
  },

  getFilteredTasks() {
    return this.tasks.filter((task) => {
      // Search
      if (this.filters.search) {
        const q = this.filters.search.toLowerCase();
        const matchTitle = (task.title || "").toLowerCase().includes(q);
        const matchDesc = (task.description || "").toLowerCase().includes(q);
        const matchTags = (task.tags || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      // Status
      if (this.filters.status && this.filters.status !== "all") {
        if (task.status !== this.filters.status) return false;
      }

      // Priority
      if (this.filters.priority && this.filters.priority !== "all") {
        if (task.priority !== this.filters.priority) return false;
      }

      // Assignee
      if (this.filters.assignee) {
        if (this.filters.assignee === "mine") {
          if (!this.currentUser || task.assignee_id !== this.currentUser.id) return false;
        } else if (this.filters.assignee === "unassigned") {
          if (task.assignee_id !== null) return false;
        } else {
          if (task.assignee_id !== parseInt(this.filters.assignee)) return false;
        }
      }

      // Tag
      if (this.filters.tag) {
        const taskTags = (task.tags || "").split(",").map((t) => t.trim().toLowerCase());
        if (!taskTags.includes(this.filters.tag.toLowerCase())) return false;
      }

      return true;
    });
  },

  // WebSocket Live Updates Handler
  handleWsEvent(type, data) {
    console.log("⚡ Handling WS event:", type, data);

    if (type === "TASK_CREATED") {
      // Check if task is already in state
      const exists = this.tasks.some((t) => t.id === data.task.id);
      if (!exists) {
        this.tasks.push(data.task);
        this.notify("tasks_updated", { reason: "create", task: data.task });
      }
      Components.showToast(`✨ ${data.user_name} created task "${data.task.title}"`, "info");
    } else if (type === "TASK_UPDATED") {
      const idx = this.tasks.findIndex((t) => t.id === data.task.id);
      if (idx !== -1) {
        this.tasks[idx] = data.task;
      } else {
        this.tasks.push(data.task);
      }
      // If currently inspecting this task, refresh detail
      if (this.activeTaskId === data.task.id && window.TaskDetailDrawer) {
        window.TaskDetailDrawer.refresh();
      }
      this.notify("tasks_updated", { reason: "update", task: data.task });
      Components.showToast(`📝 ${data.user_name} updated "${data.task.title}"`, "info");
    } else if (type === "TASK_MOVED") {
      const idx = this.tasks.findIndex((t) => t.id === data.task.id);
      if (idx !== -1) {
        this.tasks[idx] = data.task;
      }
      this.notify("tasks_updated", { reason: "move", task: data.task });
      Components.showToast(`🔄 ${data.user_name} moved "${data.task.title}" to ${data.new_status}`, "info");
    } else if (type === "TASK_DELETED") {
      this.tasks = this.tasks.filter((t) => t.id !== data.task_id);
      if (this.activeTaskId === data.task_id && window.TaskDetailDrawer) {
        window.TaskDetailDrawer.close();
      }
      this.notify("tasks_updated", { reason: "delete", taskId: data.task_id });
      Components.showToast(`🗑️ ${data.user_name} deleted task "${data.task_title || "Task #" + data.task_id}"`, "warning");
    } else if (type === "SUBTASK_ADDED" || type === "SUBTASK_UPDATED" || type === "SUBTASK_DELETED") {
      // If currently viewing task drawer, reload detail
      if (this.activeTaskId === data.task_id && window.TaskDetailDrawer) {
        window.TaskDetailDrawer.refresh();
      }
      // Also update task in list counts
      API.getTasks().then((refreshedTasks) => {
        this.tasks = refreshedTasks;
        this.notify("tasks_updated", { reason: "subtasks" });
      });
    } else if (type === "COMMENT_ADDED") {
      if (this.activeTaskId === data.task_id && window.TaskDetailDrawer) {
        window.TaskDetailDrawer.addCommentToView(data.comment);
      }
      Components.showToast(`💬 ${data.user_name} commented on a task`, "info");
    } else if (type === "PRESENCE_UPDATE") {
      this.onlineUsersCount = data.connection_count || 1;
      this.notify("presence_updated", data);
    }
  }
};
