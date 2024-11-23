document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    fetchDashboardData();
    setInterval(fetchDashboardData, 30000);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
    }
}


   // Add click handlers for stat cards
   document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const href = card.getAttribute('href');
        navigateTo(href.substring(1)); // Remove the leading slash
    });
});

// Add click handlers for quick action buttons
document.querySelectorAll('.action-button').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const href = button.getAttribute('href');
        navigateTo(href.substring(1)); // Remove the leading slash
    });
});


function navigateTo(path) {
// Store the current path to handle it in the respective page
localStorage.setItem('currentPath', path);
window.location.href = path + '.html';
}

async function fetchDashboardData() {
    const token = localStorage.getItem('token');

    if (!token) {
        showToast('No token found. Please log in again.');
        window.location.href = 'employeeLogin.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/employees/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            showToast('Dashboard endpoint not found. Please check server configuration.');
            return;
        }

        if (response.status === 401) {
            showToast('Session expired. Please log in again.');
            window.location.href = 'employeeLogin.html';
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }

        const data = await response.json();
        updateDashboard(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast(error.message || 'Error loading dashboard data');
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
}

function updateDashboard(data) {
    // Update statistics
    document.getElementById('pendingDonations').textContent = data.stats.pendingDonations || 0;
    document.getElementById('todayDeliveries').textContent = data.stats.todayDeliveries || 0;
    document.getElementById('activeVolunteers').textContent = data.stats.activeVolunteers || 0;
    document.getElementById('notifications').textContent = data.stats.notifications || 0;

    // Update urgent notifications
    updateUrgentNotifications(data.urgentNotifications || []);

    // Update charts
    updateDistributionChart(data.distributionData || []);
    updateDonationChart(data.donationSources || []);
}

function updateUrgentNotifications(notifications) {
    const container = document.getElementById('urgentNotificationsList');
    container.innerHTML = '';

    if (!notifications.length) {
        container.innerHTML = `
            <div class="action-item info">
                No high priority notifications at this time
            </div>
        `;
        return;
    }

    notifications.forEach(notification => {
        const notificationDiv = document.createElement('div');
        notificationDiv.className = `action-item ${notification.severity}`;
        notificationDiv.innerHTML = `
            <p>${notification.message}</p>
            <small>${formatDate(notification.created_at)}</small>
            ${notification.action_required ? 
                `<a href="#" onclick="handleNotificationAction('${notification.notification_id}', '${notification.action_type}')" class="notification-action">
                    Take Action
                </a>` : 
                ''
            }
            <button onclick="markNotificationAsRead(${notification.notification_id})" class="mark-read-button">
                Mark as Read
            </button>
        `;
        container.appendChild(notificationDiv);
    });
}

async function markNotificationAsRead(notificationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/notifications/${notificationId}/mark-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to mark notification as read');
        }

        showToast('Notification marked as read');
        fetchDashboardData();
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message);
    }
}

function updateDistributionChart(data) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) {
        console.error('Distribution chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    try {
        // Safely destroy existing chart
        if (window.distributionChart instanceof Chart) {
            window.distributionChart.destroy();
        }

        // Prepare data with error checking
        const months = data.map(d => formatMonth(d.month) || '');
        const values = data.map(d => parseFloat(d.delivered) || 0);

        // Create new chart with error handling
        window.distributionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Distributed Amount (kg)',
                    data: values,
                    borderColor: '#9b87f5',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quantity (kg)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating distribution chart:', error);
    }
}

function updateDonationChart(data) {
    const canvas = document.getElementById('donationChart');
    if (!canvas) {
        console.error('Donation chart canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    
    try {
        // Safely destroy existing chart
        if (window.donationChart instanceof Chart) {
            window.donationChart.destroy();
        }

        // Process the data with error checking
        const processedData = {
            restaurant: new Array(4).fill(0),
            store: new Array(4).fill(0),
            hotel: new Array(4).fill(0),
            other: new Array(4).fill(0)
        };

        data.forEach(item => {
            if (item && typeof item.week === 'number') {
                const weekIndex = Math.abs(item.week % 4);
                const type = (item.source_type || 'other').toLowerCase();
                if (processedData[type]) {
                    processedData[type][weekIndex] += parseInt(item.count) || 0;
                } else {
                    processedData.other[weekIndex] += parseInt(item.count) || 0;
                }
            }
        });

        // Create new chart with error handling
        window.donationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                    {
                        label: 'Restaurant',
                        data: processedData.restaurant,
                        backgroundColor: '#22c55e'
                    },
                    {
                        label: 'Store',
                        data: processedData.store,
                        backgroundColor: '#9b87f5'
                    },
                    {
                        label: 'Hotel',
                        data: processedData.hotel,
                        backgroundColor: '#F97316'
                    },
                    {
                        label: 'Other',
                        data: processedData.other,
                        backgroundColor: '#64748b'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Donations'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error updating donation chart:', error);
    }
}

// Helper function for formatting months
function formatMonth(month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleString();
}

function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'employeeLogin.html';
}

// Quick action handlers
function handleAction(action) {
    const actionMessages = {
        donation: 'Opening donation form...',
        delivery: 'Opening delivery scheduler...',
        volunteers: 'Opening volunteer management...',
        calendar: 'Opening calendar view...'
    };
    
    showToast(actionMessages[action] || 'Processing action...');
    navigateTo(action);
}