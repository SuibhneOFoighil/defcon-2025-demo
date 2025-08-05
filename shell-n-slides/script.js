let revertEndpoint = "192.168.10.2";
//let revertEndpoint = "100.127.98.106";
let checkInterval;
let userIP;

async function loadSlides() {
    const slidesContainer = document.querySelector('.slides');
    try {
        const response = await axios.get('slides/index.json');
        const slideStructure = response.data;

        for (const section of slideStructure) {
            if (Array.isArray(section)) {
                // This is a vertical stack of slides
                const sectionElement = document.createElement('section');
                for (const verticalSlide of section) {
                    const slideContent = await createSlide(verticalSlide);
                    if (slideContent instanceof DocumentFragment) {
                        sectionElement.append(...slideContent.childNodes);
                    } else {
                        sectionElement.appendChild(slideContent);
                    }
                }
                slidesContainer.appendChild(sectionElement);
            } else {
                // This is a single horizontal slide
                const slideContent = await createSlide(section);
                if (slideContent instanceof DocumentFragment) {
                    slidesContainer.append(...slideContent.childNodes);
                } else {
                    slidesContainer.appendChild(slideContent);
                }
            }
        }

        initializeReveal();
    } catch (error) {
        console.error('Error loading slides:', error);
    }
}

async function createSlide(slideFile) {
    const slideSection = document.createElement('section');

    if (slideFile.endsWith('.html')) {
        // Load HTML file
        try {
            const htmlContent = await axios.get(`slides/${slideFile}`);
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent.data, 'text/html');
            const sections = doc.querySelectorAll('section');

            if (sections.length > 0) {
                // If the HTML contains section tags, use them directly
                const fragment = document.createDocumentFragment();
                sections.forEach(section => {
                    const clonedSection = document.importNode(section, true);
                    fragment.appendChild(clonedSection);
                });
                return fragment;
            } else {
                // If no section tags, wrap the content in a section
                const slideSection = document.createElement('section');
                slideSection.innerHTML = htmlContent.data;
                return slideSection;
            }
        } catch (error) {
            console.error(`Error loading HTML slide: ${slideFile}`, error);
            const errorSection = document.createElement('section');
            errorSection.innerHTML = `<p>Error loading slide: ${slideFile}</p>`;
            return errorSection;
        }
    } else {
        // Load Markdown file
        try {
            const slideContent = await axios.get(`slides/${slideFile}`);
            const slideHtml = marked(slideContent.data);
            slideSection.innerHTML = slideHtml;
        } catch (error) {
            console.error(`Error loading Markdown slide: ${slideFile}`, error);
            slideSection.innerHTML = `<p>Error loading slide: ${slideFile}</p>`;
        }
    }

    return slideSection;
}

function initializeReveal() {
    Reveal.initialize({
        width: '100%',
        height: '100%',
        margin: 0.1,
        minScale: 0.2,
        maxScale: 1.5,
        // Enable the slide overview mode
        overview: true,
        // Enable keyboard shortcuts for navigation
        keyboard: true,
        // Enable the slide navigation controls
        controls: true,
        controlsTutorial: true,
        // Enable slide navigation via mouse wheel
        mouseWheel: false,
        // Vertical centering of slides
        center: true,
        // Enables touch navigation on devices with touch input
        touch: true,
        embedded: true,
        transitionSpeed: 'fast',
        plugins: [RevealZoom],
    });
    
    // Set initial terminal visibility after Reveal is ready
    Reveal.addEventListener('ready', function(event) {
        const slideId = event.currentSlide.id;
        manageTerminalVisibility(slideId);
        console.log(`Initial slide loaded: ${slideId}`);
    });
}

let isResizing = false;
let lastDownY;
// Helper to ensure resizing only happens if mouse is down on separator
let resizingSessionActive = false;

function initializeResizer() {
    const separator = document.getElementById('separator');
    const slideshow = document.getElementById('slideshow');
    const terminal = document.getElementById('terminal');

    // Set initial terminal height
    const totalHeight = window.innerHeight;
    const initialTerminalHeight = totalHeight * 0.3;
    slideshow.style.height = `${totalHeight - initialTerminalHeight}px`;

    separator.addEventListener('mousedown', (e) => {
        // Only start resizing if left mouse button is pressed
        if (e.button !== 0) return;
        isResizing = true;
        resizingSessionActive = true;
        lastDownY = e.clientY;
        document.body.classList.add('resizing');
    });

    document.addEventListener('mousemove', (e) => {
        // Only resize if actively in resizing mode and the session started on the separator
        if (!isResizing || !resizingSessionActive) return;
        // If the left mouse button is not pressed, stop resizing
        if ((e.buttons & 1) !== 1) {
            isResizing = false;
            resizingSessionActive = false;
            document.body.classList.remove('resizing');
            return;
        }

        const delta = e.clientY - lastDownY;
        lastDownY = e.clientY;

        const totalHeight = window.innerHeight;
        const newSlideshowHeight = slideshow.offsetHeight + delta;
        const newTerminalHeight = terminal.offsetHeight - delta;

        // Ensure minimum heights
        if (newSlideshowHeight < totalHeight * 0.3 || newTerminalHeight < totalHeight * 0.1) return;

        slideshow.style.height = `${newSlideshowHeight}px`;
        terminal.style.height = `${newTerminalHeight}px`;

        // Trigger reveal.js to update its layout
        Reveal.layout();
    });

    document.addEventListener('mouseup', (e) => {
        if (isResizing) {
            isResizing = false;
            resizingSessionActive = false;
            document.body.classList.remove('resizing');
            fitSlidesToContainer();
        }
    });

    document.addEventListener('mouseleave', () => {
        if (isResizing) {
            isResizing = false;
            resizingSessionActive = false;
            document.body.classList.remove('resizing');
            fitSlidesToContainer();
        }
    });
}

function updateUserIP() {
    var currentUrl = window.location.href;

    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        // Default to localhost setup
        userIP = '10'; // Default Ludus network
        console.log('UserIP (localhost): ' + userIP);
    } else {
        var ipRegex = /^(https?:\/\/)?((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3})(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).*/;
        var match = currentUrl.match(ipRegex);

        if (match) {
            var ipParts = match[2].split('.');
            userIP = ipParts[1];
            console.log('UserIP: ' + userIP);
        } else {
            userIP = '10'; // Default fallback
            console.log('UserIP (fallback): ' + userIP);
        }
    }
}

// Function to populate a span with the correct IPs
function updateTargetNet() {
    console.log('updateTargetNet function called');
    var urlElement = document.getElementById('target-net');
    if (!urlElement) {
        console.error('Element with id "target-net" not found');
        return;
    }

    var currentUrl = window.location.href;

    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        // Default network for localhost setup
        var targetNetwork = '10.10.10.0/24';
        urlElement.textContent = targetNetwork;
        console.log('Target network (localhost):', targetNetwork);
    } else {
        var ipRegex = /^(https?:\/\/)?((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3})(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).*/;
        var match = currentUrl.match(ipRegex);

        if (match) {
            var ipParts = match[2].split('.');
            ipParts[3] = '0/24';
            var targetNetwork = ipParts.join('.');
            urlElement.textContent = targetNetwork;
            console.log('Target network:', targetNetwork);
        } else {
            var targetNetwork = '10.10.10.0/24'; // Default fallback
            urlElement.textContent = targetNetwork;
            console.log('Target network (fallback):', targetNetwork);
        }
    }
}

function updateTargetIPAddress() {
    console.log('updateTargetIPAddress function called');
    var urlElements = document.querySelectorAll('#target-ip-address, .target-ip-placeholder');
    if (urlElements.length === 0) {
        console.error('Elements for target IP not found');
        return;
    }

    var currentUrl = window.location.href;

    if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
        // Default target IP for localhost setup
        var targetIP = '10.10.10.3';
        urlElements.forEach(element => {
            element.textContent = targetIP;
        });
        console.log('Target IP (localhost):', targetIP);
    } else {
        var ipRegex = /^(https?:\/\/)?((?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3})(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).*/;
        var match = currentUrl.match(ipRegex);

        if (match) {
            var ipParts = match[2].split('.');
            ipParts[3] = '3';
            var targetIP = ipParts.join('.');
            urlElements.forEach(element => {
                element.textContent = targetIP;
            });
            console.log('Target IP:', targetIP);
        } else {
            var targetIP = '10.10.10.3'; // Default fallback
            urlElements.forEach(element => {
                element.textContent = targetIP;
            });
            console.log('Target IP (fallback):', targetIP);
        }
    }
}

function loadTutorial() {
    var enjoyhint_instance = new EnjoyHint({});
    // standard tutorial items referencing DOM objects (shouldn't have to change)
    var enjoyhint_scripts_steps = [
        {
            'next #terminal': 'This is the <text style="font-weight: bolder; color: #e9c706;">terminal</text> window. <br />' +
                'You can follow along with the slides by typing commands here<br />',
            showSkip: false,
        },
        {
            'next #clickable': '<text style="font-weight: bolder; color: #e9c706;">Click</text> on commands to copy them into the terminal for you.',
            showSkip: false,
            right: -10,
        },
        {
            'next #terminal': 'The command is copied. Click on the terminal and press <text style="font-weight: bolder; color: #e9c706;">[Enter]</text> to execute it.',
            showSkip: false,
        },
        {
            'click .navigate-right': '<text style="font-weight: bolder; color: #e9c706;">Click</text> to navigate the slides',
            showSkip: false,
            shape: 'circle',
            radius: 50,
        },
        {
            'click .navigate-down': 'You can <text style="font-weight: bolder; color: #e9c706;">Click</text> down to get more detail on tasks if you need help',
            showSkip: false,
            shape: 'circle',
            radius: 50,
        },
        {
            'next #resetCameraButton': 'This is the <text style="font-weight: bolder; color: #e9c706;">Reset Camera</text> button. <br />' +
                'If you encounter any issues with the camera, click this to reset it. <br />' +
                'The camera should come back online in ~5 seconds.',
            showSkip: false,
        },
        {
            'next #tutorialTarget': 'Great! You\'re ready for the workshop.<br /><text style="color: #e9c706;">Enjoy!</text>',
            showSkip: false,
            nextButton: { text: "Let's hack!" },
        },
    ];
    enjoyhint_instance.set(enjoyhint_scripts_steps);
    enjoyhint_instance.run();
}

// Used for the slidedeck to pull the right reveal.js IP for the range
function updateTerminalSrc() {
    const terminalIframe = document.getElementById('terminal-iframe');
    if (!terminalIframe) {
        console.error('Terminal iframe not found');
        return;
    }

    // Always use localhost:7681 for native script execution
    const terminalUrl = 'http://localhost:7681';
    console.log('Setting terminal URL to:', terminalUrl);
    terminalIframe.src = terminalUrl;
}

// Function to manage terminal visibility based on slide
function manageTerminalVisibility(slideId) {
    const terminal = document.getElementById('terminal');
    const separator = document.getElementById('separator');
    const slideshow = document.getElementById('slideshow');
    
    // List of slides that should NOT show the terminal
    const noTerminalSlides = [
        'tutorial-intro',       // Introduction slide
        'ludus-deployment'      // Ludus GUI deployment slide
    ];
    
    if (noTerminalSlides.includes(slideId)) {
        // Hide terminal and separator, make slideshow take full height
        terminal.style.display = 'none';
        separator.style.display = 'none';
        slideshow.style.flex = '1';
        slideshow.style.height = 'calc(100vh - 60px)'; // Account for top pane
        
        // Force Reveal.js to recalculate layout after DOM changes
        setTimeout(() => {
            if (typeof Reveal !== 'undefined' && Reveal.layout) {
                Reveal.layout();
                console.log('Reveal layout recalculated for full viewport');
            }
            // Also trigger slide fitting to container
            if (typeof window.fitSlidesToContainer === 'function') {
                window.fitSlidesToContainer();
                console.log('Slides refit to full container');
            }
        }, 150);
        
        console.log(`Terminal hidden for slide: ${slideId}`);
    } else {
        // Show terminal and separator, restore original layout
        terminal.style.display = 'block';
        separator.style.display = 'flex';
        slideshow.style.flex = '1';
        slideshow.style.height = 'auto';
        
        // Force Reveal.js to recalculate layout after DOM changes
        setTimeout(() => {
            if (typeof Reveal.layout) {
                Reveal.layout();
                console.log('Reveal layout recalculated for split viewport');
            }
            // Also trigger slide fitting to container
            if (typeof window.fitSlidesToContainer === 'function') {
                window.fitSlidesToContainer();
                console.log('Slides refit to split container');
            }
        }, 150);
        
        console.log(`Terminal shown for slide: ${slideId}`);
    }
}

// Wait for Reveal.js to be ready
Reveal.addEventListener('slidechanged', function (event) {
    // Manage terminal visibility based on current slide
    const slideId = event.currentSlide.id;
    manageTerminalVisibility(slideId);
    
    // Check if this is the tutorial slide (legacy - may need updating)
    if (event.currentSlide.id === 'tutorial') {
        loadTutorial();
    }
    
    // Check if this is the tutorial-start slide and load tutorial
    if (event.currentSlide.id === 'tutorial-start') {
        loadTutorial();
    }
    
    // Check if this is the last slide and show the revert button
    if (event.indexh === Reveal.getTotalSlides() - 1) {
        const revertButton = document.getElementById('revertButton');
        if (revertButton) {
            revertButton.style.display = 'block';
            console.log('Revert button should be visible now');
        } else {
            console.error('Revert button not found in the DOM');
        }
    }
});

function handleRevert() {
    console.log('handleRevert function called');
    document.addEventListener('click', (event) => {
        if (event.target.id === 'revertButton') {
            console.log('Revert button clicked');
            showOfflineMode();
            checkServerStatus();
        }
    });
}

function showOfflineMode() {
    document.body.innerHTML = '<div id="offlineMessage" style="display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 24px; text-align: center;">WAITING FOR RANGE</div>';
}

function checkServerStatus() {
    const checkInterval = setInterval(() => {
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    clearInterval(checkInterval);
                    window.location.reload();
                }
            })
            .catch(() => {
                // Server is still not responding, continue waiting
            });
    }, 5000); // Check every 5 seconds
}


function addResetCameraButton() {
    const resetButton = document.getElementById('resetCameraButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetCamera);
    } else {
        console.error('Reset camera button not found');
    }
}

function createTemporarySpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'temporarySpinner';
    spinner.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #e9c706;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 9999;
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9998;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(spinner);

    setTimeout(() => {
        document.body.removeChild(spinner);
        document.body.removeChild(overlay);
    }, 5000);
}

function resetCamera() {
    createTemporarySpinner();
    axios.get(`http://${revertEndpoint}/revert-camera?user=` + userIP)
        .then(response => {
            console.log('Camera reset successful');
        })
        .catch(error => {
            console.error('Error resetting camera:', error);
        });
}

function resetRange() {
    createTemporarySpinner();
    axios.get(`http://${revertEndpoint}/revert-all?user=` + userIP)
        .then(response => {
            console.log('Range reset successful');
            return axios.get(`http://localhost:8080/reset?user=${userIP}`);
        })
        .catch(error => {
            console.error('Error during reset:', error);
            // Do the local reset anyway
            return axios.get(`http://localhost:8080/reset?user=${userIP}`);
        })
        .finally(() => {
            // Regardless of success or failure, refresh the page after a delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1000); // Refresh after 1 second
        });
}


function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = 'block';
    }
}

function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

function checkCameraStatus() {
    clearInterval(checkInterval);
    checkInterval = setInterval(() => {
        axios.get(`http://${revertEndpoint}`)
            .then(response => {
                if (response.status === 200) {
                    clearInterval(checkInterval);
                    hideSpinner();
                }
            })
            .catch(() => {
                // Camera is still not responding, continue waiting
            });
    }, 2000); // Check every 2 seconds
}

// Make sure to clear the interval when the page is unloaded
window.addEventListener('beforeunload', () => {
    clearInterval(checkInterval);
});


document.addEventListener('DOMContentLoaded', () => {
    loadSlides();
    initializeResizer();  // Make sure this line is present
    updateTerminalSrc();
    handleRevert();
    updateUserIP();
    updateTargetIPAddress();
    setTimeout(addClickableCommandListeners, 1000); // Wait for slides to load
});

function handleCommandClick(event) {
    console.log('handleCommandClick function called');
    event.preventDefault();
    const terminalIframe = document.getElementById('terminal-iframe');
    if (!terminalIframe) {
        console.error('Terminal iframe not found');
        return;
    }
    const commandText = event.currentTarget.innerText || event.currentTarget.textContent;
    // ttyd expects a postMessage with {operation: 'input', data: command + '\n'}
    // terminalIframe.contentWindow.postMessage({operation: 'input', data: commandText + '\n'}, '*');
    terminalIframe.contentWindow.term.paste(commandText);
    // terminalIframe.contentDocument.querySelector("textarea.xterm-helper-textarea").dispatchEvent(new KeyboardEvent('keypress', {charCode: 13}))
    console.log('Command sent to terminal: ' + commandText);
}

// Add click handlers to .clickable-command elements to send their text to the terminal
function addClickableCommandListeners() {
    const commands = document.querySelectorAll('.clickable-command');
    commands.forEach(cmd => {
        // Remove previous listener to avoid duplicates
        cmd.removeEventListener('click', handleCommandClick);
        cmd.addEventListener('click', handleCommandClick);
    });
}


Reveal.addEventListener('slidechanged', function (event) {
    // Existing code for target-net
    if (event.currentSlide.querySelector('#target-net')) {
        updateTargetNet();
    }
    // Updated code for target-ip-address
    if (event.currentSlide.querySelector('#target-ip-address') || event.currentSlide.querySelector('.target-ip-placeholder')) {
        updateTargetIPAddress();
    }
    // Also re-add clickable-command listeners in case new commands appeared
    setTimeout(addClickableCommandListeners, 500);
});