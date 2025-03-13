import React, { useEffect, useState, useRef, forwardRef, ForwardedRef } from 'react';
import { Icon } from '@iconify/react';
import { Paintbrush, Ruler } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supportsStroke as checkSupportsStroke, isColoredIcon as checkIsColoredIcon } from '@/lib/icons/iconService';

interface DynamicIconProps {
  iconName: string;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
  isPreview?: boolean;
  onStrokeWidthChange?: (value: number) => void;
  containerClassName?: string;
  showFeatureIndicatorsInContainer?: boolean;
  featureIndicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const DynamicIcon = forwardRef<HTMLSpanElement, DynamicIconProps>(({
  iconName,
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 0.25,
  onClick,
  isPreview = false,
  onStrokeWidthChange,
  containerClassName = '',
  showFeatureIndicatorsInContainer = false,
  featureIndicatorPosition = 'top-left'
}, ref) => {
  const [supportsStroke, setSupportsStroke] = useState(true);
  const [supportsColor, setSupportsColor] = useState(true);
  const internalIconRef = useRef<HTMLSpanElement>(null);
  
  // Use the forwarded ref or fall back to the internal ref
  const iconRef = ref || internalIconRef;
  
  // Check if the icon library supports stroke width and color
  useEffect(() => {
    if (!iconName) return;
    
    const iconPath = iconName.replace(':', '/');
    const hasStrokeSupport = checkSupportsStroke(iconPath);
    const hasColorSupport = !checkIsColoredIcon(iconPath);
    
    setSupportsStroke(hasStrokeSupport);
    setSupportsColor(hasColorSupport);
    
    // If stroke width changes are not supported, notify parent
    if (!hasStrokeSupport && onStrokeWidthChange) {
      onStrokeWidthChange(0.25); // Reset to default
    }
  }, [iconName, onStrokeWidthChange]);

  // Apply styles to the SVG element directly after it's rendered
  useEffect(() => {
    // Get the DOM node from either the forwarded ref or internal ref
    const node = ref && typeof ref === 'object' && ref.current 
      ? ref.current 
      : internalIconRef.current;
      
    if (!node) return;
    
    // Find the SVG element inside the container
    const svgElement = node.querySelector('svg');
    if (!svgElement) return;
    
    // Apply stroke width if supported
    if (supportsStroke && strokeWidth !== undefined) {
      svgElement.setAttribute('stroke-width', strokeWidth.toString());
      svgElement.setAttribute('stroke-linecap', 'round');
      svgElement.setAttribute('stroke-linejoin', 'round');
      
      // Apply to all path elements
      const paths = svgElement.querySelectorAll('path, line, rect, circle, ellipse, polyline, polygon');
      paths.forEach(path => {
        if (path.getAttribute('stroke') !== 'none') {
          path.setAttribute('stroke-width', strokeWidth.toString());
          
          // Ensure stroke attribute is set if missing
          if (!path.hasAttribute('stroke')) {
            path.setAttribute('stroke', 'currentColor');
          }
        }
      });
      
      // Apply to groups
      const groups = svgElement.querySelectorAll('g');
      groups.forEach(group => {
        if (group.getAttribute('stroke') !== 'none') {
          group.setAttribute('stroke-width', strokeWidth.toString());
          
          // Ensure stroke attribute is set if missing
          if (!group.hasAttribute('stroke')) {
            group.setAttribute('stroke', 'currentColor');
          }
        }
      });
    }
    
    // Apply color if supported
    if (supportsColor && color !== 'currentColor') {
      // Apply to all elements with stroke or fill
      const elements = svgElement.querySelectorAll('[stroke], [fill]');
      elements.forEach(el => {
        // Apply to stroke if it's not "none"
        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
          el.setAttribute('stroke', color);
        }
        
        // Apply to fill if it's not "none"
        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
          el.setAttribute('fill', color);
        }
      });
      
      // If no elements have stroke/fill, apply to SVG root
      if (elements.length === 0) {
        svgElement.setAttribute('stroke', color);
        svgElement.setAttribute('fill', color);
      }
    }
  }, [iconName, size, color, strokeWidth, supportsStroke, supportsColor, ref]);

  if (!iconName) {
    return null;
  }

  // Create custom styles based on the icon library
  const customStyles: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    color: supportsColor ? color : undefined,
    ...(supportsStroke ? {
      strokeWidth: `${strokeWidth}px`,
      stroke: color,
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    } : {})
  };

  const renderFeatureIndicator = () => {
    // Always return null to remove feature indicators
    return null;
  };

  return (
    <span 
      className={`inline-flex relative ${className} ${containerClassName}`}
      onClick={onClick}
      data-stroke-width={strokeWidth}
      data-library={iconName.split(':')[0]}
      data-supports-stroke={supportsStroke}
      data-supports-color={supportsColor}
      ref={ref || internalIconRef}
    >
      {renderFeatureIndicator()}
      <Icon 
        icon={iconName} 
        width={size} 
        height={size}
        color={supportsColor ? color : undefined}
        style={customStyles}
      />
    </span>
  );
});

DynamicIcon.displayName = 'DynamicIcon';

export default DynamicIcon; 