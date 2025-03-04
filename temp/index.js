module.exports=function(e){var t={};function o(n){if(t[n])return t[n].exports;var i=t[n]={i:n,l:!1,exports:{}};return e[n].call(i.exports,i,i.exports,o),i.l=!0,i.exports}return o.m=e,o.c=t,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)o.d(n,i,function(t){return e[t]}.bind(null,i));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=0)}([function(e,t,o){"use strict";var n=this&&this.__awaiter||function(e,t,o,n){return new(o||(o=Promise))((function(i,r){function s(e){try{a(n.next(e))}catch(e){r(e)}}function l(e){try{a(n.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,l)}a((n=n.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const i=o(1),r=o(2);joplin.plugins.register({onStart:function(){return n(this,void 0,void 0,(function*(){yield joplin.commands.register({name:"exportToLogseq",label:"Export to Logseq",iconName:"fas fa-file-export",execute:()=>n(this,void 0,void 0,(function*(){yield function(){return n(this,void 0,void 0,(function*(){const e=joplin.views.dialogs,t=yield e.create("exportToLogseqDialog");yield e.setHtml(t,'\n    <h3>Export to Logseq</h3>\n    <form>\n      <div style="margin-bottom: 10px;">\n        <label>Format:</label>\n        <select id="format" style="width: 100%;">\n          <option value="json">JSON</option>\n          <option value="edn">EDN</option>\n          <option value="opml">OPML</option>\n        </select>\n      </div>\n      <div style="margin-bottom: 10px;">\n        <label>Export path:</label>\n        <input type="text" id="path" style="width: 100%;" placeholder="e.g., /path/to/logseq/export">\n      </div>\n      <div style="margin-bottom: 10px;">\n        <input type="checkbox" id="includeResources" checked>\n        <label for="includeResources">Include resources/attachments</label>\n      </div>\n      <div style="margin-bottom: 10px;">\n        <input type="checkbox" id="splitByParagraph" checked>\n        <label for="splitByParagraph">Split notes by paragraph</label>\n      </div>\n    </form>\n  '),yield e.setButtons(t,[{id:"cancel",title:"Cancel"},{id:"export",title:"Export"}]);const o=yield e.open(t);if("export"===o.id){const t=o.formData.format,n=o.formData.path,i=o.formData.includeResources,s=o.formData.splitByParagraph;if(!n)return void(yield e.showMessageBox("Please specify an export path."));yield joplin.views.dialogs.showMessageBox("Starting export... This may take a while depending on the number of notes."),yield r.exportToLogseq({format:t,path:n,includeResources:i,splitByParagraph:s})}}))}()}))}),yield joplin.views.menuItems.create("exportToLogseqMenuItem","exportToLogseq",i.MenuItemLocation.Tools),yield joplin.views.toolbarButtons.create("exportToLogseqButton","exportToLogseq",i.ToolbarButtonLocation.NoteToolbar),console.info("Joplin to Logseq Exporter plugin loaded")}))}})},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.ToolbarButtonLocation=t.MenuItemLocation=void 0,function(e){e[e.File=1]="File",e[e.Edit=2]="Edit",e[e.View=3]="View",e[e.Note=4]="Note",e[e.Tools=5]="Tools",e[e.Help=6]="Help"}(t.MenuItemLocation||(t.MenuItemLocation={})),function(e){e[e.NoteToolbar=1]="NoteToolbar",e[e.EditorToolbar=2]="EditorToolbar"}(t.ToolbarButtonLocation||(t.ToolbarButtonLocation={}))},function(e,t,o){"use strict";var n=this&&this.__createBinding||(Object.create?function(e,t,o,n){void 0===n&&(n=o),Object.defineProperty(e,n,{enumerable:!0,get:function(){return t[o]}})}:function(e,t,o,n){void 0===n&&(n=o),e[n]=t[o]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var o in e)"default"!==o&&Object.hasOwnProperty.call(e,o)&&n(t,e,o);return i(t,e),t},s=this&&this.__awaiter||function(e,t,o,n){return new(o||(o=Promise))((function(i,r){function s(e){try{a(n.next(e))}catch(e){r(e)}}function l(e){try{a(n.throw(e))}catch(e){r(e)}}function a(e){var t;e.done?i(e.value):(t=e.value,t instanceof o?t:new o((function(e){e(t)}))).then(s,l)}a((n=n.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.exportToLogseq=void 0;const l=o(3),a=r(o(4)),c=o(5),d=r(o(6));function u(e){return e.replace(/[/\\?%*:|"<>]/g,"-")}function p(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;")}t.exportToLogseq=function(e){return s(this,void 0,void 0,(function*(){try{a.existsSync(e.path)||a.mkdirpSync(e.path,{recursive:!0});const t=c.join(e.path,"pages");a.existsSync(t)||a.mkdirpSync(t,{recursive:!0});let o="";e.includeResources&&(o=c.join(e.path,"assets"),a.existsSync(o)||a.mkdirpSync(o,{recursive:!0}));const n=yield function(){return s(this,void 0,void 0,(function*(){const e=yield joplin.data.get(["folders"],{fields:["id","title","parent_id"]}),t=yield joplin.data.get(["notes"],{fields:["id","parent_id","title","body","created_time","updated_time","user_created_time","user_updated_time"]}),o=yield joplin.data.get(["tags"],{fields:["id","title"]}),n=yield joplin.data.get(["notes","tags"],{fields:["id","note_id","tag_id"]}),i=yield joplin.data.get(["resources"],{fields:["id","title","mime","filename","file_extension"]});return{folders:e.items,notes:t.items,tags:o.items,noteTags:n.items,resources:i.items}}))}();switch(e.format){case"json":yield function(e,t,o,n){return s(this,void 0,void 0,(function*(){const i=new Map;for(const t of e.noteTags){i.has(t.note_id)||i.set(t.note_id,[]);const o=e.tags.find(e=>e.id===t.tag_id);o&&i.get(t.note_id).push(o.title)}for(const r of e.notes){const s={title:r.title,properties:{id:r.id,created:new Date(r.created_time).toISOString(),updated:new Date(r.updated_time).toISOString()},blocks:[]},d=i.get(r.id)||[];if(d.length>0&&(s.properties.tags=d),t.splitByParagraph){const e=r.body.split(/\n\s*\n/);s.blocks=e.map(e=>({id:l.v4(),content:e.trim()}))}else s.blocks=[{id:l.v4(),content:r.body}];if(t.includeResources){const o=/!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;let i,d=r.body;for(;null!==(i=o.exec(r.body));){const[t,o,r]=i,s=e.resources.find(e=>e.id===r);if(s){const e=yield joplin.data.get(["resources",r,"file"]),i=c.join(n,`${r}.${s.file_extension}`);a.writeFileSync(i,Buffer.from(e.body));const l=`![${o}](../assets/${r}.${s.file_extension})`;d=d.replace(t,l)}}if(t.splitByParagraph){const e=d.split(/\n\s*\n/);s.blocks=e.map(e=>({id:l.v4(),content:e.trim()}))}else s.blocks=[{id:l.v4(),content:d}]}for(let t=0;t<s.blocks.length;t++){const o=/\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;let n=s.blocks[t].content;n=n.replace(o,(t,o,n)=>{const i=e.notes.find(e=>e.id===n);return i?`[[${i.title}]]`:t}),s.blocks[t].content=n}const p=u(r.title)+".json",f=c.join(o,p);a.writeFileSync(f,JSON.stringify(s,null,2))}}))}(n,e,t,o);break;case"edn":yield function(e,t,o,n){return s(this,void 0,void 0,(function*(){const i=new Map;for(const t of e.noteTags){i.has(t.note_id)||i.set(t.note_id,[]);const o=e.tags.find(e=>e.id===t.tag_id);o&&i.get(t.note_id).push(o.title)}for(const r of e.notes){const s={title:r.title,properties:{id:r.id,created:new Date(r.created_time).toISOString(),updated:new Date(r.updated_time).toISOString()},blocks:[]},p=i.get(r.id)||[];if(p.length>0&&(s.properties.tags=p),t.splitByParagraph){const e=r.body.split(/\n\s*\n/);s.blocks=e.map(e=>({id:l.v4(),content:e.trim()}))}else s.blocks=[{id:l.v4(),content:r.body}];if(t.includeResources){const o=/!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;let i,d=r.body;for(;null!==(i=o.exec(r.body));){const[t,o,r]=i,s=e.resources.find(e=>e.id===r);if(s){const e=yield joplin.data.get(["resources",r,"file"]),i=c.join(n,`${r}.${s.file_extension}`);a.writeFileSync(i,Buffer.from(e.body));const l=`![${o}](../assets/${r}.${s.file_extension})`;d=d.replace(t,l)}}if(t.splitByParagraph){const e=d.split(/\n\s*\n/);s.blocks=e.map(e=>({id:l.v4(),content:e.trim()}))}else s.blocks=[{id:l.v4(),content:d}]}for(let t=0;t<s.blocks.length;t++){const o=/\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;let n=s.blocks[t].content;n=n.replace(o,(t,o,n)=>{const i=e.notes.find(e=>e.id===n);return i?`[[${i.title}]]`:t}),s.blocks[t].content=n}const f=d.encode(s),g=u(r.title)+".edn",y=c.join(o,g);a.writeFileSync(y,f)}}))}(n,e,t,o);break;case"opml":yield function(e,t,o){return s(this,void 0,void 0,(function*(){let n='<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n  <head>\n    <title>Joplin Export</title>\n  </head>\n  <body>\n';const i=new Map;for(const t of e.folders)i.has(t.parent_id)||i.set(t.parent_id,[]),i.get(t.parent_id).push(t);const r=new Map;for(const t of e.notes)r.has(t.parent_id)||r.set(t.parent_id,[]),r.get(t.parent_id).push(t);const s=new Map;for(const t of e.noteTags){s.has(t.note_id)||s.set(t.note_id,[]);const o=e.tags.find(e=>e.id===t.tag_id);o&&s.get(t.note_id).push(o.title)}n+=function o(n,l){let a="";const c=i.get(n)||[];for(const e of c)a+=`${l}<outline text="${p(e.title)}">\n`,a+=o(e.id,l+"  "),a+=l+"</outline>\n";const d=r.get(n)||[];for(const o of d){let n=o.body;const i=/\[([^\]]+)\]\(:\/([a-f0-9]+)\)/g;if(n=n.replace(i,(t,o,n)=>{const i=e.notes.find(e=>e.id===n);return i?`[[${i.title}]]`:t}),t.includeResources){const t=/!\[([^\]]*)\]\(:\/([a-f0-9]+)\)/g;n=n.replace(t,(t,o,n)=>{const i=e.resources.find(e=>e.id===n);return i?`![${o}](../assets/${n}.${i.file_extension})`:t})}const r=s.get(o.id)||[],c=r.length>0?` _tags="${p(r.join(","))}"`:"",d=` _created="${new Date(o.created_time).toISOString()}"`,u=` _updated="${new Date(o.updated_time).toISOString()}"`;a+=`${l}<outline text="${p(o.title)}"${c}${d}${u} _note="${p(n)}"/>\n`}return a}("","  "),n+="  </body>\n</opml>";const l=c.join(o,"joplin-export.opml");a.writeFileSync(l,n)}))}(n,e,e.path)}yield joplin.views.dialogs.showMessageBox("Export completed successfully!")}catch(e){console.error("Export error:",e),yield joplin.views.dialogs.showMessageBox("Export failed: "+e.message)}}))}},function(e,t){e.exports=require("uuid")},function(e,t){e.exports=require("fs-extra")},function(e,t){e.exports=require("path")},function(e,t){e.exports=require("edn-data")}]);