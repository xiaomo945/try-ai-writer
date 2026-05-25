# Google Indexing API Setup Guide

This guide explains how to set up the Google Indexing API to automatically submit your website's URLs to Google for faster indexing.

## Prerequisites

- A Google Cloud Platform (GCP) account
- A Google Search Console account with your site verified
- Your site's sitemap generated and available in `/public/sitemap.xml`

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Give your project a name and click "Create"

## Step 2: Enable the Indexing API

1. In the Google Cloud Console, go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for "Indexing API"
3. Click on the result, then click "Enable"

## Step 3: Create a Service Account

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details and click "Create"
4. For the role, select "Owner" (or a custom role with Indexing API permissions)
5. Click "Continue" > "Done"

## Step 4: Create and Download Service Account Key

1. In the Credentials page, find your new service account in the "Service Accounts" section
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Select "JSON" as the key type
6. Click "Create" and save the JSON file to your computer
7. Rename it to something simple like `google-service-account-key.json`

## Step 5: Add Service Account to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Select your website property
3. Go to "Settings" > "Users and permissions"
4. Click "Add user"
5. Enter the email address of your service account (from the JSON file you downloaded)
6. Set the permission level to "Owner"
7. Click "Add"

## Step 6: Configure Environment Variables

1. Move your service account JSON file to your project's root directory (or a secure location)
2. Update your `.env.local` file to include:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-google-service-account-key.json
```

## Step 7: Install Dependencies

If you haven't already, install the `googleapis` package:

```bash
npm install googleapis
```

## Step 8: Run the Indexing Script

To submit new URLs to Google:

```bash
npm run submit-to-google
```

This will:
1. Read all URLs from your sitemap
2. Skip URLs that have already been submitted (tracked in `.tmp/submitted-urls.log`)
3. Submit new URLs to the Google Indexing API
4. Record successfully submitted URLs in the log

## Notes

- **Rate Limits**: The Google Indexing API has rate limits. The script adds a 1-second delay between submissions to avoid hitting these limits.
- **Indexing vs Ranking**: The Indexing API notifies Google of new/updated URLs, but this doesn't guarantee ranking.
- **Security**: Keep your service account key file secure. Never commit it to version control.

## Troubleshooting

If you encounter errors:
- Double-check that your service account has "Owner" permissions in Search Console
- Verify that your JSON key file path is correct in your environment variables
- Make sure the Indexing API is enabled in your Google Cloud project
- Check the [Google Indexing API documentation](https://developers.google.com/search/apis/indexing-api/v3/getting-started) for more help

## Related Resources

- [Google Indexing API Documentation](https://developers.google.com/search/apis/indexing-api/v3/getting-started)
- [Google Search Console Help](https://support.google.com/webmasters)