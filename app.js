// Script begins by linking the Chart.js library

    const taskForm = document.getElementById('task-form');
    // Accessing the task form element by its ID

    const taskList = document.getElementById('task-list');
    // Accessing the task list container by its ID

    const completedTaskList = document.getElementById('completed-task-list');
    // Accessing the completed task list container by its ID

    const timerDisplay = document.getElementById('timer');
    // Accessing the timer display element by its ID

    const progressCircle = document.getElementById('progress-circle');
    // Accessing the progress circle element by its ID

    let timerInterval;
    // Declaring a variable for the timer interval

    let pomodoroCount = parseInt(localStorage.getItem('pomodoroCount')) || 0;
    // Retrieving the Pomodoro count from localStorage or initializing to 0

    const pomodoroCountDisplay = document.getElementById('pomodoro-count');
    // Accessing the element displaying Pomodoro count by its ID

    const timerDuration = 25 * 60;
    // Defining the Pomodoro timer duration in seconds

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    // Retrieving the list of tasks from localStorage or initializing an empty array

    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    // Retrieving the list of completed tasks from localStorage or initializing an empty array

    const renderTasks = () => {
        taskList.innerHTML = '';
        // Clearing the task list container

        tasks.forEach((task, index) => {
            const taskItem = document.createElement('div');
            // Creating a div element for each task

            taskItem.className = 'task-item';
            // Adding the class name 'task-item'

            taskItem.innerHTML = `
                <span>${task.name} (${task.category})</span>
                <div class="task-actions">
                    <button class="complete" onclick="markAsCompleted(${index})">✔</button>
                    <button class="delete" onclick="deleteTask(${index})">✖</button>
                </div>
            `;
            // Adding task details and action buttons

            taskList.appendChild(taskItem);
            // Appending the task item to the task list
        });

        completedTaskList.innerHTML = '';
        // Clearing the completed task list container

        completedTasks.forEach(task => {
            const completedItem = document.createElement('div');
            // Creating a div element for each completed task

            completedItem.className = 'task-item completed';
            // Adding the class name 'task-item completed'

            completedItem.textContent = `${task.name} (${task.category})`;
            // Setting the text content for the completed task

            completedTaskList.appendChild(completedItem);
            // Appending the completed task item to the container
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
        // Updating the tasks in localStorage

        localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
        // Updating the completed tasks in localStorage
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Preventing the form from submitting and refreshing the page

        const task = {
            name: document.getElementById('task-name').value,
            // Getting the task name from the form input

            dueDate: document.getElementById('due-date').value,
            // Getting the due date from the form input

            category: document.getElementById('category').value,
            // Getting the category from the form input

            priority: document.getElementById('priority').value,
            // Getting the priority from the form dropdown

            subtasks: document.getElementById('subtasks').value.split(',')
            // Getting subtasks, splitting by commas into an array
        };

        tasks.push(task);
        // Adding the new task to the tasks array

        renderTasks();
        // Re-rendering the task list

        taskForm.reset();
        // Resetting the form fields
    });

    const markAsCompleted = (index) => {
        completedTasks.push(tasks[index]);
        // Moving the selected task to the completed tasks array

        tasks.splice(index, 1);
        // Removing the task from the tasks array

        renderTasks();
        // Re-rendering the task list
    };

    const deleteTask = (index) => {
        tasks.splice(index, 1);
        // Deleting the task from the tasks array

        renderTasks();
        // Re-rendering the task list
    };

    renderTasks();
    // Initial rendering of the task lists

    // Activity Chart Setup
    const ctx = document.getElementById('activity-chart').getContext('2d');
    // Getting the context for the activity chart canvas

    const activityChart = new Chart(ctx, {
        type: 'bar',
        // Setting the chart type to 'bar'

        data: {
            labels: Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                return date.toISOString().slice(0, 10);
            }),
            // Dynamically setting the labels to the last 7 days' dates

            datasets: [{
                label: 'Time Spent on Pomodoros (Minutes)',
                // Updated label to indicate time spent in minutes

                data: [0, 0, 0, 0, 0, 0, 0],
                // Initializing data values to 0 for each day

                backgroundColor: 'rgba(98, 0, 234, 0.7)',
                // Setting the bar background color

                borderColor: 'rgba(98, 0, 234, 1)',
                // Setting the bar border color

                borderWidth: 1
                // Setting the bar border width
            }]
        },

        options: {
            responsive: true,
            // Making the chart responsive

            scales: {
                y: {
                    beginAtZero: true,
                    // Ensuring the y-axis starts at zero

                    title: {
                        display: true,
                        text: 'Minutes'
                        // Setting the y-axis title to 'Minutes'
                    }
                }
            }
        }
    });

    const updateProgressCircle = (timeRemaining) => {
        const progress = (timeRemaining / timerDuration) * 565;
        // Calculating the progress based on remaining time

        progressCircle.style.strokeDashoffset = 565 - progress;
        // Updating the stroke dash offset for the progress circle
    };

    const startTimer = () => {
        let [minutes, seconds] = timerDisplay.textContent.split(':').map(Number);
        // Parsing the timer display text into minutes and seconds

        let totalTime = minutes * 60 + seconds;
        // Calculating the total time in seconds

        const currentDate = new Date().toISOString().slice(0, 10);
        // Getting today's date

        const index = activityChart.data.labels.findIndex(label => label === currentDate);
        // Finding the index of today's date in the chart labels

        if (index === -1) {
            alert('Error: Current date not found in chart labels!');
            return;
        }

        timerInterval = setInterval(() => {
            if (totalTime <= 0) {
                clearInterval(timerInterval);
                // Stopping the timer when time runs out

                alert('Pomodoro session completed!');
                // Alerting the user that the session is completed

                pomodoroCount++;
                // Incrementing the Pomodoro count

                pomodoroCountDisplay.textContent = pomodoroCount;
                // Updating the Pomodoro count display

                localStorage.setItem('pomodoroCount', pomodoroCount);
                // Storing the updated count in localStorage

                resetTimer();
                // Resetting the timer to its initial state

                return;
            }

            totalTime--;
            // Decrementing the total time by one second

            const mins = Math.floor(totalTime / 60);
            // Calculating the remaining minutes

            const secs = totalTime % 60;
            // Calculating the remaining seconds

            timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            // Updating the timer display with formatted time

            updateProgressCircle(totalTime);
            // Updating the progress circle based on remaining time

            activityChart.data.datasets[0].data[index] += 1 / 60;
            // Incrementing time in the chart for the current day in minutes

            activityChart.update();
            // Updating the chart in real-time
        }, 1000);
    };

    const pauseTimer = () => clearInterval(timerInterval);
    // Pausing the timer by clearing the interval

    const resetTimer = () => {
        clearInterval(timerInterval);
        // Stopping the timer interval

        timerDisplay.textContent = '25:00';
        // Resetting the timer display to the initial state

        updateProgressCircle(timerDuration);
        // Resetting the progress circle to the initial state
    };

    document.getElementById('start-timer').addEventListener('click', startTimer);
    // Adding an event listener to the start timer button

    document.getElementById('pause-timer').addEventListener('click', pauseTimer);
    // Adding an event listener to the pause timer button

    document.getElementById('reset-timer').addEventListener('click', resetTimer);
    // Adding an event listener to the reset timer button

    resetTimer();
    // Initializing the timer in the reset state