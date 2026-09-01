console.log('this is content.js'); // log to console for debugging purposes

function getRandomNumber(min, max) { // this function generates a random number between a min and max inclusive so we can plug in this returned number in determining where the smiski will be placed on the thumbnail :D
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkAndRun() {
    if (!chrome.runtime || !chrome.runtime.id) return; // check if the extension is running in a valid context

    chrome.storage.sync.get(['smiskiEnabled'], (result) => {
        if (chrome.runtime.lastError) return; // handle potential errors

        // run only if smiskisEnabled is true
        if (result.smiskiEnabled !== false) {
            addSmiskis(); // call the function to add smiskis to thumbnails
        } else {
            removeSmiskis(); // call the function to remove smiskis from thumbnails
        }
    })
}

function removeSmiskis() {
    document.querySelectorAll('.smiski-img').forEach(img => img.remove());
    document.querySelectorAll('.smiski-added').forEach(el => el.classList.remove('smiski-added'));
}

function addSmiskis() { // function to add smiskis

    const totalImages = 64;

    // find thumbnails on  youtube as a container
    const thumbnails = document.querySelectorAll('ytd-thumbnail:not(.smiski-added)', 'ytd-rich-grid-media #thumbnail:not(.smiski-added)', 'ytd-video-renderer #thumbnail:not(.smiski-added)', 'ytd-grid-video-renderer #thumbnail:not(.smiski-added)', 'ytd-playlist-video-renderer #thumbnail:not(.smiski-added)', 'ytd-compact-video-renderer #thumbnail:not(.smiski-added)', 'ytd-compact-playlist-renderer #thumbnail:not(.smiski-added)');

    thumbnails.forEach(thumbnail => {
        thumbnail.classList.add('smiski-added'); // mark thumbnail as processed
        thumbnail.style.position = 'relative';
        thumbnail.style.overflow = 'hidden'; // makes sure the smiskis don't go outside of the thumbnail

        const smiski = document.createElement('img');
        smiski.classList.add('smiski-img');

        // below does the random image selection for the smiski
        const smiskiImages = getRandomNumber(1, totalImages);
        smiski.src = chrome.runtime.getURL(`images/s_${smiskiImages}.png`);

        smiski.style.position = 'absolute';
        smiski.style.zIndex = '9999'; // ensures smiski is on top of the thumbnail
        smiski.style.pointerEvents = 'none'; // makes sure that the smiski doesn't interfere with clicking on thumbnails

        // random positioning logic 

        const placement = getRandomNumber(1, 5); // gets a random number; 1: top left, 2: top right, 3: bottom left, 4: bottom right, 5: middle
        const randomX = getRandomNumber(0, Math.max(0, thumbnail.offsetWidth - 50)); // random x position within the thumbnail width
        const randomY = getRandomNumber(0, Math.max(0, thumbnail.offsetHeight - 50)); // random y position within the thumbnail height

        if (placement === 1) {
            smiski.style.top = `${randomY}px`;
            smiski.style.left = `${randomX}px`;
        } else if (placement === 2) {
            smiski.style.top = `${randomY}px`;
            smiski.style.right = `${randomX}px`;
        } else if (placement === 3) {
            smiski.style.bottom = `${randomY}px`;
            smiski.style.left = `${randomX}px`;
        } else if (placement === 4) {
            smiski.style.bottom = `${randomY}px`;
            smiski.style.right = `${randomX}px`;
        } else {
            smiski.style.top = '50%';
            smiski.style.left = '50%';
            smiski.style.transform = 'translate(-50%, -50%)';
        }

        const randomSize = getRandomNumber(30, 60); // random size between 30px and 60px
        smiski.style.width = `${randomSize}px`;
        smiski.style.height = 'auto'; // maintain aspect ratio

        // okay so basically this whole thing above this comment is making modications to each smiski image to make sure it fits on each thumbnail and that it has variation on each thumbnail

        // add smiski to each thumbnail
        thumbnail.appendChild(smiski);
    })
}

checkAndRun(); // call the function to check the setting and run the script

// listen to updates sent from popup.js in real time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.smiskiEnabled) {
        checkAndRun(); // re-run the function to check the setting and run the script
    }
})

// observe the youtube page when it updates so more smiskis load
const observer = new MutationObserver(() => {
    checkAndRun();
})

if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true })
} else {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true })
    })
}