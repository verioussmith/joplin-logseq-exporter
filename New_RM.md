I wrote the @Joplin_To_Logseq_Plugin_Export_Roadmap.md  at the beginning of the project without  much reference to the actual documentation or previous examples.   Our Codebase is currently further along than a codebase that  has not begun.  I would like to rewrite this Roadmap to cover the things we have implemented and the things that we need to implement to accomplish our goal.

OUR GOAL:  Create a Plugin for Joplin that conforms completely to the Joplin API Reference Documentation that will function and allow a user to export Joplin Notes, Notebooks & Tags in a way that is compatible with Logseq.  The only formats we want to accomodate are JSON, EDN & OMPL.  The plugin should have a funcctional Joplin Settings Page to configure default export format, default export path directory,  option to include attachments, options to create seperate block by paragraphs,

While writing this new roadmap include CURRENT CODEBASE PROGRESS, TASKS COMPLETED,  PLUGIN TASKS  REMAINING(EXCLUDE TESTING), DOCUMENTATION REFERENCES FOR NEEDED IMPLEMENTATIONS, CODING PATTERN USED FROM EXAMPLES.

API Docs: @https://joplinapp.org/api/references/plugin_api/classes/joplin.html 

Plugin Getting Started:
@https://joplinapp.org/help/api/get_started/plugins/ 

Plugin Tutorials:

TOC Plugin Tutorial
@https://joplinapp.org/help/api/tutorials/toc_plugin/

Markdow Editor Plugin Tutorial 
@https://joplinapp.org/help/api/tutorials/cm6_plugin 

EXAMPLES CODE
TOC Plugin Code: https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/toc/

 Markdown Editor Plugin Code:  https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins/codemirror5-and-codemirror6/ 
