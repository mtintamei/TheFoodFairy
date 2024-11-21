document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadVolunteers();
    setupFilters();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
}

async function loadVolunteers(status = 'all') {
    try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:3000/volunteers${status !== 'all' ? `?status=${status}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const volunteers = await response.json();
        displayVolunteers(volunteers);
    } catch (error) {
        showToast('Error loading volunteers: ' + error.message);
    }
}

function displayVolunteers(volunteers) {
    const grid = document.getElementById('volunteersGrid');
    grid.innerHTML = '';
    
    volunteers.forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'volunteer-card';
        card.innerHTML = `
            <div class="volunteer-info">
                <span class="volunteer-name">${volunteer.first_name} ${volunteer.last_name}</span>
                <span class="volunteer-status ${volunteer.status}">${volunteer.status}</span>
                <span>${volunteer.email}</span>
                <span>${volunteer.phone}</span>
            </div>
            <div class="volunteer-actions">
                <button onclick="updateVolunteerStatus(${volunteer.volunteer_id}, '${volunteer.status === 'active' ? 'inactive' : 'active'}')" 
                        class="action-button">
                    ${volunteer.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupFilters() {
    const searchInput = document.querySelector('.search-input');
    const statusFilter = document.querySelector('.filter-select');
    
    searchInput.addEventListener('input', debounce(filterVolunteers, 300));
    statusFilter.addEventListener('change', () => filterVolunteers());
}

async function filterVolunteers() {
    const searchTerm = document.querySelector('.search-input').value.toLowerCase();
    const status = document.querySelector('.filter-select').value;
    
    try {
        const token = localStorage.getItem('token');
        const url = `http://localhost:3000/volunteers${status !== 'all' ? `?status=${status}` : ''}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        let volunteers = await response.json();
        
        if (searchTerm) {
            volunteers = volunteers.filter(v => 
                `${v.first_name} ${v.last_name}`.toLowerCase().includes(searchTerm) ||
                v.email.toLowerCase().includes(searchTerm)
            );
        }
        
        displayVolunteers(volunteers);
    } catch (error) {
        showToast('Error filtering volunteers: ' + error.message);
    }
}

async function updateVolunteerStatus(volunteerId, newStatus) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/volunteers/${volunteerId}/status`, {
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
        
        showToast('Volunteer status updated successfully');
        loadVolunteers(document.querySelector('.filter-select').value);
    } catch (error) {
        showToast('Error updating volunteer status: ' + error.message);
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

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}