# Adobe Sign API Integration

A Node.js application that integrates with Adobe Sign API to create and manage digital signature agreements.

## Features

- Create digital signature agreements from templates
- Real-time agreement status monitoring
- User-friendly web interface for document signing
- Automatic redirect after successful signing

## Prerequisites

- Node.js (version 12 or higher)
- Adobe Sign account with API access
- Adobe Sign template created with required fields

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd adobe-api
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your Adobe Sign credentials:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file:
   ```
   ADOBE_ACCESS_TOKEN=your_adobe_access_token_here
   ADOBE_TEMPLATE_ID=your_template_id_here
   ```

3. **Get Adobe Sign credentials:**
   - **Access Token**: Visit https://secure.eu1.adobesign.com/account/accountSettingsPage#pageId::ACCESS_TOKENS
   - **Template ID**: Create a template at https://secure.eu1.adobesign.com/public/agreements/#agreement_type=template
     - Add text fields named "name" and "email"
     - Save the template and copy the ID from the URL

## Usage

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **Access the application:**
   Open http://localhost:3000 in your browser

3. **Create an agreement:**
   - Enter name and email in the form
   - Click "Send for signing"
   - The application will redirect to the signing page
   - After signing, you'll be redirected to a success page

## API Endpoints

- `POST /createAgreement` - Creates a new agreement and returns signing URL
- `GET /checkAgreementStatus/:agreementId` - Checks the current status of an agreement
- `GET /sign.html` - Signing page interface
- `GET /success` - Success page after signing

## Project Structure

```
adobe-api/
├── public/
│   ├── index.html      # Main form for creating agreements
│   ├── sign.html       # Embedded signing interface
│   └── success.html    # Success confirmation page
├── server.js           # Express server with Adobe Sign integration
├── .env.example        # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## Security Notes

- Never commit your `.env` file containing real credentials
- Access tokens should be kept secure and rotated regularly
- The application uses Adobe Sign's secure signing URLs
- All sensitive data is handled through environment variables

## Development

The server runs on port 3000 by default. The application uses:
- Express.js for the web server
- Adobe Sign REST API v6
- EU1 region endpoint (can be changed in server.js if needed)

## Dependencies

- `express` - Web framework
- `node-fetch` - HTTP client for API calls
- `dotenv` - Environment variable management

## Error Handling

The application includes error handling for:
- Missing or invalid credentials
- Adobe API rate limits
- Agreement creation failures
- Network connectivity issues