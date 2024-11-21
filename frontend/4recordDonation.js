document.addEventListener('DOMContentLoaded', function() {
    fetchDonors();
    fetchFoodItems();
    setupForm();
});

async function fetchDonors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/donors', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const donors = await response.json();
        populateSelect('donor', donors, 'donor_id', 'name');
    } catch (error) {
        showToast('Error fetching donors');
    }
}

async function fetchFoodItems() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/food-items', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const items = await response.json();
        populateSelect('foodItem', items, 'food_id', 'name');
    } catch (error) {
        showToast('Error fetching food items');
    }
}

function populateSelect(elementId, items, valueKey, textKey) {
    const select = document.getElementById(elementId);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

function setupForm() {
    const form = document.getElementById('donationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            donor_id: document.getElementById('donor').value,
            food_id: document.getElementById('foodItem').value,
            quantity: document.getElementById('quantity').value,
            pickup_time: document.getElementById('pickupTime').value,
            notes: document.getElementById('notes').value
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/donations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Donation recorded successfully');
                form.reset();
            } else {
                throw new Error('Failed to record donation');
            }
        } catch (error) {
            showToast('Error recording donation');
        }
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