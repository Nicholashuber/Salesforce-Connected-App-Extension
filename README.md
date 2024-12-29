# Simple-Chrome-Extension-to-Create-Account-in-Salesforce

# Salesforce Test Extension

A minimal example of a Chrome Extension that demonstrates how to perform the OAuth flow with Salesforce, create a record (Account), and query Apex Debug Logs, using a local Node.js server.

## Overview

This project consists of three main files:

1. **index.html**
   This is the HTML file for the Chrome Extension popup. It includes the interface elements (buttons, input fields, etc.) and references `script.js`.

2. **script.js**
   This file contains the frontend logic for the Chrome Extension. It manages:
   - Detecting the presence of an OAuth authorization code in the current URL
   - Making a callout to the local Node.js server (`runServer.js`) to exchange the authorization code for an access token
   - Creating Accounts in Salesforce using the access token
   - Fetching and displaying Apex Debug Logs

3. **runServer.js**
   A simple Node.js server that handles:
   - OAuth token exchange (using the authorization code)
   - Account creation
   - Retrieving Apex Debug Logs from Salesforce

## Prerequisites

1. **Node.js and npm**
   Make sure you have Node.js (and npm) installed on your machine.

2. **Salesforce Connected App**
   You will need a Salesforce Connected App set up for OAuth. In this example, a specific `client_id` is already used (`3MVG9JJwBBbcN47Kc2rxoKEy7S9bKdSHmfJYEJVoYRJcLHmm7QzzUZdnMUkSvLn5G0VLeNNaYxPqvdAeaXAL2`).
   - Ensure that the redirect URI in your Connected App is set to `chrome-extension://<EXTENSION_ID>/index.html`.

3. **Chrome Extension Setup**
   - You will have to load the extension in Chrome in “Developer Mode” to test.

## Getting Started

### Step 1: Clone or Download the Project

```bash
git clone <this-repo-url>
cd <project-directory>


https://sfniche.nick8040.workers.dev/?Name=TestAccount&url=https://YOUR_INSTANCE.salesforce.com&AccessToken=YOUR_ACCESS_TOKEN