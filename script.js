

// Timezone data arrays
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

// Search interface variables
let timezones = [];
const timezoneSearch = document.getElementById('timezoneSearch');
const timezoneDropdown = document.getElementById('timezoneDropdown');
let selectedIndex = -1;

// Initialize timezones array
timezones = Intl.supportedValuesOf('timeZone').map(timezone => ({
    value: timezone,
    label: timezone.replace(/_/g, ' ')
}));

// Function to filter and show matching timezones
function filterTimezones(searchText) {
    const searchLower = searchText.toLowerCase();
    return timezones.filter(timezone => 
        timezone.label.toLowerCase().includes(searchLower)
    );
}

// Function to render the dropdown options
function renderDropdown(filteredTimezones) {
    timezoneDropdown.innerHTML = '';
    filteredTimezones.forEach((timezone, index) => {
        const option = document.createElement('div');
        option.className = 'timezone-option';
        option.textContent = timezone.label;
        option.dataset.value = timezone.value;
        if (index === selectedIndex) {
            option.classList.add('highlighted');
        }
        option.addEventListener('click', () => selectTimezone(timezone.value));
        timezoneDropdown.appendChild(option);
    });
}

// Function to select a timezone
function selectTimezone(value) {
    const timezone = timezones.find(tz => tz.value === value);
    if (timezone) {
        // Limpa o campo de pesquisa após a seleção
        timezoneSearch.value = '';
        timezoneDropdown.classList.remove('show');
        
        // Cria e adiciona o novo relógio
        const newTimeZone = {
            zone: timezone.value,
            label: timezone.label
        };
        const clockElement = createClockElement(newTimeZone);
        document.getElementById('clockContainer').appendChild(clockElement);
        updateTime();
    }
}

// Event listeners for search functionality
timezoneSearch.addEventListener('focus', () => {
    const filtered = filterTimezones(timezoneSearch.value);
    renderDropdown(filtered);
    timezoneDropdown.classList.add('show');
});

timezoneSearch.addEventListener('input', () => {
    selectedIndex = -1;
    const filtered = filterTimezones(timezoneSearch.value);
    renderDropdown(filtered);
    timezoneDropdown.classList.add('show');
});

// Handle keyboard navigation
timezoneSearch.addEventListener('keydown', (e) => {
    const options = timezoneDropdown.querySelectorAll('.timezone-option');
    const filtered = filterTimezones(timezoneSearch.value);
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
            renderDropdown(filtered);
            const nextOption = options[selectedIndex];
            if (nextOption) nextOption.scrollIntoView({ block: 'nearest' });
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            renderDropdown(filtered);
            const prevOption = options[selectedIndex];
            if (prevOption) prevOption.scrollIntoView({ block: 'nearest' });
            break;
            
        case 'Enter':
            e.preventDefault();
            if (selectedIndex >= 0 && filtered[selectedIndex]) {
                selectTimezone(filtered[selectedIndex].value);
            }
            break;
            
        case 'Escape':
            timezoneDropdown.classList.remove('show');
            break;
            
        default:
            // If user types a letter, filter to show matching timezones
            if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
                selectedIndex = -1;
                const filtered = filterTimezones(timezoneSearch.value + e.key);
                renderDropdown(filtered);
                timezoneDropdown.classList.add('show');
            }
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!timezoneSearch.contains(e.target) && !timezoneDropdown.contains(e.target)) {
        timezoneDropdown.classList.remove('show');
    }
});

// Clock creation and management functions
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

// Drag and drop functionality
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

// Time update functionality
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