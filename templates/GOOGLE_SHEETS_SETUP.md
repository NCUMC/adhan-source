# Google Sheets Setup Guide

This guide will help you set up automatic configuration syncing using Google Sheets.

## Step-by-Step Setup

### 1. Create a New Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Adhan App Config"

### 2. Create Three Sheets

Your spreadsheet should have three sheets (tabs at the bottom):

#### Sheet 1: Main Config (rename to "config")
Copy and paste this data:

```
setting,value
location,0
mainClockSize,20
prayerTimeFontSize,11
prayerNameFontSize,7
hijriOffset,2
enableScreenSaver,false
fajrIqamah,20
dhuhrIqamah,10
asrIqamah,10
maghribIqamah,20
ishaIqamah,10
slide_gid,REPLACE_WITH_IMAGES_GID
msg_gid,REPLACE_WITH_MESSAGES_GID
```

#### Sheet 2: Messages (rename to "messages")
Copy and paste this data:

```
text,duration
"Please keep your phone silent during prayer!",10
"Assalamu alaikum, prayer time is near",5
"May Allah accept our worship",15
```

#### Sheet 3: Images (rename to "images")
Copy and paste this data:

```
url,duration
"quotes.jpeg",0.5
"ramadan_banner.jpg",2
"welcome_sign.png",1.5
```

### 3. Get the GID for Each Sheet

For each sheet (messages and images):

1. Click on the sheet tab to open it
2. Look at the URL in your browser's address bar
3. Find the `gid=` parameter in the URL
   - Example: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit#gid=123456789`
   - The GID is `123456789`
4. Write down or copy this number

**Note the GIDs:**
- Messages sheet GID: `_____________`
- Images sheet GID: `_____________`

### 4. Update Main Config with GIDs

1. Go back to the "config" sheet (first sheet)
2. Find the rows with `slide_gid` and `msg_gid`
3. Replace the values with the GIDs you noted:
   - `slide_gid` → Images sheet GID
   - `msg_gid` → Messages sheet GID

### 5. Make the Spreadsheet Public

1. Click the "Share" button (top right)
2. Click "Change to anyone with the link"
3. Set permission to "Viewer"
4. Click "Done"

### 6. Get the CSV Export URL

1. Note your spreadsheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Example: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - The ID is: `1ABC...XYZ`

2. Get the GID of your main config sheet (usually `0` if it's the first sheet)

3. Construct the CSV export URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=MAIN_CONFIG_GID
   ```

   Example:
   ```
   https://docs.google.com/spreadsheets/d/1ABC...XYZ/export?format=csv&gid=0
   ```

### 7. Configure in the Adhan App

1. Open the Adhan app
2. Click the logo/avatar to open Settings
3. Scroll to "Google Sheets Sync" section
4. Paste your CSV export URL in the text field
5. Enable "Auto-sync every 30 seconds"
6. Click "Sync Now" to test

### 8. Verify It's Working

- Check "Last sync" timestamp updates
- Make a test change in Google Sheets (e.g., change a message)
- Wait 30 seconds or click "Sync Now"
- Verify the change appears in the app

## Troubleshooting

### "Sync failed" error

**Possible causes:**
1. Spreadsheet is not public/shared correctly
2. URL is incorrect or malformed
3. GIDs are wrong in the main config
4. Network connection is offline

**Solutions:**
- Verify sharing settings (should be "Anyone with the link can view")
- Double-check the CSV export URL format
- Verify the GIDs in your main config sheet match the actual sheet GIDs
- Check your internet connection

### Changes not appearing

**Solutions:**
- Ensure auto-sync is enabled
- Click "Sync Now" manually
- Check the "Last sync" timestamp
- Verify the GID values in main config are correct
- Make sure your changes are saved in Google Sheets (look for "All changes saved" message)

### Invalid GID errors

- Each sheet in Google Sheets has a unique GID (visible in the URL)
- Make sure you're using the correct GID for each sheet
- The main config sheet GID goes in the app's sync URL
- The messages and images sheet GIDs go in the main config sheet itself

## Tips

1. **Keep it simple**: Start with the template data and make small changes
2. **Test frequently**: Click "Sync Now" after making changes to test immediately
3. **Use quotes**: Always wrap text values (messages, image URLs) in quotes in CSV
4. **Watch the console**: Open browser developer tools to see sync logs
5. **Backup**: Keep a copy of your working config before making major changes

## Example Spreadsheet Structure

```
📊 Adhan App Config (Spreadsheet)
├── 📄 config (GID: 0)
│   ├── location,0
│   ├── mainClockSize,20
│   ├── ...
│   ├── slide_gid,987654321
│   └── msg_gid,123456789
├── 📄 messages (GID: 123456789)
│   ├── "Message 1",10
│   └── "Message 2",5
└── 📄 images (GID: 987654321)
    ├── "image1.jpg",1
    └── "image2.png",2
```

## Advanced: Multiple Locations

You can create multiple spreadsheets for different locations or configurations, each with its own sync URL. Just switch the URL in the app settings to change configurations.
