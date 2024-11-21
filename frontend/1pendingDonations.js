document.addEventListener('DOMContentLoaded', function() {
    fetchPendingDonations();
});

async function fetchPendingDonations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/donations/pending', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        displayPendingDonations(data);
    } catch (error) {
        showToast('Error fetching pending donations');
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
            <p>Quantity: ${donation.quantity} ${donation.unit}</p>
            <p>Donor: ${donation.donor_name}</p>
            <p>Pickup Time: ${new Date(donation.pickup_time).toLocaleString()}</p>
            <button onclick="handleDonation(${donation.donation_id})" class="action-button">
                Process Donation
            </button>
        `;
        container.appendChild(card);
    });
}

function handleDonation(donationId) {
    // Handle donation processing
    showToast('Processing donation...');
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