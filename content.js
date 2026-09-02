(() => {
    console.log("Smisk-tube content.js is running");

    const TOTAL_IMAGES = 64;
    const OVERLAY_CLASS = "smiski-overlay";

    let smiskisEnabled = true;

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomImageURL() {
        const number = getRandomNumber(1, TOTAL_IMAGES);
        return chrome.runtime.getURL(`images/s_${number}.png`);
    }

    // These target the ACTUAL thumbnail images used by YouTube.
    const THUMBNAIL_IMAGE_SELECTORS = [
        ".ytThumbnailViewModelImage img",
        "yt-thumbnail-view-model img.ytCoreImageHost",
        "yt-thumbnail-view-model img",
        "ytd-thumbnail img",
        "a.ytd-thumbnail img"
    ];

    function getThumbnailImages() {
        const images = new Set();

        for (const selector of THUMBNAIL_IMAGE_SELECTORS) {
            document.querySelectorAll(selector).forEach((image) => {
                if (image instanceof HTMLImageElement) {
                    images.add(image);
                }
            });
        }

        return [...images];
    }

    function getOverlayContainer(image) {
        return image.parentElement;
    }

    function createSmiski(image) {
        const container = getOverlayContainer(image);

        if (!container) {
            return;
        }

        // Don't add another Smiski if this thumbnail already has one.
        if (container.querySelector(`:scope > .${OVERLAY_CLASS}`)) {
            return;
        }

        const rect = image.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            return;
        }

        // Make the image's parent a positioning container.
        const computedPosition = getComputedStyle(container).position;

        if (computedPosition === "static") {
            container.style.position = "relative";
        }

        const smiski = document.createElement("img");

        smiski.className = OVERLAY_CLASS;
        smiski.src = getRandomImageURL();
        smiski.alt = "";
        smiski.draggable = false;

        smiski.style.position = "absolute";
        smiski.style.zIndex = "10";
        smiski.style.pointerEvents = "none";
        smiski.style.display = "block";
        smiski.style.visibility = "visible";
        smiski.style.opacity = "1";

        // Random Smiski size.
        smiski.style.height = "auto";
        smiski.style.maxWidth = "100%";

        smiski.style.margin = "0";
        smiski.style.padding = "0";
        smiski.style.objectFit = "contain";


        smiski.style.top = "50%";
        smiski.style.left = "50%";
        smiski.style.transform =
            "translate(-50%, -50%)";
        smiski.style.height = "130%";

        smiski.onload = () => {
            console.log("Smiski loaded:", smiski.src);
        }

        smiski.onerror = () => {
            console.error(
                "Smiski failed to load:",
                smiski.src
            );
        }

        container.appendChild(smiski);
    }

    function removeSmiskis() {
        document
            .querySelectorAll(`.${OVERLAY_CLASS}`)
            .forEach((smiski) => {
                smiski.remove();
            });
    }

    function scanThumbnails() {
        if (!smiskisEnabled) {
            return;
        }

        const images = getThumbnailImages();

        console.log(
            "Found thumbnail images:",
            images.length
        );

        for (const image of images) {
            createSmiski(image);
        }
    }

    function loadSetting() {
        chrome.storage.sync.get(
            ["smiskiEnabled"],
            (result) => {

                if (chrome.runtime.lastError) {
                    console.error(
                        "Could not load Smiski setting:",
                        chrome.runtime.lastError
                    );

                    return;
                }

                smiskisEnabled =
                    result.smiskiEnabled !== false;

                console.log(
                    "Smiski enabled setting:",
                    smiskisEnabled
                );

                if (smiskisEnabled) {
                    scanThumbnails();
                } else {
                    removeSmiskis();
                }
            })
    }

    chrome.runtime.onMessage.addListener(
        (message) => {

            if (
                message.event !==
                "smiskiToggleChanged"
            ) {
                return;
            }

            smiskisEnabled =
                Boolean(message.enabled);

            console.log(
                "Smiski toggle changed:",
                smiskisEnabled
            );

            if (smiskisEnabled) {
                scanThumbnails();
            } else {
                removeSmiskis();
            }
        })

    loadSetting();

    // YouTube constantly loads new thumbnails.
    setInterval(
        scanThumbnails,
        250
    )

    // Also detect changes to the YouTube page.
    const observer =
        new MutationObserver(() => {

            if (smiskisEnabled) {
                scanThumbnails();
            }
        })

    function startObserver() {

        if (!document.body) {
            return;
        }

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            })

        console.log(
            "MutationObserver started"
        );
    }

    if (document.body) {
        startObserver();
    } else {
        window.addEventListener(
            "DOMContentLoaded",
            startObserver,
            { once: true }
        )
    }
})()