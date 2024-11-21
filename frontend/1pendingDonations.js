let currentDonationId = null;

document.addEventListener('DOMContentLoaded', function() {
    fetchPendingDonations();
    setupSearchAndFilters();
});

function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchDonor');
    const foodTypeSelect = document.getElementById('foodType');

    searchInput.addEventListener('input', filterDonations);
    foodTypeSelect.addEventListener('change', filterDonations);
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

    donations.forEach(donation => {
        const card = document.createElement('div');
        card.className = 'donation-card';
        card.innerHTML = `
            <h3>${donation.food_name}</h3>
            <p><strong>Quantity:</strong> ${donation.quantity} ${donation.unit}</p>
            <p><strong>Donor:</strong> ${donation.donor_name}</p>
            <p><strong>Category:</strong> ${donation.category}</p>
            <p><strong>Pickup Time:</strong> ${new Date(donation.pickup_time).toLocaleString()}</p>
            <button onclick="openAssignModal(${donation.donation_id})" class="action-button">
                Assign to Beneficiary
            </button>
        `;
        container.appendChild(card);
    });
}

async function openAssignModal(donationId) {
    currentDonationId = donationId;
    const modal = document.getElementById('assignModal');
    const beneficiarySelect = document.getElementById('beneficiarySelect');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/beneficiaries/active', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch beneficiaries');
        }

        const beneficiaries = await response.json();
        beneficiarySelect.innerHTML = `
            <option value="">Select a beneficiary...</option>
            ${beneficiaries.map(b => `
                <option value="${b.recipient_id}">${b.name} (Capacity: ${b.capacity})</option>
            `).join('')}
        `;
        
        modal.style.display = 'block';
    } catch (error) {
        showToast('Error fetching beneficiaries: ' + error.message);
    }
}

async function assignBeneficiary() {
    const beneficiaryId = document.getElementById('beneficiarySelect').value;
    
    if (!beneficiaryId) {
        showToast('Please select a beneficiary');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/donations/${currentDonationId}/assign`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipient_id: beneficiaryId })
        });

        if (!response.ok) {
            throw new Error('Failed to assign beneficiary');
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
    const foodType = document.getElementById('foodType').value;
    const cards = document.querySelectorAll('.donation-card');

    cards.forEach(card => {
        const donorName = card.querySelector('p:nth-child(3)').textContent.toLowerCase();
        const category = card.querySelector('p:nth-child(4)').textContent.toLowerCase();
        
        const matchesSearch = donorName.includes(searchTerm);
        const matchesType = !foodType || category.includes(foodType.toLowerCase());

        card.style.display = matchesSearch && matchesType ? 'block' : 'none';
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
    document.getElementById('assignModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('assignModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}