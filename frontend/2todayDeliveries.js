document.addEventListener('DOMContentLoaded', function() {
    fetchTodayDeliveries();
});

async function fetchTodayDeliveries() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/deliveries/today', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        displayDeliveries(data);
    } catch (error) {
        showToast('Error fetching today\'s deliveries');
    }
}

function displayDeliveries(deliveries) {
    const container = document.getElementById('deliveriesContainer');
    container.innerHTML = '';

    deliveries.forEach(delivery => {
        const item = document.createElement('div');
        item.className = 'delivery-item';
        item.innerHTML = `
            <div class="delivery-time">
                ${new Date(delivery.start_time).toLocaleTimeString()}
            </div>
            <div class="delivery-info">
                <h3>${delivery.recipient_name}</h3>
                <p>${delivery.address}</p>
                <p>Items: ${delivery.items}</p>
            </div>
            <div class="delivery-status">
                ${getStatusBadge(delivery.status)}
            </div>
        `;
        container.appendChild(item);
    });
}

function getStatusBadge(status) {
    const colors = {
        scheduled: '#2563eb',
        'in_progress': '#d97706',
        completed: '#16a34a'
    };
    
    return `<span style="background: ${colors[status]}; color: white; padding: 5px 10px; border-radius: 15px;">
        ${status.replace('_', ' ').toUpperCase()}
    </span>`;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = 'employeeLogin.html';
}