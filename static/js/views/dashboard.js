// Analytics and Performance Dashboard View
const DashboardView = {
  async render(container) {
    container.innerHTML = `
      <div class="h-full flex items-center justify-center">
        <div class="animate-spin text-indigo-600">${Icons.refresh("w-8 h-8")}</div>
      </div>
    `;

    try {
      const stats = await API.getStats();
      state.stats = stats;

      const completionColor =
        stats.completion_rate >= 70
          ? "text-emerald-500"
          : stats.completion_rate >= 40
          ? "text-amber-500"
          : "text-indigo-500";

      container.innerHTML = `
        <div class="space-y-6 pb-10">
          <!-- Top KPI Metrics Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Total Tasks -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tasks</p>
                <h3 class="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">${stats.total_tasks}</h3>
                <span class="text-xs text-slate-400 mt-1 inline-block">Active workspace</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                ${Icons.kanban("w-6 h-6")}
              </div>
            </div>

            <!-- Completion Rate -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                <h3 class="text-3xl font-extrabold ${completionColor} mt-1">${stats.completion_rate}%</h3>
                <span class="text-xs text-slate-400 mt-1 inline-block">${stats.completed_tasks} completed</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                ${Icons.checkCircle("w-6 h-6")}
              </div>
            </div>

            <!-- In Progress -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
                <h3 class="text-3xl font-extrabold text-amber-500 mt-1">${stats.in_progress_tasks}</h3>
                <span class="text-xs text-slate-400 mt-1 inline-block">Under active work</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                ${Icons.zap("w-6 h-6")}
              </div>
            </div>

            <!-- Overdue -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue</p>
                <h3 class="text-3xl font-extrabold text-rose-500 mt-1">${stats.overdue_tasks}</h3>
                <span class="text-xs text-slate-400 mt-1 inline-block">Need attention</span>
              </div>
              <div class="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                ${Icons.alertCircle("w-6 h-6")}
              </div>
            </div>
          </div>

          <!-- Middle Section: Priority & Status Breakdown -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Priority Distribution -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span>Priority Distribution</span>
              </h3>
              <div class="space-y-3.5">
                ${this.renderPriorityBar("Urgent", stats.priority_distribution.urgent || 0, stats.total_tasks, "bg-rose-500")}
                ${this.renderPriorityBar("High", stats.priority_distribution.high || 0, stats.total_tasks, "bg-amber-500")}
                ${this.renderPriorityBar("Medium", stats.priority_distribution.medium || 0, stats.total_tasks, "bg-blue-500")}
                ${this.renderPriorityBar("Low", stats.priority_distribution.low || 0, stats.total_tasks, "bg-slate-400")}
              </div>
            </div>

            <!-- Status Distribution -->
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span>Workflow Pipeline Stages</span>
              </h3>
              <div class="space-y-3.5">
                ${this.renderStatusBar("Backlog", stats.status_distribution.backlog || 0, stats.total_tasks, "bg-slate-400")}
                ${this.renderStatusBar("To Do", stats.status_distribution.todo || 0, stats.total_tasks, "bg-blue-500")}
                ${this.renderStatusBar("In Progress", stats.status_distribution.in_progress || 0, stats.total_tasks, "bg-amber-500")}
                ${this.renderStatusBar("In Review", stats.status_distribution.in_review || 0, stats.total_tasks, "bg-purple-500")}
                ${this.renderStatusBar("Completed", stats.status_distribution.completed || 0, stats.total_tasks, "bg-emerald-500")}
              </div>
            </div>
          </div>

          <!-- Live Activity Audit Trail Feed -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                ${Icons.activity("w-5 h-5 text-indigo-500")}
                <span>Recent Workspace Activity</span>
              </h3>
              <span class="text-xs text-slate-400 font-medium">Synced in Real-time</span>
            </div>

            <div class="space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800">
              ${
                stats.recent_activities.length > 0
                  ? stats.recent_activities
                      .map((act) => {
                        const timeAgo = this.formatTimeAgo(act.created_at);
                        return `
                          <div class="pt-3.5 first:pt-0 flex items-start justify-between gap-4">
                            <div class="flex items-start gap-3">
                              ${Components.renderAvatar(act.user, "w-8 h-8 text-xs mt-0.5")}
                              <div>
                                <p class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  ${act.user ? act.user.full_name : "Team Member"}
                                </p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  ${act.details || act.action}
                                </p>
                              </div>
                            </div>
                            <span class="text-[11px] text-slate-400 whitespace-nowrap">${timeAgo}</span>
                          </div>
                        `;
                      })
                      .join("")
                  : `<p class="text-xs text-slate-400 py-6 text-center">No recorded activity yet.</p>`
              }
            </div>
          </div>
        </div>
      `;
    } catch (err) {
      container.innerHTML = `
        <div class="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-2xl text-rose-600 text-sm">
          Failed to load dashboard metrics: ${err.message}
        </div>
      `;
    }
  },

  renderPriorityBar(label, count, total, barClass) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>${label}</span>
          <span>${count} tasks (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div class="${barClass} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  },

  renderStatusBar(label, count, total, barClass) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
      <div>
        <div class="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>${label}</span>
          <span>${count} tasks (${pct}%)</span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div class="${barClass} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      </div>
    `;
  },

  formatTimeAgo(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
};
