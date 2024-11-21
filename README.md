# 🥦 The Food Fairy: Food Distribution Management System

## SDG 2: Zero Hunger

The Food Fairy is a food redistribution application designed to reduce food waste and support the fight against hunger. By bridging the gap between food donors and communities in need, this system ensures that surplus food finds its way to the people who need it most.

---

## 🌟 Features

- **Manage Food Donors**: Keep track of individuals and organizations donating surplus food.
- **Track Beneficiaries**: Record information about the recipients of food.
- **Organize Distribution Centers**: Manage locations where food is gathered and distributed.
- **Categorize Food Types**: Ensure proper documentation of food items (e.g., fresh produce, canned goods, etc.).
- **Monitor Deliveries**: Log delivery records to track food movement.
- **Support Volunteers**: Record volunteer efforts to enhance operations.

---

## 🛠️ Technologies Used

### Backend:
- **Node.js**: JavaScript runtime for building the server.
- **Express.js**: Lightweight web framework for creating API endpoints.
- **MySQL**: Relational database to store and manage data.
- **Sequelize**: ORM for working with the database.
- **dotenv**: Environment variable management.

### Frontend:
- **HTML/CSS/JavaScript**: Building the user interface.
- **Responsive Design**: Optimized for various screen sizes.
- **CSS Modules**: Separate stylesheets for better organization and maintainability.

---

## 📂 Project Structure

### **Backend**
Handles the application's logic and data management.

- **`config/db.js`**: Configures the connection to the MySQL database.
- **Controllers**: Logic for handling requests (e.g., creating, reading, updating, and deleting records).
  - *Examples*: `donorController.js`, `deliveryController.js`.
- **Models**: Defines database schemas for entities like `Donor`, `Beneficiary`, and `Distribution`.
- **Routes**: API endpoints to interact with the system.
  - *Examples*: `/donors`, `/volunteers`.
- **Middleware**: Implements security and authentication.
  - *Example*: `authMiddleware.js`.

### **Frontend**
Handles the user interface and interactions.

- **Notification Styles**: Organized CSS for notifications (`toast.css`, etc.).
- **HTML & JavaScript Files**: Separate pages for different actions like viewing pending donations or recording donations.
- **Dashboard**: An employee dashboard to oversee operations.

---

## 🚀 Getting Started

### **1. Clone the Repository**
```bash
git clone https://github.com/<your-username>/THEFOODFAIRY.git
cd THEFOODFAIRY

### **2. Install Dependencies**
```bash
cd backend
npm install

### **3. Set Up Environment Variables**
Create a .env file in the backend folder:
CopyDB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key
PORT=5000

### **4. Set Up the Database**
Import the db.sql file in your MySQL database to create the required tables.

### **5. Run the Application**
Start the backend server:
bash
npm start

## 🚀 Open the Frontend
Open the frontend by either:
- Opening the HTML files in the `frontend` directory directly in your browser.
- Deploying the files to a server.

---

## 🔧 How to Use

- **Log In**: Employees and volunteers can log in through the employee login page.
- **View Data**: Access dashboards to view pending donations, active volunteers, and deliveries.
- **Add Records**: Use forms to record donations, add beneficiaries, and track distributions.
- **Notifications**: Stay updated on urgent actions via notifications.

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. **Fork the repository**.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature-branch

Commit your changes (git commit -m "Add new feature")
Push to your branch (git push origin feature-branch)
Open a pull request

🛡️ Security
------------

*   Sensitive information (e.g., environment variables and authentication keys) is stored in the .env file.
    
*   The .env file is excluded from version control using .gitignore.
    

📌 Future Features
------------------

*   **Advanced Reporting**: Generate detailed reports on food redistribution.
    
*   **Real-Time Notifications**: Use push notifications for immediate updates.
    
*   **Volunteer Management**: Add scheduling and shift tracking for volunteers.
    
*   **Mobile-Friendly UI**: Ensure smooth functionality on mobile devices.
    

💡 Challenges Faced
-------------------

*   Balancing UI simplicity with backend complexity.
    
*   Ensuring the database design supports scalability.
    
*   Managing security for sensitive donor and beneficiary data.
    

🌟 Inspiration
--------------

This project supports **Sustainable Development Goal 2: Zero Hunger**. It’s a step toward reducing food waste and ensuring equitable food distribution.

🧙‍♂️ Become a Food Fairy Today!
--------------------------------

By contributing to this project, you can help ensure that no food goes to waste and that it reaches those who need it most.