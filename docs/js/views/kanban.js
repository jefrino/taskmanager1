// Kanban Board View with Native Drag and Drop and Mobile Support
const KanbanView = {
  columns: [
    { id: "backlog", title: "Backlog", color: "border-slate-400 text-slate-500", dot: "bg-slate-400" },
    { id: "todo", title: "To Do", color: "border-blue-500 text-blue-500", dot: "bg-blue-500" },
    { id: "in_progress", title: "In Progress", color: "border-amber-500 text-amber-500", dot: "bg-amber-500" },
    { id: "in_review", title: "In Review", color: "border-purple-500 text-purple-500", dot: "bg-purple-500" },
    { id: "completed", title: "Completed", color: "border-emerald-500 text-emerald-500", dot: "bg-emerald-500" }
  ],

  draggedTaskId: null,

  render(container) {
    const tasks = state.getFilteredTasks();

    container.innerHTML = `
      <div class="h-full flex gap-5 overflow-x-auto pb-6 px-1 snap-x">
        ${this.columns
          .map((col) => {
            const colTasks = tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.position - b.position);

            return `
              <div class="kanban-column flex-shrink-0 w-80 md:w-84 flex flex-col bg-slate-100/70 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 snap-center" data-column-id="${col.id}">
                <!-- Column Header -->
                <div class="flex items-center justify-between px-2 py-2 mb-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full ${col.dot}"></span>
                    <h3 class="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                      ${col.title}
                    </h3>
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ${colTasks.length}
                    </span>
                  </div>

                  <button class="add-task-col-btn p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition" title="Add task to ${col.title}" data-status="${col.id}">
                    ${Icons.plus("w-4 h-4")}
                  </button>
                </div>

                <!-- Column Task Cards Container (Droppable) -->
                <div class="kanban-column-content flex-1 overflow-y-auto space-y-3 p-1 rounded-xl" data-status="${col.id}">
                  ${
                    colTasks.length > 0
                      ? colTasks.map((task) => this.renderTaskCard(task)).join("")
                      : `<div class="empty-placeholder h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                          <span>No tasks here</span>
                          <button class="add-task-col-btn text-indigo-500 hover:underline mt-1" data-status="${col.id}">+ Create one</button>
                        </div>`
                  }
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    this.attachEvents(container);
  },

  renderTaskCard(task) {
    const subtaskPct =
      task.subtask_count > 0 ? Math.round((task.subtask_completed_count / task.subtask_count) * 100) : 0;

    const tagsList = (task.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return `
      <div 
        class="task-card group relative bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-700/80 transition cursor-grab" 
        draggable="true" 
        data-task-id="${task.id}"
      >
        <!-- Top bar: Priority & Actions -->
        <div class="flex items-center justify-between mb-2">
          ${Components.renderPriorityBadge(task.priority)}

          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="edit-task-btn p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition" data-task-id="${task.id}" title="Edit task">
              ${Icons.edit("w-3.5 h-3.5")}
            </button>
            <button class="delete-task-btn p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition" data-task-id="${task.id}" title="Delete task">
              ${Icons.trash("w-3.5 h-3.5")}
            </button>
          </div>
        </div>

        <!-- Task Title -->
        <h4 class="task-title-link font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1.5 leading-snug hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" data-task-id="${task.id}">
          ${task.title}
        </h4>

        <!-- Description Snippet -->
        ${
          task.description
            ? `<p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                ${task.description}
               </p>`
            : ""
        }

        <!-- Tags -->
        ${
          tagsList.length > 0
            ? `<div class="flex flex-wrap gap-1 mb-3">
                ${tagsList
                  .slice(0, 3)
                  .map(
                    (tag) =>
                      `<span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">#${tag}</span>`
                  )
                  .join("")}
                ${
                  tagsList.length > 3
                    ? `<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-400">+${tagsList.length - 3}</span>`
                    : ""
                }
              </div>`
            : ""
        }

        <!-- Subtask Progress Bar (if any) -->
        ${
          task.subtask_count > 0
            ? `
            <div class="mb-3">
              <div class="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <span>Checklist</span>
                <span class="font-medium">${task.subtask_completed_count}/${task.subtask_count}</span>
              </div>
              <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full transition-all duration-300" style="width: ${subtaskPct}%"></div>
              </div>
            </div>
            `
            : ""
        }

        <!-- Bottom bar: Due Date, Comments & Assignee -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div class="flex items-center gap-2">
            ${Components.renderDueDate(task.due_date)}

            ${
              task.comment_count > 0
                ? `<span class="flex items-center gap-1 text-slate-400">
                    ${Icons.message("w-3 h-3")}
                    <span>${task.comment_count}</span>
                  </span>`
                : ""
            }
          </div>

          <div>
            ${Components.renderAvatar(task.assignee, "w-6 h-6 text-[10px]")}
          </div>
        </div>
      </div>
    `;
  },

  attachEvents(container) {
    // Open create task modal with specific column status
    container.querySelectorAll(".add-task-col-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const status = btn.getAttribute("data-status");
        window.TaskModal.open({ status });
      });
    });

    // Open detail drawer on title click or card click
    container.querySelectorAll(".task-title-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(link.getAttribute("data-task-id"));
        window.TaskDetailDrawer.open(id);
      });
    });

    // Quick Edit
    container.querySelectorAll(".edit-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-task-id"));
        const task = state.tasks.find((t) => t.id === id);
        if (task) window.TaskModal.open(task);
      });
    });

    // Quick Delete
    container.querySelectorAll(".delete-task-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute("data-task-id"));
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          Components.confirm(
            "Delete Task",
            `Are you sure you want to permanently delete "${task.title}"?`,
            async () => {
              try {
                await API.deleteTask(id);
                Components.showToast("Task deleted", "success");
              } catch (err) {
                Components.showToast(err.message, "error");
              }
            }
          );
        }
      });
    });

    // Native Drag and Drop Logic
    const cards = container.querySelectorAll(".task-card");
    const dropzones = container.querySelectorAll(".kanban-column-content");

    cards.forEach((card) => {
      card.addEventListener("dragstart", (e) => {
        this.draggedTaskId = parseInt(card.getAttribute("data-task-id"));
        card.classList.add("is-dragging");
        e.dataTransfer.setData("text/plain", this.draggedTaskId.toString());
        e.dataTransfer.effectAllowed = "move";
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("is-dragging");
        dropzones.forEach((dz) => dz.classList.remove("drag-over"));
        this.draggedTaskId = null;
      });
    });

    dropzones.forEach((dropzone) => {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        dropzone.classList.add("drag-over");
      });

      dropzone.addEventListener("dragleave", (e) => {
        if (!dropzone.contains(e.relatedTarget)) {
          dropzone.classList.remove("drag-over");
        }
      });

      dropzone.addEventListener("drop", async (e) => {
        e.preventDefault();
        dropzone.classList.remove("drag-over");

        const taskId = this.draggedTaskId || parseInt(e.dataTransfer.getData("text/plain"));
        const targetStatus = dropzone.getAttribute("data-status");

        if (!taskId || !targetStatus) return;

        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || task.status === targetStatus) return;

        // Optimistic UI update
        const oldStatus = task.status;
        task.status = targetStatus;
        KanbanView.render(container);

        try {
          await API.updateTaskStatus(taskId, targetStatus);
          // Play subtle haptic feedback or audio tone if enabled
        } catch (err) {
          // Rollback on failure
          task.status = oldStatus;
          KanbanView.render(container);
          Components.showToast(`Failed to move task: ${err.message}`, "error");
        }
      });
    });
  }
};
