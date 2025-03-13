from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import json
# Import the mock implementation instead of the full AI one
from .mock_icon_generator import generate_icon_from_prompt, convert_to_svg
from pydantic import BaseModel

app = FastAPI(title="Icons AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for now. In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IconRequest(BaseModel):
    prompt: str
    size: int = 24
    stroke_width: float = 1.5

@app.get("/")
def read_root():
    return {"status": "Iconify AI API is running (Mock Mode)"}

@app.post("/generate-icon")
async def generate_icon(request: IconRequest):
    try:
        # Generate the icon using our mock implementation
        result = await generate_icon_from_prompt(
            prompt=request.prompt,
            size=request.size
        )
        
        # Convert raster to SVG using our mock implementation
        svg_code = await convert_to_svg(
            image_path=result,
            stroke_width=request.stroke_width
        )
        
        # Apply the actual size to the SVG
        svg_code = svg_code.replace('width="24"', f'width="{request.size}"')
        svg_code = svg_code.replace('height="24"', f'height="{request.size}"')
        
        return {"svgCode": svg_code}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 