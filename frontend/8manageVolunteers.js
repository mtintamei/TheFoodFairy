document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    fetchVolunteers();
    setupFilters();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchVolunteer');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', debounce(() => filterVolunteers(), 300));
    statusFilter.addEventListener('change', () => filterVolunteers());
}

async function fetchVolunteers() {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching all volunteers with token:', token ? 'Present' : 'Missing');

        const response = await fetch('http://localhost:3000/api/volunteers/all', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteers');
        }

        displayVolunteers(data);
    } catch (error) {
        console.error('Error details:', error);
        const container = document.getElementById('volunteersContainer');
        container.innerHTML = '<div class="no-volunteers">Error loading volunteers. Please try again.</div>';
        showToast('Error: ' + error.message);
    }
}

function displayVolunteers(volunteers) {
    const container = document.getElementById('volunteersContainer');
    container.innerHTML = '';

    if (volunteers.length === 0) {
        container.innerHTML = '<div class="no-volunteers">No volunteers found</div>';
        return;
    }

    volunteers.forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'volunteer-card';
        card.innerHTML = `
            <div class="volunteer-info">
                <h3>${volunteer.first_name} ${volunteer.last_name}</h3>
                <span class="status-badge ${volunteer.status}">${formatStatus(volunteer.status)}</span>
                <p><strong>Email:</strong> ${volunteer.email}</p>
                <p><strong>Phone:</strong> ${volunteer.phone}</p>
                <p><strong>Joined:</strong> ${new Date(volunteer.join_date).toLocaleDateString()}</p>
            </div>
            <div class="volunteer-actions">
                <button onclick="openVolunteerModal(${volunteer.volunteer_id})" class="action-button">
                    View Details
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function formatStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

async function openVolunteerModal(volunteerId) {
    try {
        const token = localStorage.getItem('token');
        console.log('Fetching details for volunteer:', volunteerId);
        
        const response = await fetch(`http://localhost:3000/api/volunteers/${volunteerId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Received volunteer data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch volunteer details');
        }

        const modal = document.getElementById('volunteerModal');
        const details = document.getElementById('volunteerDetails');
        
        details.innerHTML = `
            <div class="detail-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> ${data.first_name} ${data.last_name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Gender:</strong> ${data.gender || 'Not specified'}</p>
                <p><strong>Address:</strong> ${data.address || 'Not provided'}</p>
            </div>
            <div class="detail-section">
                <h3>Volunteer Status</h3>
                <p><strong>Status:</strong> <span class="status-badge ${data.status}">${formatStatus(data.status)}</span></p>
                <p><strong>Start Date:</strong> ${data.start_date ? new Date(data.start_date).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Join Date:</strong> ${data.join_date ? new Date(data.join_date).toLocaleDateString() : 'Not set'}</p>
                <p><strong>Background Check:</strong> ${formatStatus(data.background_check)}</p>
            </div>
            <div class="detail-section">
                <h3>Delivery Statistics</h3>
                <p><strong>Completed Deliveries:</strong> ${data.stats?.completed_deliveries || 0}</p>
                <p><strong>Ongoing Deliveries:</strong> ${data.stats?.ongoing_deliveries || 0}</p>
            </div>
            ${data.why_volunteer ? `
                <div class="detail-section">
                    <h3>Motivation</h3>
                    <p>${data.why_volunteer}</p>
                </div>
            ` : ''}
        `;

        // Setup action buttons based on current status
        const activateButton = document.getElementById('activateButton');
        const deactivateButton = document.getElementById('deactivateButton');

        if (data.status === 'pending_verification') {
            activateButton.style.display = 'block';
            deactivateButton.style.display = 'none';
            activateButton.onclick = () => updateVolunteerStatus(volunteerId, 'active');
        } else if (data.status === 'active') {
            activateButton.style.display = 'none';
            deactivateButton.style.display = 'block';
            deactivateButton.onclick = () => updateVolunteerStatus(volunteerId, 'inactive');
        } else {
            activateButton.style.display = 'block';
            deactivateButton.style.display = 'none';
            activateButton.onclick = () => updateVolunteerStatus(volunteerId, 'active');
        }

        modal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching volunteer details:', error);
        showToast('Error: ' + error.message);
    }
}

async function updateVolunteerStatus(volunteerId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/volunteers/${volunteerId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update volunteer status');
        }

        document.getElementById('volunteerModal').style.display = 'none';
        showToast(`Volunteer ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchVolunteers(); // Refresh the list
    } catch (error) {
        showToast('Error: ' + error.message);
    }
}

function filterVolunteers() {
    const searchTerm = document.getElementById('searchVolunteer').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const cards = document.querySelectorAll('.volunteer-card');

    cards.forEach(card => {
        const volunteerName = card.querySelector('h3').textContent.toLowerCase();
        const volunteerStatus = card.querySelector('.status-badge').className.split(' ')[1];
        
        const matchesSearch = volunteerName.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || volunteerStatus === statusFilter;

        card.style.display = (matchesSearch && matchesStatus) ? 'block' : 'none';
    });
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

// Modal close functionality
document.querySelector('.close').onclick = function() {
    document.getElementById('volunteerModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('volunteerModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}