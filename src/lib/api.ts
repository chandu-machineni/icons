// API service for interacting with the backend

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface GenerateIconParams {
  prompt: string;
  size: number;
  strokeWidth: number;
}

export interface GenerateIconResult {
  svgCode: string;
}

/**
 * Generate an SVG icon using the FastAPI backend
 */
export const generateIcon = async (params: GenerateIconParams): Promise<GenerateIconResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-icon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: params.prompt,
        size: params.size,
        stroke_width: params.strokeWidth, // Convert to snake_case for Python backend
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to generate icon');
    }

    const data = await response.json();
    
    // Return the SVG code from the response
    return { 
      svgCode: data.svgCode
    };
  } catch (error: any) {
    console.error('Error generating icon:', error);
    throw error;
  }
};

/**
 * Fallback to the mock API when the backend is not available
 */
export const generateIconFallback = async (params: GenerateIconParams): Promise<GenerateIconResult> => {
  // Importing this dynamically to avoid circular dependencies
  const { generateIcon: mockGenerateIcon } = await import('./mockApi');
  return mockGenerateIcon(params);
}; 