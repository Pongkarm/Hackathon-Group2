document.addEventListener("DOMContentLoaded", () => {
    console.log("🛡️ NEXUS CART: Incident Response Dashboard initialized.");
    
    // Initialize number counter animations
    initCounters();
    
    // Initialize IPs horizontal bar chart
    initIpsChart();
    
    // Initialize HTTP Status Distribution doughnut chart
    initStatusChart();
    
    // Initialize attack timeline dual line chart
    initTimelineChart();
    
    // Initialize forensic terminal typing simulation
    initTerminalSimulation();
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

function initIpsChart() {
    const canvas = document.getElementById('ipsChart');
    if (!canvas) return;

    const ipsData = [
        { ip: '209.103.8.44', count: 298272 },
        { ip: '162.240.218.117', count: 298007 },
        { ip: '197.82.237.190', count: 297955 },
        { ip: '215.143.100.205', count: 297861 },
        { ip: '199.242.130.73', count: 297789 },
        { ip: '119.123.55.141', count: 297711 },
        { ip: '148.9.19.27', count: 297518 },
        { ip: '187.91.79.110', count: 297497 },
        { ip: '196.45.2.86', count: 297488 },
        { ip: '199.71.56.65', count: 297431 },
        { ip: '14.121.165.122', count: 297343 },
        { ip: '202.129.225.117', count: 297228 },
        { ip: '211.92.75.1', count: 297161 },
        { ip: '95.125.101.128', count: 297020 },
        { ip: '14.252.124.193', count: 296879 },
        { ip: '80.130.43.26', count: 296862 },
        { ip: '139.94.203.41', count: 296826 },
        { ip: '12.104.185.44', count: 296693 },
        { ip: '131.33.12.73', count: 296029 }
    ];

    const createChart = () => {
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ipsData.map(d => d.ip),
                datasets: [{
                    label: 'Requests Count',
                    data: ipsData.map(d => d.count),
                    backgroundColor: 'rgba(255, 62, 62, 0.25)',
                    borderColor: '#ff3e3e',
                    borderWidth: 1.5,
                    borderRadius: 4,
                    hoverBackgroundColor: '#ff3e3e',
                    hoverBorderColor: '#ffffff',
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(5, 5, 5, 0.95)',
                        titleFont: {
                            family: 'Outfit',
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Outfit',
                            size: 13
                        },
                        borderColor: 'rgba(255, 62, 62, 0.3)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `⚡ Requests: ${context.raw.toLocaleString()} times`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#909090',
                            font: {
                                family: 'JetBrains Mono',
                                size: 10
                            },
                            callback: function(value) {
                                return (value / 1000) + 'k';
                            }
                        },
                        min: 290000 // Set minimum to emphasize tiny differences between hackers
                    },
                    y: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#f0f0f0',
                            font: {
                                family: 'JetBrains Mono',
                                size: 11,
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });
    };

    // Trigger chart loading when container is scrolled into view (Scroll Reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createChart();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
}

function initStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;

    const statusData = {
        labels: ['HTTP 200 (Success)', 'HTTP 500 (Server Error)', 'HTTP 504 (Timeout)', 'HTTP 404 (Not Found)', 'HTTP 304 (Cached)'],
        counts: [10608035, 2687008, 2685894, 2584078, 2581383],
        colors: [
            'rgba(0, 255, 102, 0.45)', // Cyber Green
            'rgba(255, 62, 62, 0.55)',  // Cyber Red
            'rgba(255, 204, 0, 0.55)',  // Cyber Yellow
            'rgba(0, 210, 255, 0.45)',  // Cyber Blue
            'rgba(144, 144, 154, 0.35)'  // Cyber Gray
        ],
        borders: [
            '#00ff66',
            '#ff3e3e',
            '#ffcc00',
            '#00d2ff',
            '#90909a'
        ]
    };

    const createChart = () => {
        new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: statusData.labels,
                datasets: [{
                    data: statusData.counts,
                    backgroundColor: statusData.colors,
                    borderColor: statusData.borders,
                    borderWidth: 1,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: {
                    duration: 1800,
                    easing: 'easeOutCirc'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Outfit',
                                size: 11,
                                weight: '600'
                            },
                            boxWidth: 10,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(5, 5, 5, 0.95)',
                        titleFont: {
                            family: 'Outfit',
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Outfit',
                            size: 12
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const total = 21146398;
                                const val = context.raw;
                                const pct = ((val / total) * 100).toFixed(2);
                                return ` Requests: ${val.toLocaleString()} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    // Trigger loading on scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createChart();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
}

function initTimelineChart() {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;

    const timelineData = {
        months: [
            'Jun 24', 'Jul 24', 'Aug 24', 'Sep 24', 'Oct 24', 'Nov 24', 'Dec 24',
            'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25', 'May 25', 'Jun 25', 'Jul 25',
            'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26',
            'Mar 26', 'Apr 26', 'May 26', 'Jun 26'
        ],
        crashes: [
            104695, 121333, 124821, 87679, 70977, 139923, 87108, 220140, 13565,
            98880, 125419, 115363, 80172, 134391, 71970, 150872, 140992, 116299,
            143537, 72428, 109980, 114180, 99541, 116598, 26145
        ],
        lags: [
            213013, 250616, 258984, 185067, 144524, 284543, 178017, 446746, 31573,
            206692, 258045, 238438, 169320, 279745, 147409, 306775, 287526, 238742,
            296567, 153894, 225026, 236095, 206709, 239652, 55183
        ]
    };

    const createChart = () => {
        new Chart(canvas, {
            type: 'line',
            data: {
                labels: timelineData.months,
                datasets: [
                    {
                        label: 'System Lags (>5000ms)',
                        data: timelineData.lags,
                        borderColor: '#ffcc00',
                        backgroundColor: 'rgba(255, 204, 0, 0.05)',
                        borderWidth: 2,
                        tension: 0.35,
                        pointBackgroundColor: '#ffcc00',
                        pointBorderColor: '#030303',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#ffcc00',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        fill: false
                    },
                    {
                        label: 'System Crashes (HTTP 500)',
                        data: timelineData.crashes,
                        borderColor: '#ff3e3e',
                        backgroundColor: 'rgba(255, 62, 62, 0.15)',
                        borderWidth: 2,
                        tension: 0.35,
                        pointBackgroundColor: '#ff3e3e',
                        pointBorderColor: '#030303',
                        pointHoverBackgroundColor: '#ffffff',
                        pointHoverBorderColor: '#ff3e3e',
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2500,
                    easing: 'easeOutSine'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                family: 'Outfit',
                                size: 12,
                                weight: '600'
                            },
                            boxWidth: 12,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(5, 5, 5, 0.95)',
                        titleFont: {
                            family: 'Outfit',
                            size: 13,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: 'Outfit',
                            size: 12
                        },
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        usePointStyle: true,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                return ` ${label}: ${context.raw.toLocaleString()} events`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#909090',
                            font: {
                                family: 'JetBrains Mono',
                                size: 9
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.03)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#909090',
                            font: {
                                family: 'JetBrains Mono',
                                size: 10
                            },
                            callback: function(value) {
                                return (value / 1000) + 'k';
                            }
                        }
                    }
                }
            }
        });
    };

    // Trigger timeline chart render when visible (Scroll Reveal)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createChart();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);
}

function initTerminalSimulation() {
    const consoleEl = document.getElementById('terminal-console');
    if (!consoleEl) return;

    const terminalBody = consoleEl.parentElement; // The scrollable container

    // Set initial prompt placeholder
    consoleEl.innerHTML = '<span class="terminal-prompt">hacker@nexus-forensics:~$ </span><span class="cursor"></span>';

    let hasStarted = false;

    const startForensics = async () => {
        if (hasStarted) return;
        hasStarted = true;

        consoleEl.innerHTML = '';
        
        // Helper to append elements
        const appendLine = (html, delay = 0) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const line = document.createElement('div');
                    line.innerHTML = html;
                    consoleEl.appendChild(line);
                    terminalBody.scrollTop = terminalBody.scrollHeight; // Scroll parent container
                    resolve();
                }, delay);
            });
        };

        // Helper to simulate character-by-character typing
        const typeCommand = (cmdText) => {
            return new Promise((resolve) => {
                const line = document.createElement('div');
                line.innerHTML = '<span class="terminal-prompt">hacker@nexus-forensics:~$ </span><span class="terminal-command"></span><span class="cursor"></span>';
                consoleEl.appendChild(line);
                const cmdEl = line.querySelector('.terminal-command');
                const cursorEl = line.querySelector('.cursor');
                
                let idx = 0;
                const interval = setInterval(() => {
                    cmdEl.textContent += cmdText[idx];
                    idx++;
                    terminalBody.scrollTop = terminalBody.scrollHeight; // Scroll parent container
                    if (idx >= cmdText.length) {
                        clearInterval(interval);
                        cursorEl.remove(); // Remove blinking cursor from command line
                        resolve();
                    }
                }, 35); // 35ms per character
            });
        };

        // 1. Type command
        await typeCommand("grep -o \"NEXUS_CART.*\" cart_web.log | awk '{print $1}' | uniq");
        await appendLine("", 150);

        // 2. Output system responses
        await appendLine("<span class=\"terminal-output\">[STATUS] Scanning cart_web.log...</span>", 250);
        await appendLine("<span class=\"terminal-output\">[STATUS] Parsing 21,146,398 log lines...</span>", 350);
        await appendLine("<span class=\"terminal-output\">[STATUS] Scanning path parameters for anomalous patterns...</span>", 450);
        await appendLine("<span class=\"terminal-output\">[FOUND] Anomalous unique parameters detected. Extracting Digital Signature segments:</span>", 350);
        await appendLine("", 150);

        // 3. Extract characters one-by-one
        const token = "NEXUS_CART_WAS_TO_EASY_YOUR_SYSTEM_WAS_ALREADY_FALING_APART_BEFORE_YOU_EVEN_REALIZED_IT_WAS_ME_GOEMON";
        const baseTime = 1773468000000; // Mock epoch time representing early 2026
        
        for (let i = 0; i < token.length; i++) {
            const char = token[i];
            const timeOffset = i * 50; // 50ms offset per char
            const date = new Date(baseTime + timeOffset);
            const timeStr = date.toISOString().replace('T', ' ').substring(0, 19);
            
            let charHtml = `<span class="terminal-output">[${timeStr}] Extraction Index ${(i+1).toString().padStart(3, '0')}: </span><span class="terminal-highlight">${char}</span>`;
            await appendLine(charHtml, 20); // 20ms interval between lines for rapid printing effect
        }

        await appendLine("", 250);
        await appendLine("<span class=\"terminal-success\">[SUCCESS] Forensic Analysis Complete. Digital Signature Reconstructed.</span>", 250);
        await appendLine("<span class=\"terminal-success\">Raw Signature: </span><span class=\"terminal-highlight\">" + token + "</span>", 150);
        await appendLine("<span class=\"terminal-success\">Decrypted Secret: </span><span class=\"terminal-highlight\">NEXUS CART WAS TO EASY YOUR SYSTEM WAS ALREADY FALING APART BEFORE YOU EVEN REALIZED IT WAS ME GOEMON</span>", 150);
        await appendLine("<span class=\"terminal-error\">[ALERT] Threat Actor Identified: </span><span class=\"terminal-highlight\">GOEMON</span>", 150);
        
        // Add final blinking prompt
        const finalPrompt = document.createElement('div');
        finalPrompt.innerHTML = '<span class="terminal-prompt">hacker@nexus-forensics:~$ </span><span class="cursor"></span>';
        consoleEl.appendChild(finalPrompt);
        terminalBody.scrollTop = terminalBody.scrollHeight; // Scroll parent container
    };

    // Trigger terminal animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(startForensics, 400); // 400ms delay after scrolling into view
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    observer.observe(consoleEl);
}




