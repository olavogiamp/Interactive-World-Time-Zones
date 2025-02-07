const featuredTimeZones = [
    { zone: 'Europe/Lisbon', label: 'Portugal' },
    { zone: 'Asia/Jerusalem', label: 'Israel' },
    { zone: 'America/Sao_Paulo', label: 'Brasil' }
];

const timeZones = [
    { zone: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { zone: 'America/New_York', label: 'New York' },
    { zone: 'America/Los_Angeles', label: 'Los Angeles' },
    { zone: 'Europe/London', label: 'London' },
    { zone: 'Europe/Paris', label: 'Paris' },
    { zone: 'Asia/Tokyo', label: 'Tokyo' },
    { zone: 'Asia/Dubai', label: 'Dubai' },
    { zone: 'Australia/Sydney', label: 'Sydney' },
    { zone: 'Pacific/Auckland', label: 'Auckland' }
];

// Populate timezone select
const timezoneSelect = document.getElementById('timezoneSelect');
Intl.supportedValuesOf('timeZone').forEach(timezone => {
    const option = document.createElement('option');
    option.value = timezone;
    option.textContent = timezone.replace(/_/g, ' ');
    timezoneSelect.appendChild(option);
});

function createClockElement(timeZone, isFeatured = false) {
    const clockDiv = document.createElement('div');
    clockDiv.className = `clock ${isFeatured ? 'featured' : ''}`;
    clockDiv.draggable = true;
    clockDiv.innerHTML = `
        <button class="remove-button" onclick="removeClock(this)">×</button>
        <div class="location">${timeZone.label}</div>
        <div class="time" id="time-${timeZone.zone.replace('/', '-')}"></div>
        <div class="date" id="date-${timeZone.zone.replace('/', '-')}"></div>
    `;

    // Add drag and drop event listeners
    clockDiv.addEventListener('dragstart', dragStart);
    clockDiv.addEventListener('dragend', dragEnd);
    clockDiv.addEventListener('dragover', dragOver);
    clockDiv.addEventListener('drop', drop);

    return clockDiv;
}

function dragStart(e) {
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
    const draggable = document.querySelector('.dragging');
    const container = e.target.closest('.featured-container, .clock-container');
    if (container && draggable) {
        const afterElement = getDragAfterElement(container, e.clientY);
        if (afterElement) {
            container.insertBefore(draggable, afterElement);
        } else {
            container.appendChild(draggable);
        }
    }
}

function drop(e) {
    e.preventDefault();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.clock:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function removeClock(button) {
    button.closest('.clock').remove();
}

function addNewTimezone() {
    const selectedZone = timezoneSelect.value;
    if (selectedZone) {
        const newTimeZone = {
            zone: selectedZone,
            label: selectedZone.split('/').pop().replace(/_/g, ' ')
        };
        
        const clockElement = createClockElement(newTimeZone);
        document.getElementById('clockContainer').appendChild(clockElement);
        updateTime();
    }
}

function updateTime() {
    document.querySelectorAll('.clock').forEach(clock => {
        const timeElement = clock.querySelector('.time');
        const dateElement = clock.querySelector('.date');
        const zoneId = timeElement.id.replace('time-', '').replace('-', '/');
        
        const now = new Date();
        const options = {
            timeZone: zoneId,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        
        const dateOptions = {
            timeZone: zoneId,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        try {
            const timeString = now.toLocaleTimeString('en-US', options);
            const dateString = now.toLocaleDateString('en-US', dateOptions);
            
            timeElement.textContent = timeString;
            dateElement.textContent = dateString;
        } catch (e) {
            console.error(`Error updating time for ${zoneId}:`, e);
        }
    });
}

// Initialize featured clocks
const featuredContainer = document.getElementById('featuredContainer');
featuredTimeZones.forEach(timeZone => {
    featuredContainer.appendChild(createClockElement(timeZone, true));
});

// Initialize regular clocks
const container = document.getElementById('clockContainer');
timeZones.forEach(timeZone => {
    container.appendChild(createClockElement(timeZone));
});

// Update time every second
updateTime();
setInterval(updateTime, 1000);