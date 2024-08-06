const canvas = document.getElementById("drawing");
const context = canvas.getContext("2d");

const radiusInput = document.getElementById("radius")
const eraserInput = document.getElementById("eraser")
const colorInput = document.getElementById("fillColor")

let clicking = false;
let lastPos = null

function clearCanvas() {
    context.clearRect(0,0, canvas.width, canvas.height)
}

canvas.addEventListener("mousedown", (event) => {
    clicking = true;
});

function endClicking() {
    lastPos = null
    clicking = false;
}

canvas.addEventListener("mouseout", endClicking);
canvas.addEventListener("mouseup", endClicking);

canvas.addEventListener("mousemove", (event) => {
    if (clicking == false) return;
    const x = (event.offsetX / canvas.offsetWidth) * canvas.width;
    const y = (event.offsetY / canvas.offsetHeight) * canvas.height;
    console.log("xy", x, y)

    const radius = radiusInput.value
    const erasing = eraserInput.checked

    context.fillStyle = colorInput.value

    // console.log(event.offsetX, event.offsetY);

    if (erasing) {
        context.clearRect(
            x - (radius), y - (radius),
            radius*4, radius*4
        )
        return
    }

    function drawPoint(x, y) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.fill();
    }

    if (lastPos == null) {
        drawPoint(x, y)

        lastPos = { y: y, x: x }
        return
    }

    // lerp idk
    const diffX = x - lastPos.x
    const diffY = y - lastPos.y

    const distance = Math.sqrt( diffX*diffX + diffY*diffY )
    // console.log("distance", event.offsetX - lastPos.offsetX, event.offsetY - lastPos.offsetY)
    // console.log(distance)
    for (let t = 0; t < 100; t++) {
        const time = t / 100
        // console.log("t",time)
        drawPoint(
            (1 - time) * lastPos.x + (time * x),
            (1 - time) * lastPos.y + (time * y)
        )
    }

    lastPos = { y: y, x: x }
});