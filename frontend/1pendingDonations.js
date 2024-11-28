let currentDonationId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchPendingDonations();
    setupSearchAndFilters();
});

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchDonor');
    const foodTypeSelect = document.getElementById('foodType');

    // Add event listeners with debounce for search
    searchInput.addEventListener('input', debounce(() => filterDonations(), 300));
    foodTypeSelect.addEventListener('change', () => filterDonations());
}

async function fetchPendingDonations() {
    try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        const response = await fetch('http://localhost:3000/api/donors/donations/pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response Status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to fetch donations');
        }

        const data = await response.json();
        displayPendingDonations(data);
    } catch (error) {
        showToast('Error fetching pending donations: ' + error.message);
    }
}

function displayPendingDonations(donations) {
    const container = document.getElementById('donationsContainer');
    container.innerHTML = '';

    if (donations.length === 0) {
        container.innerHTML = '<div class="no-donations">No pending donations available</div>';
        return;
    }

    donations.forEach(donation => {
        const card = document.createElement('div');
        card.className = 'donation-card';
        card.innerHTML = `
            <h3>${donation.food_name}</h3>
            <p><strong>Total Quantity:</strong> ${donation.quantity} ${donation.unit}</p>
            <p><strong>Remaining:</strong> ${donation.remaining_quantity} ${donation.unit}</p>
            <p><strong>Donor:</strong> ${donation.donor_name}</p>
            <p><strong>Category:</strong> ${donation.category}</p>
            <p><strong>Pickup Time:</strong> ${new Date(donation.pickup_time).toLocaleString()}</p>
            <button onclick="openAssignModal(${donation.donation_id}, ${donation.remaining_quantity}, '${donation.unit}')" 
                    class="action-button">
                Schedule Delivery
            </button>
        `;
        container.appendChild(card);
    });
}

async function openAssignModal(donationId, remainingQuantity, unit) {
    currentDonationId = donationId;
    const modal = document.getElementById('assignModal');
    const quantityInput = document.getElementById('assignedQuantity');
    
    // Set max quantity and show remaining
    quantityInput.max = remainingQuantity;
    quantityInput.placeholder = `Max: ${remainingQuantity} ${unit}`;
    
    try {
        // Load all data in parallel
        await Promise.all([
            loadBeneficiaries(),
            loadVolunteers(),
            loadRoutes()
        ]);

        setDefaultPickupTime();
        setupEventListeners();
        
        modal.style.display = 'block';
    } catch (error) {
        showToast('Error loading data: ' + error.message);
    }
}

async function loadBeneficiaries() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/beneficiaries', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch beneficiaries');
        }
        
        const beneficiaries = await response.json();
        const select = document.getElementById('beneficiaryId');
        
        select.innerHTML = '<option value="">Select a beneficiary</option>';
        
        beneficiaries.forEach(beneficiary => {
            const option = document.createElement('option');
            option.value = beneficiary.recipient_id;
            option.textContent = `${beneficiary.name} - ${beneficiary.contact_person}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading beneficiaries:', error);
        throw error;
    }
}

async function loadVolunteers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/volunteers', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch volunteers');
        }
        
        const volunteers = await response.json();
        const select = document.getElementById('volunteerId');
        
        select.innerHTML = '<option value="">Select a volunteer</option>';
        
        volunteers.forEach(volunteer => {
            const option = document.createElement('option');
            option.value = volunteer.volunteer_id;
            option.textContent = `${volunteer.first_name} ${volunteer.last_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading volunteers:', error);
        throw error;
    }
}

async function loadRoutes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/deliveries/routes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch routes');
        }
        
        const routes = await response.json();
        const select = document.getElementById('route');
        
        select.innerHTML = '<option value="">Select a route</option>';
        
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.route_id;
            option.textContent = route.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading routes:', error);
        throw error;
    }
}

function setDefaultPickupTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const pickupInput = document.getElementById('pickupTime');
    
    pickupInput.value = now.toISOString().slice(0, 16);
    pickupInput.min = new Date().toISOString().slice(0, 16);
}

async function assignBeneficiary() {
    const beneficiaryId = document.getElementById('beneficiaryId').value;
    const routeId = document.getElementById('route').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const quantity = document.getElementById('assignedQuantity').value;
    
    if (!beneficiaryId || !routeId || !deliveryDate || !quantity) {
        showToast('Please fill in all required fields');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/donors/donations/${currentDonationId}/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipient_id: beneficiaryId,
                route_id: routeId,
                scheduled_delivery_date: deliveryDate,
                assigned_quantity: parseFloat(quantity)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to assign beneficiary');
        }

        document.getElementById('assignModal').style.display = 'none';
        showToast('Donation successfully assigned');
        fetchPendingDonations(); // Refresh the list
    } catch (error) {
        showToast('Error assigning beneficiary: ' + error.message);
    }
}

function filterDonations() {
    const searchTerm = document.getElementById('searchDonor').value.toLowerCase();
    const foodType = document.getElementById('foodType').value.toLowerCase();
    const cards = document.querySelectorAll('.donation-card');

    cards.forEach(card => {
        // Get the donor name and category
        const donorText = card.querySelector('p:contains("Donor:")').textContent;
        const categoryText = card.querySelector('p:contains("Category:")').textContent;
        
        // Extract just the values after the colon and trim whitespace
        const donorName = donorText.split('Donor:')[1].trim().toLowerCase();
        const category = categoryText.split('Category:')[1].trim().toLowerCase();

        // Check if matches search term
        const matchesSearch = searchTerm === '' || donorName.includes(searchTerm);
        
        // Check if matches food type
        let matchesType = true;
        if (foodType !== '') {
            switch (foodType) {
                case 'fresh':
                    matchesType = category === 'fresh';
                    break;
                case 'packaged':
                    matchesType = category === 'packaged';
                    break;
                case 'prepared':
                    matchesType = category === 'prepared';
                    break;
                default:
                    matchesType = true;
            }
        }

        // Show/hide card based on both conditions
        card.style.display = (matchesSearch && matchesType) ? 'block' : 'none';
    });

    // Show no results message if needed
    const visibleCards = Array.from(cards).filter(card => card.style.display === 'block');
    const container = document.getElementById('donationsContainer');
    const noResultsMsg = container.querySelector('.no-results') || createNoResultsMessage();
    
    if (visibleCards.length === 0) {
        if (!container.contains(noResultsMsg)) {
            container.appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    } else {
        noResultsMsg.style.display = 'none';
    }
}

// Helper function to find elements by text content
Element.prototype.querySelector = function(selector) {
    if (selector.includes(':contains(')) {
        const searchText = selector.match(/:contains\((.*?)\)/)[1].replace(/['"]/g, '');
        return Array.from(this.querySelectorAll('*')).find(el => 
            el.textContent.includes(searchText)
        );
    }
    return HTMLElement.prototype.querySelector.call(this, selector);
};

function createNoResultsMessage() {
    const msg = document.createElement('div');
    msg.className = 'no-results';
    msg.textContent = 'No donations match your search criteria';
    return msg;
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
    document.getElementById('assignModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('assignModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Debounce helper function
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

// Add this function to handle form submission setup
function setupEventListeners() {
    const form = document.getElementById('scheduleDeliveryForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const beneficiaryId = document.getElementById('beneficiaryId').value;
                const volunteerId = document.getElementById('volunteerId').value;
                const assignedQuantity = document.getElementById('assignedQuantity').value;
                const routeId = document.getElementById('route').value;
                const pickupTime = document.getElementById('pickupTime').value;

                // Validate all required fields
                if (!beneficiaryId || !volunteerId || !assignedQuantity || !routeId || !pickupTime) {
                    throw new Error('Please fill in all required fields');
                }

                // First, assign the beneficiary
                const beneficiaryData = {
                    recipient_id: beneficiaryId,
                    assigned_quantity: parseFloat(assignedQuantity),
                    route_id: routeId,
                    scheduled_delivery_date: pickupTime,
                    status: 'scheduled'
                };

                const token = localStorage.getItem('token');
                const assignResponse = await fetch(`http://localhost:3000/api/beneficiaries/donations/${currentDonationId}/assign`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(beneficiaryData)
                });

                const assignResponseData = await assignResponse.json();

                if (!assignResponse.ok) {
                    throw new Error(assignResponseData.message || 'Failed to assign beneficiary');
                }

                // Schedule delivery with the volunteer
                const scheduleData = {
                    donation_id: currentDonationId,
                    volunteer_id: volunteerId,
                    route_id: routeId,
                    scheduled_delivery_date: pickupTime,
                    assignment_id: assignResponseData.assignment_id
                };

                const scheduleResponse = await fetch('http://localhost:3000/api/deliveries/schedule', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scheduleData)
                });

                if (!scheduleResponse.ok) {
                    const scheduleResponseData = await scheduleResponse.json();
                    throw new Error(scheduleResponseData.message || 'Failed to schedule delivery');
                }

                document.getElementById('assignModal').style.display = 'none';
                showToast('Delivery scheduled successfully');
                fetchPendingDonations(); // Refresh the list

            } catch (error) {
                console.error('Error in scheduling delivery:', error);
                showToast(error.message || 'Error scheduling delivery');
            }
        });
    }
}