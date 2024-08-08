const canvas = document.getElementById("drawing");
const context = canvas.getContext("2d");

const radiusInput = document.getElementById("radius")
const eraserInput = document.getElementById("eraser")
const colorInput = document.getElementById("fillColor")

const toolInput = document.getElementById("mode")

let clicking = false;

let lastPos = null;
let lastTouches = {};

function endClicking() {
    lastPos = null
    clicking = false;
}

function convertTouchToMouse(TouchEvent, returnFunction) {
    if (TouchEvent == undefined) return
    if (TouchEvent.touches == undefined || returnFunction == undefined) return

    for (const touch of TouchEvent.touches) {
        const offset = {
            offsetX: touch.clientX - canvas.offsetLeft,
            offsetY: touch.clientY - canvas.offsetTop
        }

        const x = (offset.offsetX / canvas.offsetWidth) * canvas.width;
        const y = (offset.offsetY / canvas.offsetHeight) * canvas.height;

        lastTouches[event.identifier] = { y: y, x: x }

        returnFunction({
            ...touch,
            identifier: touch.identifier,
            force: touch.force,
            ...offset
        }, true)
    }
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height)
}

function painting(event, isTouch) {
    if (clicking == false) return;

    if (toolInput.value != "brush" && toolInput.value != "eraser") return;

    let identifier = -1
    if (event.identifier != undefined) {
        isTouch = true;
        identifier = event.identifier
    }

    let force = 1
    if (event.force != undefined) force = event.force

    const x = (event.offsetX / canvas.offsetWidth) * canvas.width;
    const y = (event.offsetY / canvas.offsetHeight) * canvas.height;

    const radius = radiusInput.value * force
    const erasing = toolInput.value == "eraser"

    context.fillStyle = colorInput.value;

    function setLastPosition() {
        if (isTouch == true) {
            lastTouches[identifier] = { y: y, x: x }
        } else {
            lastPos = { y: y, x: x }
        }
    }

    let currentLast = undefined
    if (isTouch == true) {
        currentLast = lastTouches[identifier]
    } else {
        currentLast = lastPos
    }

    if (erasing) {
        context.clearRect(
            x - (radius), y - (radius),
            radius * 4, radius * 4
        )
        return
    }

    function drawPoint(x, y) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
    }

    if (currentLast == null) {
        drawPoint(x, y)
        setLastPosition()
        return
    }

    const diffX = x - currentLast.x
    const diffY = y - currentLast.y

    const distance = Math.sqrt(diffX * diffX + diffY * diffY)
    const steps = Math.floor(distance * 5)
    console.log("steps:", steps)
    for (let t = 0; t < steps; t++) {
        const time = t / steps

        drawPoint(
            (1 - time) * currentLast.x + (time * x),
            (1 - time) * currentLast.y + (time * y)
        )
    }

    setLastPosition()
}

function startClicking(event) {

    if (toolInput.value == "bucket") {
        const x = Math.floor((event.offsetX / canvas.offsetWidth) * canvas.width);
        const y = Math.floor((event.offsetY / canvas.offsetHeight) * canvas.height);
        flood_fill(canvas, context, x, y, color_to_rgba(colorInput.value))
        return;
    }

    clicking = true;
    painting(event)
}

canvas.addEventListener("touchstart", (event) => convertTouchToMouse(event, startClicking));
canvas.addEventListener("mousedown", startClicking);

function endTouch(event) {
    for (const touchIdentifier of Object.keys(lastTouches)) {
        let exists = false
        for (const touch of event.touches) {
            if (touch.identifier == touchIdentifier) exists = true
        }

        if (exists == false) {
            delete lastTouches[touchIdentifier]
        }
    }

    if (event.touches.length < 1) {
        endClicking();
    }
}
canvas.addEventListener("touchend", endTouch);
canvas.addEventListener("touchcancel", endTouch);

canvas.addEventListener("mouseout", endClicking);
canvas.addEventListener("mouseup", endClicking);

canvas.addEventListener("touchmove", (event) => convertTouchToMouse(event, painting));
canvas.addEventListener("mousemove", painting);