document.addEventListener('DOMContentLoaded', function() {
    fetchApprovedDonors();
    setupForm();
    setCurrentPickupTime();
});

function setCurrentPickupTime() {
    const now = new Date();
    const pickupInput = document.getElementById('pickupTime');
    pickupInput.value = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
}

async function fetchApprovedDonors() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/donors', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch donors');
        }
        
        const donors = await response.json();
        const select = document.getElementById('donor');
        select.innerHTML = '<option value="">Select Donor</option>';
        
        const activeDonors = donors.filter(donor => donor.status === 'active');
        
        activeDonors.forEach(donor => {
            const option = document.createElement('option');
            option.value = donor.donor_id;
            option.textContent = `${donor.name} - ${donor.contact_person} (${donor.type})`;
            select.appendChild(option);
        });

        select.addEventListener('change', fetchFoodItems);
    } catch (error) {
        showToast('Error fetching donors: ' + error.message);
    }
}

async function fetchFoodItems() {
    const foodSelect = document.getElementById('foodItem');
    foodSelect.innerHTML = '<option value="">Select Food Item</option>';
    foodSelect.disabled = true;

    if (!document.getElementById('donor').value) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/food-types', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch food items');
        }
        
        const items = await response.json();
        foodSelect.disabled = false;
        
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.food_id;
            option.textContent = `${item.name} (${item.category}) - ${item.unit}`;
            option.dataset.unit = item.unit;
            foodSelect.appendChild(option);
        });

        foodSelect.addEventListener('change', updateQuantityUnit);
    } catch (error) {
        showToast('Error fetching food items: ' + error.message);
    }
}

function updateQuantityUnit() {
    const foodSelect = document.getElementById('foodItem');
    const selectedOption = foodSelect.options[foodSelect.selectedIndex];
    const quantityLabel = document.querySelector('label[for="quantity"]');
    if (selectedOption && selectedOption.dataset.unit) {
        quantityLabel.textContent = `Quantity (${selectedOption.dataset.unit})`;
    } else {
        quantityLabel.textContent = 'Quantity';
    }
}

async function setupForm() {
    const form = document.getElementById('donationForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            donor_id: document.getElementById('donor').value,
            food_id: document.getElementById('foodItem').value,
            quantity: document.getElementById('quantity').value,
            pickup_time: document.getElementById('pickupTime').value,
            status: 'pending',
            notes: document.getElementById('notes').value
        };

        console.log('Sending donation data:', formData);

        try {
            const token = localStorage.getItem('token');
            console.log('Using token:', token);
            
            const response = await fetch('http://localhost:3000/api/donors/donations/record', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);
                showToast('Donation pickup recorded successfully');
                form.reset();
                document.getElementById('foodItem').disabled = true;
                setCurrentPickupTime();
            } else {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.message || 'Failed to record donation pickup');
            }
        } catch (error) {
            console.error('Caught error:', error);
            showToast('Error recording donation: ' + error.message);
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