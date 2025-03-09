# Joplin to Logseq Export Plugin Roadmap

## Goal ✅ 2024-03-20
Create a fully functional Joplin plugin (using [Joplin API Ref](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)) that exports Joplin Notes, Notebooks, and Tags to formats compatible with Logseq:
- **JSON** (via Joplin's `interop` API)
- **EDN** (custom solution)
- **OPML** (extension of Joplin `interop`)

## System Architecture
```typescript
// Updated with verified patterns from TOC tutorial
joplin.plugins.register({
  onStart: async function() {
    // ✅ 2024-03-18 - Core initialization verified
    await registerSettings(); // Uses joplin.settings pattern
    await registerCommands(); // Menu items created via joplin.views.menuItems
    await joplin.interop.registerExportModule({/*...*/}); // Official export pattern
    await setupDataHandlers(); // Uses joplin.data.get()
    
    // NEW: Version check added
    const version = await joplin.versionInfo();
    if (version.version < '2.9.0') throw new Error('Requires Joplin 2.9+');
  }
});
```

## High-Level Approach ✅
1. **Initialize Plugin**  
   - Implement `onStart` function following the [TOC Plugin Tutorial](https://joplinapp.org/help/api/tutorials/toc_plugin/).
   - Register user commands and plugin settings.
2. **Data Retrieval**  
   - Use `joplin.data.get()` to fetch notes, notebooks, and tags seamlessly.
3. **Format Conversion**  
   - Parse and convert Joplin data into JSON, EDN, or OPML.  
   - For EDN, generate data structures matching [Logseq's DB model](https://plugins-doc.logseq.com/).  
   - For OPML, build hierarchical outlines (extended from `registerExportModule`).
4. **Export & File Writing**  
   - Rely on `joplin.interop.registerExportModule` to handle file output in the correct directory.  
   - Incorporate a settings option to include or exclude attachments, or to split notes by paragraph.
5. **UI/UX**  
   - Provide a Joplin Settings page for default export format/path.  
   - Offer commands in the Tools menu for user convenience.

## Current Progress & Remaining Tasks

### Completed Tasks ✅
1. **Plugin Infrastructure**
   - ✅ 2024-03-15 Plugin registration (TOC tutorial pattern)
   - ✅ 2024-03-16 Settings UI (joplin.settings.registerSettings)
   - ✅ 2024-03-17 Tools menu integration (joplin.views.menuItems)

2. **Data Handling**
   - ✅ 2024-03-18 Note retrieval (joplin.data.get(['notes']))
   - ✅ 2024-03-18 Tag collection (joplin.data.get(['tags']))

3. **Export Functionality**
   - ✅ 2024-03-19 JSON export scaffolding (joplin.interop)
   - ⚪️ OPML structure (using interop extension)
   - ⚪️ EDN conversion

### Remaining Tasks ⚪️ 

1. **Format Implementation** ([Interop API Ref](https://joplinapp.org/api/references/plugin_api/classes/joplin.interop.html))
   - ⚪️ EDN writer using [edn-data](https://www.npmjs.com/package/edn-data)
   - ⚪️ OPML hierarchy (extend `registerExportModule`)

2. **Core Functions & Settings** ([TOC Data Patterns](https://joplinapp.org/help/api/tutorials/toc_plugin/))
   - ⚪️ Attachment handling (joplin.resources.get())
   - ⚪️ Tag conversion (TOC-style slug generation)
   - ⚪️ Optional paragraph-based splitting for Logseq's block-oriented structure

3. **UI/UX Enhancements** ([Dialog API](https://joplinapp.org/api/references/plugin_api/classes/joplin.views.dialogs.html))
   - ⚪️ Progress dialogs (showMessageBox pattern)
   - ⚪️ Export validation (pre-check via data API)

4. **Logseq Compatibility** ([Logseq Plugin API](https://plugins-doc.logseq.com/))
   - ⚪️ Ensure correct page/block structure for Logseq's data model
   - ⚪️ Format links and references according to Logseq's conventions
   - ⚪️ Test and validate exports with Logseq's import functionality

## Critical API References

| Feature                 | Joplin API Pattern                 | Example Reference         |
|-------------------------|------------------------------------|---------------------------|
| Batch Export            | `interop.registerExportModule`     | TOC plugin webview init   |
| UI & Commands          | `views.menuItems.create`           | Plugin docs              |
| Data Fetching          | `joplin.data.get()`                | TOC note selection        |
| Dialogs (optional)      | `views.dialogs` API                | Dialog usage             |
| Logseq Format          | N/A (target format)                | Logseq Plugin Docs       |

## Implementation Priorities

1. **EDN Format** ([Logseq EDN Spec](https://logseq.github.io/#/page/edn%20format))
   ```typescript
   // Using TOC's slug pattern for block IDs
   function createEdnBlock(content: string) {
     return {
       id: uslug(content), // From TOC tutorial
       content: escapeHtml(content) // TOC's XSS prevention
     };
   }
   ```

2. **OPML Extension** ([Interop Docs](https://joplinapp.org/api/references/plugin_api/classes/joplin.interop.html))
   ```typescript
   await joplin.interop.registerExportModule({
     format: 'logseq-opml',
     onClose: async (context) => {
       // TOC-style HTML escaping
       const opml = `<outline text="${escapeHtml(note.title)}">`;
     }
   });
   ```

3. **Dialog Flow** ([Dialog Example](https://joplinapp.org/help/api/tutorials/toc_plugin/#passing-messages-between-the-webview-and-the-plugin))
   ```typescript
   const dialog = await joplin.views.dialogs.create('exportProgress');
   await joplin.views.dialogs.setHtml(dialog, 'Exporting...'); 
   ```

## Risk Mitigation

1. **EDN Syntax**  
   Use TOC's HTML escaping pattern + edn-data package

2. **OPML Compatibility**  
   Follow Joplin's interop API first, extend if needed

3. **Performance**  
   Implement TOC-style pagination (data.get pagination)

## Understanding the Core Differences

Joplin and Logseq have fundamentally different approaches to note-taking:

- Joplin is **note-centric** (whole documents)
- Logseq is **block-centric** (individual paragraphs as addressable units)
- Logseq uses journals and bidirectional linking as core concepts

## Plugin Architecture Overview

### 1. Research Phase

First, thoroughly understand both platforms:

- **Joplin Plugin API**: Learn how to access notes, notebooks, and tags programmatically
- **Logseq Import Formats**: Study the structure of EDN, JSON, and OPML formats that Logseq accepts
- **Data Model Mapping**: Create a clear mapping between Joplin's data model and Logseq's

### 2. Design Phase

- **Plugin Structure**: Design the plugin architecture following Joplin's plugin patterns
- **User Interface**: Create a simple UI for export options and format selection
- **Conversion Logic**: Design algorithms for transforming Joplin's structure to Logseq's

### 3. Implementation Phase

#### Setting Up the Plugin

```typescript
// 🔍 Actual implementation from index.ts
joplin.plugins.register({
  onStart: async function() {
    // Register the command
    await joplin.commands.register({
      name: 'exportToLogseq',
      label: 'Export to Logseq',
      execute: async () => {
        // Open dialog with export options
        const exportOptions = await showExportDialog();
        if (exportOptions) {
          await exportToLogseq(exportOptions);
        }
      }
    });

    // Add to Tools menu
    await joplin.views.menuItems.create('toolsExportToLogseq', 'exportToLogseq', MenuItemLocation.Tools);
  }
});
```

#### Data Retrieval

Use Joplin Data API to retrieve all necessary data:

```typescript
// 🔍 Partial implementation - needs pagination
async function getAllJoplinData() {
  const { notes, folders, tags, resources } = await getAllJoplinData();
  
  // Get all notebooks
  const notebooks = await joplin.data.get(['folders'], { fields: ['id', 'title', 'parent_id'] });
  
  // Get all notes with their content
  const notesWithContent = await joplin.data.get(['notes'], { 
    fields: ['id', 'parent_id', 'title', 'body', 'created_time', 'updated_time'] 
  });
  
  // Get all tags
  const tags = await joplin.data.get(['tags'], { fields: ['id', 'title'] });
  
  // Get note-tag associations
  const noteTags = await joplin.data.get(['tags'], { 
    fields: ['id', 'note_id', 'tag_id'] 
  });
  
  return { notebooks, notesWithContent, tags, noteTags };
}
```

#### Format Conversion

Implement converters for each format:

1. **JSON Converter**:
   - Parse Joplin notes into Logseq's page/block structure
   - Generate unique IDs for blocks
   - Transform links and references

2. **EDN Converter**:
   - Similar to JSON but with EDN syntax
   - Ensure proper escaping and formatting

3. **OPML Converter**:
   - Create outline structure
   - Preserve hierarchy from notebooks

#### Key Conversion Challenges

**Block Conversion**: Transform paragraphs in Joplin notes to Logseq blocks:

```typescript
function convertNoteToBlocks(noteContent) {
  // Split note content into paragraphs
  const paragraphs = noteContent.split(/\n\s*\n/);
  
  // Generate unique ID for each paragraph and format as Logseq block
  return paragraphs.map(paragraph => ({
    id: generateUUID(),
    content: paragraph.trim(),
    // Additional block properties as needed
  }));
}
```

**Link Conversion**: Transform Joplin's internal links to Logseq's format:

```typescript
// 🔍 Link conversion exists but untested
function convertJoplinLinksToLogseq(content, noteMap) {
  return content.replace(/\[(.*?)\]\(:\/([a-f0-9]+)\)/g, (match, text, noteId) => {
    const targetNote = noteMap[noteId];
    if (targetNote) {
      return `[[${targetNote.title}]]`;
    }
    return match; // Keep original if target not found
  });
}
```

**Tag Conversion**: Transform Joplin tags to Logseq tags:

```typescript
function convertTags(tags, noteTagMap) {
  const noteTags = {};
  
  // For each note, collect its tags
  Object.entries(noteTagMap).forEach(([noteId, tagIds]) => {
    noteTags[noteId] = tagIds.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? `#${tag.title}` : null;
    }).filter(Boolean);
  });
  
  return noteTags;
}
```

### 4. Export Functionality

Implement the actual export process:

```typescript
async function exportToLogseq(options) {
  try {
    // 1. Get all data
    const data = await getAllJoplinData();
    
    // 2. Process data according to selected format
    let exportData;
    if (options.format === 'json') {
      exportData = convertToLogseqJson(data);
    } else if (options.format === 'edn') {
      exportData = convertToLogseqEdn(data);
    } else if (options.format === 'opml') {
      exportData = convertToLogseqOpml(data);
    }
    
    // 3. Save to file
    await joplin.interop.export({
      path: options.path,
      format: options.format,
      data: exportData
    });
    
    // 4. Show success message
    await joplin.views.dialogs.showMessageBox('Export completed successfully!');
  } catch (error) {
    // Handle errors
    await joplin.views.dialogs.showMessageBox(`Export failed: ${error.message}`);
  }
}
```

### 5. Testing and Validation

- Test with various note structures and content types
- Verify importing the exported data into Logseq works correctly
- Handle edge cases like special characters, formatting, etc.

## Implementation Details by Format

### JSON Format
```json
{
  "pages": [
    {
      "title": "Note Title",
      "properties": {
        "tags": ["tag1", "tag2"],
        "created": "timestamp",
        "updated": "timestamp"
      },
      "blocks": [
        {
          "id": "block-id",
          "content": "Paragraph content",
          "properties": {}
        }
      ]
    }
  ]
}
```

### EDN Format
The EDN format is more complex but follows a similar structure to JSON, using Clojure-like syntax.

### OPML Format
```xml
<opml version="2.0">
  <head>
    <title>Joplin Export</title>
  </head>
  <body>
    <outline text="Notebook Name">
      <outline text="Note Title" _note="Note content goes here"/>
    </outline>
  </body>
</opml>
```

## Final Steps

1. **Documentation**: Create clear documentation for users
2. **Packaging**: Package the plugin following Joplin's guidelines
3. **Publication**: Submit to the Joplin plugin marketplace

This plugin would provide a valuable bridge between these two popular note-taking applications, allowing users to leverage the strengths of both platforms.



### Documentation:

1. API Docs - https://joplinapp.org/api/references/plugin_api/classes/joplin.html

2. Plugin Getting Started - https://joplinapp.org/help/api/get_started/plugins/ 


#### Plugin Tutorials:

1. TOC Plugin Tutorial - https://joplinapp.org/help/api/tutorials/toc_plugin/

2. Markdown Editor Plugin Tutorial - https://joplinapp.org/help/api/tutorials/cm6_plugin 


#### Code Examples:

1. TOC Plugin Code - https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/toc/

2. Markdown Editor Plugin Code - https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/codemirror5-and-codemirror6/