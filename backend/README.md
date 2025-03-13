# Icons AI Backend

This is the backend service for the Icons application, providing AI-powered icon search and recommendations.

## Features

- Stable Diffusion with ControlNet for structured icon generation
- Pix2SVG for converting raster images to clean vector SVGs
- FastAPI for efficient API handling

## Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Optional: Docker for containerized deployment

### Installation

1. Install dependencies:
   ```bash
   python setup.py
   ```

   Or manually:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python run.py
   ```

   The server will be available at http://localhost:8000

### Docker Setup

1. Build the Docker image:
   ```bash
   docker build -t iconify-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 iconify-backend
   ```

## API Endpoints

### Generate SVG Icon

```
POST /generate-icon
```

Request body:
```json
{
  "prompt": "lightning bolt icon",
  "size": 24,
  "stroke_width": 1.5
}
```

Response:
```json
{
  "svgCode": "<svg>...</svg>"
}
```

## Environment Variables

None required for basic functionality.

## Troubleshooting

If you encounter any issues with the AI models or SVG conversion, check the following:

1. Ensure you have enough disk space for downloading AI models
2. For CUDA errors, ensure you have compatible NVIDIA drivers
3. For memory issues, try reducing batch size or model parameters

## License

MIT 