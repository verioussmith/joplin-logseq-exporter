// Import required modules
import joplin from 'api';
import { exportToLogseq } from './exporter';
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
const SETTINGS_SECTION = 'logseqExporter';
const SETTINGS = {
  DEFAULT_FORMAT: 'defaultFormat',
  DEFAULT_EXPORT_PATH: 'defaultExportPath',
  INCLUDE_RESOURCES: 'includeResources',
  SPLIT_BY_PARAGRAPH: 'splitByParagraph',
  BROWSE_BUTTON: 'browseButton',
};


/**
 * Show the export dialog with options for exporting to Logseq
 */
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
        <select id="format">
          <option value="json" ${defaultFormat === 'json' ? 'selected' : ''}>JSON</option>
          <option value="edn" ${defaultFormat === 'edn' ? 'selected' : ''}>EDN</option>
          <option value="opml" ${defaultFormat === 'opml' ? 'selected' : ''}>OPML</option>
        </select>
      </div>
      <div style="margin-bottom: 10px;">
        <label>Export path:</label>
        <input type="text" id="path" value="${defaultPath || ''}" style="width: 80%" placeholder="Select a directory..." />
        <button id="browseButton" type="button">Browse</button>
      </div>
      <div style="margin-bottom: 10px;">
        <label><input type="checkbox" id="includeResources" ${defaultIncludeResources ? 'checked' : ''} /> Include attachments</label>
      </div>
      <div style="margin-bottom: 10px;">
        <label><input type="checkbox" id="splitByParagraph" ${defaultSplitByParagraph ? 'checked' : ''} /> Split by paragraph</label>
      </div>
      <div style="margin-bottom: 10px;">
        <label><input type="checkbox" id="saveAsDefault" /> Save as default settings</label>
      </div>
    </form>
  `);

  // Add form data
  await dialogs.addScript(dialog, `
    document.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      webviewApi.postMessage({
        format: document.getElementById('format').value,
        path: document.getElementById('path').value,
        includeResources: document.getElementById('includeResources').checked,
        splitByParagraph: document.getElementById('splitByParagraph').checked,
        saveAsDefault: document.getElementById('saveAsDefault').checked,
      });
    });
  `);

  // Set dialog buttons
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
        const result = await joplin.views.dialogs.showOpenDialog({
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

/**
 * This is the main plugin entry point.
 * IMPORTANT: All initialization MUST happen inside this function.
 */
joplin.plugins.register({
  onStart: async function() {
    console.log('Logseq Exporter plugin started');
    
    try {
      // Define registerSettings inside onStart
      async function registerSettings() {
        console.log('Registering settings section and settings...');
        const SettingItemType = joplin.settings.SettingItemType;
        
        try {
          console.log('Registering settings section with ID:', SETTINGS_SECTION);
          await joplin.settings.registerSection(SETTINGS_SECTION, {
            label: 'Logseq Exporter',
            iconName: 'fas fa-share-square',
            description: 'Configure export options for Logseq'
          });
          console.log('Settings section registered successfully');
      
          // Unified settings registration
          console.log('Registering individual settings...');
          await joplin.settings.registerSettings({
            [SETTINGS.DEFAULT_FORMAT]: {
              public: true,
              type: SettingItemType.String,
              section: SETTINGS_SECTION,
              value: 'json',
              label: 'Default Export Format',
              options: {
                'json': 'JSON',
                'edn': 'EDN',
                'opml': 'OPML'
              },
              description: 'Select default format for exports'
            },
            [SETTINGS.DEFAULT_EXPORT_PATH]: {
              public: true,
              type: SettingItemType.String,
              section: SETTINGS_SECTION,
              value: '',
              label: 'Default Export Path',
              description: 'Base directory for exported files'
            },
            [SETTINGS.INCLUDE_RESOURCES]: {
              public: true,
              type: SettingItemType.Bool,
              section: SETTINGS_SECTION,
              value: true,
              label: 'Include Attachments',
              description: 'Export linked resources/attachments'
            },
            [SETTINGS.SPLIT_BY_PARAGRAPH]: {
              public: true,
              type: SettingItemType.Bool,
              section: SETTINGS_SECTION,
              value: true,
              label: 'Split by Paragraph',
              description: 'Create separate blocks for each paragraph'
            }
          });
          console.log('All settings registered successfully');
      
        } catch (error) {
          console.error('Error registering settings:', error);
          // Re-throw error to ensure initialization fails properly if settings can't be registered
          throw error;
        }
      }

      // Define registerExportModules inside onStart
      async function registerExportModules() {
        try {
          // Register JSON Export Module
          await joplin.interop.registerExportModule({
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
                includeResources: await joplin.settings.value(SETTINGS.INCLUDE_RESOURCES),
                splitByParagraph: await joplin.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
              });
            },
          });
          console.info('Registered JSON export module');

          // Register EDN Export Module
          await joplin.interop.registerExportModule({
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
                includeResources: await joplin.settings.value(SETTINGS.INCLUDE_RESOURCES),
                splitByParagraph: await joplin.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
              });
            },
          });
          console.info('Registered EDN export module');

          // Register OPML Export Module
          await joplin.interop.registerExportModule({
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
                includeResources: await joplin.settings.value(SETTINGS.INCLUDE_RESOURCES),
                splitByParagraph: await joplin.settings.value(SETTINGS.SPLIT_BY_PARAGRAPH),
              });
            },
          });
          console.info('Registered OPML export module');
        } catch (error) {
          console.error('Error registering export modules:', error);
          throw error;
        }
      }

      // Initialize settings first - this is critical for the settings menu to appear
      console.log('Starting settings registration...');
      await registerSettings();
      console.log('Settings registration complete');
      
      // Register menu items for our custom UI
      console.log('Starting menu items registration...');
      try {
        await registerMenuItems(showExportDialog);
        console.info('Menu items registered successfully');
      } catch (menuError) {
        console.error('Error registering menu items:', menuError);
        // Don't throw here - continue with initialization even if menu registration fails
      }
      
      // Register export modules for File > Export All menu
      console.log('Starting export modules registration...');
      try {
        await registerExportModules();
        console.info('Export modules registered successfully');
      } catch (exportError) {
        console.error('Error registering export modules:', exportError);
        // Don't throw here - continue with initialization even if export modules fail
      }

      console.log('Logseq Exporter plugin initialization complete');
    } catch (error) {
      console.error('Error during plugin initialization:', error);
      
      // Log detailed information to help diagnose settings issues
      if (error.message && error.message.includes('settings')) {
        console.error('Settings registration failed. This may prevent the settings menu from appearing.');
        console.error('Error details:', error);
      }
    }
  }
}); 