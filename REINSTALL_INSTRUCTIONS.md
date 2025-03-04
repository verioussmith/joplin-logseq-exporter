# Reinstalling the Joplin Logseq Exporter Plugin

After updating the plugin with new features, please follow these steps to reinstall the plugin in Joplin:

## Step 1: Remove the Current Plugin

1. Close Joplin completely
2. Navigate to your Joplin plugins directory:
   - Windows: `%APPDATA%\joplin-desktop\plugins\`
   - macOS: `~/Library/Application Support/joplin-desktop/plugins/`
   - Linux: `~/.config/joplin-desktop/plugins/`
3. Delete any files related to the Logseq Exporter plugin (e.g., `com.verioussmith.joplin-logseq-exporter.jpl`)

## Step 2: Clear Joplin Plugin Cache (Optional but Recommended)

1. While Joplin is still closed, navigate to your Joplin profile directory:
   - Windows: `%APPDATA%\joplin-desktop\`
   - macOS: `~/Library/Application Support/joplin-desktop/`
   - Linux: `~/.config/joplin-desktop/`
2. Find the `plugins.sqlite` file
3. Rename it to `plugins.sqlite.bak` (this will force Joplin to rebuild its plugin cache)

## Step 3: Install the Updated Plugin

1. Make sure Joplin is still closed
2. Copy the updated plugin file from:
   `publish/com.verioussmith.joplin-logseq-exporter.jpl`
3. Paste it into your Joplin plugins directory (listed in Step 1)

## Step 4: Start Joplin and Verify the Plugin

1. Start Joplin
2. Go to Tools > Options > Plugins (or Joplin > Preferences > Plugins on macOS)
3. You should now see the Logseq Exporter plugin in the list with a checkbox to enable/disable it
4. Check that the new features are available:
   - A sidebar panel for quick access to export functions
   - Settings page with default export options
   - Menu item in the Tools menu
   - Toolbar button in the note toolbar
5. Try using the plugin by clicking on the "Export to Logseq" button in the note toolbar or by selecting Tools > Export to Logseq

## New Features in this Version

1. **Settings Panel**: Configure default export settings like format, path, and options
2. **Sidebar Panel**: Quick access to the exporter functionality from the sidebar
3. **Improved UI**: Better integration with Joplin's theme
4. **Save Preferences**: Option to save your export configuration as default

If you're still having issues, try installing the plugin using the "Install from file" option in the Joplin plugin manager:

1. In Joplin, go to Tools > Options > Plugins
2. Click the gear icon (⚙️) and select "Install from file"
3. Navigate to and select this file:
   `publish/com.verioussmith.joplin-logseq-exporter.jpl`
4. Restart Joplin when prompted 