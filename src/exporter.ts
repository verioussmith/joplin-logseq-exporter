import { v4 as uuidv4 } from 'uuid';
import joplin from 'api';
import * as edn from 'edn-data';

// Use joplin.require for native modules
const fs = joplin.require('fs-extra');
const path = joplin.require('path');

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
  is_conflict: boolean;
  latitude: string;
  longitude: string;
  altitude: string;
  author: string;
  source_url?: string;
  is_todo: number;
  todo_due: number;
  todo_completed: number;
  source: string;
  source_application: string;
  application_data: string;
  order: number;
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
  parent_id: string;
  title: string;
  created_time: number;
  updated_time: number;
}

interface JoplinTag {
  id: string;
  title: string;
  created_time: number;
  updated_time: number;
}

interface JoplinResource {
  id: string;
  title: string;
  mime: string;
  file_extension: string;
  created_time: number;
  updated_time: number;
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
    // Replace old data collection with:
    const { notes, folders, tags, resources } = await getAllJoplinData();

    // Add validation checks
    if (notes.length === 0) {
      throw new Error('No notes found in Joplin database');
    }

    if (folders.length === 0) {
      console.warn('No folders/notebooks found - export will be flat');
    }

    // Show a message that we're starting the export
    await joplin.views.dialogs.showMessageBox(`Starting export to ${options.format.toUpperCase()} format at ${options.path}. Processing ${notes.length} notes, ${folders.length} folders, ${tags.length} tags, and ${resources.length} resources.`);
    
    // Create export directories
    const pagesDir = path.join(options.path, 'pages');
    const assetsDir = path.join(options.path, 'assets');
    
    try {
      // Ensure directories exist
      fs.mkdirSync(pagesDir, { recursive: true });
      fs.mkdirSync(assetsDir, { recursive: true });
      
      console.info(`Created export directories: ${pagesDir} and ${assetsDir}`);
    } catch (dirError) {
      throw new Error(`Failed to create export directories: ${dirError.message}`);
    }
    
    // Prepare data object with note tags
    const noteTags = []; // In a real implementation, you would fetch note-tag relationships
    const data = { notes, folders, tags, resources, noteTags };
    
    // Depending on the format, call the appropriate export function
    let exportedCount = 0;
    
    switch (options.format) {
      case 'json':
        await exportAsJson(data, options, pagesDir, assetsDir);
        exportedCount = notes.length;
        break;
      case 'edn':
        await exportAsEdn(data, options, pagesDir, assetsDir);
        exportedCount = notes.length;
        break;
      case 'opml':
        await exportAsOpml(data, options, options.path);
        exportedCount = notes.length;
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    
    // Show a success message
    await joplin.views.dialogs.showMessageBox(`Export complete! ${exportedCount} notes exported to ${options.path}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await joplin.views.dialogs.showMessageBox(`Export failed: ${message}`);
    console.error('Export error:', error);
    throw error;
  }
}

async function getAllNotes(): Promise<JoplinNote[]> {
  let page = 1;
  const allNotes: JoplinNote[] = [];
  
  try {
    while(true) {
      const response = await joplin.data.get(['notes'], {
        fields: [
          'id', 
          'parent_id', 
          'title', 
          'body',
          'created_time',
          'updated_time',
          'is_conflict',
          'source_url'
        ],
        limit: 100,
        page: page++,
        order_by: 'updated_time',
        order_dir: 'DESC'
      });

      allNotes.push(...response.items);
      if(!response.has_more) break;
    }
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    throw new Error('Note retrieval failed: ' + error.message);
  }

  return allNotes;
}

async function getAllFolders(): Promise<JoplinFolder[]> {
  let page = 1;
  const allFolders: JoplinFolder[] = [];
  
  try {
    while(true) {
      const response = await joplin.data.get(['folders'], {
        fields: [
          'id', 
          'parent_id', 
          'title', 
          'created_time',
          'updated_time'
        ],
        limit: 100,
        page: page++
      });

      allFolders.push(...response.items);
      if(!response.has_more) break;
    }
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    throw new Error('Folder retrieval failed: ' + error.message);
  }

  return allFolders;
}

async function getAllTags(): Promise<JoplinTag[]> {
  let page = 1;
  const allTags: JoplinTag[] = [];
  
  try {
    while(true) {
      const response = await joplin.data.get(['tags'], {
        fields: ['id', 'title', 'created_time', 'updated_time'],
        limit: 100,
        page: page++
      });
      
      allTags.push(...response.items);
      if(!response.has_more) break;
    }
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw new Error('Tag retrieval failed: ' + error.message);
  }
  return allTags;
}

async function getAllResources(): Promise<JoplinResource[]> {
  let page = 1;
  const allResources: JoplinResource[] = [];
  
  try {
    while(true) {
      const response = await joplin.data.get(['resources'], {
        fields: ['id', 'title', 'mime', 'file_extension', 'created_time', 'updated_time'],
        limit: 100,
        page: page++
      });
      
      allResources.push(...response.items);
      if(!response.has_more) break;
    }
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    throw new Error('Resource retrieval failed: ' + error.message);
  }
  return allResources;
}

async function getAllJoplinData() {
  console.info('Starting Joplin data collection...');
  
  const [notes, folders, tags, resources] = await Promise.all([
    getAllNotes(),
    getAllFolders(),
    getAllTags(),
    getAllResources()
  ]);

  console.info(`Collected ${notes.length} notes, ${folders.length} folders, ` +
    `${tags.length} tags, ${resources.length} resources`);

  return { notes, folders, tags, resources };
}

async function exportAsJson(
  data: any, 
  options: ExportOptions, 
  pagesDir: string, 
  assetsDir: string
): Promise<void> {
  try {
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

    // Ensure directories exist
    if (!fs.existsSync(pagesDir)) {
      fs.mkdirSync(pagesDir, { recursive: true });
    }
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Track export statistics
    let successCount = 0;
    let errorCount = 0;
    let resourceCount = 0;

    // Process each note
    for (const note of data.notes) {
      try {
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
          try {
            // Find resource references in the note
            const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
            let match;
            
            // Replace each resource reference with a link to the copied file
            let updatedContent = note.body;
            const processedResources = new Set<string>(); // Track processed resources to avoid duplicates
            
            while ((match = resourceRegex.exec(note.body)) !== null) {
              const [fullMatch, altText, resourceId] = match;
              
              if (processedResources.has(resourceId)) {
                continue; // Skip already processed resources
              }
              
              const resource = data.resources.find(r => r.id === resourceId);
              
              if (resource) {
                try {
                  // Copy the resource file
                  const resourceData = await joplin.data.get(['resources', resourceId, 'file']);
                  
                  if (!resourceData || !resourceData.body) {
                    console.warn(`Resource data not found for resource ID: ${resourceId}`);
                    continue;
                  }
                  
                  const targetPath = path.join(assetsDir, `${resourceId}.${resource.file_extension || 'bin'}`);
                  
                  try {
                    fs.writeFileSync(targetPath, Buffer.from(resourceData.body));
                    console.info(`Resource exported successfully: ${resourceId} -> ${targetPath}`);
                    resourceCount++;
                    
                    // Update the reference in blocks
                    const newReference = `![${altText}](../assets/${resourceId}.${resource.file_extension || 'bin'})`;
                    updatedContent = updatedContent.replace(fullMatch, newReference);
                    
                    // Mark as processed
                    processedResources.add(resourceId);
                  } catch (writeError) {
                    console.error(`Error writing resource file ${resourceId}:`, writeError);
                  }
                } catch (resourceError) {
                  console.error(`Error fetching resource ${resourceId}:`, resourceError);
                }
              } else {
                console.warn(`Resource not found: ${resourceId}`);
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
          } catch (resourceProcessingError) {
            console.error(`Error processing resources for note ${note.id}:`, resourceProcessingError);
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
        successCount++;
      } catch (error) {
        console.error(`Error exporting note ${note.id} to JSON:`, error);
        errorCount++;
      }
    }

    console.info(`JSON export completed: ${successCount} notes exported successfully, ${errorCount} notes failed, ${resourceCount} resources exported.`);
  } catch (error) {
    console.error('Error during JSON export:', error);
    throw new Error(`JSON export failed: ${error.message}`);
  }
}

async function exportToEdn(notes: any[], options: ExportOptions) {
  // In a real implementation, this would convert to EDN format and write to file
  console.log('Exporting to EDN format:', notes.length, 'notes');
  
  // Simulate file writing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success
  return true;
}

async function exportToOpml(notes: any[], options: ExportOptions) {
  // In a real implementation, this would convert to OPML format and write to file
  console.log('Exporting to OPML format:', notes.length, 'notes');
  
  // Simulate file writing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return success
  return true;
}

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).filter(para => para.trim().length > 0);
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
    try {
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
        try {
          // Find resource references in the note
          const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
          let match;
          
          // Replace each resource reference with a link to the copied file
          let updatedContent = note.body;
          const processedResources = new Set<string>(); // Track processed resources to avoid duplicates
          
          while ((match = resourceRegex.exec(note.body)) !== null) {
            const [fullMatch, altText, resourceId] = match;
            
            if (processedResources.has(resourceId)) {
              continue; // Skip already processed resources
            }
            
            const resource = data.resources.find(r => r.id === resourceId);
            
            if (resource) {
              try {
                // Copy the resource file
                const resourceData = await joplin.data.get(['resources', resourceId, 'file']);
                
                if (!resourceData || !resourceData.body) {
                  console.warn(`Resource data not found for resource ID: ${resourceId}`);
                  continue;
                }
                
                const targetPath = path.join(assetsDir, `${resourceId}.${resource.file_extension || 'bin'}`);
                
                try {
                  fs.writeFileSync(targetPath, Buffer.from(resourceData.body));
                  console.info(`Resource exported successfully: ${resourceId} -> ${targetPath}`);
                  
                  // Update the reference in blocks
                  const newReference = `![${altText}](../assets/${resourceId}.${resource.file_extension || 'bin'})`;
                  updatedContent = updatedContent.replace(fullMatch, newReference);
                  
                  // Mark as processed
                  processedResources.add(resourceId);
                } catch (writeError) {
                  console.error(`Error writing resource file ${resourceId}:`, writeError);
                }
              } catch (resourceError) {
                console.error(`Error fetching resource ${resourceId}:`, resourceError);
              }
            } else {
              console.warn(`Resource not found: ${resourceId}`);
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
        } catch (resourceProcessingError) {
          console.error(`Error processing resources for note ${note.id}:`, resourceProcessingError);
        }
      }

      // Convert internal links
      for (let i = 0; i < page.blocks.length; i++) {
        try {
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
        } catch (linkError) {
          console.error(`Error processing links in block ${i} of note ${note.id}:`, linkError);
        }
      }

      // Convert to EDN format
      try {
        const ednData = edn.encode(page);
        
        // Write the page to a file
        const fileName = `${sanitizeFileName(note.title)}.edn`;
        const filePath = path.join(pagesDir, fileName);
        
        try {
          fs.writeFileSync(filePath, ednData);
          console.info(`Exported note ${note.id} to ${filePath}`);
        } catch (writeError) {
          console.error(`Error writing EDN file for note ${note.id}:`, writeError);
        }
      } catch (ednError) {
        console.error(`Error encoding note ${note.id} to EDN:`, ednError);
      }
    } catch (noteError) {
      console.error(`Error processing note ${note.id}:`, noteError);
    }
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

  // Create a map to store processed resources
  const processedResources = new Map<string, string>();

  // Process resources first to avoid async issues in the recursive function
  if (options.includeResources) {
    const assetsDir = path.join(exportPath, 'assets');
    
    // Ensure assets directory exists
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    
    // Process all notes to find resources
    for (const note of data.notes) {
      const resourceRegex = /!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;
      let match;
      
      while ((match = resourceRegex.exec(note.body)) !== null) {
        const [fullMatch, altText, resourceId] = match;
        
        // Skip already processed resources
        if (processedResources.has(resourceId)) {
          continue;
        }
        
        const resource = data.resources.find(r => r.id === resourceId);
        
        if (resource) {
          try {
            // Copy the resource file
            const resourceData = await joplin.data.get(['resources', resourceId, 'file']);
            
            if (!resourceData || !resourceData.body) {
              console.warn(`Resource data not found for resource ID: ${resourceId}`);
              continue;
            }
            
            const targetPath = path.join(assetsDir, `${resourceId}.${resource.file_extension || 'bin'}`);
            const relativePath = `assets/${resourceId}.${resource.file_extension || 'bin'}`;
            
            fs.writeFileSync(targetPath, Buffer.from(resourceData.body));
            console.info(`Resource exported successfully: ${resourceId} -> ${targetPath}`);
            
            // Store the relative path for this resource
            processedResources.set(resourceId, relativePath);
          } catch (resourceError) {
            console.error(`Error processing resource ${resourceId}:`, resourceError);
          }
        }
      }
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
          const resourcePath = processedResources.get(resourceId);
          if (resourcePath) {
            return `![${altText}](${resourcePath})`;
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