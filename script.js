document.addEventListener('DOMContentLoaded', () => {
    let objectives = JSON.parse(localStorage.getItem('objectives')) || [];
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const objectiveForm = document.getElementById('objectiveForm');
    const projectForm = document.getElementById('projectForm');
    const taskForm = document.getElementById('taskForm');
    const downloadBtn = document.getElementById('downloadCSV');

    const objectiveList = document.getElementById('objectiveList');
    const objectiveSelect = document.getElementById('objectiveSelect');
    const projectSelect = document.getElementById('projectSelect');
    const taskList = document.getElementById('taskList');

    objectiveForm.addEventListener('submit', e => {
        e.preventDefault();
        const objValue = document.getElementById('objectiveInput').value.trim();
        if (!objValue || objectives.includes(objValue)) return;

        objectives.push(objValue);
        localStorage.setItem('objectives', JSON.stringify(objectives));
        updateObjectives();
        objectiveForm.reset();
    });

    projectForm.addEventListener('submit', e => {
        e.preventDefault();
        const projValue = document.getElementById('projectInput').value.trim();
        const objValue = objectiveSelect.value;
        if (!projValue || !objValue) return;

        const projId = `proj_${Date.now()}`;
        projects.push({ id: projId, name: projValue, objective: objValue });
        localStorage.setItem('projects', JSON.stringify(projects));
        updateProjects();
        projectForm.reset();
    });

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const taskValue = document.getElementById('taskInput').value.trim();
        const deadline = document.getElementById('deadlineInput').value;
        const projId = projectSelect.value;
        const proname = document.getElementById('projectInput').value;

        const project = projects.find(p => p.id === projId);
        if (!taskValue || !deadline || !project) return;

        tasks.push({ task: taskValue, deadline, projectId: projId, projectname: proname, objective: project.objective });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTasks();
        taskForm.reset();
    });

    downloadBtn.addEventListener('click', () => {
        let csv = 'Task,Project ID,Objective,Deadline\n';
        tasks.forEach(t => {
            csv += `${t.task},${t.projectId},${t.objective},${t.deadline}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance_tasks.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    function updateObjectives() {
        objectiveList.innerHTML = '';
        objectiveSelect.innerHTML = '';

        objectives.forEach((obj, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${obj}</span> <button data-index="${index}" class="delete-objective">Delete</button>`;
            objectiveList.appendChild(li);

            const opt = document.createElement('option');
            opt.value = obj;
            opt.textContent = obj;
            objectiveSelect.appendChild(opt);
        });

        document.querySelectorAll('.delete-objective').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                const removed = objectives.splice(index, 1);
                projects = projects.filter(p => p.objective !== removed[0]);
                tasks = tasks.filter(t => t.objective !== removed[0]);

                localStorage.setItem('objectives', JSON.stringify(objectives));
                localStorage.setItem('projects', JSON.stringify(projects));
                localStorage.setItem('tasks', JSON.stringify(tasks));

                updateObjectives();
                updateProjects();
                updateTasks();
            });
        });
    }

    function updateProjects() {
        projectSelect.innerHTML = '';
        projects.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.objective})`;
            projectSelect.appendChild(opt);
        });
    }

    function updateTasks() {
        taskList.innerHTML = '';
        tasks.forEach(t => {
            const li = document.createElement('li');
            li.textContent = `${t.task} - Project ID: ${t.projectId}, Objective: ${t.objective}, Deadline: ${t.deadline}, Project Name: ${t.projectname}`;
            taskList.appendChild(li);
        });
    }

    // Initial UI load
    updateObjectives();
    updateProjects();
    updateTasks();
});
