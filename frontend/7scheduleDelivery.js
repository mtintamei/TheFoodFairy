document.addEventListener('DOMContentLoaded', function() {
    // Wait a brief moment to ensure DOM is fully rendered
    setTimeout(async () => {
        try {
            if (!checkAuth()) {
                return;
            }

            // Initialize the page
            await initializePage();
        } catch (error) {
            console.error('Initialization error:', error);
            showToast(`Error initializing page: ${error.message}`, 'error');
        }
    }, 100); // Small delay to ensure DOM is ready
});

async function initializePage() {
    // Verify all required elements exist before proceeding
    const requiredElements = [
        'donationId',
        'beneficiaryId',
        'assignedQuantity',
        'route',
        'volunteerId',
        'pickupTime',
        'scheduleDeliveryForm'
    ];

    // Check if all required elements exist
    for (const elementId of requiredElements) {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Required element missing: ${elementId}`);
        }
    }

    // Load all data in parallel
    try {
        await Promise.all([
            loadPendingDonations(),
            loadBeneficiaries(),
            loadVolunteers(),
            loadRoutes()
        ]);

        setDefaultPickupTime();
        setupEventListeners();
    } catch (error) {
        throw new Error(`Failed to load data: ${error.message}`);
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return false;
    }
    return true;
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
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a beneficiary</option>';
        
        beneficiaries.forEach(beneficiary => {
            const option = document.createElement('option');
            option.value = beneficiary.recipient_id;
            option.textContent = `${beneficiary.name} - ${beneficiary.contact_person}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading beneficiaries:', error);
    }
}

async function loadVolunteers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/volunteers/active', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch volunteers');
        }
        
        const volunteers = await response.json();
        const select = document.getElementById('volunteerId');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a volunteer</option>';
        
        volunteers.forEach(volunteer => {
            const option = document.createElement('option');
            option.value = volunteer.volunteer_id;
            option.textContent = `${volunteer.first_name} ${volunteer.last_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading volunteers:', error);
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
        if (!select) return;
        
        select.innerHTML = '<option value="">Select a route</option>';
        
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.route_id;
            option.textContent = route.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading routes:', error);
    }
}

async function loadPendingDonations() {
    const select = document.getElementById('donationId');
    if (!select) {
        console.error('Donation select element not found');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/donors/donations/pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch pending donations');
        }
        
        const donations = await response.json();
        
        // Clear existing options
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Select a pending donation";
        select.appendChild(defaultOption);
        
        if (Array.isArray(donations) && donations.length > 0) {
            donations.forEach(donation => {
                const option = document.createElement('option');
                option.value = donation.donation_id;
                option.textContent = `${donation.food_name} - ${donation.quantity} ${donation.unit} (${donation.donor_name})`;
                select.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No pending donations available";
            option.disabled = true;
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Error in loadPendingDonations:', error);
        showToast(`Error loading donations: ${error.message}`, 'error');
    }
}

function setDefaultPickupTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const pickupInput = document.getElementById('pickupTime');
    if (!pickupInput) return;
    
    pickupInput.value = now.toISOString().slice(0, 16);
    pickupInput.min = new Date().toISOString().slice(0, 16);
}

function setupEventListeners() {
    const form = document.getElementById('scheduleDeliveryForm');
    const donationSelect = document.getElementById('donationId');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            try {
                validateForm();
                await scheduleDeliveryWithBeneficiary();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    if (donationSelect) {
        donationSelect.addEventListener('change', async function() {
            const donationId = this.value;
            if (donationId) {
                await updateAvailableQuantity(donationId);
            }
        });
    }
}

async function updateAvailableQuantity(donationId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/donors/donations/${donationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch donation details');
        }
        
        const donation = await response.json();
        const quantityInput = document.getElementById('assignedQuantity');
        if (!quantityInput) return;
        
        quantityInput.max = donation.remaining_quantity;
        quantityInput.placeholder = `Available: ${donation.remaining_quantity} ${donation.unit}`;
    } catch (error) {
        console.error('Error updating quantity:', error);
    }
}

async function scheduleDeliveryWithBeneficiary() {
    try {
        const token = localStorage.getItem('token');
        const donationId = document.getElementById('donationId').value;
        const volunteerId = document.getElementById('volunteerId').value;
        const beneficiaryId = document.getElementById('beneficiaryId').value;
        const assignedQuantity = document.getElementById('assignedQuantity').value;
        const routeId = document.getElementById('route').value;
        const pickupTime = document.getElementById('pickupTime').value;

        // Validate all required fields
        if (!donationId || !volunteerId || !beneficiaryId || !assignedQuantity || !routeId || !pickupTime) {
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

        console.log('Assigning beneficiary with data:', beneficiaryData);

        // Changed endpoint to use beneficiary controller
        const assignResponse = await fetch(`http://localhost:3000/api/beneficiaries/donations/${donationId}/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(beneficiaryData)
        });

        const assignResponseData = await assignResponse.json();

        if (!assignResponse.ok) {
            console.error('Assignment response:', assignResponseData);
            throw new Error(assignResponseData.message || 'Failed to assign beneficiary');
        }

        console.log('Beneficiary assignment successful:', assignResponseData);

        // Step 2: Schedule delivery with the volunteer
        const scheduleData = {
            donation_id: donationId,
            volunteer_id: volunteerId,
            route_id: routeId,
            scheduled_delivery_date: pickupTime,
            assignment_id: assignResponseData.assignment_id
        };

        console.log('Scheduling delivery with data:', scheduleData);

        const scheduleResponse = await fetch('http://localhost:3000/api/deliveries/schedule', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scheduleData)
        });

        const scheduleResponseData = await scheduleResponse.json();

        if (!scheduleResponse.ok) {
            console.error('Schedule response:', scheduleResponseData);
            throw new Error(scheduleResponseData.message || 'Failed to schedule delivery');
        }

        console.log('Delivery scheduling successful:', scheduleResponseData);

        showToast('Delivery scheduled successfully', 'success');
        
        // Reset the form instead of redirecting
        document.getElementById('scheduleDeliveryForm').reset();
        
        // Refresh the donations list to show updated quantities
        await loadPendingDonations();
        
        // Reset the pickup time to default
        setDefaultPickupTime();

    } catch (error) {
        console.error('Error in scheduleDeliveryWithBeneficiary:', error);
        showToast(error.message || 'Error scheduling delivery', 'error');
    }
}

// Add this helper function to validate the form before submission
function validateForm() {
    const requiredFields = {
        donationId: 'Donation',
        beneficiaryId: 'Beneficiary',
        assignedQuantity: 'Quantity',
        route: 'Route',
        volunteerId: 'Volunteer',
        pickupTime: 'Pickup Time'
    };

    for (const [fieldId, fieldName] of Object.entries(requiredFields)) {
        const element = document.getElementById(fieldId);
        if (!element || !element.value) {
            throw new Error(`${fieldName} is required`);
        }
    }
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.className = 'toast';
    toast.classList.add(type);
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}