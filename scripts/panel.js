// Logseq Exporter Panel JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Add event listener to the export button
    const exportButton = document.getElementById('quick-export-button');
    if (exportButton) {
        exportButton.addEventListener('click', function () {
            // Send message to plugin to trigger export dialog
            webviewApi.postMessage({
                name: 'quickExport'
            });
        });
    }
});

// Listen for messages from the plugin
webviewApi.onMessage(function (message) {
    if (message.name === 'updateSettings') {
        // Update the settings display
        const settingsElement = document.getElementById('current-settings');
        if (settingsElement) {
            settingsElement.innerHTML = message.settings;
        }
    }
}); 