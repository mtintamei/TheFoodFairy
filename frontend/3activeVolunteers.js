document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
    
    fetchActiveVolunteers();
    setupSearchAndFilters();
});

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchVolunteer');
    const availabilitySelect = document.getElementById('availability');

    searchInput.addEventListener('input', debounce(() => filterVolunteers(), 300));
    availabilitySelect.addEventListener('change', () => filterVolunteers());
}

async function fetchActiveVolunteers() {
    try {
        const token = localStorage.getItem('token');
        console.log('Making request to /api/volunteers/active');
        
        const response = await fetch('http://localhost:3000/api/volunteers/active', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = 'employeeLogin.html';
                return;
            }
            throw new Error(data.message || 'Failed to fetch volunteers');
        }

        displayVolunteers(data);
    } catch (error) {
        console.error('Error details:', error);
        showToast(error.message);
    }
}

function displayVolunteers(volunteers) {
    const container = document.getElementById('volunteersContainer');
    container.innerHTML = '';

    if (!volunteers || volunteers.length === 0) {
        container.innerHTML = '<div class="no-volunteers">No active volunteers available</div>';
        return;
    }

    volunteers.forEach(volunteer => {
        const card = document.createElement('div');
        card.className = 'volunteer-card';
        card.innerHTML = `
            <div class="volunteer-header">
                <h3>${volunteer.first_name} ${volunteer.last_name}</h3>
                <span class="availability-badge ${volunteer.preferred_times || 'flexible'}">
                    ${volunteer.preferred_times || 'Flexible'}
                </span>
            </div>
            <div class="volunteer-info">
                <p><i class="fas fa-envelope"></i> ${volunteer.email}</p>
                <p><i class="fas fa-phone"></i> ${volunteer.phone}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${volunteer.address}</p>
                <p><i class="fas fa-calendar-check"></i> Joined: ${new Date(volunteer.start_date).toLocaleDateString()}</p>
                <p><i class="fas fa-check-circle"></i> Background Check: ${volunteer.background_check}</p>
            </div>
            <div class="volunteer-stats">
                <div class="stat">
                    <span class="stat-value">${volunteer.completed_deliveries || 0}</span>
                    <span class="stat-label">Deliveries</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${volunteer.rating || 'N/A'}</span>
                    <span class="stat-label">Rating</span>
                </div>
            </div>
            <div class="volunteer-actions">
                <button onclick="assignDelivery(${volunteer.volunteer_id})" class="action-button">
                    Assign Delivery
                </button>
                <button onclick="viewVolunteerHistory(${volunteer.volunteer_id})" class="secondary-button">
                    View History
                </button>
                <button onclick="contactVolunteer(${volunteer.volunteer_id})" class="contact-button">
                    Contact
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterVolunteers() {
    const searchTerm = document.getElementById('searchVolunteer').value.toLowerCase();
    const availability = document.getElementById('availability').value.toLowerCase();
    const cards = document.querySelectorAll('.volunteer-card');

    cards.forEach(card => {
        const volunteerInfo = card.textContent.toLowerCase();
        const availabilityBadge = card.querySelector('.availability-badge').textContent.toLowerCase();
        
        const matchesSearch = volunteerInfo.includes(searchTerm);
        const matchesAvailability = availability === '' || availabilityBadge.includes(availability);

        card.style.display = (matchesSearch && matchesAvailability) ? 'block' : 'none';
    });

    // Show no results message if needed
    const visibleCards = Array.from(cards).filter(card => card.style.display === 'block');
    const noResultsMsg = document.querySelector('.no-results') || createNoResultsMessage();
    
    if (visibleCards.length === 0) {
        document.getElementById('volunteersContainer').appendChild(noResultsMsg);
        noResultsMsg.style.display = 'block';
    } else {
        noResultsMsg.style.display = 'none';
    }
}

// Helper functions
function createNoResultsMessage() {
    const msg = document.createElement('div');
    msg.className = 'no-results';
    msg.textContent = 'No volunteers match your search criteria';
    return msg;
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

// Action handlers
async function assignDelivery(volunteerId) {
    // Implementation for assigning delivery
    window.location.href = `7scheduleDelivery.html?volunteerId=${volunteerId}`;
}

async function viewVolunteerHistory(volunteerId) {
    // Implementation for viewing history
    // Could open a modal or navigate to a new page
}

async function contactVolunteer(volunteerId) {
    // Implementation for contacting volunteer
    // Could open a modal with contact options
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleLogout() {
    localStorage.clear();
    window.location.href = 'employeeLogin.html';
}