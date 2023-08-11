let zoomist;
let noSleep = new NoSleep();
let html = document.documentElement;
let imgElement;
let currentRotation = `rotate(0deg)`;
let settings = null

const ROTATION_REGEX = /rotate\((.*?)\)/gm;

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

        imgElement = document.createElement('img');
        imgElement.src = imageUrl;

        settings = { orientation: screen.orientation.type, locked: false, isFullscreen: false }

        document.getElementById("uploadForm").remove();
        document.getElementById("viewport").setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
        document.body.style.overflow = "hidden"
        document.body.style.touchAction = "pan-y, pan-x"
        // let el = document.getElementById("#zoomist");
        zoomist = new Zoomist('#zoomist', {
            maxRatio: 15,
            src: imgElement,
            fill: 'contain',
            maxRatio: 8,
            wheelable: true,
            on: {
                ready() {
                    console.log("ready")
                    document.querySelector("img").style.transform += currentRotation
                    let wrapper = document.getElementsByClassName("zoomist-wrapper")[0]
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
    let wrapper = document.getElementsByClassName("zoomist-wrapper")[0]
    wrapper.style.height = "100dvh";
}

function createHorizontalButtonPanel() {
    const mainNav = document.getElementById("navbar");
    mainNav.removeAttribute("style");

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

    let fullscreenButtonColumn = document.createElement('div')
    fullscreenButtonColumn.classList.add("col", "col-auto")
    fullscreenButtonColumn.appendChild(createFullscreenButton())
    panel.appendChild(fullscreenButtonColumn)

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
    const navigator = document.getElementById("nav");
    while (navigator.firstChild) { navigator.firstChild.remove() }
    navigator.style.height = "100%"
    navigator.style.width = "5%"
    navigator.classList.add("justify-content-center")

    const lockButtonRow = document.createElement('div')
    lockButtonRow.classList.add("row")
    if (!settings.locked) {
        let lockButtonCol = document.createElement('div');
        lockButtonCol.classList.add("col")
        lockButtonCol.appendChild(createLockButton(""))
        lockButtonRow.appendChild(lockButtonCol)
        navigator.appendChild(lockButtonRow)

        const rotateButtonRow = document.createElement('div')
        rotateButtonRow.classList.add("row", "mt-1")
        let rotateButtonCol = document.createElement('div');
        rotateButtonCol.classList.add("col")
        rotateButtonCol.appendChild(createRotateButton())
        rotateButtonRow.appendChild(rotateButtonCol)
        navigator.appendChild(rotateButtonRow)
    } else {
        let lockButtonCol = document.createElement('div');
        lockButtonCol.classList.add("col")
        lockButtonCol.appendChild(createUnlockButton(""))
        lockButtonRow.appendChild(lockButtonCol)
        navigator.appendChild(lockButtonRow)
    }

    const fullscreenButtonRow = document.createElement('div')
    fullscreenButtonRow.classList.add("row", "mt-1")
    let col = document.createElement('div')
    col.classList.add('col')
    col.appendChild(createFullscreenButton())

    fullscreenButtonRow.appendChild(col)
    navigator.appendChild(fullscreenButtonRow)

    let zoomist = document.getElementById("zoomist")
    zoomist.style.width = "100%"
    zoomist.style.marginLeft = "5%"
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
        document.querySelector("img").style.transform = currentRotation;
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

function lockImage() {
    // screen.orientation.lock(screen.orientation.type)
    zoomist.options.draggable = false
    zoomist.options.pinchable = false
    zoomist.options.wheelable = false
    settings.locked = true
    document.addEventListener('click', function enableNoSleep() {
        document.removeEventListener('click', enableNoSleep, false);
        noSleep.enable();
    }, false);
    updateButtonPanel()
}

function updateButtonPanel() {
    if (settings) {
        let isMobile = window.matchMedia("(any-pointer:coarse)").matches;
        if (/landscape/.test(screen.orientation.type) && isMobile) {
            createVerticalButtonPanel()
        }
        else {
            createHorizontalButtonPanel()
        }
    }
}

function showIosInstallModal() {
    // detect if the device is on iOS
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();

        return /iphone|ipad|ipod/.test(userAgent);
    };

    // check if the device is in standalone mode
    const isInStandaloneMode = () => {
        return (
            "standalone" in window.navigator &&
            window.navigator.standalone
        );
    };
    // show the modal only once
    console.log("isIos", isIos(), "isStandalone", isInStandaloneMode());
    const shouldShowModalResponse = isIos() && !isInStandaloneMode();
    return shouldShowModalResponse;
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
