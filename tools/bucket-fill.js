var timeout_id;

function flood_fill(the_canvas, the_canvas_context, x, y, color, original_color, pixels, pixel_stack) {
    if (timeout_id >= 110) {
        clearTimeout(timeout_id)
        return;
    }

    original_color = typeof (original_color) === 'undefined' ? null : original_color;
    pixels = typeof (pixels) === 'undefined' ? null : pixels;
    pixel_stack = typeof (pixel_stack) === 'undefined' ? null : pixel_stack;

    clearTimeout(timeout_id);

    if (pixels === null) {
        pixels = the_canvas_context.getImageData(0, 0, the_canvas.width, the_canvas.height);
    }

    var linear_cords = (y * the_canvas.width + x) * 4;

    if (original_color === null) {
        original_color = {
            r: pixels.data[linear_cords],
            g: pixels.data[linear_cords + 1],
            b: pixels.data[linear_cords + 2],
            a: pixels.data[linear_cords + 3]
        };
    }

    if (pixel_stack === null) {
        pixel_stack = [{ x: x, y: y }];
    }

    var iterations = 0;
    while (pixel_stack.length > 0) {
        new_pixel = pixel_stack.shift();
        x = new_pixel.x;
        y = new_pixel.y;

        // coloring the pixels we are on
        linear_cords = (y * the_canvas.width + x) * 4;
        pixels.data[linear_cords] = color.r;
        pixels.data[linear_cords + 1] = color.g;
        pixels.data[linear_cords + 2] = color.b;
        pixels.data[linear_cords + 3] = color.a;

        if (x - 1 >= 0 &&
            (pixels.data[linear_cords - 4] == original_color.r &&
                pixels.data[linear_cords - 4 + 1] == original_color.g &&
                pixels.data[linear_cords - 4 + 2] == original_color.b &&
                pixels.data[linear_cords - 4 + 3] == original_color.a) &&
            !is_in_pixel_stack(x - 1, y, pixel_stack)) {
            pixel_stack.push({ x: x - 1, y: y });
        }
        if (x + 1 < the_canvas.width &&
            (pixels.data[linear_cords + 4] == original_color.r &&
                pixels.data[linear_cords + 4 + 1] == original_color.g &&
                pixels.data[linear_cords + 4 + 2] == original_color.b &&
                pixels.data[linear_cords + 4 + 3] == original_color.a) &&
            !is_in_pixel_stack(x + 1, y, pixel_stack)) {
            pixel_stack.push({ x: x + 1, y: y });
        }
        if (y - 1 >= 0 &&
            (pixels.data[linear_cords - 4 * the_canvas.width] == original_color.r &&
                pixels.data[linear_cords - 4 * the_canvas.width + 1] == original_color.g &&
                pixels.data[linear_cords - 4 * the_canvas.width + 2] == original_color.b &&
                pixels.data[linear_cords - 4 * the_canvas.width + 3] == original_color.a) &&
            !is_in_pixel_stack(x, y - 1, pixel_stack)) {
            pixel_stack.push({ x: x, y: y - 1 });
        }
        if (y + 1 < the_canvas.height &&
            (pixels.data[linear_cords + 4 * the_canvas.width] == original_color.r &&
                pixels.data[linear_cords + 4 * the_canvas.width + 1] == original_color.g &&
                pixels.data[linear_cords + 4 * the_canvas.width + 2] == original_color.b &&
                pixels.data[linear_cords + 4 * the_canvas.width + 3] == original_color.a) &&
            !is_in_pixel_stack(x, y + 1, pixel_stack)) {
            pixel_stack.push({ x: x, y: y + 1 });
        }

        iterations++;
        if (iterations >= 1000) {
            break;
        }
    }

    the_canvas_context.putImageData(pixels, 0, 0);
    if (pixel_stack.length > 0) {
        new_pixel = pixel_stack.shift();
        timeout_id = setTimeout(function () { flood_fill(the_canvas, the_canvas_context, new_pixel.x, new_pixel.y, color, original_color, pixels, pixel_stack); }, 50);
    }
}

function is_in_pixel_stack(x, y, pixel_stack) {
    for (var i = 0; i < pixel_stack.length; i++) {
        if (pixel_stack[i].x == x && pixel_stack[i].y == y) {
            return true;
        }
    }
    return false;
}

// adapted from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function color_to_rgba(color) {
    if (color[0] == "#") { // hex notation
        color = color.replace("#", "");
        var bigint = parseInt(color, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return {
            r: r,
            g: g,
            b: b,
            a: 255
        };
    } else if (color.indexOf("rgba(") == 0) { // already in rgba notation
        color = color.replace("rgba(", "").replace(" ", "").replace(")", "").split(",");
        return {
            r: color[0],
            g: color[1],
            b: color[2],
            a: color[3] * 255
        };
    } else {
        console.error("warning: can't convert color to rgba: " + color);
        return {
            r: 0,
            g: 0,
            b: 0,
            a: 0
        };
    }
}