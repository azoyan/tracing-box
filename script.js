let zoomist;
let noSleep = new NoSleep();
let html = document.documentElement;
let imgElement;
let currentRotation = `rotate(0deg)`;
let settings = null
const userAgent = window.navigator.userAgent
console.log(userAgent)
let isTooltipShowed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
let deferredPrompt;
let alreadyInstalled = false

const ROTATION_REGEX = /rotate\((.*?)\)/gm;

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    alreadyInstalled = true
    console.log('PWA was installed');
})

function openNativeApp(apps) {
    const psApp = apps.find((app) => app.id === "/tracing-box");
    if (psApp) {
        const toast = new bootstrap.Toast(document.getElementById('installToast'));
        const toastBody = document.getElementById("installToastBody")
        toastBody.innerHTML = `<div class="row align-items-center">
                <div class="col">Application already installed</div>
                <div class="col col-auto"><a class="btn btn-primary btn-sm" href='https://azoyan.github.io/tracing-box' target='_blank'>Open</a></div>
            </div>`
        toast.show();
    }
}

if (getPWADisplayMode() === "browser") {
    if (navigator.getInstalledRelatedApps) {
        navigator.getInstalledRelatedApps().then((apps) => {
            alreadyInstalled = apps.length > 0
            if (alreadyInstalled) {
                openNativeApp(apps)
            }
        }).catch((error) => console.log(error));
    }
    if (!alreadyInstalled) {
        const toast = new bootstrap.Toast(document.getElementById('installToast'));
        if (isIos()) {
            document.getElementById("installToastBody").innerHTML = `Install this application on your home screen for better experience and offline access. Press the <strong> “Share” </strong><i class="bi bi-box-arrow-up text-primary"> </i> button and then <strong> “Add to Home Screen” </strong><i class="bi bi-plus-square"></i>`
            toast.show()
        }
        else if (userAgent.indexOf("Firefox") > -1 && isMobile()) {
            document.getElementById("installToastBody").innerHTML = `Install this app on your home screen for better experience and offline access. Go to menu <i class="bi bi-three-dots-vertical bg-body-secondary"></i> and press the <strong> “Install" </strong> button.`
            toast.show()
        }
        else {
            window.addEventListener("beforeinstallprompt", (e) => {
                e.preventDefault();
                deferredPrompt = e;
                document.getElementById('installBtn').addEventListener('click', () => {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        } else {
                            console.log('User dismissed the install prompt');
                        }
                        deferredPrompt = null;
                        toast.hide();
                    });
                });
                toast.show();
            })
        }
    }
}

function openFullscreen() {
    // Trigger fullscreen  
    if (html.requestFullscreen) {
        html.requestFullscreen();
    } else if (html.requestFullscreen.mozRequestFullScreen) { /* Firefox */
        html.requestFullscreen.mozRequestFullScreen();
    } else if (html.requestFullscreen.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        html.requestFullscreen.webkitRequestFullscreen();
    } else if (html.webkitEnterFullscreen) { html.webkitEnterFullscreen(); }
    else if (html.children[0].webkitEnterFullscreen) {//# for Safari iPhone (where only the Video tag itself can be fullscreen)
        html.children[0].webkitEnterFullscreen();
    }
    else if (html.requestFullscreen.msRequestFullscreen) { /* IE/Edge */
        html.requestFullscreen.msRequestFullscreen();
    }
    const toast = new bootstrap.Toast(document.getElementById('toastTooltip'));
    toast.hide()
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen()
    }
    else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    const fileUpload = document.querySelector('#fileUpload');
    const uploadButton = document.querySelector('#uploadButton');
    uploadButton.addEventListener('click', () => fileUpload.click());

    const uploadButton2 = document.querySelector('#uploadButton2');
    uploadButton2.addEventListener('click', () => fileUpload.click());

    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const imageUrl = URL.createObjectURL(file);

        imgElement = document.getElementById("zoomist");
        imgElement.src = imageUrl;

        settings = { orientation: screen.orientation.type, locked: false, isFullscreen: false }

        document.getElementById("uploadForm").remove();
        document.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
        document.body.style.overflow = "hidden"
        document.body.style.touchAction = "pan-y, pan-x"
        // let el = document.getElementById("#zoomist");
        zoomist = new Zoomist('.zoomist-container', {
            maxScale: 15,
            minScale: 0.1,
            initScale: 1,
            // src: imgElement,
            fill: 'contain',
            maxRatio: 8,
            wheelable: true,
            draggable: true,
            pinchable: true,
            bounds: true,
            zoomRatio: 0.1,
            on: {
                ready() {
                    console.log("ready")
                    document.querySelector("img").style.transform += currentRotation
                    let wrapper = document.getElementsByClassName("zoomist-container")[0]
                    wrapper.style.height = "100dvh";
                },
                zoom() {
                    transformImage("zoom")
                },
                wheel() {
                    transformImage("wheel")
                },
                drag() {
                    transformImage("drag")
                },
                pinch() {
                    transformImage("pinch")
                },
            }
        })
        updateButtonPanel()
    });
});

function transformImage(debugText) {
    let transform = document.querySelector("img").style.transform.replaceAll(ROTATION_REGEX, "") + currentRotation;
    console.log("zoom", currentRotation, transform)
    document.querySelector("img").style.transform = transform
    let wrapper = document.getElementsByClassName("zoomist-container")[0]
    wrapper.style.height = "100dvh";
}

function createHorizontalButtonPanel() {
    const mainNav = document.getElementById("navbar");
    mainNav.removeAttribute("style");
    mainNav.classList.add("navbar-expand-lg")

    const navigator = document.getElementById("nav");
    navigator.classList.add("justify-content-center")
    while (navigator.firstChild) { navigator.firstChild.remove() }

    navigator.removeAttribute("style");

    const panel = document.createElement('div')
    panel.classList.add("row")

    const lockButtonColumn = document.createElement('div')
    lockButtonColumn.classList.add("col", "col-auto")
    if (!settings.locked) {
        lockButtonColumn.appendChild(createLockButton("Lock"))
        panel.appendChild(lockButtonColumn)
        const rotateButtonColumn = document.createElement('div')
        rotateButtonColumn.classList.add("col", "col-auto")
        rotateButtonColumn.appendChild(createRotateButton())
        panel.appendChild(rotateButtonColumn)
    } else {
        panel.appendChild(lockButtonColumn)
        lockButtonColumn.appendChild(createUnlockButton("Unlock"))
    }
    if (!/iPhone/.test(userAgent)) {
        let fullscreenButtonColumn = document.createElement('div')
        fullscreenButtonColumn.classList.add("col", "col-auto")
        fullscreenButtonColumn.appendChild(createFullscreenButton())
        panel.appendChild(fullscreenButtonColumn)
    }
    console.log(userAgent)

    navigator.appendChild(panel)
    mainNav.appendChild(navigator)

    let zoomist = document.getElementById("zoomist")
    zoomist.style.width = "100%"
    zoomist.style.marginLeft = "0%"
}

function createVerticalButtonPanel() {
    const mainNav = document.getElementById("navbar");

    mainNav.style.width = "5%"
    mainNav.style.height = "100%"
    mainNav.style.position = "fixed"
    mainNav.style.flexDirection = "column"
    mainNav.classList.remove("navbar-expand-lg")
    const navigator = document.getElementById("nav");
    while (navigator.firstChild) { navigator.firstChild.remove() }
    navigator.style.height = "100%"
    navigator.style.width = "5%"
    navigator.classList.add("justify-content-center")

    const fullscreenButtonRow = document.createElement('div')
    fullscreenButtonRow.classList.add("row", "mt-1")
    let col = document.createElement('div')
    col.classList.add('col')
    col.appendChild(createFullscreenButton())

    fullscreenButtonRow.appendChild(col)
    navigator.appendChild(fullscreenButtonRow)

    const lockButtonRow = document.createElement('div')
    lockButtonRow.classList.add("row")

    const rotateButtonRow = document.createElement('div')
    rotateButtonRow.classList.add("row", "mt-1")
    const rotateButtonCol = document.createElement('div');
    rotateButtonCol.classList.add("col")
    const rotateButton = createRotateButton()
    rotateButtonCol.appendChild(rotateButton)
    rotateButtonRow.appendChild(rotateButtonCol)

    navigator.appendChild(rotateButtonRow)
    mainNav.style.width = (rotateButton.getBoundingClientRect().width + 4) + 'px';

    if (!settings.locked) {
        let lockButtonCol = document.createElement('div');
        lockButtonCol.classList.add("col")
        lockButtonCol.appendChild(createLockButton(""))
        lockButtonRow.appendChild(lockButtonCol)
        navigator.appendChild(lockButtonRow)
    } else {
        let lockButtonCol = document.createElement('div');
        lockButtonCol.classList.add("col")
        lockButtonCol.appendChild(createUnlockButton(""))
        lockButtonRow.appendChild(lockButtonCol)
        navigator.appendChild(lockButtonRow)
        rotateButton.style.visibility = "hidden";
    }


    let zoomist = document.getElementById("zoomist")
    zoomist.style.width = "100%"
    zoomist.style.marginLeft = mainNav.style.width
}

function createLockButton(text) {
    let button = document.createElement('button');
    button.classList.add("btn", "btn-outline-primary", "btn-sm", "d-flex", "align-items-center")
    button.onclick = lockImage

    button.innerHTML += `<i class="bi bi-lock"></i>`
    button.innerHTML += `<span class="d-none d-sm-inline">${text}</span>`
    return button
}
let rotation = 0;

function createRotateButton() {
    let button = document.createElement('button');
    button.classList.add("btn", "btn-outline-primary", "btn-sm", "d-flex", "align-items-center")
    button.type = "button"
    button.onclick = function () {
        rotation -= 90;
        if (rotation === -360) {
            // 360 means rotate back to 0
            rotation = 0;
        }
        currentRotation = `rotate(${rotation}deg)`
        document.getElementById("zoomist").style.transform = currentRotation;
        // document.querySelector("img").style.transform.replace(ROTATION_REGEX, currentRotation)
    }

    // button.innerHTML += `<i class="bi bi-arrow-90deg-left"></i>Rotate 90°`
    button.innerText += `90°`
    return button
}

function createFullscreenButton() {
    let button = document.createElement('button');
    button.classList.add("btn", "btn-outline-secondary", "btn-sm", "d-flex", "align-items-center")
    console.log("isNotFullScreen", !document.fullscreenElement)
    if (!document.fullscreenElement) {
        button.innerHTML = `<i class="bi bi-arrows-fullscreen"></i>`
    }
    else {
        button.innerHTML = `<i class="bi bi-fullscreen-exit"></i>`
    }
    document.addEventListener("fullscreenchange", (event) => {
        if (document.fullscreenElement == null) {
            console.log("exit fullscreen")
            button.innerHTML = `<i class="bi bi-arrows-fullscreen"></i>`
            settings.isFullscreen = false
        }
        else {
            console.log("enter fullscreen")
            button.innerHTML = `<i class="bi bi-fullscreen-exit"></i>`
            settings.isFullscreen = true
            lockOrientation()
        }
    });
    button.onclick = function () {
        if (document.fullscreenElement == null) {
            openFullscreen()
        } else {
            closeFullscreen()
        }
    }

    return button
}

function createLabel(text) {
    // <label for="customRange3" class="form-label">Example range</label>
    let label = document.createElement('label')
    label.for = 'lockRange'
    label.classList.add('form-label')
    label.innerText = text
    return label
}
function createUnlockButton(text) {
    let button = document.createElement('button');
    button.classList.add("btn", "btn-outline-success", "btn-sm", "d-flex", "align-items-center")
    button.onclick = unlockImage
    button.innerHTML += `<i class="bi bi-unlock"></i>`
    button.innerHTML += `<span class="d-none d-sm-inline">${text}</span>`
    return button
}

function unlockImage() {
    // screen.orientation.unlock()
    settings.locked = false
    zoomist.options.draggable = true
    zoomist.options.pinchable = true
    zoomist.options.wheelable = true
    noSleep.disable()
    updateButtonPanel()
}

function isMobile() {
    let hasTouchScreen = false;
    if ("maxTouchPoints" in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ("msMaxTouchPoints" in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
    } else {
        const mQ = matchMedia?.("(pointer:coarse)");
        if (mQ?.media === "(pointer:coarse)") {
            hasTouchScreen = !!mQ.matches;
        } else if ("orientation" in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            hasTouchScreen =
                /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(userAgent) ||
                /\b(Android|Windows Phone|iPad|iPod)\b/i.test(userAgent);
        }
    }
    return hasTouchScreen
}

function showToast(text) {
    const toast = new bootstrap.Toast(document.getElementById('toastTooltip'));
    const toastBody = document.getElementById("toast-body");
    toastBody.innerHTML = text
    toast.show()
}

function lockOrientation() {
    let orientation = screen.orientation.type;
    let textContent = "text-content:" + orientation
    screen.orientation.lock(orientation)
        .then(() => {
            textContent = `Locked to ${orientation}\n`;
        })
        .catch((error) => {
            textContent += `Error: ${error}\n`;
            if (error instanceof DOMException && error.name === "NotSupportedError") {
                console.error("This feature is not supported on your device.");
                if (!isTooltipShowed) {
                    showToast("Lock Orientation in your device to prevent rotation")
                    isTooltipShowed = true
                }
            } else if (error instanceof DOMException && error.name === "SecurityError") {
                // console.error("You do not have permission to perform this action.");

                console.log("useragent:", userAgent);
                let isFirefox = userAgent.indexOf("Firefox") > -1;

                if (!settings.isFullscreen && !isTooltipShowed) {
                    if (isFirefox) {
                        isTooltipShowed = true
                        showToast("Lock Orientation in your device to prevent rotation")
                    }
                    else {
                        const html = `<div class="row align-items-center">
                            <div class="col">Press <strong>Fullscreen</strong> to hold device orientation</div>
                            <div class="col col-auto">
                                <button class="btn btn-outline-secondary btn-sm bi bi-arrows-fullscreen" onclick="openFullscreen()">
                                </button>
                            </div>
                        </div>`
                        showToast(html)
                    }
                }
            } else if (error instanceof TypeError) {
                console.error("There is a problem with the data type of one of your variables.");
            } else {
                console.error("An unknown error occurred.");
            }
            // alert(error, textContent)
        });
}

function lockImage() {
    zoomist.options.draggable = false
    zoomist.options.pinchable = false
    zoomist.options.wheelable = false
    settings.locked = true
    noSleep.enable();
    lockOrientation()


    updateButtonPanel()
}

function updateButtonPanel() {
    if (settings) {
        if (/landscape/.test(screen.orientation.type) && isMobile()) {
            createVerticalButtonPanel()
        }
        else {
            createHorizontalButtonPanel()
        }
    }
}
function isIos() {
    return /iPhone|iPad|iPod/.test(userAgent);
}


function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    } else if (navigator.standalone || isStandalone) {
        return 'standalone';
    }
    return 'browser';
}

function isInStandaloneMode() {
    return "standalone" === getPWADisplayMode()
}

window.addEventListener("orientationchange", () => {
    console.log(`The orientation of the screen is: ${screen.orientation.type}`);
    if (settings !== null) {
        if (/landscape/.test(screen.orientation.type)) {
            createVerticalButtonPanel()
        } else {
            createHorizontalButtonPanel()
        }
    }
});



document.addEventListener('visibilitychange', function () {
    if (document.visiblityState == 'hidden') {

    }
    else if (document.visibilityState == 'visible') {
        updateButtonPanel()
    }
});

