# 🛡️ ShieldShift

### AI-Powered Parametric Income Protection Platform for Gig Workers

<div align="center">

> **"When disruptions stop gig workers from earning, ShieldShift provides an automated financial safety net."**

A full-stack platform that protects food delivery partners from income loss caused by weather events, air-quality emergencies, flooding, extreme heat, and civic disruptions through automated parametric insurance payouts.

**Built with React, Spring Boot, MySQL, and AI/ML-powered risk intelligence.**

</div>

---

## 🚀 Overview

ShieldShift is a full-stack parametric income protection platform designed for gig economy workers such as food delivery partners.

Traditional insurance products focus on health, life, or accident coverage and require lengthy claim processes. ShieldShift takes a different approach by automatically detecting real-world disruptions and triggering payouts without requiring workers to submit claims manually.

The platform combines:

* Automated disruption monitoring
* AI-driven premium personalization
* Fraud detection and risk scoring
* Instant payout workflows
* Location-based policy coverage

to provide an accessible financial safety net for workers whose income depends on daily operations.

---

## ✨ Key Features

### Automated Parametric Insurance

* No paperwork or manual claim filing
* Automatic payout eligibility detection
* Event-driven claim generation
* Location-aware disruption validation

### Dynamic Premium Calculation

* Personalized weekly premium pricing
* Zone-based risk assessment
* Weather forecast integration
* Historical disruption analysis
* AI-driven pricing adjustments

### Smart Fraud Detection

* GPS validation
* Duplicate claim prevention
* Activity verification
* Anomaly detection using machine learning
* Risk-based claim scoring

### Real-Time Monitoring

* Rainfall tracking
* Flood advisory monitoring
* Extreme heat detection
* AQI monitoring
* Civic disruption alerts

### Worker Dashboard

* Active coverage tracking
* Policy management
* Claim history
* Payout monitoring
* Premium breakdown insights

### Secure Backend Architecture

* JWT authentication
* Spring Security
* RESTful APIs
* Scheduled event processing
* Database audit logging

---

## 🏗️ System Architecture

ShieldShift follows a modular microservice-inspired architecture:

Frontend (React + Tailwind)
↓
Spring Boot REST APIs
↓
Business Services Layer
↓
MySQL Database + AI/ML Services
↓
External Weather & Risk Data Sources

Core modules include:

* Authentication Service
* Worker Management Service
* Policy Management Service
* Premium Calculation Engine
* Fraud Detection Engine
* Disruption Monitoring Service
* Claims Processing Service
* Payout Service

---

## 🤖 AI & Machine Learning

The platform integrates machine learning models for:

### Premium Prediction

* Risk-based premium adjustment
* Forecast-driven pricing
* Historical event analysis

### Fraud Detection

* Isolation Forest anomaly detection
* GPS anomaly identification
* Suspicious claim behavior analysis

### Risk Forecasting

* Zone-level disruption forecasting
* Expected claim estimation
* Future payout liability prediction

---

## 🛠️ Technology Stack

### Frontend

* React
* Tailwind CSS
* React Router
* Axios
* Zustand
* React Hook Form

### Backend

* Java 17
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA
* Flyway
* Maven

### Database

* MySQL

### AI/ML

* Python
* Scikit-Learn
* XGBoost
* Pandas
* NumPy

### Integrations

* OpenWeatherMap API
* Razorpay Sandbox
* CPCB AQI Data
* Flood & Civic Alert Feeds

---

## 👨‍💻 My Contributions

As part of the development team, I was primarily responsible for:

* Backend development using Spring Boot
* Database schema design and implementation
* REST API development
* MySQL integration using Spring Data JPA
* Authentication and backend workflows
* Integration of backend services with AI/ML modules
* Frontend-backend API integration
* Claims processing and payout workflow implementation
* Scheduled disruption monitoring services

---

## 👥 Team

* Soumyajit Rout
* Sagnik Pratihar
* Aneek Mukherjee
* Bijay Mahato

---

## 📂 Project Structure

frontend/ → React Application

backend/ → Spring Boot APIs

ml_service/ → AI/ML Models & Services

database/ → SQL Schema & Migrations

---

## ⚙️ Getting Started

### Prerequisites

* Node.js 18+
* Java 17+
* Maven 3.8+
* MySQL 8+

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

### Configure Database

Create a MySQL database and update the Spring Boot configuration before starting the application.

---

## 📄 License

This project is intended for educational, research, and portfolio purposes.
