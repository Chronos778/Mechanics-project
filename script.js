// Global variables to store simulation state
let animationId = null;
let simulationData = null;

function calculateProjectile() {
    const velocity = parseFloat(document.getElementById("velocity").value);
    const angle = parseFloat(document.getElementById("angle").value);
    const initialHeight = parseFloat(document.getElementById("height").value);

    if (isNaN(velocity) || isNaN(angle) || isNaN(initialHeight)) {
        showNotification("Please enter valid numbers for all inputs.", "error");
        return;
    }

    // Reset any previous animation
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    // Convert angle to radians
    const angleRad = angle * (Math.PI / 180);
    const g = 9.81; // Acceleration due to gravity in m/s²

    // Calculate projectile motion parameters
    const vx = velocity * Math.cos(angleRad);
    const vy = velocity * Math.sin(angleRad);
    
    // Time to reach maximum height
    const timeToMaxHeight = vy / g;
    
    // Maximum height
    const maxHeight = initialHeight + (vy * vy) / (2 * g);
    
    // Time of flight
    let timeOfFlight;
    if (initialHeight === 0) {
        // Simplified formula when starting from ground level
        timeOfFlight = 2 * vy / g;
    } else {
        // Quadratic formula solving for time when y = 0
        const a = -0.5 * g;
        const b = vy;
        const c = initialHeight;
        // Quadratic formula: t = (-b + sqrt(b² - 4ac)) / 2a
        timeOfFlight = (-b + Math.sqrt(b*b - 4*a*c)) / (2*a);
    }
    
    // Range
    const range = vx * timeOfFlight;
    
    // Final velocity components
    const vxFinal = vx; // Horizontal velocity is constant
    const vyFinal = vy - g * timeOfFlight; // Vertical velocity at impact
    
    // Final resultant velocity
    const finalVelocity = Math.sqrt(vxFinal*vxFinal + vyFinal*vyFinal);
    
    // Impact angle with the ground
    const impactAngle = Math.abs(Math.atan(vyFinal / vxFinal) * (180 / Math.PI));

    // Store simulation data for reuse
    simulationData = {
        velocity, angle, angleRad, initialHeight, 
        vx, vy, maxHeight, range, timeOfFlight, 
        timeToMaxHeight, finalVelocity, impactAngle
    };

    // Update the result panel with calculated values
    updateResultsPanel(simulationData);
    
    // Run the simulation
    runSimulation(simulationData);
}

function updateResultsPanel(data) {
    const resultPanel = document.getElementById("result");
    resultPanel.innerHTML = `
        <h3>Simulation Results</h3>
        <div class="result-item">
            <span class="result-label">Time of Flight:</span>
            <span class="result-value">${data.timeOfFlight.toFixed(2)} s</span>
        </div>
        <div class="result-item">
            <span class="result-label">Maximum Height:</span>
            <span class="result-value">${data.maxHeight.toFixed(2)} m</span>
        </div>
        <div class="result-item">
            <span class="result-label">Range:</span>
            <span class="result-value">${data.range.toFixed(2)} m</span>
        </div>
        <div class="result-item">
            <span class="result-label">Time to Max Height:</span>
            <span class="result-value">${data.timeToMaxHeight.toFixed(2)} s</span>
        </div>
        <div class="result-item">
            <span class="result-label">Final Velocity:</span>
            <span class="result-value">${data.finalVelocity.toFixed(2)} m/s</span>
        </div>
        <div class="result-item">
            <span class="result-label">Impact Angle:</span>
            <span class="result-value">${data.impactAngle.toFixed(2)}°</span>
        </div>
    `;
    
    // Apply some styling to the result items
    const resultItems = resultPanel.querySelectorAll('.result-item');
    resultItems.forEach(item => {
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.margin = '0.5rem 0';
        item.style.padding = '0.5rem 0';
        item.style.borderBottom = '1px solid #eee';
    });
    
    const resultLabels = resultPanel.querySelectorAll('.result-label');
    resultLabels.forEach(label => {
        label.style.color = '#666';
        label.style.fontWeight = '500';
    });
    
    const resultValues = resultPanel.querySelectorAll('.result-value');
    resultValues.forEach(value => {
        value.style.fontWeight = '600';
        value.style.color = '#2962ff';
    });
}

function runSimulation(data) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");
    const crcCanvas = document.getElementById("crcCanvas");
    const crcCtx = crcCanvas.getContext("2d");
    
    // Clear both canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    crcCtx.clearRect(0, 0, crcCanvas.width, crcCanvas.height);
    
    // Set up simulation parameters
    const g = 9.81;
    const padding = 40;
    
    // Calculate scaling factors
    const canvasWidth = canvas.width - 2 * padding;
    const canvasHeight = canvas.height - 2 * padding;
    
    // Determine the scale factor based on range and max height
    const scaleX = canvasWidth / (data.range * 1.1); // Add 10% margin
    const scaleY = canvasHeight / (data.maxHeight * 1.2); // Add 20% margin for top space
    const scale = Math.min(scaleX, scaleY);
    
    // Draw coordinate axes
    drawAxes(ctx, canvas, padding, data);
    drawCRCAxes(crcCtx, crcCanvas);
    
    // Draw the complete trajectory path in advance
    drawTrajectoryPath(ctx, canvas, padding, scale, data);
    
    // Draw the max height marker
    drawMaxHeightMarker(ctx, canvas, padding, scale, data);
    
    // Start the animation
    let time = 0;
    const timestep = 0.016; // 60 FPS approximately
    
    function animate() {
        if (time > data.timeOfFlight) {
            // Animation complete
            return;
        }
        
        // Clear only the portion needed for the projectile (not the entire canvas)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw the coordinate system and path
        drawAxes(ctx, canvas, padding, data);
        drawTrajectoryPath(ctx, canvas, padding, scale, data);
        drawMaxHeightMarker(ctx, canvas, padding, scale, data);
        
        // Calculate current position
        const x = data.vx * time;
        const y = data.initialHeight + (data.vy * time) - (0.5 * g * time * time);
        
        // Convert to canvas coordinates
        const canvasX = padding + x * scale;
        const canvasY = canvas.height - padding - y * scale;
        
        // Draw the current position indicator
        drawProjectile(ctx, canvasX, canvasY, time, data);
        
        // Update position tracker in CRC canvas
        updateCRCCanvas(crcCtx, crcCanvas, x / data.range, y / data.maxHeight, time / data.timeOfFlight);
        
        // Update time and schedule next frame
        time += timestep;
        animationId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

function drawAxes(ctx, canvas, padding, data) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Set up the coordinate system style
    ctx.fillStyle = "#1e1e24";
    ctx.fillRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    
    // Draw grid lines first
    drawGrid(ctx, canvas, padding, data);
    
    // Draw main axes
    ctx.beginPath();
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 2;
    
    // x-axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    
    // y-axis
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    
    ctx.stroke();
    
    // Add axis labels
    ctx.fillStyle = "#aaa";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    
    // X-axis label
    ctx.fillText("Distance (m)", width / 2, height - 10);
    
    // Y-axis label
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Height (m)", 0, 0);
    ctx.restore();
}

function drawGrid(ctx, canvas, padding, data) {
    const width = canvas.width;
    const height = canvas.height;
    
    // Calculate grid spacing
    const rangeRounded = Math.ceil(data.range / 10) * 10;
    const heightRounded = Math.ceil(data.maxHeight / 5) * 5;
    
    const gridSpacingX = rangeRounded / 5;
    const gridSpacingY = heightRounded / 5;
    
    // Calculate scale factors
    const scaleX = (width - 2 * padding) / data.range;
    const scaleY = (height - 2 * padding) / (data.maxHeight * 1.2);
    
    // Draw vertical grid lines and labels
    ctx.beginPath();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;
    ctx.textAlign = "center";
    ctx.fillStyle = "#999";
    ctx.font = "10px Arial";
    
    for (let x = 0; x <= rangeRounded; x += gridSpacingX) {
        const canvasX = padding + x * scaleX;
        if (canvasX <= width - padding) {
            ctx.moveTo(canvasX, height - padding);
            ctx.lineTo(canvasX, padding);
            ctx.fillText(x.toString(), canvasX, height - padding + 15);
        }
    }
    
    // Draw horizontal grid lines and labels
    for (let y = 0; y <= heightRounded * 1.2; y += gridSpacingY) {
        const canvasY = height - padding - y * scaleY;
        if (canvasY >= padding) {
            ctx.moveTo(padding, canvasY);
            ctx.lineTo(width - padding, canvasY);
            ctx.fillText(y.toString(), padding - 15, canvasY + 4);
        }
    }
    
    ctx.stroke();
}

function drawTrajectoryPath(ctx, canvas, padding, scale, data) {
    const g = 9.81;
    const timeStep = data.timeOfFlight / 100; // Divide into 100 segments
    
    ctx.beginPath();
    
    // Start at initial position
    let x = 0;
    let y = data.initialHeight;
    let canvasX = padding + x * scale;
    let canvasY = canvas.height - padding - y * scale;
    
    ctx.moveTo(canvasX, canvasY);
    
    // Draw the path
    for (let t = timeStep; t <= data.timeOfFlight; t += timeStep) {
        x = data.vx * t;
        y = data.initialHeight + (data.vy * t) - (0.5 * g * t * t);
        
        canvasX = padding + x * scale;
        canvasY = canvas.height - padding - y * scale;
        
        ctx.lineTo(canvasX, canvasY);
    }
    
    // Style the path
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawMaxHeightMarker(ctx, canvas, padding, scale, data) {
    // Draw a marker at the maximum height point
    const timeAtMaxHeight = data.vy / 9.81;
    const xAtMaxHeight = data.vx * timeAtMaxHeight;
    const maxHeight = data.initialHeight + (data.vy * data.vy) / (2 * 9.81);
    
    const canvasX = padding + xAtMaxHeight * scale;
    const canvasY = canvas.height - padding - maxHeight * scale;
    
    // Draw circle at max height point
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF5722";
    ctx.fill();
    
    // Add label
    ctx.fillStyle = "#FFF";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Max height: ${maxHeight.toFixed(2)}m`, canvasX + 10, canvasY - 5);
}

function drawProjectile(ctx, x, y, time, data) {
    // Draw the projectile
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "#2196F3";
    ctx.fill();
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw current time
    ctx.font = "14px Arial";
    ctx.fillStyle = "#FFF";
    ctx.textAlign = "left";
    ctx.fillText(`Time: ${time.toFixed(2)}s`, 20, 30);
    
    // Calculate current velocity
    const vx = data.vx;
    const vy = data.vy - 9.81 * time;
    const currentVelocity = Math.sqrt(vx*vx + vy*vy);
    
    // Draw velocity vector
    const angle = Math.atan2(vy, vx);
    drawVelocityVector(ctx, x, y, angle, currentVelocity);
}

function drawVelocityVector(ctx, x, y, angle, magnitude) {
    const vectorLength = 20;
    const endX = x + Math.cos(angle) * vectorLength;
    const endY = y - Math.sin(angle) * vectorLength; // Subtract because canvas y is inv
