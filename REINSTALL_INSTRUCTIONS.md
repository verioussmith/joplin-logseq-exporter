# Reinstallation Instructions for Joplin Logseq Exporter Plugin

## Step 1: Remove Current Plugin (if installed)

1. Close Joplin completely
2. Navigate to the Joplin plugins directory:
   - Windows: `%APPDATA%\joplin-desktop\plugins\`
   - macOS: `~/Library/Application Support/joplin-desktop/plugins/`
   - Linux: `~/.config/joplin-desktop/plugins/`
3. Delete any files related to the Logseq Exporter plugin (e.g., `com.verioussmith.joplin-logseq-exporter.jpl` or similar)

## Step 2: Clear Joplin's Plugin Cache (IMPORTANT)

This step is crucial to fix issues with missing activation buttons or UI elements.

1. Navigate to the Joplin profile directory:
   - Windows: `%APPDATA%\joplin-desktop\`
   - macOS: `~/Library/Application Support/joplin-desktop/`
   - Linux: `~/.config/joplin-desktop/`

2. Find and rename/delete these files:
   - Rename `plugins.sqlite` to `plugins.sqlite.bak`
   - Rename `plugins.sqlite-shm` to `plugins.sqlite-shm.bak` (if it exists)
   - Rename `plugins.sqlite-wal` to `plugins.sqlite-wal.bak` (if it exists)

3. Additionally, check for and clear cache files:
   - Navigate to the Joplin cache directory (same parent folder as above)
   - Look for a `cache` folder and delete any plugin-related entries

## Step 3: Install the Updated Plugin

1. Copy the updated plugin file from `publish/com.verioussmith.joplin-logseq-exporter.jpl`
2. Paste it into the Joplin plugins directory (same as in Step 1)

## Step 4: Start Joplin and Verify

1. Start Joplin
2. Go to Tools > Options > Plugins
3. You should now see the Logseq Exporter plugin with an option to enable or disable it
4. Enable the plugin and restart Joplin when prompted

## New Features in Version 1.0.0

The latest version of the Logseq Exporter plugin includes the following features:

1. **Settings Panel**: Access plugin settings via Tools > Options > Logseq Exporter
   - Configure default export format (JSON, EDN, OPML)
   - Set default export path
   - Toggle resource/attachment inclusion
   - Control note splitting behavior

2. **Sidebar Panel**: A dedicated panel for quick access to export functionality
   - Shows current export settings
   - One-click export button
   - Access via the sidebar tabs

3. **File Menu Integration**: New export options under the File menu
   - File > Export to Logseq (JSON)
   - File > Export to Logseq (EDN)
   - File > Export to Logseq (OPML)
   
4. **Toolbar Button**: Quick access export button in the note toolbar

## Using Development Mode (Alternative Method)

If you're still encountering issues, try installing the plugin in Development Mode:

1. Close Joplin completely
2. Launch Joplin with the `--dev` flag:
   - Windows: Right-click on the Joplin shortcut, select "Properties", and add `--dev` to the end of the Target field
   - macOS: Open Terminal and run: `open -a Joplin --args --dev`
   - Linux: Run `joplin --dev` from the terminal

3. In Joplin, go to Tools > Options > Plugins
4. Under "Advanced Settings", add the full path to your plugin directory in the "Development plugins" field:
   - The path should be to the plugin's root directory (the one containing the `manifest.json` file)
   - Example: `/path/to/JoplinExportPlugin`

5. Restart Joplin and check if the plugin appears with an activation button

## Troubleshooting

If you still don't see the activation button:

1. In Joplin, go to Tools > Options > Plugins
2. Look for the "gear" icon at the top of the plugins list
3. Select "Install from file" and navigate to `publish/com.verioussmith.joplin-logseq-exporter.jpl`
4. Restart Joplin and check if the activation button appears

If issues persist, try completely uninstalling and reinstalling Joplin itself, which will create a fresh plugins database and configuration.

If you're still having issues, try installing the plugin using the "Install from file" option in the Joplin plugin manager:

1. In Joplin, go to Tools > Options > Plugins
2. Click the gear icon (⚙️) and select "Install from file"
3. Navigate to and select this file:
   `publish/com.verioussmith.joplin-logseq-exporter.jpl`
4. Restart Joplin when prompted 