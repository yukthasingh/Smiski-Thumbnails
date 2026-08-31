document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('SmiskiButton');

    // helper function to update button text and color class
    function updateButtonUI(isEnabled) {
        if (isEnabled) {
            button.textContent = 'Click to disable!';
            button.className = 'enabled';
        } else {
            button.textContent = 'Click to enable!';
            button.className = 'disabled';
        }
    }

    // load current saved setting
    chrome.storage.sync.get(['smiskiEnabled'], (result) => {
        const isEnabled = result.smiskiEnabled !== false; // default to true if undefined
        updateButtonUI(isEnabled);
    });

    // save state when button pressed
    button.addEventListener('change', () => {
        chrome.storage.sync.get(['smiskiEnabled'], (result) => {
            const currentState = result.smiskiEnabled !== false; // default to true if undefined
            const newState = !currentState; // toggle state

            chrome.storage.sync.set({ smiskiEnabled: newState }, () => {
                updateButtonUI(newState); // update button UI after saving
            })
        })
    })
})