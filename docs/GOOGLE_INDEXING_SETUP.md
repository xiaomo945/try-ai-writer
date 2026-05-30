# Google Indexing API Setup Guide

This guide will help you set up the Google Indexing API to automatically submit new pages and blog posts to Google Search Console when you deploy your site.

## Prerequisites
- A Google Cloud Platform (GCP) account
- A Google Search Console account with your site verified

---

## Step 1: Create a Project in Google Cloud Platform
1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Click on the project dropdown in the top left and click "New Project"
3. Name your project (e.g., "Try AI Writer Indexing") and click "Create"

## Step 2: Enable the Indexing API
1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Indexing API"
3. Select it and click "Enable"

## Step 3: Create a Service Account & Download Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details:
   - Service account name: `search-console-indexer`
   - Service account ID: `search-console-indexer@PROJECT_ID.iam.gserviceaccount.com` (will be auto-filled)
   - Description: "Service account for Google Indexing API"
4. Click "Create and Continue"
5. Click "Done" (no role needed)
6. Now, select the service account you just created from the list
7. Go to the "Keys" tab
8. Click "Add Key" → "Create New Key"
9. Choose "JSON" format and click "Create"
10. Save the downloaded JSON file as `google-indexing-key.json` (we'll use this in the next steps)

## Step 4: Add Service Account to Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Select your site property
3. Click on "Settings" (gear icon in the sidebar)
4. Click on "Users and permissions"
5. Click the "Add user" button
6. In the "Email address" field, paste the service account email from Step 3.3
7. Set the permission to "Owner" or "Full" (both work)
8. Click "Add"

## Step 5: Set Up Environment Variables
Create or edit `.env.local` in your project root and add:
```env
GOOGLE_INDEXING_KEY_PATH=./google-indexing-key.json
SITE_URL=https://tryaiwriter.com
```

## Step 6: Configure Vercel Deploy Webhook (Optional)
1. In your Vercel project settings, go to "Git" → "Deploy Hooks"
2. Create a deploy hook called "Production Deploy"
3. Add the hook URL to a script in your package.json (optional)

## FAQ

### Q: What are the API limits?
A: The Google Indexing API has a default quota of 200 requests per day, which is enough for most sites.

### Q: What types of content can I submit?
A: You can submit URLs with `URL_UPDATED` (new or updated content) or `URL_DELETED` (removed content).

### Q: How long does it take for Google to index my pages?
A: It varies, but typically pages are indexed within a few hours to a few days.

---

## Troubleshooting
- **403 Forbidden Errors**: Make sure your service account is added correctly to Google Search Console with proper permissions.
- **Invalid Credentials**: Double-check your JSON key file path and contents.
