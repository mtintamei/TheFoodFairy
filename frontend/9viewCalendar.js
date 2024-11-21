document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeCalendar();
    loadDeliveries();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
}

let currentDate = new Date();

function initializeCalendar() {
    updateCalendarHeader();
    renderCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendarHeader();
        renderCalendar();
        loadDeliveries();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendarHeader();
        renderCalendar();
        loadDeliveries();
    });
}

function updateCalendarHeader() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        grid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        const today = new Date();
        if (day === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()) {
            dayCell.classList.add('today');
        }
        
        grid.appendChild(dayCell);
    }
}

async function loadDeliveries() {
    try {
        const token = localStorage.getItem('token');
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        
        const response = await fetch(`http://localhost:3000/deliveries/month/${year}/${month}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const deliveries = await response.json();
        markDeliveryDays(deliveries);
        displayDeliveriesTimeline(deliveries);
    } catch (error) {
        showToast('Error loading deliveries: ' + error.message);
    }
}

function markDeliveryDays(deliveries) {
    const days = document.querySelectorAll('.calendar-day:not(.empty):not(.header)');
    days.forEach(day => day.classList.remove('has-delivery'));
    
    deliveries.forEach(delivery => {
        const deliveryDate = new Date(delivery.start_time);
        if (deliveryDate.getMonth() === currentDate.getMonth()) {
            const dayCell = days[deliveryDate.getDate() - 1];
            if (dayCell) {
                dayCell.classList.add('has-delivery');
            }
        }
    });
}

function displayDeliveriesTimeline(deliveries) {
    const timeline = document.getElementById('deliveriesTimeline');
    timeline.innerHTML = '';
    
    if (deliveries.length === 0) {
        timeline.innerHTML = '<div class="delivery-item">No deliveries scheduled for this month</div>';
        return;
    }
    
    deliveries.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    
    deliveries.forEach(delivery => {
        const deliveryDate = new Date(delivery.start_time);
        const item = document.createElement('div');
        item.className = 'delivery-item';
        item.innerHTML = `
            <div class="delivery-time">
                ${deliveryDate.toLocaleDateString()} ${deliveryDate.toLocaleTimeString()}
            </div>
            <div class="delivery-info">
                <strong>Donation #${delivery.donation_id}</strong>
                <div>Volunteer: ${delivery.volunteer_name || 'Unassigned'}</div>
                <div>Status: ${delivery.status}</div>
            </div>
            <div class="delivery-actions">
                <button onclick="viewDeliveryDetails(${delivery.delivery_id})" class="action-button">
                    View Details
                </button>
            </div>
        `;
        timeline.appendChild(item);
    });
}

function viewDeliveryDetails(deliveryId) {
    // Implement delivery details view
    showToast('Delivery details feature coming soon');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}