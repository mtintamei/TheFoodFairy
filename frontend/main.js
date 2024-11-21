// frontend/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Volunteer Form Submission
    const volunteerForm = document.getElementById('volunteerForm');
    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const volunteer = Object.fromEntries(formData.entries());

            fetch('http://localhost:3000/volunteers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(volunteer)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Volunteer registration successful!');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Volunteer registration failed. Please try again.');
            });
        });
    }

    // Employee Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(event.target);
            const loginData = Object.fromEntries(formData.entries());

            fetch('http://localhost:3000/employees/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.message === 'Login successful') {
                    alert('Login successful!');
                    window.location.href = 'employeeDashboard.html'; // Redirect to dashboard
                } else {
                    alert('Login failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Please try again.');
            });
        });
    }

    // Load Dashboard Data
    function loadDashboardData() {
        // Fetch all data from the backend and display it on the dashboard
        fetch('http://localhost:3000/donors')
            .then(response => response.json())
            .then(data => {
                displayData('Donors', data);
            });

        fetch('http://localhost:3000/beneficiaries')
            .then(response => response.json())
            .then(data => {
                displayData('Beneficiaries', data);
            });

        fetch('http://localhost:3000/volunteers')
            .then(response => response.json())
            .then(data => {
                displayData('Volunteers', data);
            });

        fetch('http://localhost:3000/centers')
            .then(response => response.json())
            .then(data => {
                displayData('Distribution Centers', data);
            });

        fetch('http://localhost:3000/foodtypes')
            .then(response => response.json())
            .then(data => {
                displayData('Food Types', data);
            });

        fetch('http://localhost:3000/deliveries')
            .then(response => response.json())
            .then(data => {
                displayData('Delivery Records', data);
            });
    }

    // Display Data on Dashboard
    function displayData(title, data) {
        const dashboardData = document.getElementById('dashboardData');
        const section = document.createElement('section');
        section.innerHTML = `<h3>${title}</h3>`;

        if (data.length > 0) {
            const table = document.createElement('table');
            table.classList.add('data-table');

            // Create table header
            const headerRow = document.createElement('tr');
            Object.keys(data[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Create table rows
            data.forEach(item => {
                const row = document.createElement('tr');
                Object.values(item).forEach(value => {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                });
                table.appendChild(row);
            });

            section.appendChild(table);
        } else {
            section.innerHTML += '<p>No data available</p>';
        }

        dashboardData.appendChild(section);
    }

    // Load dashboard data when the dashboard page is loaded
    if (window.location.pathname.endsWith('employeeDashboard.html')) {
        loadDashboardData();
    }
});