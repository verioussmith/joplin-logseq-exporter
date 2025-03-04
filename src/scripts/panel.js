// This script is loaded in the sidebar panel

document.addEventListener('DOMContentLoaded', function () {
    // Get the quick export button
    const quickExportButton = document.getElementById('quick-export-button');

    // Add click event listener
    if (quickExportButton) {
        quickExportButton.addEventListener('click', function () {
            // Send message to plugin
            webviewApi.postMessage({
                name: 'quickExport'
            });
        });
    }

    // Initialize settings display
    webviewApi.onMessage(function (message) {
        if (message.name === 'updateSettings') {
            const settingsElement = document.getElementById('current-settings');
            if (settingsElement) {
                settingsElement.innerHTML = message.settings;
            }
        }
    });

    // Tell the plugin we're ready
    webviewApi.postMessage({
        name: 'panelReady'
    });
}); 