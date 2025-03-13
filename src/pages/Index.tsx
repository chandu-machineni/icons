import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SearchInput from '@/components/IconGenerator/PromptInput';
import IconControls from '@/components/IconGenerator/IconControls';
import IconPreview from '@/components/IconGenerator/IconPreview';
import IconGallery from '@/components/IconGenerator/IconGallery';
import { Icon, getTotalIconCount } from '@/lib/icons/iconService';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Gallery icons will have a fixed size and stroke width
  const gallerySize = 24;
  const galleryStrokeWidth = 0.25;
  
  // Preview icon can be customized
  const [previewSize, setPreviewSize] = useState(40);
  const [previewStrokeWidth, setPreviewStrokeWidth] = useState(0.25);
  const [previewColor, setPreviewColor] = useState('currentColor');
  
  const [totalIcons, setTotalIcons] = useState<number>(0);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load initial icon statistics
  useEffect(() => {
    const loadIconStats = async () => {
      try {
        const total = await getTotalIconCount();
        setTotalIcons(total);
      } catch (error) {
        console.error("Error loading icon stats:", error);
      }
    };
    
    loadIconStats();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    // Reset selected icon when search changes
    if (selectedIcon) {
      setSelectedIcon(null);
    }
    
    // The actual search is handled by the IconGallery component
    setIsLoading(true);
    // Use a shorter timeout to prevent focus loss
    setTimeout(() => {
      setIsLoading(false);
    }, 50);
  };

  // Handle icon selection
  const handleIconSelect = (icon: Icon) => {
    setSelectedIcon(icon);
    // Reset preview size and stroke width when selecting a new icon
    setPreviewSize(40);
    setPreviewStrokeWidth(0.25);
    setPreviewColor('currentColor');
  };
  
  // Handle stroke width changes when not supported
  const handleStrokeWidthChange = (newStrokeWidth: number) => {
    setPreviewStrokeWidth(newStrokeWidth);
  };
  
  // Handle closing the preview
  const handleClosePreview = () => {
    setSelectedIcon(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Mobile breakpoint message */}
      <div className="lg:hidden fixed inset-0 z-50 flex flex-col items-center justify-between bg-background">
        <Header />
        <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
          <h1 className="text-2xl font-semibold mb-4">
            Switch to Desktop for Full Experience
          </h1>
          <p className="text-muted-foreground max-w-md">
            Our icon customization tools work best on larger screens. Visit us on your desktop to access our complete suite of icon customization features.
          </p>
        </div>
        <Footer />
      </div>
      
      <main className="flex-1 w-full px-40 pt-0 pb-6 hidden lg:block">
        <div className="container mx-auto max-w-[1024px]">
          {/* Search bar */}
          <div className="mb-8 max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground text-center mb-6 mt-0">
              {totalIcons.toLocaleString()} icons from popular libraries
            </p>
            <SearchInput 
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Main content - Icon Gallery */}
          <div className={`${selectedIcon ? 'lg:w-2/3 xl:w-3/4' : 'w-full'}`}>
            <IconGallery 
              searchQuery={debouncedSearchQuery}
              size={gallerySize}
              strokeWidth={galleryStrokeWidth}
              onIconSelect={handleIconSelect}
              isPreviewOpen={!!selectedIcon}
              selectedIconId={selectedIcon?.id}
            />
          </div>
          
          {/* Right Sidebar - Only show when an icon is selected */}
          {selectedIcon && (
            <div className="lg:w-1/3 xl:w-1/4 space-y-2 lg:sticky top-10 self-start">
              {/* Preview with Copy/Download buttons */}
              <IconPreview 
                selectedIcon={selectedIcon}
                isLoading={isLoading}
                size={previewSize}
                strokeWidth={previewStrokeWidth}
                color={previewColor}
                onClose={handleClosePreview}
                onStrokeWidthChange={handleStrokeWidthChange}
                onSizeChange={setPreviewSize}
                onColorChange={setPreviewColor}
                isDarkMode={false}
              />
              
              {/* Size, Stroke, and Color controls - now only affects preview */}
              <IconControls 
                size={previewSize}
                setSize={setPreviewSize}
                strokeWidth={previewStrokeWidth}
                setStrokeWidth={setPreviewStrokeWidth}
                color={previewColor}
                setColor={setPreviewColor}
                isLoading={isLoading}
                hasIcon={!!selectedIcon}
                supportsStroke={selectedIcon.iconifyName.split(':')[0].match(/(lucide|tabler|mingcute|line-md|carbon|mdi-light|iconoir|ph|solar|ri|uil|bx)/i) !== null}
                supportsColor={!selectedIcon.iconifyName.split(':')[0].match(/(twemoji|noto|emojione|fxemoji|openmoji|fluent-emoji|logos|flag|cryptocurrency|circle-flags)/i)}
              />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
