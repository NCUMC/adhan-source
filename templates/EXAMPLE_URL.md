# Example Google Sheets URL

This file shows an example of what the final Google Sheets CSV export URL should look like.

## URL Format

```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/export?format=csv&gid=MAIN_CONFIG_GID
```

## Real Example (Template - Make a Copy!)

You can use this public template spreadsheet:

**Spreadsheet URL:**
```
https://docs.google.com/spreadsheets/d/1EXAMPLE_SPREADSHEET_ID/edit
```

**CSV Export URL (for main config sheet with GID 0):**
```
https://docs.google.com/spreadsheets/d/1EXAMPLE_SPREADSHEET_ID/export?format=csv&gid=0
```

## How to Use This Template

1. **Option A - Create Your Own:**
   - Follow the instructions in `GOOGLE_SHEETS_SETUP.md`
   - Create from scratch using the templates in this folder

2. **Option B - Copy from Template:**
   - If you have access to a template spreadsheet, click "File" → "Make a copy"
   - Follow steps 5-7 in `GOOGLE_SHEETS_SETUP.md` to configure

## Quick Test

To test if your URL is working:

1. Copy your CSV export URL
2. Paste it in a browser address bar
3. You should see CSV data download or display
4. If you see HTML or an error page, the URL is incorrect

## Common URL Issues

❌ **Wrong:**
- `https://docs.google.com/spreadsheets/d/.../edit` (This is the edit URL, not export)
- `https://docs.google.com/spreadsheets/d/.../edit#gid=0` (Contains #, should use &gid=)
- Missing `/export?format=csv&gid=N` part

✅ **Correct:**
- `https://docs.google.com/spreadsheets/d/ABC123XYZ/export?format=csv&gid=0`

## Security Note

The spreadsheet must be publicly accessible (at least "Anyone with the link can view") for the app to fetch the configuration. Do not include sensitive information in the spreadsheet.
