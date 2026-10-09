// TaskFlow — To-Do List Application Logic

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');
const moonIcon = document.getElementById('moonIcon');
const sunIcon = document.getElementById('sunIcon');
const currentDateEl = document.getElementById('currentDate');

// Stats Elements
const statsRatio = document.getElementById('statsRatio');
const statsPercent = document.getElementById('statsPercent');
const progressBar = document.getElementById('progressBar');
const totalTasksCount = document.getElementById('totalTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editTaskId = document.getElementById('editTaskId');
const editTaskInput = document.getElementById('editTaskInput');
const editPrioritySelect = document.getElementById('editPrioritySelect');
const editDueDateInput = document.getElementById('editDueDateInput');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Default initial tasks for demo/first-run
const initialTasks = [
  {
    id: '1',
    text: 'Explore TaskFlow features & interface',
    completed: true,
    priority: 'low',
    dueDate: '',
    createdAt: Date.now() - 3600000
  },
  {
    id: '2',
    text: 'Review project roadmap and milestones',
    completed: false,
    priority: 'high',
    dueDate: getFormattedDate(0), // Today
    createdAt: Date.now() - 1800000
  },
  {
    id: '3',
    text: 'Design responsive layout for tablet & mobile',
    completed: false,
    priority: 'medium',
    dueDate: getFormattedDate(1), // Tomorrow
    createdAt: Date.now()
  }
];

// App State
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks')) || initialTasks;
let currentFilter = 'all';
let searchQuery = '';

// Helper: Format today + days offset as YYYY-MM-DD
function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Format friendly header date
function updateHeaderDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// Render Stats & Progress
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksCount.textContent = total;
  pendingTasksCount.textContent = pending;
  completedTasksCount.textContent = completed;
  statsRatio.textContent = `${completed} of ${total} completed`;
  statsPercent.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
}

// Format due date label & check overdue
function formatDueDate(dueDateStr, isCompleted) {
  if (!dueDateStr) return null;
  const [year, month, day] = dueDateStr.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let label = '';
  let isOverdue = false;

  if (diffDays === 0) {
    label = 'Due Today';
  } else if (diffDays === 1) {
    label = 'Due Tomorrow';
  } else if (diffDays === -1) {
    label = 'Yesterday';
    isOverdue = true;
  } else if (diffDays < -1) {
    label = `${Math.abs(diffDays)}d overdue`;
    isOverdue = true;
  } else {
    label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  return {
    label,
    isOverdue: isOverdue && !isCompleted
  };
}

// Render Task List
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    // Filter by tab
    if (currentFilter === 'active' && task.completed) return false;
    if (currentFilter === 'completed' && !task.completed) return false;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const match = task.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  // Toggle Empty State
  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  // Render each task item
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // Due date info
    const dueDateInfo = formatDueDate(task.dueDate, task.completed);
    const dueDateHtml = dueDateInfo 
      ? `<span class="badge-date ${dueDateInfo.isOverdue ? 'overdue' : ''}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          ${dueDateInfo.label}
        </span>`
      : '';

    li.innerHTML = `
      <div class="task-left">
        <div class="custom-checkbox ${task.completed ? 'checked' : ''}" role="checkbox" aria-checked="${task.completed}" tabindex="0">
          <input type="checkbox" ${task.completed ? 'checked' : ''} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div class="task-content">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <div class="task-metadata">
            <span class="badge-priority ${task.priority}">${task.priority}</span>
            ${dueDateHtml}
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn edit-btn" title="Edit task" aria-label="Edit task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>
        <button class="action-btn delete-btn" title="Delete task" aria-label="Delete task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text,
    completed: false,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value,
    createdAt: Date.now()
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  dueDateInput.value = '';
  prioritySelect.value = 'medium';
  taskInput.focus();
});

// Event Delegation for Task Actions (Toggle, Edit, Delete)
taskList.addEventListener('click', (e) => {
  const item = e.target.closest('.task-item');
  if (!item) return;
  const taskId = item.dataset.id;

  // Toggle complete
  if (e.target.closest('.custom-checkbox')) {
    toggleTaskComplete(taskId);
    return;
  }

  // Edit task
  if (e.target.closest('.edit-btn')) {
    openEditModal(taskId);
    return;
  }

  // Delete task
  if (e.target.closest('.delete-btn')) {
    deleteTask(taskId);
    return;
  }
});

// Allow Space/Enter key on custom checkbox
taskList.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    const checkbox = e.target.closest('.custom-checkbox');
    if (checkbox) {
      e.preventDefault();
      const item = checkbox.closest('.task-item');
      if (item) toggleTaskComplete(item.dataset.id);
    }
  }
});

// Toggle Task Complete State
function toggleTaskComplete(id) {
  tasks = tasks.map(t => {
    if (t.id === id) {
      return { ...t, completed: !t.completed };
    }
    return t;
  });
  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(id) {
  const item = document.querySelector(`.task-item[data-id="${id}"]`);
  if (item) {
    item.style.transform = 'translateX(20px)';
    item.style.opacity = '0';
    setTimeout(() => {
      tasks = tasks.filter(t => t.id !== id);
      saveTasks();
      renderTasks();
    }, 180);
  } else {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }
}

// Clear Completed Tasks
clearCompletedBtn.addEventListener('click', () => {
  const hasCompleted = tasks.some(t => t.completed);
  if (!hasCompleted) return;

  if (confirm('Are you sure you want to clear all completed tasks?')) {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }
});

// Filter Tabs
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Search Input
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

// Edit Modal Functions
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editTaskId.value = task.id;
  editTaskInput.value = task.text;
  editPrioritySelect.value = task.priority || 'medium';
  editDueDateInput.value = task.dueDate || '';

  editModal.classList.remove('hidden');
  editTaskInput.focus();
}

function closeEditModal() {
  editModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Close modal when clicking outside
editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

// Handle Edit Form Submission
editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editTaskId.value;
  const newText = editTaskInput.value.trim();

  if (!newText) return;

  tasks = tasks.map(t => {
    if (t.id === id) {
      return {
        ...t,
        text: newText,
        priority: editPrioritySelect.value,
        dueDate: editDueDateInput.value
      };
    }
    return t;
  });

  saveTasks();
  renderTasks();
  closeEditModal();
});

// Dark / Light Theme Toggle
function initTheme() {
  const savedTheme = localStorage.getItem('taskflow_theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  if (isDark) {
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
    localStorage.setItem('taskflow_theme', 'dark');
  } else {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
    localStorage.setItem('taskflow_theme', 'light');
  }
});

// Keyboard Shortcut: Esc to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
    closeEditModal();
  }
});

// Initial Setup
updateHeaderDate();
initTheme();
renderTasks();
