document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    fetchTodayDeliveries();
    setupFilters();
    // Refresh data every 5 minutes
    setInterval(fetchTodayDeliveries, 300000);
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'employeeLogin.html';
    }
}

function setupFilters() {
    document.getElementById('statusFilter').addEventListener('change', filterDeliveries);
    document.getElementById('timeFilter').addEventListener('change', filterDeliveries);
    document.getElementById('searchInput').addEventListener('input', filterDeliveries);
}

async function fetchTodayDeliveries() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/deliveries/today', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch deliveries');
        }

        const deliveries = await response.json();
        displayDeliveries(deliveries);
        checkForDelayedDeliveries(deliveries);
    } catch (error) {
        showToast('Error fetching deliveries: ' + error.message);
    }
}

function displayDeliveries(deliveries) {
    const container = document.getElementById('deliveriesContainer');
    container.innerHTML = '';

    if (deliveries.length === 0) {
        container.innerHTML = '<div class="no-deliveries">No deliveries scheduled for today</div>';
        return;
    }

    // Apply sorting
    const sortBy = document.getElementById('sortBy').value;
    sortDeliveries(deliveries, sortBy);

    deliveries.forEach(delivery => {
        const card = createDeliveryCard(delivery);
        container.appendChild(card);
    });
}

function createDeliveryCard(delivery) {
    const card = document.createElement('div');
    const status = delivery.status || 'pending';
    card.className = `delivery-card ${status}`;
    card.dataset.deliveryTime = delivery.scheduled_delivery_date;
    
    const deliveryTime = new Date(delivery.scheduled_delivery_date);
    const isPastDue = deliveryTime < new Date() && status !== 'completed';
    
    card.innerHTML = `
        <div class="delivery-header">
            <span class="delivery-time">
                ${deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span class="status-badge ${status}">
                ${status.replace('_', ' ').toUpperCase()}
            </span>
        </div>
        <div class="delivery-info">
            <h3>${delivery.recipient_name || 'No Recipient'}</h3>
            <div class="info-row">
                <span>📦 ${delivery.food_name || 'No Food Item'}</span>
                <span>${delivery.assigned_quantity || 0} ${delivery.unit || 'units'}</span>
            </div>
            <div class="info-row">
                <span>🚗 ${delivery.route_name || 'No Route'}</span>
            </div>
            ${delivery.volunteer_name ? 
                `<div class="info-row">👤 ${delivery.volunteer_name}</div>` : 
                '<div class="info-row warning-text">⚠️ No volunteer assigned</div>'
            }
            ${isPastDue ? 
                '<div class="info-row warning-text">⚠️ Past scheduled time</div>' : ''
            }
        </div>
        <div class="delivery-actions">
            ${!delivery.volunteer_id ? 
                `<button onclick="openAssignVolunteerModal(${delivery.assignment_id})" class="action-button assign-button">
                    Assign Volunteer
                </button>` : ''
            }
            ${isPastDue ? 
                `<button onclick="openRescheduleModal(${delivery.assignment_id})" class="action-button reschedule-button">
                    Reschedule
                </button>` : ''
            }
            <button onclick="openStatusUpdateModal(${delivery.assignment_id})" class="action-button status-button">
                Update Status
            </button>
        </div>
    `;
    
    return card;
}

function sortDeliveries(deliveries, sortBy) {
    switch (sortBy) {
        case 'time':
            deliveries.sort((a, b) => new Date(a.scheduled_delivery_date) - new Date(b.scheduled_delivery_date));
            break;
        case 'status':
            deliveries.sort((a, b) => a.status.localeCompare(b.status));
            break;
        case 'recipient':
            deliveries.sort((a, b) => a.recipient_name.localeCompare(b.recipient_name));
            break;
    }
}

async function openAssignVolunteerModal(assignmentId) {
    const modal = document.getElementById('assignVolunteerModal');
    const select = document.getElementById('volunteerSelect');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/volunteers/available', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch volunteers');
        }

        const volunteers = await response.json();
        
        select.innerHTML = `
            <option value="">Select a volunteer...</option>
            ${volunteers.map(v => `
                <option value="${v.volunteer_id}">
                    ${v.first_name} ${v.last_name} - ${v.phone}
                </option>
            `).join('')}
        `;
        
        // Also fetch and display delivery details
        const deliveryResponse = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!deliveryResponse.ok) {
            throw new Error('Failed to fetch delivery details');
        }

        const delivery = await deliveryResponse.json();
        const deliveryDetails = document.getElementById('deliveryDetails');
        deliveryDetails.innerHTML = `
            <p><strong>Recipient:</strong> ${delivery.recipient_name || 'Not specified'}</p>
            <p><strong>Food Item:</strong> ${delivery.food_name || 'Not specified'}</p>
            <p><strong>Delivery Time:</strong> ${new Date(delivery.scheduled_delivery_date).toLocaleString()}</p>
        `;
        
        modal.dataset.assignmentId = assignmentId;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error in openAssignVolunteerModal:', error);
        showToast('Error opening assignment modal: ' + error.message);
    }
}

async function assignVolunteer() {
    const modal = document.getElementById('assignVolunteerModal');
    const assignmentId = modal.dataset.assignmentId;
    const volunteerId = document.getElementById('volunteerSelect').value;
    
    if (!volunteerId) {
        showToast('Please select a volunteer');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}/assign-volunteer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ volunteer_id: volunteerId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to assign volunteer');
        }

        modal.style.display = 'none';
        showToast('Volunteer assigned successfully');
        fetchTodayDeliveries();
    } catch (error) {
        console.error('Error in assignVolunteer:', error);
        showToast('Error assigning volunteer: ' + error.message);
    }
}

function getStatusBadge(status) {
    const colors = {
        scheduled: '#2563eb',
        'in_progress': '#d97706',
        completed: '#16a34a'
    };
    
    return `<span style="background: ${colors[status]}; color: white; padding: 5px 10px; border-radius: 15px;">
        ${status.replace('_', ' ').toUpperCase()}
    </span>`;
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

function filterDeliveries() {
    const statusFilter = document.getElementById('statusFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const container = document.getElementById('deliveriesContainer');
    let deliveryCards = Array.from(container.getElementsByClassName('delivery-card'));

    // Filter by status
    if (statusFilter !== 'all') {
        deliveryCards = deliveryCards.filter(card => {
            const statusBadge = card.querySelector('.status-badge');
            const cardStatus = statusBadge.textContent.toLowerCase().trim();
            return cardStatus.includes(statusFilter.toLowerCase());
        });
    }

    // Filter by time
    if (timeFilter !== 'all') {
        deliveryCards = deliveryCards.filter(card => {
            const timeText = card.querySelector('.delivery-time').textContent;
            const deliveryTime = new Date();
            const [time, period] = timeText.split(' ');
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours);
            
            // Convert to 24-hour format
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            
            switch (timeFilter) {
                case 'morning':
                    return hour >= 6 && hour < 12;
                case 'afternoon':
                    return hour >= 12 && hour < 17;
                case 'evening':
                    return hour >= 17 && hour < 22;
                default:
                    return true;
            }
        });
    }

    // Filter by search term
    if (searchTerm) {
        deliveryCards = deliveryCards.filter(card => {
            return card.textContent.toLowerCase().includes(searchTerm);
        });
    }

    // Sort deliveries
    deliveryCards.sort((a, b) => {
        switch (sortBy) {
            case 'time':
                const timeA = new Date(a.dataset.deliveryTime);
                const timeB = new Date(b.dataset.deliveryTime);
                return timeA - timeB;
            case 'status':
                const statusA = a.querySelector('.status-badge').textContent.toLowerCase();
                const statusB = b.querySelector('.status-badge').textContent.toLowerCase();
                return statusA.localeCompare(statusB);
            case 'recipient':
                const recipientA = a.querySelector('h3').textContent;
                const recipientB = b.querySelector('h3').textContent;
                return recipientA.localeCompare(recipientB);
            default:
                return 0;
        }
    });

    // Update display
    container.innerHTML = '';
    if (deliveryCards.length === 0) {
        container.innerHTML = '<div class="no-deliveries">No deliveries match the selected filters</div>';
    } else {
        deliveryCards.forEach(card => container.appendChild(card));
    }
}

function checkForDelayedDeliveries(deliveries) {
    const now = new Date();
    const delayedDeliveries = deliveries.filter(delivery => {
        const deliveryTime = new Date(delivery.scheduled_delivery_date);
        return deliveryTime < now && delivery.status !== 'completed';
    });

    if (delayedDeliveries.length > 0) {
        showToast(`Warning: ${delayedDeliveries.length} delayed deliveries need attention!`, 'warning');
    }
}

async function openRescheduleModal(assignmentId) {
    const modal = document.getElementById('rescheduleModal');
    const deliveryDetails = document.getElementById('rescheduleDeliveryDetails');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch delivery details');
        }

        const delivery = await response.json();
        
        // Remove array check since backend now returns single object
        if (!delivery) {
            throw new Error('Invalid delivery data received');
        }
        
        deliveryDetails.innerHTML = `
            <p><strong>Recipient:</strong> ${delivery.recipient_name || 'Not specified'}</p>
            <p><strong>Food Item:</strong> ${delivery.food_name || 'Not specified'}</p>
            <p><strong>Original Time:</strong> ${new Date(delivery.scheduled_delivery_date).toLocaleString()}</p>
        `;
        
        // Set minimum date to now
        const now = new Date();
        const dateInput = document.getElementById('newDeliveryDate');
        dateInput.min = now.toISOString().slice(0, 16);
        dateInput.value = now.toISOString().slice(0, 16); // Set default value to current time
        
        modal.dataset.assignmentId = assignmentId;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error in openRescheduleModal:', error); // Added error logging
        showToast('Error fetching delivery details: ' + error.message);
    }
}

async function rescheduleDelivery() {
    const modal = document.getElementById('rescheduleModal');
    const assignmentId = modal.dataset.assignmentId;
    const newDate = document.getElementById('newDeliveryDate').value;
    const reason = document.getElementById('rescheduleReason').value;
    
    if (!newDate || !reason) {
        showToast('Please fill in all required fields');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}/reschedule`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scheduled_delivery_date: newDate,  // Changed from new_date to scheduled_delivery_date
                reason: reason
            })
        });

        if (!response.ok) {
            throw new Error('Failed to reschedule delivery');
        }

        modal.style.display = 'none';
        showToast('Delivery rescheduled successfully');
        fetchTodayDeliveries();
    } catch (error) {
        console.error('Error in rescheduleDelivery:', error); // Added error logging
        showToast('Error rescheduling delivery: ' + error.message);
    }
}

async function openStatusUpdateModal(assignmentId) {
    const modal = document.getElementById('statusUpdateModal');
    const deliveryDetails = document.getElementById('statusDeliveryDetails');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch delivery details');
        }

        const delivery = await response.json();
        
        deliveryDetails.innerHTML = `
            <p><strong>Recipient:</strong> ${delivery.recipient_name}</p>
            <p><strong>Food Item:</strong> ${delivery.food_name}</p>
            <p><strong>Scheduled Time:</strong> ${new Date(delivery.scheduled_delivery_date).toLocaleString()}</p>
            <p><strong>Current Status:</strong> ${delivery.status}</p>
        `;
        
        modal.dataset.assignmentId = assignmentId;
        modal.style.display = 'block';
    } catch (error) {
        showToast('Error fetching delivery details: ' + error.message);
    }
}

async function updateDeliveryStatus() {
    const modal = document.getElementById('statusUpdateModal');
    const assignmentId = modal.dataset.assignmentId;
    const status = document.getElementById('statusSelect').value;
    const notes = document.getElementById('statusNotes').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/deliveries/${assignmentId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                notes: notes
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update delivery status');
        }

        modal.style.display = 'none';
        showToast('Delivery status updated successfully');
        fetchTodayDeliveries();
    } catch (error) {
        showToast('Error updating delivery status: ' + error.message);
    }
}

// Add modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        this.closest('.modal').style.display = 'none';
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}