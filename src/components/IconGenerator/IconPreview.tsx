import React, { useState, useRef, useEffect } from 'react';
import { Icon, getSvgWithOptions, supportsStroke, isColoredIcon, getFormattedFilename, showIconTypeWarning, getIconLicense, LicenseType } from '@/lib/icons/iconService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Download, Check, X, Code, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DynamicIcon from './DynamicIcon';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IconPreviewProps {
  selectedIcon: Icon | null;
  isLoading: boolean;
  size: number;
  strokeWidth: number;
  color?: string; 
  onClose?: () => void;
  onStrokeWidthChange: (newStrokeWidth: number) => void;
  onSizeChange: (newSize: number) => void;
  onColorChange: (newColor: string) => void;
  isDarkMode: boolean;
}

// Define the keyframes and animation class
const shakeAnimation = `
  @keyframes shake {
    0% { transform: translateX(0); }
    16.6% { transform: translateX(-5px); }
    33.3% { transform: translateX(5px); }
    50% { transform: translateX(-5px); }
    66.6% { transform: translateX(5px); }
    83.3% { transform: translateX(-3px); }
    100% { transform: translateX(0); }
  }
`;

// Add the animation style to the document head
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = shakeAnimation + `
    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(styleEl);
}

// Track which icons have had their attribution copied (persists between component instances)
const attributionCopiedIcons = new Set<string>();

const IconPreview: React.FC<IconPreviewProps> = ({
  selectedIcon,
  isLoading,
  size,
  strokeWidth,
  color = 'currentColor',
  onClose,
  onStrokeWidthChange,
  onSizeChange,
  onColorChange,
  isDarkMode
}) => {
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copyingSnippet, setCopyingSnippet] = useState(false);
  const [copyingAttribution, setCopyingAttribution] = useState(false);
  const [renderedSvg, setRenderedSvg] = useState<string | null>(null);
  const [shakeAttribution, setShakeAttribution] = useState(false);
  const iconContainerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  if (!selectedIcon && !isLoading) {
    return null;
  }

  // Get icon type and editability info
  const getIconInfo = () => {
    if (!selectedIcon) return { type: '', library: '' };
    const iconPath = selectedIcon.iconifyName.replace(':', '/');
    const prefix = iconPath.split('/')[0];
    
    // Define icon types and their libraries
    const iconTypes = {
      emoji: ['twemoji', 'noto', 'emojione', 'fxemoji', 'openmoji', 'fluent-emoji'],
      logos: ['logos', 'simple-icons', 'skill-icons', 'devicon'],
      flags: ['flag', 'circle-flags', 'country-flag'],
      payment: ['cryptocurrency', 'payment'],
      regular: ['lucide', 'tabler', 'mingcute', 'line-md', 'carbon', 'mdi-light', 'iconoir', 'ph', 'solar', 'ri', 'uil', 'bx']
    };
    
    // Determine icon type
    for (const [type, libraries] of Object.entries(iconTypes)) {
      if (libraries.some(lib => prefix.includes(lib))) {
        return { type, library: prefix };
      }
    }
    
    return { type: 'regular', library: prefix };
  };

  const { type, library } = getIconInfo();
  const iconPath = selectedIcon?.iconifyName.replace(':', '/') || '';
  const canEditStroke = supportsStroke(iconPath);
  const canEditColor = !isColoredIcon(iconPath);

  // Function to capture the rendered SVG directly from the DOM
  const captureRenderedSvg = () => {
    if (!iconRef.current) return null;
    
    // Find the SVG element inside the container
    const svgElement = iconRef.current.querySelector('svg');
    if (!svgElement) return null;
    
    // Clone the SVG to avoid modifying the displayed one
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Ensure width and height attributes are set
    clonedSvg.setAttribute('width', size.toString());
    clonedSvg.setAttribute('height', size.toString());
    
    // Ensure xmlns attribute is set for standalone SVG
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Add metadata for Figma frame naming
    if (selectedIcon) {
      // Add title element for accessibility and Figma frame naming
      const titleElement = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      titleElement.textContent = selectedIcon.name;
      clonedSvg.insertBefore(titleElement, clonedSvg.firstChild);
      
      // Add id attribute for Figma frame naming
      clonedSvg.setAttribute('id', selectedIcon.name.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // Apply computed styles to ensure stroke and color are correctly set
    const applyComputedStyles = (element: Element) => {
      if (element instanceof SVGElement) {
        const computedStyle = window.getComputedStyle(element);
        
        // Apply stroke attributes if they exist in computed styles
        if (computedStyle.stroke && computedStyle.stroke !== 'none') {
          element.setAttribute('stroke', color);
          element.setAttribute('stroke-width', strokeWidth.toString());
        }
        
        // Apply fill if it exists in computed styles
        if (computedStyle.fill && computedStyle.fill !== 'none') {
          element.setAttribute('fill', color);
        }
      }
      
      // Recursively apply to all child elements
      Array.from(element.children).forEach(applyComputedStyles);
    };
    
    // Apply styles to all elements
    applyComputedStyles(clonedSvg);
    
    // Serialize the SVG to a string
    const serializer = new XMLSerializer();
    return serializer.serializeToString(clonedSvg);
  };

  // Update the rendered SVG whenever relevant properties change
  useEffect(() => {
    if (selectedIcon && !isLoading) {
      // Wait a bit for the icon to render completely
      const timer = setTimeout(() => {
        const svg = captureRenderedSvg();
        if (svg) {
          setRenderedSvg(svg);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [selectedIcon, size, strokeWidth, color, isLoading]);

  // Check if attribution has been copied for the current icon
  const hasAttributionBeenCopied = () => {
    if (!selectedIcon) return false;
    return attributionCopiedIcons.has(selectedIcon.id);
  };

  // Handle copy SVG to clipboard
  const handleCopy = async () => {
    if (!selectedIcon) return;
    
    try {
      setCopying(true);
      console.log(`Copying icon with strokeWidth: ${strokeWidth}, color: ${color}`);
      
      // Use the captured SVG instead of fetching a new one
      const svgString = renderedSvg || captureRenderedSvg();
      
      if (!svgString) {
        console.error('Failed to capture SVG for copying');
        toast.error("Failed to capture SVG from preview");
        return;
      }
      
      // Try to use the clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(svgString);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = svgString;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Failed to copy SVG: ', err);
          throw err;
        }
        
        document.body.removeChild(textArea);
      }
      
      toast.success('SVG copied to clipboard!', {
        icon: '✓',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      // Show attribution reminder toast if needed and not already copied
      const license = getIconLicense(selectedIcon.iconifyName);
      if (license.type === 'attribution' && !hasAttributionBeenCopied()) {
        toast.warning("Don't forget attribution!", {
          description: "This icon requires attribution.\nCopy it from the badge.",
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fee2e2', // Tinted red background
            color: '#b91c1c',
            border: '1px solid #fecaca'
          }
        });
        
        // Trigger shake animation
        setShakeAttribution(true);
        setTimeout(() => setShakeAttribution(false), 500);
      } else if (license.type === 'unknown' && !hasAttributionBeenCopied()) {
        toast.warning("Attribution status unknown", {
          description: "Please check the source website for license information before using.",
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fef3c7', // Tinted yellow background
            color: '#92400e',
            border: '1px solid #fde68a'
          }
        });
      }
      
      setTimeout(() => {
        setCopying(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy SVG: ', error);
      toast.error(`Failed to copy SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCopying(false);
    }
  };

  // Handle SVG download
  const handleDownload = async () => {
    if (!selectedIcon) return;
    
    try {
      setDownloading(true);
      console.log(`Downloading icon with strokeWidth: ${strokeWidth}, color: ${color}`);
      
      // Use the captured SVG instead of fetching a new one
      const svgString = renderedSvg || captureRenderedSvg();
      
      if (!svgString) {
        console.error('Failed to capture SVG for download');
        toast.error("Failed to capture SVG from preview");
        return;
      }
      
      // Create a blob from the SVG string
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = getFormattedFilename(selectedIcon, {
        size,
        strokeWidth: canEditStroke ? strokeWidth : undefined,
        color: canEditColor ? color : undefined
      });
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Show attribution reminder toast if needed and not already copied
      const license = getIconLicense(selectedIcon.iconifyName);
      if (license.type === 'attribution' && !hasAttributionBeenCopied()) {
        toast.warning("Don't forget attribution!", {
          description: "This icon requires attribution.\nCopy it from the badge.",
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fee2e2', // Tinted red background
            color: '#b91c1c',
            border: '1px solid #fecaca'
          }
        });
        
        // Trigger shake animation
        setShakeAttribution(true);
        setTimeout(() => setShakeAttribution(false), 500);
      } else if (license.type === 'unknown' && !hasAttributionBeenCopied()) {
        toast.warning("Attribution status unknown", {
          description: "Please check the source website for license information before using.",
          duration: 5000,
          style: {
            borderRadius: '10px',
            background: '#fef3c7', // Tinted yellow background
            color: '#92400e',
            border: '1px solid #fde68a'
          }
        });
      }
      
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 100);
    } catch (error) {
      console.error('Failed to download SVG: ', error);
      toast.error(`Failed to download SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDownloading(false);
    }
  };
  
  // Handle copy code snippet
  const handleCopySnippet = () => {
    if (!selectedIcon) return;
    
    try {
      setCopyingSnippet(true);
      let snippet = `<Icon icon="${selectedIcon.iconifyName}" width="${size}" height="${size}"`;
      
      if (canEditStroke) {
        snippet += ` style={{ strokeWidth: ${strokeWidth} }}`;
      }
      
      if (canEditColor && color !== 'currentColor') {
        snippet += ` color="${color}"`;
      }
      
      snippet += ' />';
      
      navigator.clipboard.writeText(snippet);
      toast.success("Code snippet copied to clipboard");
      
      setTimeout(() => setCopyingSnippet(false), 2000);
    } catch (error) {
      console.error("Error copying snippet:", error);
      toast.error("Failed to copy code snippet");
      setCopyingSnippet(false);
    }
  };
  
  // Handle copying attribution text
  const handleCopyAttribution = async () => {
    if (!selectedIcon) return;
    
    const license = getIconLicense(selectedIcon.iconifyName);
    if (license.type === 'attribution' && license.attribution) {
      try {
        await navigator.clipboard.writeText(license.attribution);
        setCopyingAttribution(true);
        toast.success('Attribution copied to clipboard', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
        
        // Mark this icon as having had its attribution copied
        attributionCopiedIcons.add(selectedIcon.id);
        
        setTimeout(() => {
          setCopyingAttribution(false);
        }, 3000);
      } catch (error) {
        console.error('Failed to copy attribution:', error);
        toast.error('Failed to copy attribution', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          }
        });
      }
    }
  };
  
  // Get icon type display text
  const getIconTypeDisplay = () => {
    switch (type) {
      case 'emoji': return 'Emoji';
      case 'logos': return 'Logo';
      case 'flags': return 'Flag';
      case 'payment': return 'Payment Icon';
      default: return library;
    }
  };
  
  // Show warning for non-editable icons
  const showEditabilityWarning = () => {
    if (!canEditColor) {
      showIconTypeWarning(getIconTypeDisplay());
    }
  };
  
  // Get license information for the icon
  const getLicenseInfo = () => {
    if (!selectedIcon) return { type: 'unknown' as LicenseType };
    return getIconLicense(selectedIcon.iconifyName);
  };

  const license = getLicenseInfo();
  
  return (
    <div className="w-full max-w-[408px] mx-auto">
      <Card className="overflow-hidden border-0 shadow-sm relative">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            {/* Close button */}
      {onClose && (
        <button 
          onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
        >
                <X className="h-4 w-4" />
        </button>
      )}
      
            <div className="bg-slate-50 rounded-lg p-5 mb-4 flex items-center justify-center relative" ref={iconContainerRef}>
              <div 
                className="relative flex items-center justify-center w-full h-full"
                style={{ 
                  minHeight: `${size}px`,
                  minWidth: `${size}px`
                }}
              >
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ 
                    transform: `scale(${size / 24})`,
                    transformOrigin: 'center',
                    color: color === 'currentColor' ? 'currentColor' : color,
                    strokeWidth: strokeWidth * 1.67,
                    strokeLinejoin: 'round',
                    strokeLinecap: 'round'
                  }}
                >
              <DynamicIcon 
                iconName={selectedIcon.iconifyName}
                    size={24}
                strokeWidth={canEditStroke ? strokeWidth : undefined}
                color={canEditColor ? color : undefined}
                className="text-primary"
                onClick={showEditabilityWarning}
                    isPreview={true}
                    onStrokeWidthChange={onStrokeWidthChange}
                    containerClassName="relative"
                    showFeatureIndicatorsInContainer={false}
                    ref={iconRef}
              />
                </div>
              </div>
          </div>
            
            <div className="text-center mb-6">
              <h3 className="text-base font-medium mb-1">{selectedIcon.name}</h3>
              <p className="text-xs text-muted-foreground">
                {getIconTypeDisplay()}
                {canEditColor ? (
                  <>
                    {` • ${size}px`}
                    {canEditStroke && ` • ${(strokeWidth * 1.67).toFixed(1)}px`}
                    {color !== 'currentColor' && (
                      <span className="inline-flex items-center">
                        {' • '}
                        <span 
                          className="inline-block w-3 h-3 rounded-full ml-0.5" 
                          style={{ backgroundColor: color }}
                        />
                      </span>
                    )}
                  </>
                ) : (
                  ` • ${size}px • Non-editable`
                )}
          </p>
        </div>
            
            <div className="space-y-3 w-full">
              {/* Copy button - full width */}
                <Button 
                  onClick={handleCopy} 
                  variant="default"
                className="w-full h-9 justify-center rounded-full"
                  disabled={copying}
                >
                  {copying ? (
                  <span className="w-full inline-block text-center">Copied</span>
                ) : (
                  <span className="w-full inline-block text-center">Copy as SVG</span>
                  )}
                </Button>
              
              {/* Download button */}
              <Button 
                variant="outline" 
                onClick={handleDownload} 
                className="w-full h-9 justify-center rounded-full"
                disabled={downloading}
              >
                <span className="w-full inline-block text-center">Download as SVG</span>
              </Button>
              
              {/* License attribution badge */}
              {license.type === 'attribution' && (
                <div 
                  className={cn(
                    "flex items-center justify-between mt-3 p-2 bg-red-50 border border-red-200 rounded-lg h-[24px]",
                    shakeAttribution && "animate-shake"
                  )}
                >
                  <div className="flex items-center">
                    <span className="text-xs text-red-700">📢 Attribution required</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-xs text-red-700 hover:bg-red-50 hover:text-red-700 min-w-[50px]"
                    onClick={handleCopyAttribution}
                  >
                    {copyingAttribution ? (
                      <span className="w-full text-center">Copied</span>
                    ) : (
                      <span className="w-full text-center">Copy</span>
                    )}
                  </Button>
                </div>
              )}
              
              {license.type === 'free' && (
                <div className="flex items-center justify-center mt-3 p-2 bg-green-50 border border-green-200 rounded-lg h-[24px] min-w-full">
                  <span className="text-xs text-green-700">🎉 No attribution needed – free to use</span>
                </div>
              )}
              
              {license.type === 'unknown' && (
                <div className="flex items-center justify-center mt-3 p-2 bg-gray-50 border border-gray-200 rounded-lg h-[24px] min-w-full">
                  <span className="text-xs text-gray-700">❓ Attribution status unknown</span>
    </div>
        )}
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default IconPreview;
