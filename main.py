from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from playwright.async_api import async_playwright
import logging
import base64

# Initialize FastAPI
app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Configure logging
logging.basicConfig(level=logging.INFO)

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/scan")
async def scan_url(request: Request):
    try:
        data = await request.json()
        url = data.get("url", "").strip()
        
        if not url.startswith(("http://", "https://")):
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid URL", "message": "URL must start with http:// or https://"}
            )
        
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            # Set timeout and wait for page to load
            await page.goto(url, wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(2000)  # Additional stability wait
            
            # Capture screenshot
            screenshot = await page.screenshot(full_page=True, type="png")
            await browser.close()
            
            # Return base64 encoded image
            return JSONResponse({
                "status": "success",
                "image": base64.b64encode(screenshot).decode("utf-8")
            })
            
    except Exception as e:
        logging.error(f"Scan failed: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Scan Failed", "message": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
