// This script is loaded in the sidebar panel

document.addEventListener('DOMContentLoaded', function () {
    console.log('Logseq Exporter panel loaded');

    // Get the quick export button
    const quickExportButton = document.getElementById('quick-export-button');

    // Add click event listener
    if (quickExportButton) {
        quickExportButton.addEventListener('click', function () {
            console.log('Quick export button clicked');
            // Send message to plugin
            webviewApi.postMessage({
                name: 'quickExport'
            });
        });
    } else {
        console.error('Quick export button not found');
    }

    // Initialize settings display
    webviewApi.onMessage(function (message) {
        console.log('Message received in panel:', message);
        if (message.name === 'updateSettings') {
            const settingsElement = document.getElementById('current-settings');
            if (settingsElement) {
                settingsElement.innerHTML = message.settings;
            } else {
                console.error('Settings element not found');
            }
        }
    });

    // Tell the plugin we're ready
    console.log('Sending panelReady message');
    webviewApi.postMessage({
        name: 'panelReady'
    });
}); 