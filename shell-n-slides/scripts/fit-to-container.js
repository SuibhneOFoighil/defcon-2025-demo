// fit-to-container.js
// Dynamically scales .reveal .slides content to fit within its parent container

function fitSlidesToContainer() {
    const slidesContainer = document.querySelector('.reveal .slides');
    if (!slidesContainer) return;
    const parent = slidesContainer.parentElement;
    if (!parent) return;

    // Find the current visible slide
    const currentSlide = slidesContainer.querySelector('section.present');
    if (!currentSlide) return;

    // Reset scale and positioning
    currentSlide.style.transform = '';
    currentSlide.style.transformOrigin = 'top left';
    currentSlide.style.position = 'absolute';
    currentSlide.style.left = '0';
    currentSlide.style.top = '0';

    // Get dimensions
    const parentRect = parent.getBoundingClientRect();
    const slideRect = currentSlide.getBoundingClientRect();

    // Calculate scale factors
    const scaleX = parentRect.width / slideRect.width;
    const scaleY = parentRect.height / slideRect.height;
    const scale = Math.min(scaleX, scaleY);

    // Apply scale
    currentSlide.style.transform = `scale(${scale})`;
    // Set a CSS variable for scale
    currentSlide.style.setProperty('--slide-scale', scale);
    // Dynamically adjust font-size (base 20px, scaled)
    currentSlide.style.fontSize = `${20 * scale}px`;

    // Center horizontally/vertically
    const leftOffset = (parentRect.width - slideRect.width * scale) / 2;
    const topOffset = (parentRect.height - slideRect.height * scale) / 2;
    currentSlide.style.left = `${leftOffset}px`;
    currentSlide.style.top = `${topOffset}px`;
}

function initializeFitToContainer() {
    fitSlidesToContainer();
    window.addEventListener('resize', fitSlidesToContainer);
    // Re-fit on slide change (Reveal.js event)
    if (window.Reveal && typeof window.Reveal.addEventListener === 'function') {
        window.Reveal.addEventListener('slidechanged', fitSlidesToContainer);
    } else {
        // fallback: observe class changes
        const slidesContainer = document.querySelector('.reveal .slides');
        if (slidesContainer && window.MutationObserver) {
            const observer = new MutationObserver(fitSlidesToContainer);
            observer.observe(slidesContainer, { attributes: true, subtree: true, attributeFilter: ['class'] });
        }
    }
}

// Expose for manual use if needed
window.fitSlidesToContainer = fitSlidesToContainer;
window.initializeFitToContainer = initializeFitToContainer;


function initializeFitToContainer() {
    fitSlidesToContainer();
    window.addEventListener('resize', fitSlidesToContainer);
    // Optionally, observe slide content changes
    const slidesContainer = document.querySelector('.reveal .slides');
    if (slidesContainer && window.MutationObserver) {
        const observer = new MutationObserver(fitSlidesToContainer);
        observer.observe(slidesContainer, { childList: true, subtree: true });
    }
}

// Expose for manual use if needed
window.fitSlidesToContainer = fitSlidesToContainer;
window.initializeFitToContainer = initializeFitToContainer;
