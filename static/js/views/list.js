// Interactive List and Table View with Quick Completion & Bulk Actions
const ListView = {
  selectedTaskIds: new Set(),

  render(container) {
    const tasks = state.getFilteredTasks();

    container.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
        <!-- List Toolbar & Bulk Actions Bar -->
        <div class="px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
              ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}
            </span>

            ${
              this.selectedTaskIds.size > 0
                ? `<div class="flex items-center gap-2 pl-3 border-l border-slate-300 dark:border-slate-700">
                    <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      ${this.selectedTaskIds.size} selected
                    </span>
                    <button id="bulk-complete-btn" class="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100 transition">
                      Mark Completed
                    </button>
                    <button id="bulk-delete-btn" class="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100 transition">
                      Delete Selected
                    </button>
                  </div>`
                : ""
            }
          </div>

          <div class="flex items-center gap-2">
            <button id="add-task-list-btn" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition shadow-sm">
              ${Icons.plus("w-3.5 h-3.5")}
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <!-- Table Container -->
        <div class="flex-1 overflow-x-auto overflow-y-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead class="sticky top-0 bg-slate-50 dark:bg-slate-800/90 backdrop-blur-sm z-10 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="w-10 px-4 py-3 text-center">
                  <input type="checkbox" id="select-all-tasks" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" ${
                    tasks.length > 0 && this.selectedTaskIds.size === tasks.length ? "checked" : ""
                  } />
                </th>
                <th class="px-4 py-3">Task</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Priority</th>
                <th class="px-4 py-3">Due Date</th>
                <th class="px-4 py-3">Checklist</th>
                <th class="px-4 py-3">Assignee</th>
                <th class="w-20 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
              ${
                tasks.length > 0
                  ? tasks.map((task) => this.renderTableRow(task)).join("")
                  : `<tr>
                      <td colspan="8" class="text-center py-16 text-slate-400">
                        <div class="flex flex-col items-center justify-center gap-2">
                          ${Icons.kanban("w-8 h-8 opacity-40")}
                          <span>No tasks found matching current filters.</span>
                        </div>
                      </td>
                    </tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.attachEvents(container);
  },

  renderTableRow(task) {
    const isCompleted = task.status === "completed";
    const isSelected = this.selectedTaskIds.has(task.id);

    return `
      <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group cursor-pointer ${
        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
      }" data-task-id="${task.id}">
        <!-- Select Checkbox -->
        <td class="px-4 py-3.5 text-center" onclick="event.stopPropagation()">
          <input type="checkbox" class="task-row-checkbox rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" data-task-id="${task.id}" ${
            isSelected ? "checked" : ""
          } />
        </td>

        <!-- Title & Tags -->
        <td class="px-4 py-3.5 max-w-xs md:max-w-md">
          <div class="flex items-start gap-2.5">
            <button class="quick-complete-toggle mt-0.5 text-slate-400 hover:text-emerald-500 transition" data-task-id="${task.id}" title="${
              isCompleted ? "Mark incomplete" : "Mark completed"
            }" onclick="event.stopPropagation()">
              ${
                isCompleted
                  ? `<span class="text-emerald-500">${Icons.checkCircle("w-5 h-5")}</span>`
                  : `<span class="text-slate-300 dark:text-slate-600 hover:text-emerald-500"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"></circle></svg></span>`
              }
            </button>
            <div class="min-w-0">
              <span class="font-medium text-slate-800 dark:text-slate-100 ${
                isCompleted ? "line-through opacity-50" : ""
              }">
                ${task.title}
              </span>
              ${
                task.tags
                  ? `<div class="flex flex-wrap gap-1 mt-1">
                      ${task.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .slice(0, 3)
                        .map(
                          (tag) =>
                            `<span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">#${tag}</span>`
                        )
                        .join("")}
                     </div>`
                  : ""
              }
            </div>
          </div>
        </td>

        <!-- Status -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${Components.renderStatusBadge(task.status)}
        </td>

        <!-- Priority -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${Components.renderPriorityBadge(task.priority)}
        </td>

        <!-- Due Date -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          ${Components.renderDueDate(task.due_date)}
        </td>

        <!-- Checklist progress -->
        <td class="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
          ${
            task.subtask_count > 0
              ? `<div class="flex items-center gap-2">
                  <div class="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full rounded-full" style="width: ${Math.round(
                      (task.subtask_completed_count / task.subtask_count) * 100
                    )}%"></div>
                  </div>
                  <span>${task.subtask_completed_count}/${task.subtask_count}</span>
                 </div>`
              : `<span class="text-slate-400">-</span>`
          }
        </td>

        <!-- Assignee -->
        <td class="px-4 py-3.5 whitespace-nowrap">
          <div class="flex items-center gap-2">
            ${Components.renderAvatar(task.assignee, "w-6 h-6 text-[10px]")}
            <span class="text-xs text-slate-600 dark:text-slate-300">
              ${task.assignee ? task.assignee.full_name : "Unassigned"}
            </span>
          </div>
        </td>

        <!-- Actions -->
        <td class="px-4 py-3.5 text-right whitespace-nowrap" onclick="event.stopPropagation()">
          <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="edit-btn p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition" data-task-id="${task.id}" title="Edit">
              ${Icons.edit("w-4 h-4")}
            </button>
            <button class="del-btn p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition" data-task-id="${task.id}" title="Delete">
              ${Icons.trash("w-4 h-4")}
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  attachEvents(container) {
    // Row click -> Task details drawer
    container.querySelectorAll("tbody tr").forEach((tr) => {
      tr.addEventListener("click", () => {
        const id = parseInt(tr.getAttribute("data-task-id"));
        if (id) window.TaskDetailDrawer.open(id);
      });
    });

    // Add task button
    const addBtn = container.querySelector("#add-task-list-btn");
    if (addBtn) {
      addBtn.addEventListener("click", () => window.TaskModal.open());
    }

    // Quick complete toggle
    container.querySelectorAll(".quick-complete-toggle").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = parseInt(btn.getAttribute("data-task-id"));
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;
        const newStatus = task.status === "completed" ? "todo" : "completed";
        try {
          await API.updateTaskStatus(id, newStatus);
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    });

    // Edit button
    container.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-task-id"));
        const task = state.tasks.find((t) => t.id === id);
        if (task) window.TaskModal.open(task);
      });
    });

    // Delete button
    container.querySelectorAll(".del-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-task-id"));
        const task = state.tasks.find((t) => t.id === id);
        if (!task) return;
        Components.confirm(
          "Delete Task",
          `Are you sure you want to delete "${task.title}"?`,
          async () => {
            try {
              await API.deleteTask(id);
              ListView.selectedTaskIds.delete(id);
            } catch (err) {
              Components.showToast(err.message, "error");
            }
          }
        );
      });
    });

    // Select All Checkbox
    const selectAll = container.querySelector("#select-all-tasks");
    if (selectAll) {
      selectAll.addEventListener("change", (e) => {
        const tasks = state.getFilteredTasks();
        if (e.target.checked) {
          tasks.forEach((t) => this.selectedTaskIds.add(t.id));
        } else {
          this.selectedTaskIds.clear();
        }
        ListView.render(container);
      });
    }

    // Individual Row Checkboxes
    container.querySelectorAll(".task-row-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = parseInt(cb.getAttribute("data-task-id"));
        if (e.target.checked) {
          this.selectedTaskIds.add(id);
        } else {
          this.selectedTaskIds.delete(id);
        }
        ListView.render(container);
      });
    });

    // Bulk Complete
    const bulkCompleteBtn = container.querySelector("#bulk-complete-btn");
    if (bulkCompleteBtn) {
      bulkCompleteBtn.addEventListener("click", async () => {
        const ids = Array.from(this.selectedTaskIds);
        try {
          for (const id of ids) {
            await API.updateTaskStatus(id, "completed");
          }
          this.selectedTaskIds.clear();
          Components.showToast(`Marked ${ids.length} tasks as completed!`, "success");
        } catch (err) {
          Components.showToast(err.message, "error");
        }
      });
    }

    // Bulk Delete
    const bulkDeleteBtn = container.querySelector("#bulk-delete-btn");
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener("click", () => {
        const ids = Array.from(this.selectedTaskIds);
        Components.confirm(
          "Bulk Delete",
          `Are you sure you want to delete ${ids.length} tasks?`,
          async () => {
            try {
              for (const id of ids) {
                await API.deleteTask(id);
              }
              this.selectedTaskIds.clear();
              Components.showToast(`Deleted ${ids.length} tasks`, "success");
            } catch (err) {
              Components.showToast(err.message, "error");
            }
          }
        );
      });
    }
  }
};
