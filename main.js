window.addEventListener('load', () => {
	const form = document.querySelector("#new-task-form");
	const input = document.querySelector("#new-task-input");
	const list_el = document.querySelector("#tasks");
	const filterSelect = document.querySelector("#filter-select");
	const sortSelect = document.querySelector("#sort-select");
	const exportButton = document.querySelector("#export-button");
	const searchInput = document.querySelector("#search-input");
	let tasks = [];
  
	// Load tasks from local storage
	if (localStorage.getItem("tasks")) {
	  tasks = JSON.parse(localStorage.getItem("tasks"));
	  renderTasks();
	}
  
	form.addEventListener('submit', (e) => {
	  e.preventDefault();
  
	  const taskText = input.value.trim();
  
	  if (!taskText) {
		alert("Enter a Task!!");
		return;
	  }
  
	  const task = {
		text: taskText,
		completed: false,
		priority: "medium",
		dueDate: null,
		history: []
	  };
  
	  tasks.push(task);
	  saveTasksToLocalStorage();
	  renderTasks();
  
	  input.value = '';
	});
  
	filterSelect.addEventListener('change', () => {
	  renderTasks();
	});
  
	sortSelect.addEventListener('change', () => {
	  renderTasks();
	});
  
	exportButton.addEventListener('click', () => {
	  exportTasks();
	});
  
	searchInput.addEventListener('input', () => {
	  renderTasks();
	});
  
	function saveTasksToLocalStorage() {
	  localStorage.setItem("tasks", JSON.stringify(tasks));
	}
  
	function deleteTask(index) {
	  tasks.splice(index, 1);
	  saveTasksToLocalStorage();
	  renderTasks();
	}
  
	function renderTasks() {
	  const filterValue = filterSelect.value;
	  const sortValue = sortSelect.value;
	  const searchValue = searchInput.value.trim().toLowerCase();
  
	  let filteredTasks = tasks;
  
	  // Apply filtering
	  if (filterValue === "complete") {
		filteredTasks = tasks.filter(task => task.completed);
	  } else if (filterValue === "incomplete") {
		filteredTasks = tasks.filter(task => !task.completed);
	  }
  
	  // Apply search
	  if (searchValue) {
		filteredTasks = filteredTasks.filter(task => task.text.toLowerCase().includes(searchValue));
	  }
  
	  // Apply sorting
	  if (sortValue === "due-date") {
		filteredTasks.sort((a, b) => {
		  if (!a.dueDate && !b.dueDate) {
			return 0;
		  } else if (!a.dueDate) {
			return 1;
		  } else if (!b.dueDate) {
			return -1;
		  }
		  return new Date(a.dueDate) - new Date(b.dueDate);
		});
	  } else if (sortValue === "priority") {
		filteredTasks.sort((a, b) => {
		  const priorityOrder = { low: 1, medium: 2, high: 3 };
		  return priorityOrder[a.priority] - priorityOrder[b.priority];
		});
	  }
  
	  list_el.innerHTML = "";
  
	  filteredTasks.forEach((task, index) => {
		const task_el = document.createElement('div');
		task_el.classList.add('task');
		task_el.draggable = true;
		task_el.dataset.index = index;
  
		const task_content_el = document.createElement('div');
		task_content_el.classList.add('content');
  
		task_el.appendChild(task_content_el);
  
		const task_input_el = document.createElement('input');
		task_input_el.classList.add('text');
		task_input_el.type = 'text';
		task_input_el.value = task.text;
		task_input_el.setAttribute('readonly', 'readonly');
  
		if (task.completed) {
		  task_el.classList.add('completed');
		}
  
		task_content_el.appendChild(task_input_el);
  
		const task_priority_el = document.createElement('div');
		task_priority_el.classList.add('priority');
		task_priority_el.innerText = `Priority: ${task.priority}`;
  
		task_el.appendChild(task_priority_el);
  
		const task_due_date_el = document.createElement('div');
		task_due_date_el.classList.add('due-date');
		task_due_date_el.innerText = `Due Date: ${task.dueDate || 'Not set'}`;
  
		task_el.appendChild(task_due_date_el);
  
		const task_history_el = document.createElement('div');
		task_history_el.classList.add('history');
		task_history_el.innerText = `History: ${task.history.length} changes`;
  
		task_el.appendChild(task_history_el);
  
		const task_actions_el = document.createElement('div');
		task_actions_el.classList.add('actions');
  
		const task_edit_el = document.createElement('button');
		task_edit_el.classList.add('edit');
		task_edit_el.innerText = 'Edit';
  
		const task_delete_el = document.createElement('button');
		task_delete_el.classList.add('delete');
		task_delete_el.innerText = 'Delete';
  
		task_actions_el.appendChild(task_edit_el);
		task_actions_el.appendChild(task_delete_el);
  
		task_el.appendChild(task_actions_el);
  
		list_el.appendChild(task_el);
  
		task_el.addEventListener('dragstart', (e) => {
		  e.dataTransfer.setData('text/plain', task_el.dataset.index);
		});
  
		task_el.addEventListener('dragover', (e) => {
		  e.preventDefault();
		});
  
		task_el.addEventListener('drop', (e) => {
		  const sourceIndex = e.dataTransfer.getData('text/plain');
		  const targetIndex = task_el.dataset.index;
		  if (sourceIndex !== targetIndex) {
			const sourceTask = tasks[sourceIndex];
			tasks.splice(sourceIndex, 1);
			tasks.splice(targetIndex, 0, sourceTask);
			saveTasksToLocalStorage();
			renderTasks();
		  }
		});
  
		task_edit_el.addEventListener('click', (e) => {
		  if (task_edit_el.innerText.toLowerCase() === "edit") {
			task_edit_el.innerText = "Save";
			task_input_el.removeAttribute("readonly");
			task_input_el.focus();
		  } else {
			task_edit_el.innerText = "Edit";
			task_input_el.setAttribute("readonly", "readonly");
			tasks[index].text = task_input_el.value;
			tasks[index].history.push({
			  timestamp: new Date().toISOString(),
			  action: "Task updated"
			});
			saveTasksToLocalStorage();
			renderTasks();
		  }
		});
  
		task_delete_el.addEventListener('click', (e) => {
		  deleteTask(index);
		});
	  });
	}
  
	function exportTasks() {
	  const exportData = JSON.stringify(tasks);
	  const blob = new Blob([exportData], { type: "application/json" });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement("a");
	  a.href = url;
	  a.download = "tasks.json";
	  a.click();
	}
  });
  