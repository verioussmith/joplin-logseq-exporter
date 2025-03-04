// Import local types instead of trying to import from Joplin's API
import { MenuItemLocation, ToolbarButtonLocation } from './api-types';
import { exportToLogseq } from './exporter';

// Access the global joplin object
declare const joplin: any;

joplin.plugins.register({
  onStart: async function() {
    // Register the export command
    await joplin.commands.register({
      name: 'exportToLogseq',
      label: 'Export to Logseq',
      iconName: 'fas fa-file-export',
      execute: async () => {
        await showExportDialog();
      },
    });

    // Add to Tools menu
    await joplin.views.menuItems.create('exportToLogseqMenuItem', 'exportToLogseq', MenuItemLocation.Tools);

    // Add toolbar button
    await joplin.views.toolbarButtons.create('exportToLogseqButton', 'exportToLogseq', ToolbarButtonLocation.NoteToolbar);

    console.info('Joplin to Logseq Exporter plugin loaded');
  },
});

async function showExportDialog() {
  // Create dialog for export options
  const dialogs = joplin.views.dialogs;
  const dialog = await dialogs.create('exportToLogseqDialog');
  
  await dialogs.setHtml(dialog, `
    <h3>Export to Logseq</h3>
    <form>
      <div style="margin-bottom: 10px;">
        <label>Format:</label>
        <select id="format" style="width: 100%;">
          <option value="json">JSON</option>
          <option value="edn">EDN</option>
          <option value="opml">OPML</option>
        </select>
      </div>
      <div style="margin-bottom: 10px;">
        <label>Export path:</label>
        <input type="text" id="path" style="width: 100%;" placeholder="e.g., /path/to/logseq/export">
      </div>
      <div style="margin-bottom: 10px;">
        <input type="checkbox" id="includeResources" checked>
        <label for="includeResources">Include resources/attachments</label>
      </div>
      <div style="margin-bottom: 10px;">
        <input type="checkbox" id="splitByParagraph" checked>
        <label for="splitByParagraph">Split notes by paragraph</label>
      </div>
    </form>
  `);

  await dialogs.setButtons(dialog, [
    {
      id: 'cancel',
      title: 'Cancel',
    },
    {
      id: 'export',
      title: 'Export',
    },
  ]);

  const result = await dialogs.open(dialog);
  
  if (result.id === 'export') {
    const format = result.formData.format;
    const path = result.formData.path;
    const includeResources = result.formData.includeResources;
    const splitByParagraph = result.formData.splitByParagraph;

    if (!path) {
      await dialogs.showMessageBox('Please specify an export path.');
      return;
    }

    // Show progress
    await joplin.views.dialogs.showMessageBox('Starting export... This may take a while depending on the number of notes.');

    // Start export process
    await exportToLogseq({
      format: format,
      path: path,
      includeResources: includeResources,
      splitByParagraph: splitByParagraph,
    });
  }
} 