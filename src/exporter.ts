import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs-extra';
const path = require('path');
import * as edn from 'edn-data';

// Access the global joplin object
declare const joplin: any;

interface ExportOptions {
  format: 'json' | 'edn' | 'opml';
  path: string;
  includeResources: boolean;
  splitByParagraph: boolean;
}

interface JoplinNote {
  id: string;
  parent_id: string;
  title: string;
  body: string;
  created_time: number;
  updated_time: number;
  is_conflict: number;
  latitude: string;
  longitude: string;
  altitude: string;
  author: string;
  source_url: string;
  is_todo: number;
  todo_due: number;
  todo_completed: number;
  source: string;
  source_application: string;
  application_data: string;
  order: number;
  user_created_time: number;
  user_updated_time: number;
  encryption_cipher_text: string;
  encryption_applied: number;
  markup_language: number;
  is_shared: number;
  share_id: string;
  conflict_original_id: string;
  master_key_id: string;
}

interface JoplinFolder {
  id: string;
  title: string;
  parent_id: string;
}

interface JoplinTag {
  id: string;
  title: string;
}

interface JoplinResource {
  id: string;
  title: string;
  mime: string;
  filename: string;
  file_extension: string;
}

interface LogseqBlock {
  id: string;
  content: string;
  properties?: Record<string, any>;
  children?: LogseqBlock[];
}

interface LogseqPage {
  title: string;
  properties?: Record<string, any>;
  blocks?: LogseqBlock[];
}

export async function exportToLogseq(options: ExportOptions): Promise<void> {
  try {
    // Create export directory if it doesn't exist
    if (!fs.existsSync(options.path)) {
      fs.mkdirpSync(options.path, { recursive: true });
    }

    // Create pages directory for Logseq
    const pagesDir = path.join(options.path, 'pages');
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirpSync(pagesDir, { recursive: true });
    }

    // Create assets directory if including resources
    let assetsDir = '';
    if (options.includeResources) {
      assetsDir = path.join(options.path, 'assets');
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirpSync(assetsDir, { recursive: true });
      }
    }

    // Get all Joplin data
    const data = await getAllJoplinData();

    // Process based on selected format
    switch (options.format) {
      case 'json':
        await exportAsJson(data, options, pagesDir, assetsDir);
        break;
      case 'edn':
        await exportAsEdn(data, options, pagesDir, assetsDir);
        break;
      case 'opml':
        await exportAsOpml(data, options, options.path);
        break;
    }

    // Show success message
    await joplin.views.dialogs.showMessageBox('Export completed successfully!');
  } catch (error) {
    console.error('Export error:', error);
    await joplin.views.dialogs.showMessageBox(`Export failed: ${error.message}`);
  }
}

async function getAllJoplinData() {
  // Get all folders
  const folders = await joplin.data.get(['folders'], { 
    fields: ['id', 'title', 'parent_id']
  });

  // Get all notes
  const notes = await joplin.data.get(['notes'], { 
    fields: ['id', 'parent_id', 'title', 'body', 'created_time', 'updated_time', 'user_created_time', 'user_updated_time']
  });

  // Get all tags
  const tags = await joplin.data.get(['tags'], { 
    fields: ['id', 'title']
  });

  // Get note-tag associations
  const noteTags = await joplin.data.get(['notes', 'tags'], {
    fields: ['id', 'note_id', 'tag_id']
  });

  // Get resources if needed
  const resources = await joplin.data.get(['resources'], {
    fields: ['id', 'title', 'mime', 'filename', 'file_extension']
  });

  return {
    folders: folders.items as JoplinFolder[],
    notes: notes.items as JoplinNote[],
    tags: tags.items as JoplinTag[],
    noteTags: noteTags.items as { id: string; note_id: string; tag_id: string }[],
    resources: resources.items as JoplinResource[]
  };
}

async function exportAsJson(
  data: any, 
  options: ExportOptions, 
  pagesDir: string, 
  assetsDir: string
): Promise<void> {
  // Create a map of note tags
  const noteTagsMap = new Map<string, string[]>();
  for (const noteTag of data.noteTags) {
    if (!noteTagsMap.has(noteTag.note_id)) {
      noteTagsMap.set(noteTag.note_id, []);
    }
    const tag = data.tags.find(t => t.id === noteTag.tag_id);
    if (tag) {
      noteTagsMap.get(noteTag.note_id).push(tag.title);
    }
  }

  // Process each note
  for (const note of data.notes) {
    // Convert note to Logseq page
    const page: LogseqPage = {
      title: note.title,
      properties: {
        id: note.id,
        created: new Date(note.created_time).toISOString(),
        updated: new Date(note.updated_time).toISOString(),
      },
      blocks: []
    };

    // Add tags if any
    const noteTags = noteTagsMap.get(note.id) || [];
    if (noteTags.length > 0) {
      page.properties.tags = noteTags;
    }

    // Process note body into blocks
    if (options.splitByParagraph) {
      // Split by paragraphs
      const paragraphs = note.body.split(/\n\s*\n/);
      page.blocks = paragraphs.map(paragraph => ({
        id: uuidv4(),
        content: paragraph.trim()
      }));
    } else {
      // Keep as single block
      page.blocks = [{
        id: uuidv4(),
        content: note.body
      }];
    }

    // Process resources/attachments in the note
    if (options.includeResources) {
      // Find resource references in the note
      const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
      let match;
      
      // Replace each resource reference with a link to the copied file
      let updatedContent = note.body;
      while ((match = resourceRegex.exec(note.body)) !== null) {
        const [fullMatch, altText, resourceId] = match;
        const resource = data.resources.find(r => r.id === resourceId);
        
        if (resource) {
          // Copy the resource file
          const resourceData = await joplin.data.get(['resources', resourceId, 'file']);
          const targetPath = path.join(assetsDir, `${resourceId}.${resource.file_extension}`);
          fs.writeFileSync(targetPath, Buffer.from(resourceData.body));
          
          // Update the reference in blocks
          const newReference = `![${altText}](../assets/${resourceId}.${resource.file_extension})`;
          updatedContent = updatedContent.replace(fullMatch, newReference);
        }
      }
      
      // Update blocks with the new content
      if (options.splitByParagraph) {
        const paragraphs = updatedContent.split(/\n\s*\n/);
        page.blocks = paragraphs.map(paragraph => ({
          id: uuidv4(),
          content: paragraph.trim()
        }));
      } else {
        page.blocks = [{
          id: uuidv4(),
          content: updatedContent
        }];
      }
    }

    // Convert internal links
    for (let i = 0; i < page.blocks.length; i++) {
      // Replace Joplin internal links with Logseq links
      const linkRegex = /\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;
      let content = page.blocks[i].content;
      
      content = content.replace(linkRegex, (match, text, noteId) => {
        const linkedNote = data.notes.find(n => n.id === noteId);
        if (linkedNote) {
          return `[[${linkedNote.title}]]`;
        }
        return match;
      });
      
      page.blocks[i].content = content;
    }

    // Write the page to a file
    const fileName = `${sanitizeFileName(note.title)}.json`;
    const filePath = path.join(pagesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(page, null, 2));
  }
}

async function exportAsEdn(
  data: any, 
  options: ExportOptions, 
  pagesDir: string, 
  assetsDir: string
): Promise<void> {
  // Create a map of note tags
  const noteTagsMap = new Map<string, string[]>();
  for (const noteTag of data.noteTags) {
    if (!noteTagsMap.has(noteTag.note_id)) {
      noteTagsMap.set(noteTag.note_id, []);
    }
    const tag = data.tags.find(t => t.id === noteTag.tag_id);
    if (tag) {
      noteTagsMap.get(noteTag.note_id).push(tag.title);
    }
  }

  // Process each note
  for (const note of data.notes) {
    // Convert note to Logseq page structure
    const page: any = {
      title: note.title,
      properties: {
        id: note.id,
        created: new Date(note.created_time).toISOString(),
        updated: new Date(note.updated_time).toISOString(),
      },
      blocks: []
    };

    // Add tags if any
    const noteTags = noteTagsMap.get(note.id) || [];
    if (noteTags.length > 0) {
      page.properties.tags = noteTags;
    }

    // Process note body into blocks
    if (options.splitByParagraph) {
      // Split by paragraphs
      const paragraphs = note.body.split(/\n\s*\n/);
      page.blocks = paragraphs.map(paragraph => ({
        id: uuidv4(),
        content: paragraph.trim()
      }));
    } else {
      // Keep as single block
      page.blocks = [{
        id: uuidv4(),
        content: note.body
      }];
    }

    // Process resources/attachments in the note
    if (options.includeResources) {
      // Find resource references in the note
      const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
      let match;
      
      // Replace each resource reference with a link to the copied file
      let updatedContent = note.body;
      while ((match = resourceRegex.exec(note.body)) !== null) {
        const [fullMatch, altText, resourceId] = match;
        const resource = data.resources.find(r => r.id === resourceId);
        
        if (resource) {
          // Copy the resource file
          const resourceData = await joplin.data.get(['resources', resourceId, 'file']);
          const targetPath = path.join(assetsDir, `${resourceId}.${resource.file_extension}`);
          fs.writeFileSync(targetPath, Buffer.from(resourceData.body));
          
          // Update the reference in blocks
          const newReference = `![${altText}](../assets/${resourceId}.${resource.file_extension})`;
          updatedContent = updatedContent.replace(fullMatch, newReference);
        }
      }
      
      // Update blocks with the new content
      if (options.splitByParagraph) {
        const paragraphs = updatedContent.split(/\n\s*\n/);
        page.blocks = paragraphs.map(paragraph => ({
          id: uuidv4(),
          content: paragraph.trim()
        }));
      } else {
        page.blocks = [{
          id: uuidv4(),
          content: updatedContent
        }];
      }
    }

    // Convert internal links
    for (let i = 0; i < page.blocks.length; i++) {
      // Replace Joplin internal links with Logseq links
      const linkRegex = /\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;
      let content = page.blocks[i].content;
      
      content = content.replace(linkRegex, (match, text, noteId) => {
        const linkedNote = data.notes.find(n => n.id === noteId);
        if (linkedNote) {
          return `[[${linkedNote.title}]]`;
        }
        return match;
      });
      
      page.blocks[i].content = content;
    }

    // Convert to EDN format
    const ednData = edn.encode(page);
    
    // Write the page to a file
    const fileName = `${sanitizeFileName(note.title)}.edn`;
    const filePath = path.join(pagesDir, fileName);
    fs.writeFileSync(filePath, ednData);
  }
}

async function exportAsOpml(
  data: any, 
  options: ExportOptions, 
  exportPath: string
): Promise<void> {
  // Create OPML structure
  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Joplin Export</title>
  </head>
  <body>
`;

  // Create a map of folders by parent_id for hierarchy
  const foldersByParent = new Map<string, JoplinFolder[]>();
  for (const folder of data.folders) {
    if (!foldersByParent.has(folder.parent_id)) {
      foldersByParent.set(folder.parent_id, []);
    }
    foldersByParent.get(folder.parent_id).push(folder);
  }

  // Create a map of notes by parent_id
  const notesByParent = new Map<string, JoplinNote[]>();
  for (const note of data.notes) {
    if (!notesByParent.has(note.parent_id)) {
      notesByParent.set(note.parent_id, []);
    }
    notesByParent.get(note.parent_id).push(note);
  }

  // Create a map of note tags
  const noteTagsMap = new Map<string, string[]>();
  for (const noteTag of data.noteTags) {
    if (!noteTagsMap.has(noteTag.note_id)) {
      noteTagsMap.set(noteTag.note_id, []);
    }
    const tag = data.tags.find(t => t.id === noteTag.tag_id);
    if (tag) {
      noteTagsMap.get(noteTag.note_id).push(tag.title);
    }
  }

  // Recursive function to build OPML structure
  function buildOpmlHierarchy(parentId: string, indent: string): string {
    let result = '';
    
    // Add folders
    const folders = foldersByParent.get(parentId) || [];
    for (const folder of folders) {
      result += `${indent}<outline text="${escapeXml(folder.title)}">\n`;
      result += buildOpmlHierarchy(folder.id, indent + '  ');
      result += `${indent}</outline>\n`;
    }
    
    // Add notes
    const notes = notesByParent.get(parentId) || [];
    for (const note of notes) {
      // Process note content
      let content = note.body;
      
      // Convert internal links
      const linkRegex = /\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;
      content = content.replace(linkRegex, (match, text, noteId) => {
        const linkedNote = data.notes.find(n => n.id === noteId);
        if (linkedNote) {
          return `[[${linkedNote.title}]]`;
        }
        return match;
      });
      
      // Process resources/attachments
      if (options.includeResources) {
        const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
        content = content.replace(resourceRegex, (match, altText, resourceId) => {
          const resource = data.resources.find(r => r.id === resourceId);
          if (resource) {
            return `![${altText}](../assets/${resourceId}.${resource.file_extension})`;
          }
          return match;
        });
      }
      
      // Get tags
      const tags = noteTagsMap.get(note.id) || [];
      const tagsAttr = tags.length > 0 ? ` _tags="${escapeXml(tags.join(','))}"` : '';
      
      // Add OPML attributes for Logseq
      const createdAttr = ` _created="${new Date(note.created_time).toISOString()}"`;
      const updatedAttr = ` _updated="${new Date(note.updated_time).toISOString()}"`;
      
      result += `${indent}<outline text="${escapeXml(note.title)}"${tagsAttr}${createdAttr}${updatedAttr} _note="${escapeXml(content)}"/>\n`;
    }
    
    return result;
  }

  // Build the OPML content
  opml += buildOpmlHierarchy('', '  ');
  
  // Close the OPML
  opml += `  </body>
</opml>`;

  // Write the OPML file
  const filePath = path.join(exportPath, 'joplin-export.opml');
  fs.writeFileSync(filePath, opml);
}

// Helper functions
function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-');
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
} 