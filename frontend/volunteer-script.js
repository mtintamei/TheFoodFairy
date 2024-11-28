document.getElementById('volunteerForm').addEventListener('submit', function(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const formData = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    gender: document.querySelector('input[name="gender"]:checked').value,
    startDate: document.getElementById('startDate').value,
    address: document.getElementById('address').value,
    motivation: document.getElementById('motivation').value
  };

  const submitBtn = document.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  fetch('http://localhost:3000/api/volunteers/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'New volunteer added') {
      document.getElementById('volunteerForm').reset();
      showModal('Congratulations! Your application has been received. Our team will review your application and contact you soon.');
    } else if (data.message === 'Volunteer with this email already exists') {
      showModal('You have already applied. Please check your email for further instructions.');
    } else {
      throw new Error(data.message || 'Failed to submit application');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showModal('There was an error submitting your application. Please try again.');
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Apply Now';
  });
});

function validateForm() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const gender = document.querySelector('input[name="gender"]:checked');
  const startDate = document.getElementById('startDate').value;
  const address = document.getElementById('address').value;
  const motivation = document.getElementById('motivation').value;

  if (!firstName || !lastName || !email || !phone || !gender || !startDate || !address || !motivation) {
    alert('Please fill in all required fields.');
    return false;
  }

  if (!isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return false;
  }

  if (!isValidPhone(phone)) {
    alert('Please enter a valid phone number.');
    return false;
  }

  return true;
}

function isValidEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

function isValidPhone(phone) {
  const phonePattern = /^\d{10}$/;
  return phonePattern.test(phone);
}

function showModal(message) {
  const modal = document.getElementById('successModal');
  const modalMessage = document.querySelector('.modal-content p');
  modalMessage.textContent = message;
  modal.style.display = 'block';

  const closeBtn = document.getElementById('modalCloseBtn');
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}