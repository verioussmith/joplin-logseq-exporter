# Reinstallation Instructions for Joplin Logseq Exporter

Follow these steps to correctly reinstall the updated plugin:

## 1. Remove Current Plugin

1. Close Joplin completely
2. Navigate to your Joplin plugin directory:
   - Windows: `%APPDATA%\Joplin\plugins`
   - macOS: `~/Library/Application Support/Joplin/plugins`
   - Linux: `~/.config/joplin/plugins`
3. Delete the `com.verioussmith.joplin-logseq-exporter` folder

## 2. Clear Joplin's Plugin Cache

To ensure no UI issues occur with the reinstalled plugin:

1. Navigate to the Joplin profile directory:
   - Windows: `%APPDATA%\Joplin`
   - macOS: `~/Library/Application Support/Joplin`
   - Linux: `~/.config/joplin`
2. Rename or delete the `.cache` folder

## 3. Install the Updated Plugin

1. Copy the updated `.jpl` file from the `publish` directory to your Joplin plugins directory
2. Ensure the file is named `com.verioussmith.joplin-logseq-exporter.jpl`

## 4. Start Joplin and Verify

1. Start Joplin
2. Go to Tools > Options > Plugins
3. Ensure the Logseq Exporter plugin is enabled
4. Check for the new features:
   - Look for the File menu export options
   - Check the sidebar for the Logseq Exporter panel
   - Explore the settings in Tools > Options > Logseq Exporter

## New Features in Version 1.0.0

- **Settings Panel**: Configure export formats, paths, and options
- **Sidebar Panel**: Quick access to export functionality with current settings displayed
- **File Menu Integration**: Export options under File menu for different formats (JSON, EDN, OPML)
- **Toolbar Button**: Quick access export button in the note toolbar

## Using Development Mode (Alternative Method)

For development purposes, you can launch Joplin in development mode:

1. **Launch Joplin with dev flag**:
   - Windows: `joplin.exe --dev`
   - macOS: `/Applications/Joplin.app/Contents/MacOS/Joplin --dev`
   - Linux: `joplin --dev`

2. **Add plugin directory**:
   - Go to Tools > Options > Advanced > Development
   - Add the full path to your plugin directory (the folder containing the `src` directory)
   - Click "Save"
   - Restart Joplin

3. **If activation button not visible**:
   - Restart Joplin
   - Go to Tools > Options > Advanced > Development
   - Verify the plugin path is correct

## Troubleshooting UI Elements Not Appearing

If after reinstalling you still don't see UI elements like menu items or panels:

1. **Clear Browser Cache**:
   - Joplin is built on Electron, which uses Chromium
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS) to open Developer Tools
   - Navigate to Application tab > Clear Storage > Clear site data
   - Restart Joplin

2. **Reset User Profile**:
   - As a last resort, you can reset Joplin's user profile
   - Close Joplin
   - Rename the Joplin data directory (backup first!):
     - Windows: `%APPDATA%\Joplin`
     - macOS: `~/Library/Application Support/Joplin`
     - Linux: `~/.config/joplin`
   - Start Joplin and reconfigure
   - Reinstall the plugin

3. **Run from Terminal with Debugging**:
   - Launch Joplin from terminal with:
     - `joplin --debug`
   - Check the console output for any errors related to the plugin

4. **Manually verify plugins directory structure**:
   - The plugin should have this structure in your plugins directory:
     ```
     plugins/
     └── com.verioussmith.joplin-logseq-exporter/
         ├── index.js
         ├── manifest.json
         ├── icons/
         ├── scripts/
         └── styles/
     ```

5. **Check Compatibility**:
   - Ensure your Joplin version is at least 2.1 (check Help > About Joplin)

Remember: Sometimes a complete reinstall of Joplin itself can resolve persistent plugin issues. 