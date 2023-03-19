// Variables declared
let activeSlideIndex = 1;

const [fileInput, range, prevButton, nextButton, resetButton, slideContainer] =
    ["file_input", "blur-range", "previousButton", "nextButton", "resetButton", "slideContainer"].map(
        (id) => document.getElementById(id)
    );

// Functions
// Move to the previous or next slide
const changeSlide = (offset) => {
    activeSlideIndex += offset;
    displaySlide(activeSlideIndex);
};

// Display the specified slide and hide the others
const displaySlide = (index) => {
    const slides = document.querySelectorAll(".slide");
    let currentSlideIndex = index;

    if (currentSlideIndex > slides.length) {
        currentSlideIndex = 1;
    } else if (currentSlideIndex < 1) {
        currentSlideIndex = slides.length;
    }

    slides.forEach((slide, slideIndex) => {
        slide.style.display = slideIndex === currentSlideIndex - 1 ? "block" : "none";
    });
};

// Load and draw image to a canvas
const loadAndDrawImage = (canvas, file, index) => {
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.onload = () => {
        canvas.originalImage = image;

        const fixedWidth = 1500;
        const fixedHeight = 1000;
        canvas.width = fixedWidth;
        canvas.height = fixedHeight;

        const scale = Math.min(fixedWidth / image.width, fixedHeight / image.height);
        const x = (fixedWidth - image.width * scale) / 2;
        const y = (fixedHeight - image.height * scale) / 2;

        ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    };
    image.src = URL.createObjectURL(file);
};

// Set up mouse handlers for canvas drawing
const setupMouseHandlers = (canvas) => {
    let isMouseDown = false;

    const mouseEvents = {
        mousedown: (event) => {
            event.preventDefault();
            isMouseDown = true;
        },
        mousemove: (event) => {
            event.preventDefault();

            if (isMouseDown) {
                const { offsetX: endX, offsetY: endY } = event;
                const size = range.value;
                const ctx = canvas.getContext("2d");

                ctx.save();
                ctx.filter = `blur(${3}px)`;
                ctx.beginPath();
                ctx.arc(endX, endY, size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(canvas, 0, 0);
                ctx.restore();
            }
        },
        mouseup: (event) => {
            event.preventDefault();
            isMouseDown = false;
        },
        mouseleave: (event) => {
            event.preventDefault();
            isMouseDown = false;
        },
    };

    Object.keys(mouseEvents).forEach((event) =>
        canvas.addEventListener(event, mouseEvents[event])
    );
};

// Create a new slide with the specified file and index
const createNewSlide = (file, index) => {
    const slide = document.createElement("div");
    slide.classList.add("slide");

    const canvas = document.createElement("canvas");
    canvas.addEventListener("contextmenu", (event) => {
        event.preventDefault();
    });

    slide.appendChild(canvas);
    slideContainer.appendChild(slide);

    loadAndDrawImage(canvas, file, index);
    setupMouseHandlers(canvas);
    createCustomCursor(canvas);
};

// Set today's date to the date input
const setTodayDate = () => {
    const today = moment().format('YYYY-MM-DD');
    const dateInput = document.getElementById("date");
    dateInput.value = today;
};

// Custom Cursor Function
const createCustomCursor = () => {
    const canvas = document.createElement("canvas");
    const canvasContext = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.style.position = "fixed";
    canvas.style.pointerEvents = "none";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1000";

    let canvasWidth = (canvas.width = window.innerWidth);
    let canvasHeight = (canvas.height = window.innerHeight);

    let mouseX = canvasWidth / 2;
    let mouseY = canvasHeight / 2;

    let circle = {
        radius: parseInt(range.value),
        lastX: mouseX,
        lastY: mouseY,
    };

    range.addEventListener("input", () => {
        circle.radius = parseInt(range.value);
    });

    const mouseRender = () => {
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);

        circle.lastX = mouseX;
        circle.lastY = mouseY;

        canvasContext.beginPath();
        canvasContext.arc(
            circle.lastX,
            circle.lastY,
            circle.radius,
            0,
            Math.PI * 2,
            false
        );
        canvasContext.lineWidth = 0.5;
        canvasContext.strokeStyle = "black";
        canvasContext.stroke();
        canvasContext.fillStyle = "rgba(255, 255, 255, 0.1)";
        canvasContext.fill();
        canvasContext.closePath();

        requestAnimationFrame(mouseRender);
    };

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener("resize", () => {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
    });

    mouseRender();
};

// Event listeners
prevButton.addEventListener("click", () => changeSlide(-1));
nextButton.addEventListener("click", () => changeSlide(1));

// Clear the drawings on the current slide
resetButton.addEventListener("click", () => {
    const slides = document.getElementsByClassName("slide");
    const activeSlide = slides[activeSlideIndex - 1];
    const canvas = activeSlide.querySelector("canvas");

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const image = canvas.originalImage;
    const fixedWidth = canvas.width;
    const fixedHeight = canvas.height;
    const scale = Math.min(fixedWidth / image.width, fixedHeight / image.height);
    const x = (fixedWidth - image.width * scale) / 2;
    const y = (fixedHeight - image.height * scale) / 2;

    ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
});

// When the file input changes, create new slides and display the first slide
fileInput.addEventListener("change", () => {
    const files = fileInput.files;

    [...files].forEach((file, index) => {
        createNewSlide(file, index);
    });

    displaySlide(1);
});

// Call setTodayDate when the window loads
window.addEventListener("load", setTodayDate);