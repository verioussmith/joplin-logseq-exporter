import joplin from 'api';
// Remove fallback reference
// const joplinApi = joplin || (typeof globalThis !== 'undefined' && globalThis.joplin) || joplin;

// Define menu item locations
enum MenuItemLocation {
  File = 1,
  Edit = 2,
  View = 3,
  Note = 4,
  Tools = 5,
  Help = 6,
}

/**
 * Register menu items for the Logseq exporter
 */
export async function registerMenuItems(showExportDialog: (preselectedFormat?: string) => Promise<void>) {
  try {
    // Register commands for File menu and submenu items
    // First, register the parent command
    await joplin.commands.register({
      name: 'exportToLogseqParent',
      label: 'Export to Logseq',
      iconName: 'fas fa-file-export',
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

    // Add the parent menu item to the File menu
    await joplin.views.menuItems.create('logseqExporterMenuItem', 'exportToLogseqParent', MenuItemLocation.File);
    
    // Add submenu items with parent property
    await joplin.views.menuItems.create('logseqExportJson', 'exportToLogseqJson', MenuItemLocation.File, { parent: 'logseqExporterMenuItem' });
    await joplin.views.menuItems.create('logseqExportEdn', 'exportToLogseqEdn', MenuItemLocation.File, { parent: 'logseqExporterMenuItem' });
    await joplin.views.menuItems.create('logseqExportOpml', 'exportToLogseqOpml', MenuItemLocation.File, { parent: 'logseqExporterMenuItem' });
    
    console.info('Created export menu in File menu with submenus');
  } catch (menuError) {
    console.error('Error creating menu items:', menuError);
  }
} 