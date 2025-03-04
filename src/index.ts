// Import local types instead of trying to import from Joplin's API
import { MenuItemLocation, ToolbarButtonLocation } from './api-types';
import { exportToLogseq } from './exporter';

// Access the global joplin object
declare const joplin: any;

// Define setting keys
const SETTINGS_SECTION = 'logseqExporterSettings';
const SETTINGS = {
  DEFAULT_FORMAT: 'defaultFormat',
  DEFAULT_EXPORT_PATH: 'defaultExportPath',
  INCLUDE_RESOURCES: 'includeResources',
  SPLIT_BY_PARAGRAPH: 'splitByParagraph',
};

async function registerSettings() {
  // Register settings section
  await joplin.settings.registerSection(SETTINGS_SECTION, {
    label: 'Logseq Exporter',
    iconName: 'fas fa-file-export',
    description: 'Settings for the Logseq Exporter plugin',
  });

  // Register settings
  await joplin.settings.registerSettings({
    [SETTINGS.DEFAULT_FORMAT]: {
      label: 'Default export format',
      type: 3, // Dropdown
      section: SETTINGS_SECTION,
      public: true,
      value: 'json',
      options: {
        'json': 'JSON',
        'edn': 'EDN',
        'opml': 'OPML',
      },
      description: 'The default format to use when exporting notes',
    },
    [SETTINGS.DEFAULT_EXPORT_PATH]: {
      label: 'Default export path',
      type: 4, // String
      section: SETTINGS_SECTION,
      public: true,
      value: '',
      description: 'The default path to export notes to',
    },
    [SETTINGS.INCLUDE_RESOURCES]: {
      label: 'Include resources/attachments',
      type: 2, // Boolean
      section: SETTINGS_SECTION,
      public: true,
      value: true,
      description: 'Whether to include attached files in exports',
    },
    [SETTINGS.SPLIT_BY_PARAGRAPH]: {
      label: 'Split notes by paragraph',
      type: 2, // Boolean
      section: SETTINGS_SECTION,
      public: true,
      value: true,
      description: 'Whether to split notes into blocks by paragraph',
    },
  });
}

async function createSidebarPanel() {
  // Create the panel
  const panel = await joplin.views.panels.create('logseq-exporter-panel');
  
  // Set the HTML content
  await joplin.views.panels.setHtml(panel, `
    <div style="padding: 15px;">
      <h3>Logseq Exporter</h3>
      <p>Use this panel to quickly export your notes to Logseq.</p>
      <div style="margin-top: 10px;">
        <button id="quick-export-button" style="width: 100%; padding: 6px;">Export to Logseq</button>
      </div>
      <div style="margin-top: 20px;">
        <p>Current Settings:</p>
        <ul id="current-settings">
          <li>Loading settings...</li>
        </ul>
      </div>
    </div>
  `);
  
  // Set CSS
  await joplin.views.panels.addScript(panel, './styles/panel.css');
  
  // Add JavaScript
  await joplin.views.panels.addScript(panel, './scripts/panel.js');
  
  // Handle messages from panel
  await joplin.views.panels.onMessage(panel, async (message) => {
    if (message.name === 'quickExport') {
      await showExportDialog();
    }
  });
  
  // Update settings display when panel is visible
  await updatePanelSettings(panel);
  
  return panel;
}

async function updatePanelSettings(panel) {
  const defaultFormat = await joplin.settings.value(SETTINGS.DEFAULT_FORMAT);
  const defaultPath = await joplin.settings.value(SETTINGS.DEFAULT_EXPORT_PATH);
  const includeResources = await joplin.settings.value(SETTINGS.INCLUDE_RESOURCES);
  const splitByParagraph = await joplin.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH);
  
  const settingsHtml = `
    <li>Format: ${defaultFormat.toUpperCase()}</li>
    <li>Export path: ${defaultPath || '(Not set)'}</li>
    <li>Include resources: ${includeResources ? 'Yes' : 'No'}</li>
    <li>Split by paragraph: ${splitByParagraph ? 'Yes' : 'No'}</li>
  `;
  
  await joplin.views.panels.postMessage(panel, {
    name: 'updateSettings',
    settings: settingsHtml
  });
}

joplin.plugins.register({
  onStart: async function() {
    // Register settings
    await registerSettings();
    
    // Create sidebar panel
    const panel = await createSidebarPanel();
    
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
    
    // Settings changed handler
    await joplin.settings.onChange(async () => {
      await updatePanelSettings(panel);
    });

    console.info('Joplin to Logseq Exporter plugin loaded');
  },
});

async function showExportDialog() {
  // Get default values from settings
  const defaultFormat = await joplin.settings.value(SETTINGS.DEFAULT_FORMAT);
  const defaultPath = await joplin.settings.value(SETTINGS.DEFAULT_EXPORT_PATH);
  const defaultIncludeResources = await joplin.settings.value(SETTINGS.INCLUDE_RESOURCES);
  const defaultSplitByParagraph = await joplin.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH);
  
  // Create dialog for export options
  const dialogs = joplin.views.dialogs;
  const dialog = await dialogs.create('exportToLogseqDialog');
  
  await dialogs.setHtml(dialog, `
    <h3>Export to Logseq</h3>
    <form>
      <div style="margin-bottom: 10px;">
        <label>Format:</label>
        <select id="format" style="width: 100%;">
          <option value="json" ${defaultFormat === 'json' ? 'selected' : ''}>JSON</option>
          <option value="edn" ${defaultFormat === 'edn' ? 'selected' : ''}>EDN</option>
          <option value="opml" ${defaultFormat === 'opml' ? 'selected' : ''}>OPML</option>
        </select>
      </div>
      <div style="margin-bottom: 10px;">
        <label>Export path:</label>
        <input type="text" id="path" style="width: 100%;" placeholder="e.g., /path/to/logseq/export" value="${defaultPath || ''}">
      </div>
      <div style="margin-bottom: 10px;">
        <input type="checkbox" id="includeResources" ${defaultIncludeResources ? 'checked' : ''}>
        <label for="includeResources">Include resources/attachments</label>
      </div>
      <div style="margin-bottom: 10px;">
        <input type="checkbox" id="splitByParagraph" ${defaultSplitByParagraph ? 'checked' : ''}>
        <label for="splitByParagraph">Split notes by paragraph</label>
      </div>
      <div style="margin-bottom: 10px;">
        <label><input type="checkbox" id="saveAsDefault"> Save these settings as default</label>
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
    const saveAsDefault = result.formData.saveAsDefault;

    if (!path) {
      await dialogs.showMessageBox('Please specify an export path.');
      return;
    }
    
    // Save as default if requested
    if (saveAsDefault) {
      await joplin.settings.setValue(SETTINGS.DEFAULT_FORMAT, format);
      await joplin.settings.setValue(SETTINGS.DEFAULT_EXPORT_PATH, path);
      await joplin.settings.setValue(SETTINGS.INCLUDE_RESOURCES, includeResources);
      await joplin.settings.setValue(SETTINGS.SPLIT_BY_PARAGRAPH, splitByParagraph);
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