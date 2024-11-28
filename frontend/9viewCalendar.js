document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeCalendar();
    loadDeliveries();
    setupModalClose();
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
        dayCell.setAttribute('data-date', day);
        
        // Make the day clickable
        dayCell.addEventListener('click', () => showDeliveriesForDate(day));
        
        const today = new Date();
        if (day === today.getDate() && 
            currentDate.getMonth() === today.getMonth() && 
            currentDate.getFullYear() === today.getFullYear()) {
            dayCell.classList.add('today');
        }
        
        grid.appendChild(dayCell);
    }
}

let currentDeliveries = []; // Store deliveries data globally

async function loadDeliveries() {
    try {
        const token = localStorage.getItem('token');
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const response = await fetch(`http://localhost:3000/api/deliveries/calendar/${year}/${month}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch deliveries');
        }

        currentDeliveries = await response.json(); // Store deliveries
        updateCalendarWithDeliveries(currentDeliveries);
    } catch (error) {
        console.error('Error loading deliveries:', error);
        showToast('Error loading deliveries: ' + error.message);
    }
}

function updateCalendarWithDeliveries(deliveries) {
    const days = document.querySelectorAll('.calendar-day:not(.empty):not(.header)');
    days.forEach(day => {
        day.classList.remove('has-delivery');
        const countBadge = day.querySelector('.delivery-count');
        if (countBadge) countBadge.remove();
    });
    
    if (!deliveries || deliveries.length === 0) return;

    // Group deliveries by date
    const deliveriesByDate = deliveries.reduce((acc, delivery) => {
        const date = new Date(delivery.scheduled_delivery_date).getDate();
        if (!acc[date]) acc[date] = [];
        acc[date].push(delivery);
        return acc;
    }, {});

    // Update calendar UI
    days.forEach(dayCell => {
        const date = parseInt(dayCell.getAttribute('data-date'));
        const dateDeliveries = deliveriesByDate[date];
        
        if (dateDeliveries && dateDeliveries.length > 0) {
            dayCell.classList.add('has-delivery');
            const countBadge = document.createElement('div');
            countBadge.className = 'delivery-count';
            countBadge.textContent = dateDeliveries.length;
            dayCell.appendChild(countBadge);
        }
    });
}

function showDeliveriesForDate(day) {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const deliveriesForDay = currentDeliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.scheduled_delivery_date);
        return deliveryDate.getDate() === day &&
               deliveryDate.getMonth() === selectedDate.getMonth() &&
               deliveryDate.getFullYear() === selectedDate.getFullYear();
    });

    showDayDeliveriesModal(deliveriesForDay, selectedDate);
}

function showDayDeliveriesModal(deliveries, date) {
    const modal = document.getElementById('deliveryDetailsModal');
    const details = document.getElementById('deliveryDetails');
    
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    if (deliveries.length === 0) {
        details.innerHTML = `
            <h3>${formattedDate}</h3>
            <p>No deliveries scheduled for this date.</p>
        `;
    } else {
        details.innerHTML = `
            <h3>Deliveries for ${formattedDate}</h3>
            <div class="deliveries-list">
                ${deliveries.map(delivery => `
                    <div class="delivery-item">
                        <div class="delivery-info">
                            <p><strong>Time:</strong> ${new Date(delivery.scheduled_delivery_date).toLocaleTimeString()}</p>
                            <p><strong>Donation ID:</strong> ${delivery.donation_id}</p>
                            <p><strong>Recipient:</strong> ${delivery.recipient_name}</p>
                            <p><strong>Volunteer:</strong> ${delivery.volunteer_name || 'Unassigned'}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${delivery.status || 'pending'}">${formatStatus(delivery.status)}</span></p>
                            <p><strong>Route:</strong> ${delivery.route_name}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

function setupModalClose() {
    // Close button functionality
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.onclick = function() {
            document.getElementById('deliveryDetailsModal').style.display = 'none';
        }
    });

    // Click outside modal to close
    window.onclick = function(event) {
        const modal = document.getElementById('deliveryDetailsModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

function formatStatus(status) {
    if (!status) return 'Not Set';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}