function calculateProjectile() {
    const velocity = parseFloat(document.getElementById("velocity").value);
    const angle = parseFloat(document.getElementById("angle").value);
    const initialHeight = parseFloat(document.getElementById("height").value);

    if (isNaN(velocity) || isNaN(angle) || isNaN(initialHeight)) {
        alert("Please enter valid numbers for all inputs.");
        return;
    }

    const angleRad = angle * (Math.PI / 180);

    const g = 9.81;


    const timeOfFlight = (velocity * Math.sin(angleRad) + Math.sqrt(Math.pow(velocity * Math.sin(angleRad), 2) + 2 * g * initialHeight)) / g;
    const maxHeight = initialHeight + Math.pow(velocity * Math.sin(angleRad), 2) / (2 * g);
    const range = (velocity * Math.cos(angleRad)) * timeOfFlight;

    const finalVelocity = Math.sqrt(Math.pow(velocity * Math.cos(angleRad), 2) + Math.pow(velocity * Math.sin(angleRad) - g * timeOfFlight, 2));
    let impactAngle = Math.atan((velocity * Math.sin(angleRad) - g * timeOfFlight) / (velocity * Math.cos(angleRad))) * (180 / Math.PI);
    impactAngle = ((impactAngle % 360) + 360) % 360;
 

    document.getElementById("result").innerHTML = `
        <p><strong>Time of Flight:</strong> ${timeOfFlight.toFixed(2)} s</p>
        <p><strong>Maximum Height:</strong> ${maxHeight.toFixed(2)} m</p>
        <p><strong>Range:</strong> ${range.toFixed(2)} m</p>
        <p><strong>Final Velocity:</strong> ${finalVelocity.toFixed(2)} m/s</p>
        <p><strong>Impact Angle:</strong> ${impactAngle.toFixed(2)}°</p>
    `;

    simulateProjectile(velocity, angleRad, initialHeight, timeOfFlight, maxHeight, range, finalVelocity, impactAngle);
}

function simulateProjectile(velocity, angleRad, initialHeight, totalTime, maxHeight, range, finalVelocity, impactAngle) {
    const canvas = document.getElementById("simulationCanvas");
    const ctx = canvas.getContext("2d");
    const g = 9.81;

    const padding = 50;
    const scale = Math.min(
        (canvas.width - 2 * padding) / range,
        (canvas.height - 2 * padding) / (maxHeight + initialHeight)
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.strokeStyle = "#555555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding); 
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "12px Arial";
    for (let i = 0; i <= maxHeight + initialHeight; i += Math.ceil((maxHeight + initialHeight) / 5)) {
        const yPos = canvas.height - padding - i * scale;
        ctx.fillText(i + " m", 20, yPos);
    }

    for (let i = 0; i <= range; i += Math.ceil(range / 5)) {
        const xPos = padding + i * scale;
        ctx.fillText(i + " m", xPos, canvas.height - 30);
    }

    let time = 0;
    const interval = 15;
    let previousX = padding, previousY = canvas.height - padding - initialHeight * scale;

    function animate() {
        if (time > totalTime) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#555555";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(padding, padding);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        for (let i = 0; i <= maxHeight + initialHeight; i += Math.ceil((maxHeight + initialHeight) / 5)) {
            const yPos = canvas.height - padding - i * scale;
            ctx.fillText(i + " m", 20, yPos);
        }
        for (let i = 0; i <= range; i += Math.ceil(range / 5)) {
            const xPos = padding + i * scale;
            ctx.fillText(i + " m", xPos, canvas.height - 30);
        }

        const x = velocity * Math.cos(angleRad) * time;
        const y = initialHeight + (velocity * Math.sin(angleRad) * time - 0.5 * g * Math.pow(time, 2));

        const canvasX = padding + x * scale;
        const canvasY = canvas.height - padding - y * scale;

        ctx.beginPath();
        ctx.moveTo(previousX, previousY);
        ctx.lineTo(canvasX, canvasY);
        ctx.strokeStyle = "#0ea900";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 10, 0, 2 * Math.PI); 
        ctx.fillStyle = "#0ea900";
        ctx.fill();

        previousX = canvasX;
        previousY = canvasY;

        ctx.fillStyle = "#ffffff";
        ctx.font = "14px Arial";
        ctx.fillText(`Time: ${time.toFixed(2)} s`, 60, 20);
        ctx.fillText(`Height: ${y.toFixed(2)} m`, 60, 40);
        ctx.fillText(`Range: ${x.toFixed(2)} m`, 60, 60);
        ctx.fillText(`Resultant Velocity: ${finalVelocity.toFixed(2)} m/s`, 60, 80);
        ctx.fillText(`Impact Angle: ${impactAngle.toFixed(2)}°`, 60, 100);

        time += interval / 1000;
        requestAnimationFrame(animate);
    }

    animate();
}
