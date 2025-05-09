document.addEventListener("DOMContentLoaded", () => {
 
  const messageTextarea = document.getElementById('message');
  if (messageTextarea) {
    messageTextarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  }

  const scanForm = document.getElementById("scanForm");
  if (scanForm) {
    scanForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const urlInput = document.getElementById("urlInput").value;
      const resultDiv = document.getElementById("scanResult");
      resultDiv.innerText = "⏳ Scanning... Please wait...";

      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlInput })
        });

        const data = await response.json();

        if (data.error) {
          resultDiv.innerText = `❌ Error: ${data.error}`;
          return;
        }

        if (data.malicious !== null) {
          resultDiv.innerText = data.malicious
            ? "⚠️ Malicious URL detected!"
            : "✅ This URL seems safe.";
        } else {
          resultDiv.innerText = `ℹ️ Scan submitted. Checking results...`;
          const pollInterval = setInterval(async () => {
            try {
              const resultRes = await fetch(`/api/scan/status/${data.uuid}`);
              const statusData = await resultRes.json();

              if (statusData.malicious !== null) {
                clearInterval(pollInterval);
                resultDiv.innerText = statusData.malicious
                  ? "⚠️ Malicious URL detected!"
                  : "✅ This URL seems safe.";
              }
            } catch (err) {
              console.error("Error checking scan status:", err);
              resultDiv.innerText = "❌ Error fetching scan results.";
              clearInterval(pollInterval);
            }
          }, 10000);
        }
      } catch (err) {
        resultDiv.innerText = "❌ Error scanning the URL.";
        console.error(err);
      }
    });

    const clearResult = () => {
      document.getElementById("scanResult").innerText = "";
    };

    document.getElementById("urlInput").addEventListener("input", clearResult);
    document.getElementById("urlInput").addEventListener("focus", clearResult);
  }

  // =============== CONTACT FORM ===============
  const contactForm = document.getElementById('contactForm');
  const loadingSpinner = document.getElementById('loadingSpinner');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      loadingSpinner.style.display = 'block'; // Show spinner

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await res.json();
        if (res.ok) {
          // Do not show alert, just hide spinner
          contactForm.reset();
        } else {
          console.error('Error:', data.error);
        }
      } catch (error) {
        console.error('Failed to send contact message:', error);
      } finally {
        loadingSpinner.style.display = 'none'; // Hide spinner after request is complete
      }
    });
  }
});
