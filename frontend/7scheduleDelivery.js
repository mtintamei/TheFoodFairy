document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadPendingDonations();
    loadVolunteers();
    loadRoutes();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
        return;
    }
}

async function loadPendingDonations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/donations?status=pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const donations = await response.json();
        
        const select = document.getElementById('donationId');
        donations.forEach(donation => {
            const option = document.createElement('option');
            option.value = donation.donation_id;
            option.textContent = `Donation #${donation.donation_id} - ${donation.donor_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        showToast('Error loading donations: ' + error.message);
    }
}

async function loadVolunteers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/volunteers?status=active', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const volunteers = await response.json();
        
        const select = document.getElementById('volunteerId');
        volunteers.forEach(volunteer => {
            const option = document.createElement('option');
            option.value = volunteer.volunteer_id;
            option.textContent = `${volunteer.first_name} ${volunteer.last_name}`;
            select.appendChild(option);
        });
    } catch (error) {
        showToast('Error loading volunteers: ' + error.message);
    }
}

async function loadRoutes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/routes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const routes = await response.json();
        
        const select = document.getElementById('route');
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.route_id;
            option.textContent = route.name;
            select.appendChild(option);
        });
    } catch (error) {
        showToast('Error loading routes: ' + error.message);
    }
}

document.getElementById('scheduleDeliveryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        const formData = {
            donationId: document.getElementById('donationId').value,
            volunteerId: document.getElementById('volunteerId').value,
            routeId: document.getElementById('route').value,
            pickupTime: document.getElementById('pickupTime').value
        };
        
        const response = await fetch('http://localhost:3000/deliveries', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to schedule delivery');
        }
        
        showToast('Delivery scheduled successfully');
        setTimeout(() => {
            window.location.href = 'employeeDashboard.html';
        }, 2000);
    } catch (error) {
        showToast('Error scheduling delivery: ' + error.message);
    }
});

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function submitDeliverySchedule(event) {
    event.preventDefault();
    // ... existing scheduling code ...

    try {
        // After successful scheduling
        showToast('Delivery scheduled successfully');
        
        // Refresh the dashboard
        if (window.opener && !window.opener.closed) {
            window.opener.refreshDashboard();
        }
        
        // Clear form or redirect
        window.location.href = 'employeeDashboard.html';
    } catch (error) {
        showToast('Error scheduling delivery: ' + error.message);
    }
}