function calculateCGPA(): void {
    // Read marks from HTML
    const webT = parseFloat((document.getElementById("webT") as HTMLElement).innerText);
    const cn = parseFloat((document.getElementById("cn") as HTMLElement).innerText);
    const cc = parseFloat((document.getElementById("cc") as HTMLElement).innerText);
    const cv = parseFloat((document.getElementById("cv") as HTMLElement).innerText);

    // Store in an array
    const marks = [webT, cn, cc, cv];

    // Convert marks → grade points (10-point scale)
    const gradePoints = marks.map(m => {
        if (m >= 90) return 10;
        else if (m >= 80) return 9;
        else if (m >= 70) return 8;
        else if (m >= 60) return 7;
        else if (m >= 50) return 6;
        else if (m >= 40) return 5;
        else return 0;
    });



}

// Run automatically on page load
window.onload = calculateCGPA;
