import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Ruler, Paintbrush, AlertCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

export interface ControlsProps {
  size: number;
  setSize: (size: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  isLoading: boolean;
  hasIcon: boolean;
  color?: string;
  setColor?: (color: string) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onDownloadPNG?: () => void;
  isCopied?: boolean;
  supportsStroke?: boolean;
  supportsColor?: boolean;
}

// Predefined color palette with names
const colorPalette = [
  { value: '#000000', name: 'Black' },
  { value: '#FFFFFF', name: 'White' },
  { value: '#6E56CF', name: 'Primary' },
  { value: '#F97316', name: 'Orange' },
  { value: '#10B981', name: 'Green' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#3B82F6', name: 'Blue' },
  { value: '#EF4444', name: 'Red' },
  { value: '#A855F7', name: 'Purple' },
  { value: '#FACC15', name: 'Yellow' },
];

// Common color names
const colorNames = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'gray', 'black', 'white',
  'cyan', 'magenta', 'lime', 'maroon', 'navy', 'olive', 'teal', 'aqua', 'fuchsia', 'silver'
];

const IconControls: React.FC<ControlsProps> = ({
  size,
  setSize,
  strokeWidth,
  setStrokeWidth,
  color = 'currentColor',
  setColor,
  isLoading,
  hasIcon,
  supportsStroke = true,
  supportsColor = true,
}) => {
  const [customColor, setCustomColor] = useState('');
  const [isValidColor, setIsValidColor] = useState(true);
  const [showError, setShowError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [open, setOpen] = useState(false);

  // Update customColor when color prop changes
  useEffect(() => {
    setCustomColor(color);
  }, [color]);

  // Validate color input
  const validateColor = (input: string) => {
    if (!input) return false;
    
    // Check for valid hex code (3 or 6 digits)
    const hexRegex = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
    // Check for valid color name
    const isValidHex = hexRegex.test(input);
    const isValidName = colorNames.includes(input.toLowerCase());
    
    return isValidHex || isValidName;
  };

  // Handle color input change
  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    const isValid = validateColor(newColor);
    setIsValidColor(isValid);
    setShowError(!isValid && newColor.length > 0);
  };

  // Handle color apply
  const handleColorApply = () => {
    if (validateColor(customColor)) {
      setColor(customColor);
      setShowError(false);
    }
  };

  // Handle color input key press
  const handleColorKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && validateColor(customColor)) {
      handleColorApply();
    }
  };

  // Filter colors based on search query
  const filteredColors = colorPalette.filter(color => 
    color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    color.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Size</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{size}</span>
            </div>
            <Slider
              value={[size]}
              onValueChange={(value) => setSize(value[0])}
              min={16}
              max={200}
              step={1}
              className="flex-1"
              disabled={isLoading || !hasIcon}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>16</span>
              <span>200</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stroke</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-900">{(strokeWidth * 1.67).toFixed(1)}</span>
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={!supportsStroke ? 'cursor-not-allowed' : ''} 
                       onClick={() => !supportsStroke && toast.info("Stroke editing not supported for this icon")}>
                    <Slider
                      value={[strokeWidth]}
                      min={0.3}
                      max={4.8}
                      step={0.1}
                      onValueChange={(values) => setStrokeWidth(values[0])}
                      disabled={isLoading || !hasIcon || !supportsStroke}
                      className={`py-1 ${!supportsStroke ? 'opacity-50' : ''}`}
                    />
                  </div>
                </TooltipTrigger>
                {!supportsStroke && (
                  <TooltipContent side="top" className="max-w-[275px]" sideOffset={5}>
                    <p className="text-xs whitespace-pre-line">
                      This icon doesn't support stroke changes.{'\n'}
                      You can edit it in design tools like Figma or Illustrator.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5</span>
              <span>8.0</span>
            </div>
            {!supportsStroke && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                  <Ruler className="h-3 w-3" />
                  <span>Stroke is not adjustable</span>
                </div>
              </div>
            )}
          </div>
          
          {supportsColor && (
            <div className="space-y-2">
              <Label>Color</Label>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={!supportsColor ? 'cursor-not-allowed' : ''}
                         onClick={() => !supportsColor && toast.info("Color editing not supported for this icon")}>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={isLoading || !hasIcon || !supportsColor}
                          >
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border border-slate-200" 
                                style={{ backgroundColor: color }}
                              />
                              <span>{color === 'currentColor' ? 'Default' : color}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-4" side="top" align="start">
                          <div className="grid grid-cols-5 gap-3 place-items-center mb-3">
                            {colorPalette.map((paletteColor) => (
                              <button
                                key={paletteColor.value}
                                className={`w-8 h-8 rounded-full border border-slate-200 ${
                                  color === paletteColor.value ? 'border-primary border-2' : ''
                                } hover:border-primary/50 transition-colors`}
                                style={{ backgroundColor: paletteColor.value }}
                                onClick={() => {
                                  setColor(paletteColor.value);
                                  setCustomColor(paletteColor.value);
                                  setOpen(false);
                                }}
                                disabled={!supportsColor}
                              >
                                {color === paletteColor.value && (
                                  <Check className="w-4 h-4 mx-auto text-white" />
                                )}
                              </button>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                value={customColor}
                                onChange={handleColorInputChange}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && validateColor(customColor)) {
                                    handleColorApply();
                                    setOpen(false);
                                  }
                                }}
                                placeholder="Enter hex or color name"
                                className={cn(
                                  "flex-1",
                                  showError && "border-red-500 focus-visible:ring-red-500"
                                )}
                                disabled={!supportsColor}
                              />
                              {showError && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500">
                                  <AlertCircle className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <Button 
                              onClick={() => {
                                if (validateColor(customColor)) {
                                  handleColorApply();
                                  setOpen(false);
                                }
                              }}
                              size="sm"
                              disabled={!supportsColor || !isValidColor || !customColor || customColor === color}
                            >
                              Apply
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TooltipTrigger>
                  {!supportsColor && (
                    <TooltipContent side="top" className="max-w-[275px]" sideOffset={5}>
                      <p className="text-xs whitespace-pre-line">
                        This icon doesn't support color changes.{'\n'}
                        You can edit it in design tools like Figma or Illustrator.
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              
              {!supportsColor && (
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                    <Paintbrush className="h-3 w-3" />
                    <span>Color is not adjustable</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IconControls;
