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
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/employees/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` // Ensure the token is included in the headers
            }
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Dashboard data fetched successfully!');
            console.log(data);
            updateDashboard(data); // Assuming you have an updateDashboard function
        } else {
            showToast(data.message);
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast('An error occurred while fetching dashboard data');
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
    // Update stats
    document.getElementById('pendingDonations').textContent = data.stats.pendingDonations;
    document.getElementById('todayDeliveries').textContent = data.stats.todayDeliveries;
    document.getElementById('activeVolunteers').textContent = data.stats.activeVolunteers;
    document.getElementById('notifications').textContent = data.stats.notifications;

     // Update urgent notifications
     updateUrgentNotifications(data.urgentNotifications);

    // Update charts
    updateDistributionChart(data.distributionData);
    updateDonationChart(data.donationSources);
}

function updateUrgentNotifications(notifications) {
    const container = document.getElementById('urgentNotificationsList');
    container.innerHTML = '';

    if (notifications.length === 0) {
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
            <small>Created: ${new Date(notification.created_at).toLocaleString()}</small>
            ${notification.action_url ? 
                `<a href="${notification.action_url}" class="notification-action">Take Action</a>` : 
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
        const response = await fetch(`http://localhost:3000/notifications/${notificationId}/mark-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            showToast('Notification marked as read');
            fetchDashboardData(); // Refresh dashboard data
        } else {
            showToast('Error marking notification as read');
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        showToast('An error occurred');
    }
}

// Distribution Progress Chart
let distributionChart = null;
let donationChart = null;

function updateDistributionChart(data) {
    const distributionCtx = document.getElementById('distributionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (distributionChart) {
        distributionChart.destroy();
    }

    distributionChart = new Chart(distributionCtx, {
        type: 'line',
        data: {
            labels: data.map(d => new Date(2024, d.month - 1).toLocaleString('default', { month: 'short' })),
            datasets: [{
                label: 'Delivered (kg)',
                data: data.map(d => d.delivered),
                borderColor: '#9b87f5',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });
}

function updateDonationChart(data) {
    const processedData = processSourcesData(data);
    const donationCtx = document.getElementById('donationChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (donationChart) {
        donationChart.destroy();
    }

    donationChart = new Chart(donationCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Farms',
                data: processedData.farms,
                backgroundColor: '#22c55e'
            },
            {
                label: 'Restaurants',
                data: processedData.restaurants,
                backgroundColor: '#9b87f5'
            },
            {
                label: 'Stores',
                data: processedData.stores,
                backgroundColor: '#F97316'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function processSourcesData(data) {
    const result = {
        farms: new Array(4).fill(0),
        restaurants: new Array(4).fill(0),
        stores: new Array(4).fill(0)
    };

    data.forEach(item => {
        const weekIndex = item.week % 4;
        switch(item.source_type.toLowerCase()) {
            case 'farm':
                result.farms[weekIndex] += item.count;
                break;
            case 'restaurant':
                result.restaurants[weekIndex] += item.count;
                break;
            case 'store':
                result.stores[weekIndex] += item.count;
                break;
        }
    });

    return result;
}

// Handle Quick Actions
function handleAction(action) {
    const toast = document.getElementById('toast');
    let message = '';
    
    switch(action) {
        case 'donation':
            message = 'Opening donation form...';
            break;
        case 'delivery':
            message = 'Opening delivery scheduler...';
            break;
        case 'volunteers':
            message = 'Opening volunteer management...';
            break;
        case 'calendar':
            message = 'Opening calendar view...';
            break;
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
}
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'employeeLogin.html';
}