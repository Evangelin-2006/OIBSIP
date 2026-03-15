# OIBSIP
Full-stack Pizza Delivery App (OASIS INFOBYTE Internship) - React + Node.js + MongoDB + Razorpay. Custom pizza builder, admin inventory management, real-time order tracking, payment integration, and low-stock notifications
#  Pizza Delivery Full-Stack App
OASIS INFOBYTE Internship Task 
React + Node.js + MongoDB + Razorpay  
Built by: Evangelin S. 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

##  Project Overview
Full-stack pizza delivery application with custom pizza builder, admin inventory management, real-time order tracking, and payment integration. Created for OASIS INFOBYTE Web Development Internship (Level 2).

## ✨ Key Features
- User Flow: Registration, login, email verification, forgot password
- Custom Pizza Builder: 5 bases × 5 sauces × cheese types × multiple veggies/meats
- Payment: Razorpay test mode integration (dummy account)
- Admin Panel: Inventory tracking, stock updates, order status management
- Notifications: Low stock email alerts (threshold: pizza base < 20)
- Real-time: Order status updates reflect instantly in user dashboard

##  Tech Stack
| Frontend | Backend | Database | Payments | Other |
|----------|---------|----------|----------|-------|
| React | Node.js/Express | MongoDB | Razorpay | Nodemailer, JWT |

##  Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay test account

### Clone & Install
git clone https://github.com/Evangelin-2006/OIBSIP.git
cd pizza-delivery-app

# Backend
cd backend
npm install
cp .env.example .env  # Add your key

# Frontend
cd ../frontend
npm install
npm run dev
