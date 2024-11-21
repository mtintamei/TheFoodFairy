document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    fetchUrgentActions();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
    }
}

async function fetchUrgentActions() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/urgent-actions', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        displayUrgentActions(data);
    } catch (error) {
        showToast('Error fetching urgent actions');
    }
}

function displayUrgentActions(actions) {
    const container = document.getElementById('urgentActionsList');
    container.innerHTML = '';

    actions.forEach(action => {
        const actionDiv = document.createElement('div');
        actionDiv.className = `action-item ${action.severity}`;
        actionDiv.innerHTML = `
            <p>${action.message}</p>
            <button onclick="markAsRead(${action.id})" class="mark-read-button">
                Mark as Read
            </button>
        `;
        container.appendChild(actionDiv);
    });
}

async function markAsRead(actionId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/urgent-actions/${actionId}/mark-read`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            showToast('Action marked as read');
            fetchUrgentActions(); // Refresh the list
        }
    } catch (error) {
        showToast('Error marking action as read');
    }
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