# CSV Configuration Templates

This directory contains CSV templates for importing configuration files into the Adhan application.

## Messages Configuration (`messages_template.csv`)

Used to configure rotating reminder messages displayed during prayer times.

### Columns:
- **text** (string): The message text to display. Use quotes if your message contains commas.
- **duration** (number): Display duration in minutes.

### Example:
```csv
text,duration
"Please keep your phone silent during prayer!",10
"Assalamu alaikum, prayer time is near",5
"May Allah accept our worship",15
```

**Notes:**
- Duration represents how long each message will be displayed before rotating to the next one
- Messages are displayed in the order they appear in the CSV
- Always wrap text in quotes, especially if it contains special characters or commas

---

## Images Configuration (`images_template.csv`)

Used to configure rotating image slideshow during normal prayer display periods.

### Columns:
- **url** (string): Path or URL to the image file. Use quotes if path contains special characters.
- **duration** (number): Display duration in minutes (supports decimals).

### Example:
```csv
url,duration
"quotes.jpeg",0.5
"ramadan_banner.jpg",2
"welcome_sign.png",1.5
```

**Notes:**
- Duration can be decimal values (e.g., 0.5 for 30 seconds)
- Image paths are relative to the `public/` folder in the application
- Images are displayed in the order they appear in the CSV
- Always wrap file paths in quotes

---

## General Configuration (`config_template.csv`)

Used to configure general application settings including location, font sizes, Hijri offset, and Iqamah timings.

### Columns:
- **setting** (string): The setting name
- **value** (string/number/boolean): The setting value

### Example:
```csv
setting,value
location,0
mainClockSize,15
prayerTimeFontSize,8
prayerNameFontSize,5
hijriOffset,0
enableScreenSaver,false
fajrIqamah,10
dhuhrIqamah,10
asrIqamah,10
maghribIqamah,10
ishaIqamah,10
```

### Available Settings:

**Display Settings:**
- **mainClockSize** (number): Main clock font size in viewport height (vh)
- **prayerTimeFontSize** (number): Prayer time font size in vh
- **prayerNameFontSize** (number): Prayer name font size in vh

**Location & Date:**
- **location** (number): Prayer time location index (0-10 for available locations)
- **hijriOffset** (number): Hijri date adjustment in days (positive or negative)

**Features:**
- **enableScreenSaver** (boolean): Enable screen saver mode during long breaks between prayers (true/false)

**Iqamah Timings (minutes after prayer call):**
- **fajrIqamah** (number): Minutes after Fajr call
- **dhuhrIqamah** (number): Minutes after Dhuhr call
- **asrIqamah** (number): Minutes after Asr call
- **maghribIqamah** (number): Minutes after Maghrib call
- **ishaIqamah** (number): Minutes after Isha call

**Google Sheets Integration:**
- **slide_gid** (number): Google Sheets GID (page ID) for the images configuration sheet
- **msg_gid** (number): Google Sheets GID (page ID) for the messages configuration sheet

**Notes:**
- Boolean values should be `true` or `false` (lowercase)
- Do not add quotes around values (unless they contain commas)
- Settings are case-sensitive
- The `slide_gid` and `msg_gid` values tell the app which sheets contain the images and messages configs

---

## How to Use

### With Google Sheets (Recommended for Live Updates)

1. **Create a Google Spreadsheet** with three sheets:
   - **Main Config** (e.g., GID 0): Use the format from `config_template.csv`
   - **Messages** (e.g., GID 1): Use the format from `messages_template.csv`
   - **Images** (e.g., GID 2): Use the format from `images_template.csv`

2. **Get the GID for each sheet:**
   - Open each sheet in Google Sheets
   - The GID is in the URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=GID_NUMBER`
   - Note down the GID for messages sheet and images sheet

3. **Add GIDs to your main config sheet:**
   - In the main config sheet, add two rows:
     - `slide_gid,YOUR_IMAGES_SHEET_GID`
     - `msg_gid,YOUR_MESSAGES_SHEET_GID`

4. **Get the CSV export URL for the main config sheet:**
   - Share the spreadsheet (make it public or "Anyone with the link can view")
   - Construct URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=MAIN_CONFIG_GID`

5. **Configure in the app:**
   - Open Settings → Google Sheets Sync
   - Paste the main config sheet CSV URL
   - Enable "Auto-sync every 30 seconds" for automatic updates
   - Click "Sync Now" to test

6. **Update configs anytime:**
   - Edit values in your Google Sheets
   - Changes will sync automatically (if auto-sync enabled) or click "Sync Now"

### Manual CSV Import (One-time)

1. **Choose the appropriate CSV file:**
   - `config_template.csv` - General settings (location, fonts, Iqamah times, etc.)
   - `messages_template.csv` - Rotating reminder messages
   - `images_template.csv` - Image slideshow rotation

2. **Edit the CSV file** with your custom values
3. **Load the CSV** using the application's settings interface (import feature to be implemented)
4. **Configuration is saved** to browser localStorage automatically

## File Format Requirements

- Use UTF-8 encoding
- First row must be the header row
- CSV must be properly comma-separated (values with commas must be quoted)
- Numbers should not have quotes (except for url/text columns)
