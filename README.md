# CineBook – Cinema Booking & Management System

A fullstack cinema platform supporting multi-role users, deployed on a live Linux VPS with Docker and Nginx[cite: 1].

## 📸 Screenshots & Demo
* **Live Demo:** [http://cinemabookcdh.duckdns.org/](http://cinemabookcdh.duckdns.org/)[cite: 1]
<img width="1899" height="1028" alt="image" src="https://github.com/user-attachments/assets/80738bcd-e890-4542-98d7-ae28814cdf74" />
## 🚀 Key Features
- **Security & Authentication:** JWT-based authentication with Role-Based Access Control (Admin, Staff, Customer) via Spring Security filters[cite: 1].
- **Booking & Check-in:** End-to-end ticket booking workflow covering seat selection, food combo choices, and real-time check-in status for staff[cite: 1].
- **Admin Dashboard:** Real-time admin dashboard with Recharts, backed by optimized SQL aggregates reducing report query time by ~40%[cite: 1].
- **Deployment:** Packaged using Docker containers and deployed onto a live Linux VPS with Nginx configured as a reverse proxy[cite: 1].

## 🛠️ Tech Stack
- **Backend:** Java, Spring Boot, Spring Security, JWT, Hibernate/JPA, RESTful API[cite: 1]
- **Frontend:** ReactJS, JavaScript, HTML/CSS, Bootstrap 5, Axios[cite: 1]
- **Database:** MySQL[cite: 1]
- **DevOps & Tools:** Docker, Nginx, Git, Postman, Maven[cite: 1]

## 💻 How to Run Locally

### Backend
1. Clone the repository: `git clone https://github.com/dinhhoa04/cinema-be.git`[cite: 1]
2. Update database configurations in `application.properties`.
3. Build and run the application using Maven or IntelliJ IDEA[cite: 1].

### Frontend
1. Clone the repository: `git clone https://github.com/dinhhoa04/cinema-fe.git`[cite: 1]
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
