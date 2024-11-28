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

// Add this at the top of the file to store the original data
let originalDeliveries = [];

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
        originalDeliveries = deliveries; // Store the original data
        displayDeliveries(deliveries);
    } catch (error) {
        showToast('Error fetching deliveries: ' + error.message);
    }
}

function displayDeliveries(deliveries) {
    const container = document.getElementById('deliveriesContainer');
    container.innerHTML = '';

    if (deliveries.length === 0) {
        container.innerHTML = '<div class="no-deliveries">No deliveries match the selected filters</div>';
        return;
    }

    deliveries.forEach(delivery => {
        const card = createDeliveryCard(delivery);
        container.appendChild(card);
    });
}

function createDeliveryCard(delivery) {
    const card = document.createElement('div');
    const status = delivery.delivery_status || delivery.assignment_status || 'scheduled';
    card.className = `delivery-card ${status.toLowerCase()}`;
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

function filterDeliveries() {
    const statusFilter = document.getElementById('statusFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    let filteredDeliveries = [...originalDeliveries];

    // Apply status filter
    if (statusFilter !== 'all') {
        filteredDeliveries = filteredDeliveries.filter(delivery => {
            const deliveryStatus = delivery.delivery_status || delivery.assignment_status || 'scheduled';
            return deliveryStatus.toLowerCase() === statusFilter.toLowerCase();
        });
    }

    // Apply time filter
    if (timeFilter !== 'all') {
        filteredDeliveries = filteredDeliveries.filter(delivery => {
            const deliveryTime = new Date(delivery.scheduled_delivery_date);
            const hour = deliveryTime.getHours();
            
            switch (timeFilter) {
                case 'morning':
                    return hour >= 6 && hour < 12;  // 6 AM to 12 PM
                case 'afternoon':
                    return hour >= 12 && hour < 17; // 12 PM to 5 PM
                case 'evening':
                    return hour >= 17 && hour < 22; // 5 PM to 10 PM
                default:
                    return true;
            }
        });
    }

    // Apply search filter
    if (searchQuery) {
        filteredDeliveries = filteredDeliveries.filter(delivery => {
            return (
                (delivery.recipient_name || '').toLowerCase().includes(searchQuery) ||
                (delivery.recipient_address || '').toLowerCase().includes(searchQuery) ||
                (delivery.food_name || '').toLowerCase().includes(searchQuery) ||
                (delivery.volunteer_name || '').toLowerCase().includes(searchQuery) ||
                (delivery.route_name || '').toLowerCase().includes(searchQuery)
            );
        });
    }

    displayDeliveries(filteredDeliveries);
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
    const statusSelect = document.getElementById('statusSelect');
    
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
        
        // Set the current status in the select dropdown using delivery_status if available
        statusSelect.value = delivery.delivery_status || delivery.assignment_status || 'scheduled';
        
        deliveryDetails.innerHTML = `
            <p><strong>Recipient:</strong> ${delivery.recipient_name || 'Not specified'}</p>
            <p><strong>Food Item:</strong> ${delivery.food_name || 'Not specified'}</p>
            <p><strong>Scheduled Time:</strong> ${new Date(delivery.scheduled_delivery_date).toLocaleString()}</p>
            <p><strong>Current Status:</strong> ${(delivery.delivery_status || delivery.assignment_status || 'scheduled').replace('_', ' ').toUpperCase()}</p>
        `;
        
        modal.dataset.assignmentId = assignmentId;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error in openStatusUpdateModal:', error);
        showToast('Error fetching delivery details: ' + error.message);
    }
}

async function updateDeliveryStatus() {
    const modal = document.getElementById('statusUpdateModal');
    const assignmentId = modal.dataset.assignmentId;
    const status = document.getElementById('statusSelect').value;
    const notes = document.getElementById('statusNotes').value || '';
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found');
        }

        // Debug log the request
        console.log('Sending update request:', {
            assignmentId,
            status,
            notes,
            url: `http://localhost:3000/api/deliveries/${assignmentId}/status`
        });

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

        // Log the raw response
        console.log('Raw response:', response);

        const responseData = await response.json();
        console.log('Response data:', responseData);

        if (!response.ok) {
            throw new Error(responseData.message || responseData.error || 
                          `Server error: ${response.status} ${response.statusText}`);
        }

        modal.style.display = 'none';
        document.getElementById('statusNotes').value = '';
        showToast('Delivery status updated successfully');
        await fetchTodayDeliveries();
    } catch (error) {
        // Enhanced error logging
        console.error('Update status error details:', {
            error: error,
            message: error.message,
            stack: error.stack,
            assignmentId: assignmentId,
            status: status
        });

        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showToast('Network error: Could not connect to server');
            return;
        }

        showToast(`Error updating delivery status: ${error.message}`);
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