document.addEventListener('DOMContentLoaded', function() {
    fetchActiveVolunteers();
});

async function fetchActiveVolunteers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/volunteers/active', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        displayVolunteers(data);
    } catch (error) {
        showToast('Error fetching active volunteers');
    }
}

function displayVolunteers(volunteers) {
    const container = document.getElementById('volunteersContainer');
    container.innerHTML = '';

    volunteers.forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'volunteer-card';
        card.innerHTML = `
            <h3>${volunteer.first_name} ${volunteer.last_name}</h3>
            <p>Email: ${volunteer.email}</p>
            <p>Phone: ${volunteer.phone}</p>
            <p>Status: ${volunteer.status}</p>
            <button onclick="assignDelivery(${volunteer.volunteer_id})" class="action-button">
                Assign Delivery
            </button>
        `;
        container.appendChild(card);
    });
}

function assignDelivery(volunteerId) {
    // Handle delivery assignment
    showToast('Opening delivery assignment...');
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