document.getElementById("presentation-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const topic = document.getElementById("topic").value;
    const resultDiv = document.getElementById("result");

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
        });

        if (response.ok) {
            const presentationUrl = await response.text();
            resultDiv.innerHTML = `<p>Presentation generated successfully! <a href="${presentationUrl}" target="_blank">Click here to view your presentation</a></p>`;
        } else {
            throw new Error("Failed to generate presentation.");
        }
    } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
