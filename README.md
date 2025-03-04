# Joplin Logseq Exporter Plugin

A plugin for Joplin that allows you to export your notes to Logseq-compatible formats (JSON, EDN, OPML).

## Features

- Export Joplin notes to Logseq-compatible formats:
  - JSON format (one file per note)
  - EDN format (one file per note)
  - OPML format (single file export)
- Include resources/attachments in the export
- Option to split notes by paragraph for better Logseq compatibility
- Converts Joplin internal links to Logseq-style links

## Installation

### From the Plugin Repository (Not Yet Available)

Once this plugin is published to the Joplin plugin repository, you can install it directly from Joplin:

1. Open Joplin
2. Go to `Tools > Options > Plugins` (or `Joplin > Preferences > Plugins` on macOS)
3. Search for "Logseq Exporter"
4. Click "Install" and restart Joplin when prompted

### Manual Installation

To install the plugin manually:

1. Download the latest `.jpl` file from the [releases page](https://github.com/yourusername/joplin-logseq-exporter/releases)
2. Open Joplin
3. Go to `Tools > Options > Plugins` (or `Joplin > Preferences > Plugins` on macOS)
4. Click the gear icon (⚙️) and select "Install from file"
5. Select the downloaded `.jpl` file
6. Restart Joplin when prompted

Alternatively, you can install the plugin by copying the `.jpl` file to your Joplin plugins directory:

1. Download the latest `.jpl` file
2. Close Joplin completely
3. Copy the `.jpl` file to your Joplin plugins directory:
   - Windows: `%APPDATA%\joplin-desktop\plugins\`
   - macOS: `~/Library/Application Support/joplin-desktop/plugins/`
   - Linux: `~/.config/joplin-desktop/plugins/`
4. Start Joplin

## Usage

1. Open Joplin
2. Click on the "Export to Logseq" button in the note toolbar, or select `Tools > Export to Logseq`
3. In the export dialog:
   - Select the export format (JSON, EDN, or OPML)
   - Specify the export path (where the Logseq files will be saved)
   - Choose whether to include resources/attachments
   - Choose whether to split notes by paragraph
4. Click "Export"
5. Wait for the export to complete
6. Open Logseq and import the exported files

## Development

### Building from Source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. The plugin will be available in the `publish` directory as a `.jpl` file

## License

MIT

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/yourusername/joplin-logseq-exporter/issues) on GitHub. 