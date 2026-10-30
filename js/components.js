// Reusable UI Components & Modals
const Components = {
  // Toast Notification System
  showToast(message, type = "info", duration = 4000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-emerald-500 text-white shadow-emerald-500/20",
      info: "bg-indigo-600 text-white shadow-indigo-500/20",
      warning: "bg-amber-500 text-white shadow-amber-500/20",
      error: "bg-rose-600 text-white shadow-rose-500/20"
    };

    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 backdrop-blur-md text-sm font-medium ${
      bgColors[type] || bgColors.info
    }`;

    toast.innerHTML = `
      <div class="flex-1">${message}</div>
      <button class="opacity-70 hover:opacity-100 transition-opacity p-0.5">
        ${Icons.close("w-4 h-4")}
      </button>
    `;

    toast.querySelector("button").addEventListener("click", () => {
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.isConnected) {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  },

  // Priority Pill
  renderPriorityBadge(priority) {
    const p = (priority || "medium").toLowerCase();
    const config = {
      urgent: { label: "Urgent", class: "badge-urgent", icon: "🔥" },
      high: { label: "High", class: "badge-high", icon: "🔺" },
      medium: { label: "Medium", class: "badge-medium", icon: "⚡" },
      low: { label: "Low", class: "badge-low", icon: "🔹" }
    };
    const item = config[p] || config.medium;
    return `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${item.class}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
      </span>
    `;
  },

  // Status Badge
  renderStatusBadge(status) {
    const config = {
      backlog: { label: "Backlog", bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
      todo: { label: "To Do", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
      in_progress: { label: "In Progress", bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
      in_review: { label: "In Review", bg: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
      completed: { label: "Completed", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" }
    };
    const s = config[status] || { label: status, bg: "bg-gray-100 text-gray-700" };
    return `
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.bg}">
        ${s.label}
      </span>
    `;
  },

  // Due Date Badge with Overdue Detection
  renderDueDate(dueDateStr) {
    if (!dueDateStr) return "";

    const due = new Date(dueDateStr);
    const now = new Date();
    const isToday = due.toDateString() === now.toDateString();
    const isPast = due < now && !isToday;

    let text = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    let cls = "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800";

    if (isPast) {
      cls = "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 font-semibold";
      text = `Overdue (${text})`;
    } else if (isToday) {
      cls = "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 font-semibold";
      text = "Today";
    }

    return `
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${cls}">
        ${Icons.clock("w-3 h-3")}
        <span>${text}</span>
      </span>
    `;
  },

  // Avatar with Initials fallback
  renderAvatar(user, sizeCls = "w-7 h-7 text-xs") {
    if (!user) {
      return `
        <div class="${sizeCls} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-medium" title="Unassigned">
          ?
        </div>
      `;
    }

    if (user.avatar_url) {
      return `
        <img src="${user.avatar_url}" alt="${user.full_name}" class="${sizeCls} rounded-full object-cover border border-white dark:border-slate-800" title="${user.full_name} (${user.role})" />
      `;
    }

    const initials = user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return `
      <div class="${sizeCls} rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold tracking-tight shadow-sm" title="${user.full_name}">
        ${initials}
      </div>
    `;
  },

  // Confirmation Modal
  confirm(title, message, onConfirm) {
    const modal = document.getElementById("confirm-modal");
    const titleEl = document.getElementById("confirm-modal-title");
    const msgEl = document.getElementById("confirm-modal-msg");
    const confirmBtn = document.getElementById("confirm-modal-btn");
    const cancelBtn = document.getElementById("confirm-modal-cancel");

    titleEl.textContent = title;
    msgEl.textContent = message;

    modal.classList.remove("hidden");

    const cleanup = () => {
      modal.classList.add("hidden");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
    };

    confirmBtn.onclick = async () => {
      cleanup();
      await onConfirm();
    };

    cancelBtn.onclick = () => {
      cleanup();
    };
  }
};
