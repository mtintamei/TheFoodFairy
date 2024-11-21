document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadNotifications();
    setupFilterButtons();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
}

async function loadNotifications(severity = null) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Updated endpoint to match backend route structure
        const url = new URL('http://localhost:3000/employees/notifications');
        if (severity && severity !== 'all') {
            url.searchParams.append('severity', severity);
        }
            
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const notifications = await response.json();
        if (notifications.length === 0) {
            displayNoNotifications();
        } else {
            displayNotifications(notifications);
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        showToast('Error loading notifications: ' + error.message);
    }
}

function displayNoNotifications() {
    const container = document.getElementById('notificationsList');
    container.innerHTML = `
        <div class="notification-item">
            <div class="notification-content">
                <p class="notification-message">No notifications found</p>
            </div>
        </div>
    `;
}

function displayNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    container.innerHTML = '';

    if (!notifications || notifications.length === 0) {
        container.innerHTML = `
            <div class="notification-item">
                <div class="notification-content">
                    <p class="notification-message">No notifications found</p>
                </div>
            </div>
        `;
        return;
    }

    notifications.forEach(notification => {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `notification-item ${notification.severity} ${notification.is_read ? 'read' : ''}`;
        
        notificationDiv.innerHTML = `
            <div class="notification-content">
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <span>${notification.alert_type}</span>
                    <span>Created: ${new Date(notification.created_at).toLocaleString()}</span>
                </div>
            </div>
            ${!notification.is_read ? `
                <button onclick="markAsRead(${notification.notification_id})" class="mark-read-btn">
                    Mark as Read
                </button>
            ` : ''}
            ${notification.action_url ? `
                <a href="${notification.action_url}" class="action-btn">
                    View Details
                </a>
            ` : ''}
        `;
        
        container.appendChild(notificationDiv);
    });
}

async function markAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`http://localhost:3000/employees/notifications/${notificationId}/mark-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        showToast('Notification marked as read');
        loadNotifications(); // Reload notifications
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('Error: ' + error.message);
    }
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const severity = button.dataset.filter;
            loadNotifications(severity === 'all' ? null : severity);
        });
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'employeeLogin.html';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}