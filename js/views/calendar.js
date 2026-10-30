// Interactive Monthly Calendar View
const CalendarView = {
  currentDate: new Date(),

  render(container) {
    const tasks = state.getFilteredTasks();
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const today = new Date();

    // Map tasks by date string YYYY-MM-DD
    const tasksByDate = {};
    tasks.forEach((task) => {
      if (task.due_date) {
        const d = new Date(task.due_date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
        if (!tasksByDate[key]) tasksByDate[key] = [];
        tasksByDate[key].push(task);
      }
    });

    // Generate Calendar Grid Cells
    let cellsHtml = "";

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cellsHtml += `
        <div class="min-h-[105px] p-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800 text-slate-400 opacity-40 select-none">
          <span class="text-xs font-semibold">${d}</span>
        </div>
      `;
    }

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTasks = tasksByDate[dateKey] || [];
      const isToday =
        today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

      cellsHtml += `
        <div class="calendar-day-cell group relative min-h-[105px] p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer flex flex-col" data-date="${dateKey}">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-semibold ${
              isToday
                ? "w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold"
                : "text-slate-700 dark:text-slate-300"
            }">
              ${day}
            </span>
            <button class="add-task-day-btn opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 rounded transition" data-date="${dateKey}" title="Add task on ${dateKey}">
              ${Icons.plus("w-3.5 h-3.5")}
            </button>
          </div>

          <!-- Tasks list for this day -->
          <div class="flex-1 overflow-y-auto space-y-1">
            ${dayTasks
              .slice(0, 3)
              .map((t) => {
                const priorityColors = {
                  urgent: "border-l-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
                  high: "border-l-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                  medium: "border-l-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
                  low: "border-l-slate-400 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                };
                const colorCls = priorityColors[t.priority] || priorityColors.medium;

                return `
                  <div class="calendar-task-pill px-1.5 py-1 rounded text-[11px] font-medium border-l-2 truncate shadow-2xs hover:brightness-95 transition cursor-pointer ${colorCls} ${
                  t.status === "completed" ? "line-through opacity-60" : ""
                }" data-task-id="${t.id}" title="${t.title} (${t.status})">
                    ${t.title}
                  </div>
                `;
              })
              .join("")}
            ${
              dayTasks.length > 3
                ? `<span class="text-[10px] text-slate-400 font-medium pl-1">+${dayTasks.length - 3} more</span>`
                : ""
            }
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full">
        <!-- Calendar Header Controls -->
        <div class="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">
              ${monthNames[month]} ${year}
            </h2>
            <button id="cal-today-btn" class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition">
              Today
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button id="cal-prev-btn" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              ${Icons.chevronLeft("w-4 h-4")}
            </button>
            <button id="cal-next-btn" class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              ${Icons.chevronRight("w-4 h-4")}
            </button>
          </div>
        </div>

        <!-- Day of Week Names -->
        <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center py-2.5">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <!-- Days Grid -->
        <div class="grid grid-cols-7 flex-1 overflow-y-auto">
          ${cellsHtml}
        </div>
      </div>
    `;

    this.attachEvents(container);
  },

  attachEvents(container) {
    const prevBtn = container.querySelector("#cal-prev-btn");
    const nextBtn = container.querySelector("#cal-next-btn");
    const todayBtn = container.querySelector("#cal-today-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        CalendarView.render(container);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        CalendarView.render(container);
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.currentDate = new Date();
        CalendarView.render(container);
      });
    }

    // Click on task pill
    container.querySelectorAll(".calendar-task-pill").forEach((pill) => {
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = parseInt(pill.getAttribute("data-task-id"));
        if (id) window.TaskDetailDrawer.open(id);
      });
    });

    // Click on day cell or "+ button" to add task on that date
    container.querySelectorAll(".calendar-day-cell").forEach((cell) => {
      cell.addEventListener("click", (e) => {
        const dateStr = cell.getAttribute("data-date");
        if (dateStr) {
          window.TaskModal.open({ due_date: `${dateStr}T17:00` });
        }
      });
    });
  }
};
