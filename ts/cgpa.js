function calculateCGPA() {
    // Read marks from HTML
    var webT = parseFloat(document.getElementById("webT").innerText);
    var cn = parseFloat(document.getElementById("cn").innerText);
    var cc = parseFloat(document.getElementById("cc").innerText);
    var cv = parseFloat(document.getElementById("cv").innerText);
    // Store in an array
    var marks = [webT, cn, cc, cv];
    // Convert marks → grade points (10-point scale)
    var gradePoints = marks.map(function (m) {
        if (m >= 90)
            return 10;
        else if (m >= 80)
            return 9;
        else if (m >= 70)
            return 8;
        else if (m >= 60)
            return 7;
        else if (m >= 50)
            return 6;
        else if (m >= 40)
            return 5;
        else
            return 0;
    });
    // Calculate average CGPA
    var cgpa = gradePoints.reduce(function (a, b) { return a + b; }, 0) / gradePoints.length;
    // Display the result
    document.getElementById("res").innerText = cgpa.toFixed(2);
}
// Run automatically on page load
window.onload = calculateCGPA;
