# LocalMarket – AI-Powered Hyperlocal Product Discovery Platform

LocalMarket is a full-stack AI-assisted hyperlocal marketplace platform designed to help users discover nearby products and local shops intelligently using location-aware search, smart filtering, and conversational marketplace assistance.

The platform connects buyers and shopkeepers through a modern geo-enabled product discovery system that focuses on local availability, nearby recommendations, and intelligent product exploration.

---

# 🚀 Features

## Buyer Features

* Nearby product discovery
* Smart product search
* AI marketplace assistant
* Product filtering and sorting
* Category-wise browsing
* Nearby shop recommendations
* Responsive modern UI
* Shop-based product grouping
* Distance-aware marketplace results

---

## Shopkeeper Features

* Shopkeeper authentication
* Product upload system
* Inventory management
* Shop dashboard
* Product categorization
* Price and discount management
* Product attribute management

---

## AI-Assisted Marketplace Features

* Conversational product discovery
* Smart search query understanding
* Nearby recommendation logic
* Cheapest product discovery
* Contextual marketplace responses
* Intelligent product filtering

---

## Geolocation Features

* User coordinate detection
* Nearby shop discovery
* Distance calculation using Haversine Formula
* Radius-based product exploration
* Google Maps integration

---

# 🛠️ Technology Stack

## Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* Lucide React

---

## Backend

* Spring Boot
* Java
* REST APIs
* Maven

---

## Database

* MongoDB

---

## Additional Technologies

* Google Maps API
* Geolocation APIs
* Haversine Formula
* k6 Load Testing
* Concurrent API Benchmarking

---

# 🧠 AI Marketplace Assistant

The LocalMarket assistant enables users to search products using natural language queries.

### Example Queries

* “Cheap gaming keyboard near me”
* “Nearby electronics shops”
* “Find toys under ₹500”
* “Cheapest headphones nearby”

The assistant intelligently:

* parses search intent
* filters products
* ranks nearby shops
* generates conversational responses

---

# 📍 Hyperlocal Marketplace Concept

Unlike traditional e-commerce systems, LocalMarket focuses on:

* nearby inventory discovery
* local shops
* distance-aware recommendations
* hyperlocal product availability

The platform helps users quickly discover products available within their surrounding geographical area.

---

# 🏗️ System Architecture

```text id="7jlwmm"
React Frontend
       ↓
REST APIs
       ↓
Spring Boot Backend
       ↓
MongoDB Database
```

---

# ⚡ Key Technical Features

* RESTful API architecture
* Layered backend design
* DTO-based request/response handling
* Role-based authentication flow
* Smart marketplace filtering
* Responsive Airbnb-style soft UI
* Component-driven frontend architecture
* Geolocation-aware product ranking

---

# 📂 Project Structure

## Frontend

```text id="8jlwmm"
localmarket-ui/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   ├── hooks/
│   ├── styles/
│   └── types/
```

---

## Backend

```text id="0jlwmm"
localmarket/
├── controller/
├── service/
├── repository/
├── model/
├── dto/
└── config/
```

---

# 🔥 Core Modules

| Module                | Description                 |
| --------------------- | --------------------------- |
| Buyer Marketplace     | Product discovery interface |
| Vendor Dashboard      | Product management system   |
| Marketplace Assistant | AI-assisted search          |
| Geolocation Engine    | Nearby product logic        |
| Authentication System | Role-based login            |
| Product Search System | Smart filtering and sorting |

---

# 📡 API Features

* Product APIs
* Authentication APIs
* Marketplace APIs
* Assistant APIs
* Nearby search APIs
* Filtering APIs
* Upload APIs

---

# 📊 Scalability & Load Testing

The backend architecture was benchmarked using k6 load testing.

## Benchmark Results

| Metric                       | Result       |
| ---------------------------- | ------------ |
| Max Concurrent Virtual Users | 2000         |
| Total Requests Processed     | 800,000+     |
| Peak Throughput              | 5396 req/sec |
| Request Failures             | 0%           |

The backend remained stable under high concurrent traffic conditions while maintaining low-latency API responses.

---

# 🔒 Security Features

* Input validation
* CORS protection
* Secure request handling
* DTO validation
* Backend request sanitization
* Controlled API exposure

---

# 🎨 UI/UX Design

The frontend follows an Airbnb-inspired soft UI design philosophy:

* rounded layouts
* modern spacing
* soft shadows
* responsive components
* clean marketplace experience

---

# 📈 Future Enhancements

* Real AI/LLM integration
* Voice-based marketplace assistant
* Real-time chat system
* Online payments
* Recommendation engine
* Redis caching
* Docker deployment
* Cloud scalability
* Real-time inventory sync

---

# 🧪 Performance Engineering

The project includes:

* API benchmarking
* concurrency testing
* scalability analysis
* stress testing
* throughput evaluation
* latency monitoring

---

# 🎯 Learning Outcomes

This project helped in understanding:

* Full-stack application architecture
* Spring Boot backend development
* REST API design
* MongoDB integration
* React component architecture
* Geolocation systems
* AI-assisted search systems
* Scalability engineering
* Load testing and benchmarking

---

# 🚀 Installation

## Backend Setup

```bash id="1jlwmm"
cd localmarket
./mvnw spring-boot:run
```

---

## Frontend Setup

```bash id="2jlwmm"
cd localmarket-ui
npm install
npm run dev
```

---

# 🌐 Environment Variables

Create `.env` inside frontend:

```env id="3jlwmm"
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

---

# 👨‍💻 Author

Developed as a major full-stack engineering project focused on:

* hyperlocal commerce
* intelligent product discovery
* scalable backend systems
* AI-assisted marketplace interactions

---

# 📄 License

This project is intended for educational and academic purposes.
