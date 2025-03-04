// Don't import local types for enums, use Joplin's global API instead
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

// Use Joplin API location values as strings - these are the official values from the API
const MenuItemLocation = {
  File: 'file',
  Edit: 'edit',
  View: 'view',
  Note: 'note',
  Tools: 'tools',
  Help: 'help'
};

const ToolbarButtonLocation = {
  NoteToolbar: 'noteToolbar',
  EditorToolbar: 'editorToolbar'
};

// Import or define the enum types
const SettingItemType = {
  Int: 1,
  String: 2,
  Bool: 3,
  Array: 4,
  Object: 5,
  Button: 6,
};

async function registerSettings() {
  // Register settings section
  await joplin.settings.registerSection(SETTINGS_SECTION, {
    label: 'Logseq Exporter',
    icon: 'fas fa-file-export',
    description: 'Settings for the Logseq Exporter plugin'
  });

  // Register settings
  await joplin.settings.registerSettings({
    [SETTINGS.DEFAULT_FORMAT]: {
      label: 'Default export format',
      type: SettingItemType.String,
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
      type: SettingItemType.String,
      section: SETTINGS_SECTION,
      public: true,
      value: '',
      description: 'The default path to export notes to',
    },
    [SETTINGS.INCLUDE_RESOURCES]: {
      label: 'Include resources/attachments',
      type: SettingItemType.Bool,
      section: SETTINGS_SECTION,
      public: true,
      value: true,
      description: 'Whether to include attached files in exports',
    },
    [SETTINGS.SPLIT_BY_PARAGRAPH]: {
      label: 'Split notes by paragraph',
      type: SettingItemType.Bool,
      section: SETTINGS_SECTION,
      public: true,
      value: true,
      description: 'Whether to split notes into blocks by paragraph',
    },
  });
}

async function createSidebarPanel() {
  console.log('Creating sidebar panel...');
  
  // Create the panel
  const panel = await joplin.views.panels.create('logseqExporterPanel');
  console.log('Panel created with handle:', panel);
  
  // Set the HTML content
  await joplin.views.panels.setHtml(panel, `
    <div class="export-panel" style="padding: 15px;">
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
  console.log('Panel HTML set');
  
  // Set CSS - make sure the file exists in the correct location
  await joplin.views.panels.addScript(panel, './styles/panel.css');
  console.log('Panel CSS added');
  
  // Add JavaScript - make sure the file exists in the correct location
  await joplin.views.panels.addScript(panel, './scripts/panel.js');
  console.log('Panel script added');
  
  // Handle messages from panel
  await joplin.views.panels.onMessage(panel, async (message) => {
    console.log('Message received from panel:', message);
    
    if (message.name === 'quickExport') {
      console.log('Quick export requested from panel');
      await showExportDialog();
    } else if (message.name === 'panelReady') {
      console.log('Panel is ready, updating settings');
      await updatePanelSettings(panel);
    }
  });
  
  // Explicitly show the panel - this is critical!
  await joplin.views.panels.show(panel);
  console.log('Panel shown');
  
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
    console.info('Starting Joplin Logseq Exporter plugin...');
    
    try {
      // Register settings
      await registerSettings();
      console.info('Settings registered successfully');
      
      // Create sidebar panel
      const panel = await createSidebarPanel();
      console.info('Sidebar panel created successfully');
      
      // Register the main export command
      await joplin.commands.register({
        name: 'exportToLogseq',
        label: 'Export to Logseq...',
        iconName: 'fas fa-file-export',
        execute: async () => {
          await showExportDialog();
        },
      });
      console.info('Main export command registered');

      // Add to Tools menu - explicitly use the enum value
      await joplin.views.menuItems.create('exportToLogseqMenuItem', 'exportToLogseq', MenuItemLocation.Tools);
      console.info('Added to Tools menu');

      // Add toolbar button - explicitly use the enum value
      await joplin.views.toolbarButtons.create('exportToLogseqButton', 'exportToLogseq', ToolbarButtonLocation.NoteToolbar);
      console.info('Toolbar button created');
      
      // Register commands for File menu and submenu items
      // First, register the parent command
      await joplin.commands.register({
        name: 'exportToLogseqParent',
        label: 'Export to Logseq',
        execute: async () => {
          // This is a parent item that will have submenu entries
          // You can provide a default action here if clicked directly
          await showExportDialog();
        },
      });
      console.info('Parent menu command registered');
      
      // Then register format-specific commands
      await joplin.commands.register({
        name: 'exportToLogseqJson',
        label: 'JSON Format',
        execute: async () => {
          await showExportDialog('json');
        },
      });
      
      await joplin.commands.register({
        name: 'exportToLogseqEdn',
        label: 'EDN Format',
        execute: async () => {
          await showExportDialog('edn');
        },
      });
      
      await joplin.commands.register({
        name: 'exportToLogseqOpml',
        label: 'OPML Format',
        execute: async () => {
          await showExportDialog('opml');
        },
      });
      console.info('Format-specific commands registered');

      // Create the menu structure
      // 1. Create the parent menu item
      await joplin.views.menuItems.create(
        'exportToLogseqParentMenuItem', // ID of the menu item
        'exportToLogseqParent',         // Command name it's linked to
        MenuItemLocation.File           // Where to show the menu
      );
      console.info('Parent menu item created');

      // 2. Create the submenu items under the parent
      await joplin.views.menuItems.create(
        'exportToLogseqJsonMenuItem',   // ID
        'exportToLogseqJson',           // Command
        MenuItemLocation.File,          // Location (must match parent)
        { parent: 'exportToLogseqParentMenuItem' } // Link to parent
      );
      
      await joplin.views.menuItems.create(
        'exportToLogseqEdnMenuItem',
        'exportToLogseqEdn',
        MenuItemLocation.File,
        { parent: 'exportToLogseqParentMenuItem' }
      );
      
      await joplin.views.menuItems.create(
        'exportToLogseqOpmlMenuItem',
        'exportToLogseqOpml',
        MenuItemLocation.File,
        { parent: 'exportToLogseqParentMenuItem' }
      );
      
      console.info('Format-specific submenu items created');
      
      // Settings changed handler
      await joplin.settings.onChange(async () => {
        await updatePanelSettings(panel);
      });
      console.info('Settings change handler registered');

      console.info('Joplin Logseq Exporter plugin loaded successfully');
    } catch (error) {
      console.error('Error initializing Joplin Logseq Exporter plugin:', error);
    }
  },
});

async function showExportDialog(preselectedFormat = null) {
  // Get default values from settings
  const defaultFormat = preselectedFormat || await joplin.settings.value(SETTINGS.DEFAULT_FORMAT);
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