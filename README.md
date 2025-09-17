# Fullstack Project - Group 3 - RMIT 
BlooMart - E-commerce Website
Welcome to BlooMart! This platform is a multi-category e-commerce web app built for a fast, friendly, and trustworthy shopping experience, allows customers, vendors and shippers to access and explore their roles.

## 1. Group GitHub Repository
Our project repository is available at:
https://github.com/PhapLu/Fullstack-Project.git

## 2. Website Test User Logins
Admin User Login:
Username: adminTest
Password: Bloomart123@

Customer User Login:
Username: customerTest
Password: Bloomart123@

Vendor User Login:
Username: vendorTest
Password: Bloomart123@

Shipper User Login:
Username: shipperTest
Password: Bloomart123@

## 3. MongoDB Atlas Database Connection URL
For connecting to the database, use the following connection string:

mongodb+srv://phapluu2k5tqt:PhapNhat987AZ@cluster0.hadhzxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

## 4. Tech-Stack
Authentication
We use JWT with Role-Based Access Control (RBAC) to ensure the right permissions per role.
- Admin: manage users/vendors, monitor growth & hubs, audit key actions.
- Vendor: quick onboarding, publish/manage products, fulfill orders, view earnings.
- Customer: browse/search, add to cart, checkout, track payment & order status in My Account.
- Shipper: hub-based order queue, plan deliveries, update outcomes (delivered/failed/rescheduled).

Payments
Integrated with AlePay for secure prepaid card/transfer payments.
- Users are redirected to AlePay to complete payment, then return to BlooMart.
- Note: Reliable payment callbacks/webhooks require a deployed domain; configure the callback URL in server/.env.

Real-time Communication
WebSocket chat (ws) enables customer ↔ vendor Q&A:

- Live messaging without page reloads for faster clarifications.
- Can power instant updates (e.g., order inquiries, product details).

Security Features
To protect user data and platform integrity:
- helmet for secure HTTP headers.
- sanitize-html and mongo-sanitize to validate and clean inputs.
- bcrypt + JWT for credential & session security.
- HTTPS recommended in all environments.

Email Communication
Brevo (Sendinblue) handles:
- Account verification emails.
- Order and payment notifications.
- Other transactional messages as configured.

## 5. How to Access and Use the Website
### Install & Run
1) **Clone**
git clone https://github.com/PhapLu/Fullstack-Project.git
cd Fullstack-Project
2) **Server**
cd server
npm install
# create server/.env (Mongo URI, JWT, Brevo, AlePay)
npm start
3) **Client**
cd client
npm install
npm run dev

## 6. File .env must be created before running the application
NODE_ENV=development
PORT=3000
JWT_SECRET=GROUP3_FULLSTACK_PROJECT
MONGODB_CONNECTION_STRING=mongodb+srv://phapluudev2k5:PhapNhat987AZ@cluster0.oedyizh.mongodb.net/BlooMart?retryWrites=true&w=majority&appName=Cluster0
MONGODB_LOCAL_CONNECTION_STRING=mongodb+srv://phapluudev2k5:PhapNhat987AZ@cluster0.oedyizh.mongodb.net/BlooMart?retryWrites=true&w=majority&appName=Cluster0
BREVO_SMTP_USERNAME=7905cd001@smtp-brevo.com
BREVO_SMTP_PASSWORD=xsmtpsib-03424837703ab573ae5265e7f3437b0cdfd65bdb45cdcf76fe04b85cdf38b5c2-RghAEkT39YcZQMd6
CLIENT_LOCAL_ORIGIN=http://localhost:5173
MONGO_URI=mongodb+srv://phapluudev2k5:PhapNhat987AZ@cluster0.oedyizh.mongodb.net/
DB_NAME=BlooMart

#Alepay
ALEPAY_TOKEN_KEY=cVU3XOxZtHQLMAc8KQGsHF9Q6QbjS4
ALEPAY_LOCAL_BASE_URL=https://alepay-v3-sandbox.nganluong.vn/api/v3/checkout
ALEPAY_CHECK_SUM_KEY=n2UvTjnFAj2JVWzzQ9NNBs7OKQ6Oh8
ALEPAY_RETURN_URL=https://pastal-be-staging.onrender.com/v1/api/order/alepay_return
ALEPAY_CANCEL_URL=https://pastal-be-staging.onrender.com/v1/api/order/alepay_cancel
