// Logseq Exporter Panel JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('Logseq Exporter panel loaded');

    // Add event listener to the export button
    const exportButton = document.getElementById('quick-export-button');
    if (exportButton) {
        exportButton.addEventListener('click', function () {
            console.log('Quick export button clicked');
            // Send message to plugin to trigger export dialog
            webviewApi.postMessage({
                name: 'quickExport'
            });
        });
    } else {
        console.error('Quick export button not found');
    }

    // Tell the plugin we're ready
    console.log('Sending panelReady message');
    webviewApi.postMessage({
        name: 'panelReady'
    });
});

// Listen for messages from the plugin
webviewApi.onMessage(function (message) {
    console.log('Message received in panel:', message);
    if (message.name === 'updateSettings') {
        // Update the settings display
        const settingsElement = document.getElementById('current-settings');
        if (settingsElement) {
            settingsElement.innerHTML = message.settings;
        } else {
            console.error('Settings element not found');
        }
    }
}); 