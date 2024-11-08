function calculateProjectile() {
  const velocity = parseFloat(document.getElementById("velocity").value);
  const angle = parseFloat(document.getElementById("angle").value);
  const height = parseFloat(document.getElementById("height").value);
  const g = 9.81;
  
  // Convert angle to radians
  const angleRad = (angle * Math.PI) / 180;
  
  // Time of flight
  const timeOfFlight = (velocity * Math.sin(angleRad) + Math.sqrt(Math.pow(velocity * Math.sin(angleRad), 2) + 2 * g * height)) / g;
  
  // Maximum height
  const maxHeight = height + Math.pow(velocity * Math.sin(angleRad), 2) / (2 * g);
  
  // Range
  const range = velocity * Math.cos(angleRad) * timeOfFlight;
  
  // Final velocity (resultant velocity)
  const finalVy = velocity * Math.sin(angleRad) - g * timeOfFlight;
  const finalVx = velocity * Math.cos(angleRad);
  const finalVelocity = Math.sqrt(Math.pow(finalVx, 2) + Math.pow(finalVy, 2));
  
  // Angle of impact (tita), ensuring it's positive
  const impactAngle = Math.abs(Math.atan(finalVy / finalVx) * (180 / Math.PI)); // convert to degrees
  
  // Display results
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <p>Time of Flight: ${timeOfFlight.toFixed(2)} s</p>
    <p>Maximum Height: ${maxHeight.toFixed(2)} m</p>
    <p>Range: ${range.toFixed(2)} m</p>
    <p>Final Velocity (Resultant): ${finalVelocity.toFixed(2)} m/s</p>
    <p>Angle of Impact: ${impactAngle.toFixed(2)}°</p>
  `;
  resultDiv.classList.add("visible");
}
