document.getElementById('scanForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = document.getElementById('scanInput').value;
    const resultDiv = document.getElementById('result');
    
    resultDiv.innerHTML = `
        <div class="text-center">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Scanning website...</p>
        </div>
    `;

    try {
        const response = await fetch('/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        
        if (response.ok) {
            resultDiv.innerHTML = `
                <div class="text-center">
                    <h4 class="mb-3">Scan Result</h4>
                    <img src="data:image/png;base64,${data.image}" 
                         class="img-fluid rounded" 
                         style="max-width: 100%; height: auto;">
                    <div class="mt-3">
                        <button onclick="downloadImage('${data.image}')" 
                                class="btn btn-success">
                            <i class="fas fa-download me-2"></i>Download
                        </button>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    <h4><i class="fas fa-exclamation-triangle me-2"></i>Error</h4>
                    <p class="mb-0">${data.error}</p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle me-2"></i>Connection Error</h4>
                <p class="mb-0">${error.message}</p>
            </div>
        `;
    }
});

function downloadImage(base64Data) {
    const link = document.createElement('a');
    link.download = 'scan-result.png';
    link.href = `data:image/png;base64,${base64Data}`;
    link.click();
}
