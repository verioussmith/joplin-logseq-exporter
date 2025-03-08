// Import required modules
import joplin from 'api';
// Ensure we have the real joplin object at runtime
const joplinApi = joplin || (typeof globalThis !== 'undefined' && globalThis.joplin) || joplin;
import { exportToLogseq } from './exporter';
import * as fs from 'fs-extra';
import * as path from 'path';
import { registerMenuItems } from './menu';

// Define FileSystemItem and ModelType enums if not available in API imports
enum FileSystemItem {
  File = 1,
  Directory = 2,
}

enum ModelType {
  Note = 1,
  Folder = 2,
  Setting = 3,
  Resource = 4,
  Tag = 5,
  NoteTag = 6,
  Search = 7,
  Command = 8,
  MasterKey = 9,
}

// Settings keys
const SETTINGS_SECTION = 'logseqExporterSettings';
const SETTINGS = {
  DEFAULT_FORMAT: 'defaultFormat',
  DEFAULT_EXPORT_PATH: 'defaultExportPath',
  INCLUDE_RESOURCES: 'includeResources',
  SPLIT_BY_PARAGRAPH: 'splitByParagraph',
  BROWSE_BUTTON: 'browseButton',
};

// Add this after initializing joplinApi:
const SettingItemType = joplinApi.settings.SettingItemType;

// Register settings
async function registerSettings() {
  console.log('Registering settings section and settings...');
  
  try {
    await joplinApi.settings.registerSection(SETTINGS_SECTION, {
      label: 'Logseq Exporter',
      iconName: 'fas fa-file-export',
      description: 'Settings for the Logseq Exporter plugin'
    });

    // Register directory browser command
    await joplinApi.commands.register({
      name: 'logseqExporterBrowseDir',
      label: 'Select export directory',
      execute: async () => {
        const result = await joplinApi.dialogs.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Export Directory'
        });
        
        if (result.filePaths && result.filePaths.length > 0) {
          await joplinApi.settings.setValue(SETTINGS.DEFAULT_EXPORT_PATH, result.filePaths[0]);
        }
      }
    });

    // Register settings with proper types and options
    await joplinApi.settings.registerSettings({
      [SETTINGS.DEFAULT_FORMAT]: {
        label: 'Default export format',
        type: SettingItemType.String,
        section: SETTINGS_SECTION,
        public: true,
        value: 'json',
        description: 'Default format for exports',
        isEnum: true,
        options: {
          json: 'JSON',
          edn: 'EDN', 
          opml: 'OPML'
        }
      },
      [SETTINGS.DEFAULT_EXPORT_PATH]: {
        label: 'Default export path',
        type: SettingItemType.String,
        section: SETTINGS_SECTION,
        public: true,
        value: '',
        description: 'Path for exported files (click button below to browse)'
      },
      [SETTINGS.BROWSE_BUTTON]: {
        label: 'Browse for export directory',
        type: SettingItemType.Button,
        section: SETTINGS_SECTION,
        public: true,
        value: 'Browse...',
        description: 'Select export folder',
        onClick: { command: 'logseqExporterBrowseDir' }
      },
      [SETTINGS.INCLUDE_RESOURCES]: {
        label: 'Include attachments',
        type: SettingItemType.Bool,
        section: SETTINGS_SECTION,
        public: true,
        value: true,
        description: 'Export file attachments with notes'
      },
      [SETTINGS.SPLIT_BY_PARAGRAPH]: {
        label: 'Split by paragraphs',
        type: SettingItemType.Bool,
        section: SETTINGS_SECTION,
        public: true,
        value: true,
        description: 'Create separate blocks for each paragraph'
      }
    });

    const panel = await joplinApi.views.panels.create('logseqSettingsPanel');

  } catch (error) {
    console.error('Error registering settings:', error);
  }
}

/**
 * Register export modules that will show up in File > Export All
 */
async function registerExportModules() {
  try {
    // Register JSON Export Module
    await joplinApi.interop.registerExportModule({
      description: 'JSON - Export to Logseq (JSON Format)',
      format: 'logseq-json',
      target: FileSystemItem.Directory,
      isNoteArchive: true,
      fileExtensions: ['json'],
      
      onInit: async (context) => {
        console.info('Starting JSON export to Logseq', context);
      },
      
      onProcessItem: async (context, itemType, item) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing item for JSON export: ${itemType} ${item.id}`);
      },
      
      onProcessResource: async (context, resource, filePath) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing resource for JSON export: ${resource.id}`);
      },
      
      onClose: async (context) => {
        console.info('Completing JSON export to Logseq', context);
        await exportToLogseq({
          format: 'json',
          path: context.destPath,
          includeResources: await joplinApi.settings.value(SETTINGS.INCLUDE_RESOURCES),
          splitByParagraph: await joplinApi.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
        });
      },
    });
    console.info('Registered JSON export module');

    // Register EDN Export Module
    await joplinApi.interop.registerExportModule({
      description: 'EDN - Export to Logseq (EDN Format)',
      format: 'logseq-edn',
      target: FileSystemItem.Directory,
      isNoteArchive: true,
      fileExtensions: ['edn'],
      
      onInit: async (context) => {
        console.info('Starting EDN export to Logseq', context);
      },
      
      onProcessItem: async (context, itemType, item) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing item for EDN export: ${itemType} ${item.id}`);
      },
      
      onProcessResource: async (context, resource, filePath) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing resource for EDN export: ${resource.id}`);
      },
      
      onClose: async (context) => {
        console.info('Completing EDN export to Logseq', context);
        await exportToLogseq({
          format: 'edn',
          path: context.destPath,
          includeResources: await joplinApi.settings.value(SETTINGS.INCLUDE_RESOURCES),
          splitByParagraph: await joplinApi.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
        });
      },
    });
    console.info('Registered EDN export module');

    // Register OPML Export Module
    await joplinApi.interop.registerExportModule({
      description: 'OPML - Export to Logseq (OPML Format)',
      format: 'logseq-opml',
      target: FileSystemItem.Directory,
      isNoteArchive: true,
      fileExtensions: ['opml'],
      
      onInit: async (context) => {
        console.info('Starting OPML export to Logseq', context);
      },
      
      onProcessItem: async (context, itemType, item) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing item for OPML export: ${itemType} ${item.id}`);
      },
      
      onProcessResource: async (context, resource, filePath) => {
        // This is just for tracking progress, actual export happens in onClose
        console.info(`Processing resource for OPML export: ${resource.id}`);
      },
      
      onClose: async (context) => {
        console.info('Completing OPML export to Logseq', context);
        await exportToLogseq({
          format: 'opml',
          path: context.destPath,
          includeResources: await joplinApi.settings.value(SETTINGS.INCLUDE_RESOURCES),
          splitByParagraph: await joplinApi.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
        });
      },
    });
    console.info('Registered OPML export module');
  } catch (error) {
    console.error('Error registering export modules:', error);
  }
}

/**
 * This is the main plugin entry point.
 */
joplin.plugins.register({
  onStart: async function() {
    console.log('Logseq Exporter plugin started');
    
    // Register settings
    await registerSettings();
    
    try {
      // No longer creating the sidebar panel since it's not needed
      
      // Register menu items for our custom UI
      try {
        await registerMenuItems(showExportDialog);
        console.info('Menu items registered successfully');
      } catch (menuError) {
        console.error('Error registering menu items:', menuError);
      }
      
      // Register export modules for File > Export All menu
      try {
        await registerExportModules();
        console.info('Export modules registered successfully');
      } catch (exportError) {
        console.error('Error registering export modules:', exportError);
      }
      
      return {
        // Return a value to indicate successful initialization
        panel: null,
      };
    } catch (error) {
      console.error('Error initializing plugin:', error);
    }
  },
});

async function showExportDialog(preselectedFormat = null) {
  // Get default values from settings
  const defaultFormat = preselectedFormat || await joplinApi.settings.value(SETTINGS.DEFAULT_FORMAT);
  const defaultPath = await joplinApi.settings.value(SETTINGS.DEFAULT_EXPORT_PATH);
  const defaultIncludeResources = await joplinApi.settings.value(SETTINGS.INCLUDE_RESOURCES);
  const defaultSplitByParagraph = await joplinApi.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH);
  
  // Create dialog for export options
  const dialogs = joplinApi.views.dialogs;
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
        <div style="display: flex; width: 100%;">
          <input type="text" id="path" style="flex-grow: 1;" placeholder="e.g., /path/to/logseq/export" value="${defaultPath || ''}">
          <button type="button" id="browseButton" style="margin-left: 5px;">Browse...</button>
        </div>
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

  // Add script to handle the browse button
  await dialogs.addScript(dialog, `
    document.getElementById('browseButton').addEventListener('click', async () => {
      // Call back to the plugin to open a file dialog
      await webviewApi.postMessage({
        name: 'openFilePicker'
      });
    });
  `);

  // Handle messages from the dialog
  await dialogs.onMessage(dialog, async (message) => {
    if (message.name === 'openFilePicker') {
      try {
        // Show the file picker dialog
        const result = await joplinApi.dialogs.showOpenDialog({
          properties: ['openDirectory', 'createDirectory'],
          title: 'Select export directory',
          buttonLabel: 'Select',
        });
        
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
          const selectedPath = result.filePaths[0];
          // Send the selected path back to the dialog
          await dialogs.postMessage(dialog, {
            name: 'updatePath',
            path: selectedPath
          });
        }
      } catch (error) {
        console.error('Error opening file picker:', error);
      }
    }
  });

  // Add script to handle messages from the plugin
  await dialogs.addScript(dialog, `
    webviewApi.onMessage((message) => {
      if (message.name === 'updatePath') {
        document.getElementById('path').value = message.path;
      }
    });
  `);

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
      await joplinApi.settings.setValue(SETTINGS.DEFAULT_FORMAT, format);
      await joplinApi.settings.setValue(SETTINGS.DEFAULT_EXPORT_PATH, path);
      await joplinApi.settings.setValue(SETTINGS.INCLUDE_RESOURCES, includeResources);
      await joplinApi.settings.setValue(SETTINGS.SPLIT_BY_PARAGRAPH, splitByParagraph);
    }

    // Show progress
    await joplinApi.views.dialogs.showMessageBox('Starting export... This may take a while depending on the number of notes.');

    // Start export process
    await exportToLogseq({
      format: format,
      path: path,
      includeResources: includeResources,
      splitByParagraph: splitByParagraph,
    });
  }
} 