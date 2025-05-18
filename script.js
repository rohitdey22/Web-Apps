document.addEventListener('DOMContentLoaded', () => {
    // Handle section switching
    document.querySelectorAll('nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-section').forEach(sec => sec.classList.remove('active'));
        const sectionId = btn.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
      });
    });
  
    // TASK LIST LOGIC
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-items');
  
    const updateProgressBar = () => {
      const tasks = taskList.querySelectorAll('li');
      const total = tasks.length;
      const completed = [...tasks].filter(t => t.classList.contains('completed')).length;
      const percent = total ? Math.round((completed / total) * 100) : 0;
  
      let bar = document.querySelector('.progress-fill');
      if (!bar) {
        const wrapper = document.createElement('div');
        wrapper.className = 'progress-bar';
        bar = document.createElement('div');
        bar.className = 'progress-fill';
        wrapper.appendChild(bar);
        taskList.parentElement.appendChild(wrapper);
      }
      bar.style.width = percent + '%';
    };
  
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskName = document.getElementById('task-name').value.trim();
      const taskPriority = document.getElementById('task-priority').value;
  
      if (!taskName) return;
  
      const li = document.createElement('li');
      li.textContent = taskName;
      li.classList.add(taskPriority);
  
      // Complete checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '10px';
      checkbox.addEventListener('change', () => {
        li.classList.toggle('completed', checkbox.checked);
        li.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
        updateProgressBar();
      });
  
      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.style.cssText = 'float: right; background: transparent; border: none; cursor: pointer; color: #888;';
      delBtn.addEventListener('click', () => {
        li.remove();
        updateProgressBar();
      });
  
      li.prepend(checkbox);
      li.appendChild(delBtn);
      taskList.appendChild(li);
  
      taskForm.reset();
      updateProgressBar();
    });
  });

  // Sticky Notes logic
const notesContainer = document.getElementById('notes-container');
const addNoteButton = document.getElementById('add-note');

let noteId = 0;

addNoteButton.addEventListener('click', () => {
  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.contentEditable = true;
  note.setAttribute('draggable', 'true');
  note.setAttribute('data-id', noteId++);
  note.style.left = Math.random() * 400 + 'px';
  note.style.top = Math.random() * 300 + 'px';

  // Drag functionality
  note.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', note.getAttribute('data-id'));
    e.dataTransfer.effectAllowed = 'move';
  });

  notesContainer.appendChild(note);
});

notesContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
});

notesContainer.addEventListener('drop', (e) => {
  const id = e.dataTransfer.getData('text/plain');
  const note = document.querySelector(`.sticky-note[data-id='${id}']`);
  const containerRect = notesContainer.getBoundingClientRect();

  // Adjust position based on container's offset
  note.style.left = (e.clientX - containerRect.left - 100) + 'px';
  note.style.top = (e.clientY - containerRect.top - 25) + 'px';
});

// Pomodoro Timer logic
const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('start-timer');
const pauseBtn = document.getElementById('pause-timer');
const resetBtn = document.getElementById('reset-timer');

let pomodoroDuration = 25 * 60; // 25 minutes in seconds
let remainingTime = pomodoroDuration;
let timerInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingTime);
}

function startTimer() {
  if (timerInterval) return; // already running
  timerInterval = setInterval(() => {
    if (remainingTime > 0) {
      remainingTime--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      // Optionally add notification or sound here
      alert('Pomodoro session complete! Take a break.');
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  pauseTimer();
  remainingTime = pomodoroDuration;
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize display
updateDisplay();

// Markdown Editor logic
const mdInput = document.getElementById('markdown-input');
const mdPreview = document.getElementById('markdown-preview');
const wordCount = document.getElementById('word-count');

// Simple markdown parser (supports headers, bold, italics, code, lists)
function parseMarkdown(text) {
  if (!text) return '';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  // Italics
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  // Inline code
  html = html.replace(/`(.*?)`/gim, '<code>$1</code>');
  // Unordered lists
  html = html.replace(/^\s*[-*+] (.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

  // Paragraphs
  html = html.replace(/\n$/gim, '<br />');

  return html.trim();
}

function updateMarkdown() {
  const text = mdInput.value;
  mdPreview.innerHTML = parseMarkdown(text);

  // Word count (split on whitespace)
  const words = text.trim().split(/\s+/).filter(Boolean);
  wordCount.textContent = `Word count: ${words.length}`;
}

mdInput.addEventListener('input', updateMarkdown);

// Initialize
updateMarkdown();

// Weekly Calendar logic

const calendarGrid = document.getElementById('calendar-grid');
const taskList = document.getElementById('calendar-task-list');
const addTaskBtn = document.getElementById('add-calendar-task-btn');
const newTaskInput = document.getElementById('new-calendar-task-name');

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const startHour = 8;
const endHour = 18;

let taskIdCounter = 0;

// Generate time labels and empty slots dynamically
function buildCalendarGrid() {
  // Clear existing time slots (after headers)
  // We keep first 8 grid-header divs (1 time + 7 days)
  // Remove all others if any (if rebuilding)
  while (calendarGrid.children.length > 8) {
    calendarGrid.removeChild(calendarGrid.lastChild);
  }

  for (let hour = startHour; hour <= endHour; hour++) {
    // Time label column
    const timeLabel = document.createElement('div');
    timeLabel.className = 'calendar-header';
    timeLabel.textContent = `${hour}:00`;
    calendarGrid.appendChild(timeLabel);

    // Day columns with droppable time slots
    for (let i = 0; i < days.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'time-slot';
      slot.dataset.day = days[i];
      slot.dataset.hour = hour;
      slot.addEventListener('dragover', dragOverHandler);
      slot.addEventListener('drop', dropHandler);
      slot.addEventListener('dragleave', dragLeaveHandler);
      calendarGrid.appendChild(slot);
    }
  }
}

// Drag and Drop Handlers

let draggedTaskId = null;

function dragStartHandler(e) {
  draggedTaskId = e.target.dataset.taskId;
  e.dataTransfer.setData('text/plain', draggedTaskId);
  e.dataTransfer.effectAllowed = 'move';
  // Optional: style drag image or feedback
}

function dragOverHandler(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function dragLeaveHandler(e) {
  e.currentTarget.classList.remove('drag-over');
}

function dropHandler(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  const taskId = e.dataTransfer.getData('text/plain');
  const taskElem = document.querySelector(`[data-task-id="${taskId}"]`);
  if (!taskElem) return;

  // Clone task block for calendar slot
  const taskClone = taskElem.cloneNode(true);
  taskClone.classList.add('task-block');
  taskClone.setAttribute('draggable', 'true');
  taskClone.dataset.taskId = taskId + '-cal-' + Date.now();
  // Optional: remove from pool or keep multiple instances
  // For simplicity, allow multiple instances

  // Append task clone to slot
  e.currentTarget.appendChild(taskClone);

  // Make task clone draggable inside calendar to support repositioning/removal if desired
  taskClone.addEventListener('dragstart', dragStartHandler);

  // Optional: Add right-click removal on calendar task
  taskClone.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    taskClone.remove();
  });
}

// Add new task to task pool
function addTaskToPool(name) {
  if (!name.trim()) return;
  const li = document.createElement('li');
  li.textContent = name.trim();
  li.dataset.taskId = 'task-' + (taskIdCounter++);
  li.setAttribute('draggable', 'true');
  li.addEventListener('dragstart', dragStartHandler);
  taskList.appendChild(li);
  newTaskInput.value = '';
}

// Event listeners
addTaskBtn.addEventListener('click', () => {
  addTaskToPool(newTaskInput.value);
});

// Initialize calendar grid and add some sample tasks
buildCalendarGrid();
['Email review', 'Code review', 'Meeting', 'Workout', 'Read book'].forEach(addTaskToPool);

// Time Zone Converter logic

const timeInput = document.getElementById('time-input');
const fromTzSelect = document.getElementById('from-tz');
const toTzSelect = document.getElementById('to-tz');
const convertBtn = document.getElementById('convert-btn');
const conversionResult = document.getElementById('conversion-result');

// Common timezones list (IANA format)
const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland'
];

// Populate dropdowns
function populateTimezones() {
  timezones.forEach(tz => {
    const optionFrom = document.createElement('option');
    optionFrom.value = tz;
    optionFrom.textContent = tz;
    fromTzSelect.appendChild(optionFrom);

    const optionTo = document.createElement('option');
    optionTo.value = tz;
    optionTo.textContent = tz;
    toTzSelect.appendChild(optionTo);
  });

  fromTzSelect.value = 'UTC';
  toTzSelect.value = 'America/New_York';
}

// Convert time between zones
function convertTime() {
  const timeStr = timeInput.value;
  if (!timeStr) {
    conversionResult.textContent = 'Please enter a valid time.';
    return;
  }

  const fromTz = fromTzSelect.value;
  const toTz = toTzSelect.value;

  // Parse input time in from timezone, on today's date
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  // Use Intl.DateTimeFormat with timeZone to get equivalent date
  const fromDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hours,
    minutes
  ));

  // Format time in target timezone
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: toTz,
    });

    // We need to adjust the time from 'fromTz' to UTC, then format in 'toTz'.
    // But JS Date has no direct constructor for arbitrary tz, so workaround:

    // Calculate offset between fromTz and UTC at this time
    const fromOffset = getTimezoneOffset(fromDate, fromTz);
    // Adjust time to UTC by subtracting offset
    const utcTime = new Date(fromDate.getTime() - fromOffset);

    // Format utcTime in toTz
    const converted = formatter.format(utcTime);

    conversionResult.textContent = `${timeStr} (${fromTz}) = ${converted} (${toTz})`;
  } catch (err) {
    conversionResult.textContent = 'Error converting time zones.';
  }
}

// Get timezone offset in ms for a date and IANA timezone
function getTimezoneOffset(date, tz) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = dtf.formatToParts(date);
  const map = {};
  parts.forEach(({ type, value }) => {
    map[type] = value;
  });

  // Construct a date string in local timezone
  const asString = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
  const asDate = new Date(asString);

  return asDate.getTime() - date.getTime();
}

convertBtn.addEventListener('click', convertTime);

// Initialize
populateTimezones();
convertTime();
// JSON Viewer/Editor

const jsonInput = document.getElementById('json-input');
const parseJsonBtn = document.getElementById('parse-json-btn');
const formatJsonBtn = document.getElementById('format-json-btn');
const jsonOutput = document.getElementById('json-output');
const jsonError = document.getElementById('json-error');

parseJsonBtn.addEventListener('click', () => {
  jsonError.textContent = '';
  jsonOutput.innerHTML = '';
  try {
    const obj = JSON.parse(jsonInput.value);
    const tree = buildJsonTree(obj);
    jsonOutput.appendChild(tree);
  } catch (err) {
    jsonError.textContent = 'Invalid JSON: ' + err.message;
  }
});

formatJsonBtn.addEventListener('click', () => {
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonInput.value = JSON.stringify(obj, null, 2);
    jsonError.textContent = '';
  } catch (err) {
    jsonError.textContent = 'Invalid JSON: ' + err.message;
  }
});

function buildJsonTree(value) {
  const container = document.createElement('div');

  if (typeof value === 'object' && value !== null) {
    const isArray = Array.isArray(value);

    const opener = document.createElement('span');
    opener.textContent = isArray ? '[' : '{';
    opener.className = 'json-brackets';

    const closer = document.createElement('span');
    closer.textContent = isArray ? ']' : '}';
    closer.className = 'json-brackets';

    container.appendChild(opener);

    const content = document.createElement('div');
    content.style.marginLeft = '1em';

    Object.entries(value).forEach(([key, val], index, arr) => {
      const node = document.createElement('div');
      node.className = 'json-node';

      const collapser = document.createElement('span');
      collapser.textContent = '-';
      collapser.className = 'json-collapser';

      collapser.onclick = () => {
        if (collapser.textContent === '-') {
          collapser.textContent = '+';
          content.style.display = 'none';
        } else {
          collapser.textContent = '-';
          content.style.display = 'block';
        }
      };

      node.appendChild(collapser);

      const keySpan = document.createElement('span');
      keySpan.textContent = isArray ? '' : `"${key}": `;
      keySpan.className = 'json-key';
      node.appendChild(keySpan);

      if (typeof val === 'object' && val !== null) {
        node.appendChild(buildJsonTree(val));
      } else {
        const valSpan = document.createElement('span');
        valSpan.textContent = formatJsonValue(val);
        valSpan.className = `json-${typeof val}`;
        if (val === null) valSpan.className = 'json-null';
        node.appendChild(valSpan);
      }

      if (index < arr.length - 1) {
        node.appendChild(document.createTextNode(','));
      }
      content.appendChild(node);
    });

    container.appendChild(content);
    container.appendChild(closer);
  } else {
    // Primitive value
    const valSpan = document.createElement('span');
    valSpan.textContent = formatJsonValue(value);
    valSpan.className = `json-${typeof value}`;
    if (value === null) valSpan.className = 'json-null';
    container.appendChild(valSpan);
  }

  return container;
}

function formatJsonValue(val) {
  if (typeof val === 'string') return `"${val}"`;
  if (val === null) return 'null';
  return String(val);
}
// Mind Map Builder

const mindmapContainer = document.getElementById('mindmap-container');
const addRootBtn = document.getElementById('add-root-node');
const nodeTextInput = document.getElementById('mindmap-node-text');

addRootBtn.addEventListener('click', () => {
  const text = nodeTextInput.value.trim();
  if (!text) return;
  const node = createMindmapNode(text);
  mindmapContainer.appendChild(node);
  nodeTextInput.value = '';
});

function createMindmapNode(labelText) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mindmap-node';

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = labelText;

  const addChildBtn = document.createElement('button');
  addChildBtn.textContent = '+';
  addChildBtn.className = 'add-child-btn';

  const childrenContainer = document.createElement('div');
  childrenContainer.className = 'mindmap-children';

  addChildBtn.onclick = () => {
    const childText = prompt('Enter child node text:');
    if (childText) {
      const child = createMindmapNode(childText);
      childrenContainer.appendChild(child);
    }
  };

  label.appendChild(addChildBtn);
  wrapper.appendChild(label);
  wrapper.appendChild(childrenContainer);

  return wrapper;
}
// Snippet Manager

const snippetTitle = document.getElementById('snippet-title');
const snippetLanguage = document.getElementById('snippet-language');
const snippetCode = document.getElementById('snippet-code');
const snippetList = document.getElementById('snippet-list');
const snippetSearch = document.getElementById('snippet-search');
const languageFilter = document.getElementById('language-filter');
const addSnippetBtn = document.getElementById('add-snippet-btn');

let snippets = [];

addSnippetBtn.addEventListener('click', () => {
  const title = snippetTitle.value.trim();
  const language = snippetLanguage.value;
  const code = snippetCode.value.trim();

  if (!title || !code) return;

  const snippet = { title, language, code };
  snippets.push(snippet);

  renderSnippets();
  snippetTitle.value = '';
  snippetCode.value = '';
});

snippetSearch.addEventListener('input', renderSnippets);
languageFilter.addEventListener('change', renderSnippets);

function renderSnippets() {
  const searchQuery = snippetSearch.value.toLowerCase();
  const lang = languageFilter.value;

  snippetList.innerHTML = '';

  snippets
    .filter(snip => {
      const matchesLang = lang === 'All' || snip.language === lang;
      const matchesSearch =
        snip.title.toLowerCase().includes(searchQuery) ||
        snip.code.toLowerCase().includes(searchQuery);
      return matchesLang && matchesSearch;
    })
    .forEach(snip => {
      const div = document.createElement('div');
      div.className = 'snippet';

      const title = document.createElement('div');
      title.className = 'snippet-title';
      title.textContent = snip.title;

      const lang = document.createElement('div');
      lang.className = 'snippet-language';
      lang.textContent = snip.language;

      const code = document.createElement('pre');
      code.textContent = snip.code;

      div.appendChild(title);
      div.appendChild(lang);
      div.appendChild(code);
      snippetList.appendChild(div);
    });
}

// Regex Tester

const regexInput = document.getElementById('regex-input');
const regexPattern = document.getElementById('regex-pattern');
const regexFlags = document.getElementById('regex-flags');
const regexOutput = document.getElementById('regex-output');

function updateRegexOutput() {
  const input = regexInput.value;
  const pattern = regexPattern.value;
  const flags = regexFlags.value;

  regexOutput.innerHTML = '';

  if (!pattern) {
    regexOutput.textContent = input;
    return;
  }

  try {
    const re = new RegExp(pattern, flags);
    const result = [];
    let lastIndex = 0;

    const matches = [...input.matchAll(re)];
    for (const match of matches) {
      const start = match.index;
      const end = start + match[0].length;

      // Add plain text before match
      result.push(escapeHTML(input.slice(lastIndex, start)));

      // Add highlighted match
      result.push(`<span class="highlight">${escapeHTML(match[0])}</span>`);

      lastIndex = end;
    }

    // Add remaining text
    result.push(escapeHTML(input.slice(lastIndex)));

    regexOutput.innerHTML = result.join('');
  } catch (e) {
    regexOutput.textContent = 'Invalid regex: ' + e.message;
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

regexInput.addEventListener('input', updateRegexOutput);
regexPattern.addEventListener('input', updateRegexOutput);
regexFlags.addEventListener('input', updateRegexOutput);
