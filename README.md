# CineBook – Cinema Booking & Management System

A fullstack cinema platform supporting multi-role users, deployed on a live Linux VPS with Docker and Nginx.

## 📸 Screenshots & Demo
* **Live Demo:** [http://cinemabookcdh.duckdns.org/](http://cinemabookcdh.duckdns.org/)
<img width="1903" height="1035" alt="image" src="https://github.com/user-attachments/assets/097aa060-4e97-4ee8-80e0-18d0653016e4" />

<img width="1887" height="1025" alt="image" src="https://github.com/user-attachments/assets/06695280-d85b-4a6c-8f6c-17bc7fdd8bed" />

<img width="1887" height="1022" alt="image" src="https://github.com/user-attachments/assets/135b6d88-f9bc-42f0-a7b0-b1b6bf43a7ac" />

<img width="1522" height="999" alt="image" src="https://github.com/user-attachments/assets/63633e06-9078-4800-a5d6-01f56328fea2" />

<img width="1903" height="1027" alt="image" src="https://github.com/user-attachments/assets/cfce0c02-5305-4f30-becb-039713960401" />


## 🚀 Key Features
- **Security & Authentication:** JWT-based authentication with Role-Based Access Control (Admin, Staff, Customer) via Spring Security filters.
- **Booking & Check-in:** End-to-end ticket booking workflow covering seat selection, food combo choices, and real-time check-in status for staff.
- **Admin Dashboard:** Real-time admin dashboard with Recharts, backed by optimized SQL aggregates reducing report query time by ~40%.
- **Deployment:** Packaged using Docker containers and deployed onto a live Linux VPS with Nginx configured as a reverse proxy.

## 🛠️ Tech Stack
- **Backend:** Java, Spring Boot, Spring Security, JWT, Hibernate/JPA, RESTful API
- **Frontend:** ReactJS, JavaScript, HTML/CSS, Bootstrap 5, Axios
- **Database:** MySQL
- **DevOps & Tools:** Docker, Nginx, Git, Postman, Maven

## 💻 How to Run Locally

### Backend
1. Clone the repository: `git clone https://github.com/dinhhoa04/cinema-be.git`
2. Update database configurations in `application.properties`.
3. Build and run the application using Maven or IntelliJ IDEA.

### Frontend
1. Clone the repository: `git clone https://github.com/dinhhoa04/cinema-fe.git`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
