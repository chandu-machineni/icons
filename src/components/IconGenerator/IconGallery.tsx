import React, { useState, useEffect } from 'react';
import { Icon, IconStyle, searchIcons, iconLibraries, iconCategories, getTotalIconCount } from '@/lib/icons/iconService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, Search, Code, Check, Filter, X, ArrowLeft, Loader2 } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import SortFilter, { SortOption } from './SortFilter';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IconGalleryProps {
  searchQuery: string;
  size: number;
  strokeWidth: number;
  onIconSelect: (icon: Icon) => void;
  isPreviewOpen: boolean;
  selectedIconId?: string;
}

const IconGallery: React.FC<IconGalleryProps> = ({ 
  searchQuery, 
  size = 24, 
  strokeWidth = 0.25,
  onIconSelect,
  isPreviewOpen = false,
  selectedIconId
}) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalAvailableIcons, setTotalAvailableIcons] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('all');
  const [filteredCount, setFilteredCount] = useState<number>(0);
  const ICONS_PER_PAGE = 100;
  
  // Track copy animation state
  const [copiedIcons, setCopiedIcons] = useState<Record<string, string>>({});
  
  // Store all results for pagination
  const [allResults, setAllResults] = useState<Icon[]>([]);
  const [filteredResults, setFilteredResults] = useState<Icon[]>([]);

  // Reset search and filters
  const resetSearch = () => {
    setSortBy('all');
  };

  // Filter icons based on sort option
  const filterIconsByStyle = (icons: Icon[]) => {
    if (sortBy === 'all') return icons;
    
    if (sortBy === 'others') {
      return icons.filter(icon => {
        const style = icon.style.toLowerCase();
        return !['outline', 'solid', 'thin', 'duotone', 'bold'].includes(style);
      });
    }
    
    return icons.filter(icon => icon.style.toLowerCase() === sortBy);
  };
  
  // Load total icon count on mount
  useEffect(() => {
    const fetchTotalIcons = async () => {
      try {
        const totalCount = await getTotalIconCount();
        setTotalAvailableIcons(totalCount);
      } catch (error) {
        console.error("Error fetching total icon count:", error);
      }
    };
    
    fetchTotalIcons();
  }, []);
  
  // Update filtered results when sort option or all results change
  useEffect(() => {
    const filtered = filterIconsByStyle(allResults);
    setFilteredResults(filtered);
    setFilteredCount(filtered.length);
    setIcons(filtered.slice(0, ICONS_PER_PAGE));
    setHasMore(filtered.length > ICONS_PER_PAGE);
    setPage(1);
  }, [sortBy, allResults]);
  
  // Load icons based on search
  useEffect(() => {
    const fetchIcons = async () => {
      setLoading(true);
      setPage(1);
      setIcons([]);
      
      try {
        const results = await searchIcons(searchQuery);
        setAllResults(results);
      } catch (error) {
        console.error("Error fetching icons:", error);
        toast.error("Failed to load icons. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchIcons();
  }, [searchQuery]);
  
  // Load more icons
  const loadMore = async () => {
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ICONS_PER_PAGE;
      const endIndex = nextPage * ICONS_PER_PAGE;
      
      const newIcons = filteredResults.slice(startIndex, endIndex);
      setIcons(prev => [...prev, ...newIcons]);
      setPage(nextPage);
      setHasMore(endIndex < filteredResults.length);
    } catch (error) {
      console.error("Error loading more icons:", error);
      toast.error("Failed to load more icons");
    } finally {
      setLoadingMore(false);
    }
  };

  // Determine the grid columns class based on whether preview is open
  const gridColumnsClass = isPreviewOpen
    ? "grid-cols-4 gap-2"
    : "grid-cols-5 gap-2";
  
  // Check if we're searching and have results
  const isSearching = !!searchQuery.trim();
  const hasSearchResults = isSearching && allResults.length > 0 && !loading;
  const hasFilteredResults = icons.length > 0;
  
  // Reset filter when search query changes
  useEffect(() => {
    setSortBy('all');
  }, [searchQuery]);

  // Calculate style counts from all results
  const calculateStyleCounts = (icons: Icon[]) => {
    const counts = {
      outline: 0,
      solid: 0,
      thin: 0,
      duotone: 0,
      bold: 0,
      others: 0
    };

    icons.forEach(icon => {
      const style = icon.style.toLowerCase();
      if (['outline', 'solid', 'thin', 'duotone', 'bold'].includes(style)) {
        counts[style as keyof typeof counts]++;
      } else {
        counts.others++;
      }
    });

    return Object.entries(counts).map(([style, count]) => ({
      style: style as SortOption,
      count
    }));
  };

  // Just call onIconSelect directly without the toast
  const handleIconSelect = (icon: Icon) => {
    onIconSelect(icon);
  };

  return (
    <div className="w-full max-w-[1024px] mx-auto space-y-4">
      {/* Search results header - only show when actively searching */}
      {hasSearchResults && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-medium text-lg flex items-center gap-2">
              "{searchQuery}"
              <Badge variant="secondary" className="px-2 py-0.5">
                {filteredCount.toLocaleString()} results
              </Badge>
            </h2>
          </div>
          <div>
            <SortFilter 
              value={sortBy} 
              onValueChange={setSortBy}
              totalIcons={allResults.length}
              styleCounts={calculateStyleCounts(allResults)}
            />
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className={`grid ${gridColumnsClass} gap-2`}>
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded mb-2" />
                <Skeleton className="h-3 w-16 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Icon grid display */}
      {!loading && hasFilteredResults && (
        <>
          <div className={`grid ${gridColumnsClass} gap-2`}>
            {icons.map((icon, index) => (
              <button
                key={index}
                onClick={() => handleIconSelect(icon)}
                className={cn(
                  "relative rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                  "flex flex-col items-center justify-center px-2 py-6",
                  selectedIconId === icon.id && "ring-2 ring-primary"
                )}
              >
                <div className="flex items-center justify-center h-10 w-full">
                  <DynamicIcon
                    iconName={icon.iconifyName}
                    size={32}
                    strokeWidth={strokeWidth}
                    className="text-primary"
                    containerClassName="relative"
                    showFeatureIndicatorsInContainer={false}
                  />
                </div>
                <div className="text-xs text-center text-muted-foreground truncate w-full mt-1">
                  {icon.name}
                </div>
              </button>
            ))}
          </div>
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center my-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMore}
                className="text-xs font-normal"
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Icons'}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Empty state */}
      {!loading && !hasFilteredResults && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-base font-medium">No icons found</h3>
          <p className="text-muted-foreground text-sm">
            {sortBy !== 'all' 
              ? 'No icons match the current filter. Try a different style filter.'
              : 'Try a different search term'}
          </p>
        </div>
      )}
      
      {/* Results count footer */}
      {!loading && hasFilteredResults && (
        <div className="text-xs text-muted-foreground text-center">
          {hasSearchResults ? (
            <>Showing {icons.length.toLocaleString()} of {filteredCount.toLocaleString()} results for "{searchQuery}"</>
          ) : (
            <>Showing popular icons from our library of {totalAvailableIcons.toLocaleString()}+ icons</>
          )}
        </div>
      )}
    </div>
  );
};

export default IconGallery;
