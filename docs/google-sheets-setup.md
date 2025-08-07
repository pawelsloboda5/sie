# Google Sheets Integration Setup

This document explains how to set up Google Sheets integration for provider applications.

## Step 1: Create Google Apps Script Web App

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with the script below
4. Deploy as a web app with "Execute as: Me" and "Who has access: Anyone"
5. Copy the web app URL and add it to your environment variables as `GOOGLE_SCRIPT_URL`

## Step 2: Google Apps Script Code

```javascript
function doPost(e) {
  try {
    // Parse the JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Your Google Sheet ID from the URL
    const SHEET_ID = '1OTVWyPf3ar8AFMdJ_xw2eZWKtubdUcZ2Ma15UIuTTRI';
    
    // Open the sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Check if headers exist, if not add them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full Name', 
        'Email',
        'Phone',
        'Profession',
        'Location',
        'Additional Info'
      ]);
    }
    
    // Append the data row
    sheet.appendRow(data.data);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        id: new Date().getTime().toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Provider Application API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Step 3: Environment Variable Setup

Add the following environment variable to your `.env.local` file:

```bash
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Replace `YOUR_DEPLOYMENT_ID` with the actual deployment ID from your Google Apps Script web app.

## Step 4: Sheet Headers

The script will automatically create headers if they don't exist:
- Timestamp
- Full Name
- Email
- Phone
- Profession
- Location  
- Additional Info

## Testing

You can test the integration by:
1. Submitting a form on your website
2. Checking the Google Sheet for new entries
3. Monitoring the console for any errors

## Troubleshooting

- Ensure the Google Apps Script is deployed with correct permissions
- Verify the SHEET_ID matches your Google Sheet
- Check that the web app URL is correctly set in environment variables
- Make sure the Google Account has access to the sheet