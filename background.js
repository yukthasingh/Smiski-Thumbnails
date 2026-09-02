console.log("Smiski backgorund.js is running");

// listen for msgs from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("recieved message in background.js:", message);

    if (message.event == "toggleSmiski") {
        const newState = message.enabled;

        console.log("Received toggleSmiski:", newState)

        // save setting
        chrome.storage.sync.set(
            {
                smiskiEnabled: newState
            },
            () => {
                console.log("Smiski setting saved:", newState);
            }
        );

        chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
            tabs.forEach((tab) => {
                if (!tab.id) {
                    return;
                }

                chrome.tabs.sendMessage(
                    tab.id, {
                    event: "smiskiToggleChanged",
                    enabled: newState
                })
            })
        })

        sendResponse({
            status: "success"
        })

        return true;
    }
})