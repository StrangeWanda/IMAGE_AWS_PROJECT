const dropZone = document.getElementById('drop-zone');
const imageInput = document.getElementById('image-input');
const thumbnailContainer = document.getElementById('thumbnail-container');
const layoutOptions = document.getElementById('layout-options');
const layoutSection = document.getElementById('layout-section');
const bgColorPicker = document.getElementById('bg-color-picker');
const previewCanvas = document.getElementById('preview-canvas');
const previewCtx = previewCanvas.getContext('2d');
const livePreview = document.getElementById('live-preview');
const downloadButton = document.getElementById('download-button');
let draggedIndex = null;

// Drag-and-drop upload handling
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#018786';
    dropZone.style.color = '#ffffff';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
    dropZone.style.color = '#03dac6';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    dropZone.style.color = '#03dac6';
    imageInput.files = e.dataTransfer.files;
    handleFileUpload();
});

dropZone.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', handleFileUpload);

// Handle file upload
function handleFileUpload() {
    const files = Array.from(imageInput.files);
    if (files.length) {
        displayThumbnails(files);
        suggestLayouts(files.length);
    }
}

// Display thumbnails
function displayThumbnails(files) {
    thumbnailContainer.innerHTML = '';
    files.forEach((file, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.classList.add('thumbnail');
        thumbnail.draggable = true;
        thumbnail.dataset.index = index;

        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        thumbnail.appendChild(img);
        thumbnailContainer.appendChild(thumbnail);

        thumbnail.addEventListener('dragstart', (e) => handleDragStart(e, index));
        thumbnail.addEventListener('dragover', (e) => e.preventDefault());
        thumbnail.addEventListener('drop', (e) => handleDrop(e, index));
    });
}

// Drag-and-drop reordering
function handleDragStart(e, index) {
    draggedIndex = index;
    e.dataTransfer.effectAllowed = 'move';
}

function handleDrop(e, targetIndex) {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
        const filesArray = Array.from(imageInput.files);
        const draggedFile = filesArray.splice(draggedIndex, 1)[0];
        filesArray.splice(targetIndex, 0, draggedFile);

        const newFileList = new DataTransfer();
        filesArray.forEach((file) => newFileList.items.add(file));
        imageInput.files = newFileList.files;

        displayThumbnails(imageInput.files);
    }
    draggedIndex = null;
}

// Suggest layouts based on image count
function suggestLayouts(numImages) {
    layoutSection.style.display = 'block';
    layoutOptions.innerHTML = '';

    for (let rows = 1; rows <= numImages; rows++) {
        if (numImages % rows === 0) {
            const cols = numImages / rows;
            layoutOptions.innerHTML += `<option value="${rows}-${cols}">${rows} x ${cols}</option>`;
        }
    }
}

// Live preview
layoutOptions.addEventListener('change', updatePreview);
bgColorPicker.addEventListener('input', updatePreview);

function updatePreview() {
    const [rows, cols] = layoutOptions.value.split('-').map(Number);
    const files = Array.from(imageInput.files);

    if (!files.length || !rows || !cols) return;

    const images = files.map((file) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        return img;
    });

    // Wait for all images to load before updating the canvas
    Promise.all(images.map((img) => new Promise((resolve) => (img.onload = resolve)))).then(() => {
        const imgWidth = images[0].width;
        const imgHeight = images[0].height;

        // Set canvas size
        previewCanvas.width = cols * imgWidth;
        previewCanvas.height = rows * imgHeight;

        previewCtx.fillStyle = bgColorPicker.value;
        previewCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        let x = 0;
        let y = 0;

        images.forEach((img, index) => {
            previewCtx.drawImage(img, x, y, imgWidth, imgHeight);
            x += imgWidth;
            if ((index + 1) % cols === 0) {
                x = 0;
                y += imgHeight;
            }
        });

        livePreview.style.display = 'block';
        downloadButton.style.display = 'block';
    });
}

// Download stitched image
downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'stitched_image.png';
    link.href = previewCanvas.toDataURL();
    link.click();
});
