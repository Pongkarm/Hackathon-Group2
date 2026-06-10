document.addEventListener("DOMContentLoaded", () => {
    console.log("🛡️ NEXUS CART: Incident Response Dashboard initialized.");
    
    // Initialize number counter animations
    initCounters();
});

function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    
    const countUp = (counter) => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; // Animation duration in ms
        const startTime = performance.now();
        
        const updateCount = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function: easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            const currentValue = Math.floor(easeProgress * target);
            counter.innerText = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        requestAnimationFrame(updateCount);
    };

    // Use IntersectionObserver to start counting when cards are visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    counters.forEach(counter => observer.observe(counter));
}

