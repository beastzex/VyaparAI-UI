// --- DOM Element References ---
// Upload elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const browseButton = document.getElementById('browse-button');
const uploadButton = document.getElementById('upload-button');
const fileNameDisplay = document.getElementById('file-name-display');
const uploadContainer = document.getElementById('upload-container'); // Container for upload UI
const statusSection = document.getElementById('status-section');
const statusUpdates = document.getElementById('status-updates');
const loadingSpinner = document.getElementById('loading-spinner');
const resultsSection = document.getElementById('results-section');
const resultsOutput = document.getElementById('results-output');
// Navigation elements
const navLinks = document.querySelectorAll('.nav-links a');
// Elements to animate on scroll
const scrollRevealElements = document.querySelectorAll('.scroll-reveal');


// --- Configuration ---
const BACKEND_URL = 'http://127.0.0.1:8000'; // ** UPDATE THIS **

// --- Global Variables ---
let selectedFile = null;
let pollingInterval = null;

// --- Event Listeners ---

// Navigation Smooth Scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href'); // Gets "#home", "#about", etc.
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    });
});


// Upload Area Listeners (Drag & Drop, Browse)
if (dropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    dropArea.addEventListener('drop', handleDrop, false);
    // Click drop area to trigger file input
    dropArea.addEventListener('click', () => fileInput.click());
}
if (browseButton) {
    browseButton.addEventListener('click', () => fileInput.click());
}
if (fileInput) {
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
}
if (uploadButton) {
    uploadButton.addEventListener('click', uploadFile);
}


function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    if (dropArea) dropArea.classList.add('highlight');
}

function unhighlight(e) {
    if (dropArea) dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files && files.length > 0) {
        selectedFile = files[0];
        if (fileNameDisplay) fileNameDisplay.textContent = `Selected file: ${selectedFile.name}`;
        if (uploadButton) uploadButton.disabled = false;
        resetUploadUI(); // Reset status/results on new file selection
    }
}

// --- Scroll Reveal Animation Logic ---
const observerOptions = {
    root: null, // relative to the viewport
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of the element is visible
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Unobserve after animation runs once
            // observer.unobserve(entry.target);
        } else {
            // Optional: Remove class to re-animate on scroll up/down
             entry.target.classList.remove('visible');
        }
    });
};

const scrollObserver = new IntersectionObserver(observerCallback, observerOptions);

scrollRevealElements.forEach(el => {
    scrollObserver.observe(el);
});


// --- Core Upload & Polling Logic ---

async function uploadFile() {
    if (!selectedFile || !uploadButton) return;

    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';
    if (statusSection) statusSection.classList.remove('hidden');
    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.add('hidden'); // Ensure results are hidden
    if (statusUpdates) statusUpdates.innerHTML = ''; // Clear previous status
    addStatusUpdate("Starting upload...");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await fetch(`${BACKEND_URL}/api/upload_document`, {
            method: 'POST',
            body: formData,
        });

        uploadButton.textContent = 'Processing...';

        if (!response.ok) {
            let errorMsg = `Upload failed: ${response.statusText} (${response.status})`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.detail || errorMsg;
            } catch (e) { /* Ignore */ }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        const taskId = result.task_id;

        if (!taskId) throw new Error("Backend did not return a task ID.");

        addStatusUpdate("File uploaded successfully. Starting agent processing...");
        startPolling(taskId);

    } catch (error) {
        console.error("Upload Error:", error);
        addStatusUpdate(`Error during upload: ${error.message}`);
        showErrorState(`Upload failed: ${error.message}`);
    }
}

function startPolling(taskId) {
    if (pollingInterval) clearInterval(pollingInterval); // Clear previous

    pollingInterval = setInterval(async () => {
        console.log("Polling for task status:", taskId);
        try {
            const response = await fetch(`${BACKEND_URL}/api/task_status/${taskId}`);
            if (!response.ok) throw new Error(`Polling failed: ${response.statusText} (${response.status})`);

            const result = await response.json();
            console.log("Poll response:", result);

            const lastStatusElement = statusUpdates?.lastElementChild;
            const currentStatusMsg = result.status_message || result.status;
            if (result.status && result.status !== 'PENDING' && (!lastStatusElement || lastStatusElement.textContent !== currentStatusMsg)) {
                addStatusUpdate(currentStatusMsg);
            }

            if (result.status === 'SUCCESS') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                showResults(result.result || "Processing complete, but no result data received.");
            } else if (result.status === 'FAILURE') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                const errorMsg = result.error_message || 'Unknown processing error';
                addStatusUpdate(`Processing failed: ${errorMsg}`);
                showErrorState(`Processing failed: ${errorMsg}`);
            } // Else: Still PROCESSING, continue polling...

        } catch (error) {
            console.error("Polling Error:", error);
            addStatusUpdate(`Error during status check: ${error.message}. Stopping polling.`);
             // Stop polling on error to avoid spamming
            clearInterval(pollingInterval);
            pollingInterval = null;
            showErrorState(`Error checking status: ${error.message}`);
        }
    }, 3000); // Poll every 3 seconds
}

function addStatusUpdate(message) {
    if (!statusUpdates) return;
    const p = document.createElement('p');
    p.textContent = message;
    statusUpdates.insertBefore(p, statusUpdates.firstChild);
}

function showResults(resultText) {
    if (statusUpdates) addStatusUpdate("Processing Complete!"); // Final status update
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (resultsSection) resultsSection.classList.remove('hidden');

    if (resultsOutput) {
        try {
            const parsedResult = JSON.parse(resultText);
            resultsOutput.textContent = JSON.stringify(parsedResult, null, 2); // Pretty print JSON
        } catch (e) {
            resultsOutput.textContent = resultText; // Display as raw text
        }
    }

    if (uploadButton) {
        uploadButton.textContent = 'Upload Another File';
        uploadButton.disabled = true; // Wait for new file selection
    }
     if(fileNameDisplay) fileNameDisplay.textContent = 'Select a new file to process.';
    selectedFile = null;
    if (fileInput) fileInput.value = '';
}

function showErrorState(errorMessage) {
     if (loadingSpinner) loadingSpinner.classList.add('hidden');
     if (resultsSection) resultsSection.classList.remove('hidden'); // Show results section for error
     if (resultsOutput) resultsOutput.textContent = `Error: ${errorMessage}`;

     if (uploadButton) {
        uploadButton.textContent = 'Upload Failed - Select New File';
        uploadButton.disabled = true; // Wait for new file selection
     }
      if(fileNameDisplay) fileNameDisplay.textContent = 'Select a new file to process.';
     selectedFile = null;
     if (fileInput) fileInput.value = '';

    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}


function resetUploadUI() {
    if (statusSection) statusSection.classList.add('hidden');
    if (resultsSection) resultsSection.classList.add('hidden');
    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (statusUpdates) statusUpdates.innerHTML = '';
    if (resultsOutput) resultsOutput.textContent = '';
    if (uploadButton) uploadButton.textContent = 'Upload & Process';
    if (uploadButton && !selectedFile) uploadButton.disabled = true; // Keep disabled if no file selected yet

    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("VyaparAI Frontend Initialized");
    resetUploadUI(); // Ensure clean state on load
    // Optional: Add active state to nav link based on scroll position
});