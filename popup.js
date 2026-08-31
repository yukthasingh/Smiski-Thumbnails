document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('SmiskiButton');

    // load current saved setting
    chrome.storage.sync.get(['smiskiEnabled'], (result) => {
        if (result.smiskiEnabled === undefined) {
            toggleButton.checked = result.smiskiEnabled;
        } else {
            toggleButton.checked = true;
        }
    });

    // save state when button pressed
    toggleButton.addEventListener('change', () => {
        chrome.storage.sync.set ({ smiskisEnabled: toggleButton.checked });
    });
});