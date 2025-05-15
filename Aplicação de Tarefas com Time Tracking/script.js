// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timers = {};
let intervalIds = {};
const tasksList = document.getElementById('tasks-list');
const newTaskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task-btn');
const toggleThemeBtn = document.getElementById('toggle-theme');
const body = document.body;

// Chart.js setup
const ctx = document.getElementById('productivityChart').getContext('2d');
const chartData = {
  labels: [],
  datasets: [{
    label: 'Horas Gastas',
    data: [],
    backgroundColor: 'rgba(162, 91, 159, 0.6)',
    borderColor: 'rgba(162, 91, 159, 1)',
    borderWidth: 1,
    borderRadius: 5
  }]
};
const productivityChart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    scales: {
      y: { beginAtZero: true, stepSize: 1 }
    },
    plugins: {
      legend: { display: false }
    }
  }
});

// Utils
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
}

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateChart();
}

function updateChart() {
  // Últimos 7 dias, soma total de tempo por dia (simplificado)
  let last7days = {};
  for(let i=6; i>=0; i--) {
    let day = new Date();
    day.setDate(day.getDate() - i);
    let dayStr = day.toISOString().slice(0,10);
    last7days[dayStr] = 0;
  }
  
  tasks.forEach(task => {
    if(task.sessions) {
      task.sessions.forEach(s => {
        if(last7days[s.date] !== undefined) {
          last7days[s.date] += s.duration;
        }
      });
    }
  });

  chartData.labels = Object.keys(last7days);
  chartData.datasets[0].data = Object.values(last7days).map(sec => +(sec/3600).toFixed(2));
  productivityChart.update();
}

function renderTasks() {
  tasksList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const taskEl = document.createElement('div');
    taskEl.classList.add('task');

    const timeSpent = task.timeSpent || 0;
    const isRunning = timers[task.id] !== undefined;

    taskEl.innerHTML = `
      <div class="task-info">
        <h3>${task.name}</h3>
        <div class="task-timer">${formatTime(timeSpent)}</div>
      </div>
      <div class="task-actions">
        <button class="start-btn">${isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}</button>
        <button class="stop-btn" ${!isRunning ? 'disabled' : ''}>⏹️ Finalizar</button>
        <button class="delete-btn">❌ Excluir</button>
      </div>
    `;

    // Actions
    const startBtn = taskEl.querySelector('.start-btn');
    const stopBtn = taskEl.querySelector('.stop-btn');
    const deleteBtn = taskEl.querySelector('.delete-btn');

    startBtn.onclick = () => startTimer(task.id);
    stopBtn.onclick = () => stopTimer(task.id);
    deleteBtn.onclick = () => {
      if(confirm(`Excluir tarefa "${task.name}"?`)) {
        if(timers[task.id]) clearInterval(intervalIds[task.id]);
        tasks.splice(idx, 1);
        saveTasks();
        renderTasks();
      }
    };

    tasksList.appendChild(taskEl);
  });
}

// Timer funcs
function startTimer(taskId) {
  if(timers[taskId]) return; // Já rodando

  let task = tasks.find(t => t.id === taskId);
  let start = Date.now();

  timers[taskId] = start;

  intervalIds[taskId] = setInterval(() => {
    let now = Date.now();
    task.timeSpent = (task.timeSpent || 0) + Math.floor((now - timers[taskId]) / 1000);
    timers[taskId] = now;
    renderTasks();
  }, 1000);
}

function stopTimer(taskId) {
  if(!timers[taskId]) return;

  clearInterval(intervalIds[taskId]);

  let task = tasks.find(t => t.id === taskId);
  const now = Date.now();
  const duration = Math.floor((now - timers[taskId]) / 1000);
  timers[taskId] = undefined;
  intervalIds[taskId] = undefined;

  if(!task.sessions) task.sessions = [];
  task.sessions.push({
    date: new Date().toISOString().slice(0,10),
    duration: duration
  });

  saveTasks();
  renderTasks();
}

// Add nova tarefa
addTaskBtn.onclick = () => {
  const name = newTaskInput.value.trim();
  if(!name) return alert('Digite o nome da tarefa!');
  tasks.push({ id: Date.now().toString(), name, timeSpent: 0, sessions: [] });
  newTaskInput.value = '';
  saveTasks();
  renderTasks();
};

// Dark mode toggle
toggleThemeBtn.onclick = () => {
  body.classList.toggle('dark');
  toggleThemeBtn.textContent = body.classList.contains('dark') ? 'Modo Claro' : 'Modo Dark';
};

// Inicialização
renderTasks();
updateChart();

if(localStorage.getItem('theme') === 'dark') {
  body.classList.add('dark');
  toggleThemeBtn.textContent = 'Modo Claro';
// Continuando script.js

function startTimer(taskId) {
  if (intervalIds[taskId]) return; // Já tá rodando

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const startTime = Date.now();

  timers[taskId] = startTime;

  intervalIds[taskId] = setInterval(() => {
    const elapsed = Math.floor((Date.now() - timers[taskId]) / 1000);
    task.timeSpent = (task.timeSpent || 0) + elapsed;
    timers[taskId] = Date.now();
    renderTasks();
  }, 1000);

  renderTasks();
}

function stopTimer(taskId) {
  if (!intervalIds[taskId]) return;

  clearInterval(intervalIds[taskId]);
  delete intervalIds[taskId];

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Salvar sessão
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  if (!task.sessions) task.sessions = [];
  task.sessions.push({
    date: dateStr,
    duration: task.timeSpent || 0,
  });

  saveTasks();
  renderTasks();
}

function addTask(name) {
  if (!name.trim()) return;

  const newTask = {
    id: Date.now().toString(),
    name: name.trim(),
    timeSpent: 0,
    sessions: [],
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();
  newTaskInput.value = '';
}

function deleteTask(taskId) {
  stopTimer(taskId);
  tasks = tasks.filter(t => t.id !== taskId);
  saveTasks();
  renderTasks();
}

// Dark mode toggle
toggleThemeBtn.onclick = () => {
  body.classList.toggle('dark');
  toggleThemeBtn.textContent = body.classList.contains('dark') ? 'Modo Light' : 'Modo Dark';
};

// Eventos
addTaskBtn.onclick = () => addTask(newTaskInput.value);
newTaskInput.onkeydown = e => {
  if (e.key === 'Enter') addTask(newTaskInput.value);
};

// Inicializar UI
renderTasks();
updateChart();

}
