import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Copy, Check } from 'lucide-react';
import { Icon } from '@/lib/icons/iconService';
import { getSvgWithOptions } from '@/lib/icons/iconService';
import { toast } from 'sonner';

interface IconUsageProps {
  selectedIcon: Icon | null;
  size: number;
  strokeWidth: number;
}

const IconUsage: React.FC<IconUsageProps> = ({
  selectedIcon,
  size,
  strokeWidth
}) => {
  const [activeCopy, setActiveCopy] = useState<string | null>(null);

  if (!selectedIcon) {
    return null;
  }

  // Handle copy for different code snippets
  const handleCopy = async (type: string, content: string) => {
    try {
      // Try to use the modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      setActiveCopy(type);
      toast.success("Copied to clipboard");
      
      // Reset after 2 seconds
      setTimeout(() => {
        setActiveCopy(null);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Function to get SVG code
  const getSvgCode = async (): Promise<string> => {
    try {
      const svgContent = await getSvgWithOptions(selectedIcon.iconifyName, size, strokeWidth);
      return svgContent || '';
    } catch (error) {
      console.error("Error getting SVG:", error);
      return '';
    }
  };

  // Generate HTML code example
  const getHtmlCode = (): string => {
    return `<img src="https://api.iconify.design/icon/${selectedIcon.iconifyName}.svg?width=${size}&height=${size}" alt="${selectedIcon.name}" />`;
  };

  // Generate React code example
  const getReactCode = (): string => {
    return `import { Icon } from '@iconify/react';\n\n<Icon icon="${selectedIcon.iconifyName}" width={${size}} height={${size}} />`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3">
        <Tabs defaultValue="svg" className="w-full">
          <TabsList className="mb-2 w-full justify-start h-7">
            <TabsTrigger value="svg" className="text-xs h-6 px-2">SVG</TabsTrigger>
            <TabsTrigger value="html" className="text-xs h-6 px-2">HTML</TabsTrigger>
            <TabsTrigger value="react" className="text-xs h-6 px-2">React</TabsTrigger>
          </TabsList>
          
          {/* SVG Usage */}
          <TabsContent value="svg" className="text-xs mt-0">
            <div className="relative rounded-md bg-slate-50 p-3 font-mono text-xs">
              <div className="overflow-x-auto pr-8 pb-2 max-h-32 whitespace-pre-wrap">
                {`<svg 
  width="${size}" 
  height="${size}" 
  viewBox="0 0 24 24"
  stroke-width="${strokeWidth}"
  xmlns="http://www.w3.org/2000/svg"
  ...
/>`}
              </div>
              <button
                onClick={async () => {
                  const svgCode = await getSvgCode();
                  handleCopy('svg', svgCode);
                }}
                className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 transition-colors"
                aria-label="Copy SVG code"
              >
                {activeCopy === 'svg' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                )}
              </button>
            </div>
          </TabsContent>
          
          {/* HTML Usage */}
          <TabsContent value="html" className="text-xs mt-0">
            <div className="relative rounded-md bg-slate-50 p-3 font-mono text-xs">
              <div className="overflow-x-auto pr-8 pb-2 max-h-32 whitespace-pre-wrap">
                {getHtmlCode()}
              </div>
              <button
                onClick={() => handleCopy('html', getHtmlCode())}
                className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 transition-colors"
                aria-label="Copy HTML code"
              >
                {activeCopy === 'html' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                )}
              </button>
            </div>
          </TabsContent>
          
          {/* React Usage */}
          <TabsContent value="react" className="text-xs mt-0">
            <div className="relative rounded-md bg-slate-50 p-3 font-mono text-xs">
              <div className="overflow-x-auto pr-8 pb-2 max-h-32 whitespace-pre-wrap">
                {getReactCode()}
              </div>
              <button
                onClick={() => handleCopy('react', getReactCode())}
                className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 transition-colors"
                aria-label="Copy React code"
              >
                {activeCopy === 'react' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                )}
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IconUsage; 