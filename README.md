# SecomCare Copycat

A Chrome extension to help you quickly copy and paste form content on `care.secom.com.tw`.

## Features

*   **One-click Copy**: Copy all supported form fields with a single click.
*   **One-click Paste**: Paste the copied data into the form fields on another page.
*   **Customizable Text**: Configure the text for the "Health Education" field in the options page.

## Usage

1.  Navigate to a page on `care.secom.com.tw` that contains a form you want to copy.
2.  A control panel will appear on the right side of the page with the following buttons:
    *   **Copy**: Clicks this button to copy the form data.
    *   **Paste**: Clicks this button to paste the copied data.
    *   **Options**: Opens the options page in a new tab.
    *   **Show Data**: Logs the copied data to the browser's developer console.

## Development

### Loading the Extension

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable "Developer mode" in the top right corner.
3.  Click "Load unpacked" and select the `build` directory.

### Packaging the Extension

To package the extension for distribution, run the following command in your terminal:

```bash
./pack.sh
```

This will create a `SecomCare-Copycat.zip` file in the project root.

## Privacy Policy

This extension stores all copied data locally on your computer using the `chrome.storage.local` API. No data is ever transmitted to any external server. For more information, please see our [Privacy Policy](privacy-policy.md).