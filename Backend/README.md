# Company Reminder Scheduler API

This is a Node.js and Express-based API for managing company data and scheduling reminders for annual document renewals. The application includes endpoints to retrieve company information, trigger email reminders automatically, and manually send reminders.

## Features

- **Retrieve Company Data**: Fetch all companies or specific companies by their ID or enterprise number.
- **Automatic Reminder Scheduling**: Schedule email reminders for all companies automatically.
- **Manual Reminder Emails**: Send manual email reminders for specific companies.
- **Express Framework**: Built using Express.js with a JSON API.
- **CORS Enabled**: Supports cross-origin resource sharing.

## Requirements

- **Node.js**: Ensure you have Node.js installed.
- **Dependencies**:
  - `express`
  - `moment`
  - `node-cron`
  - `Nodemailer` (for sending emails)

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <repository_folder>

2. Install dependencies:

  ```bash
  npm install

3. Set Up the env for Nodelmailer:
  EMAIL_USER:<your-email>
  EMAIL_PASSWORD:<your-app-password>

4. Start the server:
 ```bash
 node Server.js

**Ahem**Hire me**Ahem**MIT License**Ahem**Let me know if you need additional details 
