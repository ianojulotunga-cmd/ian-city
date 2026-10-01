# Wide City Smart Digital Homes

A responsive e-commerce storefront for home & kitchen appliances, computer accessories and electronics, with an Express backend for Safaricom Daraja M-Pesa STK Push.

## Run locally

1. Install Node.js 18+.
2. Open this folder in a terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and fill in your Daraja sandbox credentials.
5. Set `DARAJA_CALLBACK_URL` to a public HTTPS URL when testing callbacks.
6. Run `npm start`.
7. Open `http://localhost:5000`.

The frontend is self-contained in `public/`, so it also displays correctly when served by the included Express server.

## GitHub

Upload the entire folder to a GitHub repository. For the M-Pesa version, deploy the Node/Express app on a host that supports environment variables and a public HTTPS callback. Do not commit `.env`.

## M-Pesa

The server uses Daraja OAuth and M-Pesa Express STK Push. The callback is `/api/mpesa/callback`. In production, persist orders and callback results in a database before treating an order as paid.

## HCI choices

- Search and category filtering
- Clear product imagery and prices
- Recognition over recall through visible cart state
- Immediate feedback for cart and payment actions
- Responsive mobile-first layout
- Error prevention for phone number and empty cart
- Consistent controls, spacing and typography
- User control through quantity changes and cart removal
