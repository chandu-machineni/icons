import { Icon as IconifyReactComponent } from '@iconify/react';
import { toast } from 'sonner';

// Define icon styles
export enum IconStyle {
  OUTLINE = 'outline',
  SOLID = 'solid',
  THIN = 'thin',
  DUOTONE = 'duotone',
  BOLD = 'bold'
}

// Interface for our Icon type
export interface Icon {
  id: string;
  name: string;
  tags: string[];
  style: IconStyle;
  library: string;
  category: string;
  iconifyName: string; // Reference to Iconify name (e.g., "mdi:home")
  apiSource?: string; // Which API the icon comes from
  svg?: string;
}

// Interface for icon API providers
interface IconProvider {
  id: string;
  name: string;
  search: (query: string, options?: any, page?: number) => Promise<Icon[]>;
  getPopular: () => Promise<Icon[]>;
}

// Icon libraries information - expanded with more details
export const iconLibraries = [
  { id: 'heroicons', name: 'Heroicons', url: 'https://heroicons.com/' },
  { id: 'material-symbols', name: 'Material Symbols', url: 'https://fonts.google.com/icons' },
  { id: 'mdi', name: 'Material Design Icons', url: 'https://materialdesignicons.com/' },
  { id: 'fa', name: 'Font Awesome', url: 'https://fontawesome.com/' },
  { id: 'fa6-solid', name: 'Font Awesome 6 Solid', url: 'https://fontawesome.com/' },
  { id: 'fa6-regular', name: 'Font Awesome 6 Regular', url: 'https://fontawesome.com/' },
  { id: 'fa6-brands', name: 'Font Awesome 6 Brands', url: 'https://fontawesome.com/' },
  { id: 'ph', name: 'Phosphor Icons', url: 'https://phosphoricons.com/' },
  { id: 'tabler', name: 'Tabler Icons', url: 'https://tabler-icons.io/' },
  { id: 'ri', name: 'Remix Icon', url: 'https://remixicon.com/' },
  { id: 'lucide', name: 'Lucide Icons', url: 'https://lucide.dev/' },
  { id: 'iconamoon', name: 'Iconamoon', url: 'https://iconamoon.io/' },
  { id: 'bi', name: 'Bootstrap Icons', url: 'https://icons.getbootstrap.com/' },
  { id: 'carbon', name: 'Carbon Icons', url: 'https://carbondesignsystem.com/guidelines/icons/library/' },
  { id: 'fluent', name: 'Fluent Icons', url: 'https://developer.microsoft.com/en-us/fluentui#/styles/web/icons' },
  { id: 'jam', name: 'Jam Icons', url: 'https://jam-icons.com/' },
  { id: 'gg', name: 'css.gg', url: 'https://css.gg/' },
  { id: 'ion', name: 'Ionicons', url: 'https://ionicons.com/' },
  { id: 'bx', name: 'Box Icons', url: 'https://boxicons.com/' },
  { id: 'simple-icons', name: 'Simple Icons', url: 'https://simpleicons.org/' },
  { id: 'ci', name: 'Circum Icons', url: 'https://circumicons.com/' },
  { id: 'feather', name: 'Feather Icons', url: 'https://feathericons.com/' },
  { id: 'uil', name: 'Unicons', url: 'https://iconscout.com/unicons' },
  { id: 'octicon', name: 'Octicons', url: 'https://primer.style/octicons/' },
  { id: 'mingcute', name: 'MingCute Icons', url: 'https://www.mingcute.com/' },
  { id: 'iconoir', name: 'Iconoir', url: 'https://iconoir.com/' },
  { id: 'bxs', name: 'Boxicons Solid', url: 'https://boxicons.com/' },
  { id: 'bxl', name: 'Boxicons Logos', url: 'https://boxicons.com/' }
];

// Icon categories
export const iconCategories = [
  { id: 'interface', name: 'Interface' },
  { id: 'arrows', name: 'Arrows' },
  { id: 'communication', name: 'Communication' },
  { id: 'ecommerce', name: 'E-commerce' },
  { id: 'security', name: 'Security' },
  { id: 'files', name: 'Files & Documents' },
  { id: 'users', name: 'Users & People' },
  { id: 'media', name: 'Media' },
  { id: 'technology', name: 'Technology' },
  { id: 'business', name: 'Business' },
  { id: 'maps', name: 'Maps & Location' },
  { id: 'social', name: 'Social Media' },
  { id: 'health', name: 'Health & Medical' },
  { id: 'weather', name: 'Weather' },
  { id: 'transport', name: 'Transportation' },
  { id: 'development', name: 'Development' },
  { id: 'brands', name: 'Brands & Logos' },
  { id: 'food', name: 'Food & Beverage' },
  { id: 'nature', name: 'Nature & Environment' },
  { id: 'household', name: 'Household & Furniture' },
];

// Cache for search results to improve performance
const searchCache: Record<string, any> = {};
const iconCache: Record<string, Icon[]> = {};
const maxCacheEntries = 200; // Maximum number of entries in the cache to avoid memory issues

// Clear cache if it gets too large
const manageCache = () => {
  if (Object.keys(searchCache).length > maxCacheEntries) {
    // Delete the oldest entries (first 50)
    const entries = Object.keys(searchCache);
    for (let i = 0; i < 50; i++) {
      delete searchCache[entries[i]];
    }
  }
};

// ------------------
// ICONIFY API PROVIDER
// ------------------
const iconifyProvider: IconProvider = {
  id: 'iconify',
  name: 'Iconify',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 1000; // Increased from 200 to 1000
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch from Iconify API');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'iconify');
    } catch (error) {
      console.error('Error fetching icons from Iconify API:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    const popularQueries = ['home', 'user', 'search', 'settings', 'arrow', 'cart', 'check', 'star', 'menu', 'notification'];
    
    try {
      const icons: Icon[] = [];
      const fetchPromises = popularQueries.map(async (query) => {
        const response = await fetch(`https://api.iconify.design/search?query=${query}&limit=10`);
        if (!response.ok) return [];
        
        const data = await response.json();
        return convertIconifyResultsToIcons(data, 'iconify');
      });
      
      const results = await Promise.all(fetchPromises);
      results.forEach(result => icons.push(...result));
      
      // Remove duplicates
      const uniqueIcons = Object.values(
        icons.reduce((acc: Record<string, Icon>, icon) => {
          acc[icon.iconifyName] = icon;
          return acc;
        }, {})
      );
      
      return uniqueIcons;
    } catch (error) {
      console.error('Error fetching popular icons from Iconify:', error);
      return [];
    }
  }
};

// ------------------
// FONT AWESOME API PROVIDER
// ------------------
const fontAwesomeProvider: IconProvider = {
  id: 'fontawesome',
  name: 'Font Awesome',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      const prefixes = 'fa,fa6-solid,fa6-regular,fa6-brands';
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${prefixes}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Font Awesome icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'fontawesome');
    } catch (error) {
      console.error('Error fetching Font Awesome icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=fa,fa6-solid,fa6-regular,fa6-brands&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Font Awesome icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'fontawesome');
    } catch (error) {
      console.error('Error fetching popular Font Awesome icons:', error);
      return [];
    }
  }
};

// ------------------
// MATERIAL DESIGN ICONS PROVIDER
// ------------------
const materialDesignProvider: IconProvider = {
  id: 'material',
  name: 'Material Design Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      const prefixes = 'mdi,material-symbols';
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${prefixes}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Material Design icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'material');
    } catch (error) {
      console.error('Error fetching Material Design icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=mdi,material-symbols&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch popular Material Design icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'material');
    } catch (error) {
      console.error('Error fetching popular Material Design icons:', error);
      return [];
    }
  }
};

// ------------------
// BOOTSTRAP ICONS PROVIDER
// ------------------
const bootstrapIconsProvider: IconProvider = {
  id: 'bootstrap',
  name: 'Bootstrap Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=bi&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Bootstrap icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'bootstrap');
    } catch (error) {
      console.error('Error fetching Bootstrap icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=bi&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Bootstrap icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'bootstrap');
    } catch (error) {
      console.error('Error fetching popular Bootstrap icons:', error);
      return [];
    }
  }
};

// ------------------
// HEROICONS PROVIDER
// ------------------
const heroiconsProvider: IconProvider = {
  id: 'heroicons',
  name: 'Heroicons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=heroicons&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Heroicons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'heroicons');
    } catch (error) {
      console.error('Error fetching Heroicons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=heroicons&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Heroicons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'heroicons');
    } catch (error) {
      console.error('Error fetching popular Heroicons:', error);
      return [];
    }
  }
};

// ------------------
// REMIX ICON PROVIDER
// ------------------
const remixIconProvider: IconProvider = {
  id: 'remix',
  name: 'Remix Icon',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=ri&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Remix icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'remix');
    } catch (error) {
      console.error('Error fetching Remix icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=ri&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Remix icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'remix');
    } catch (error) {
      console.error('Error fetching popular Remix icons:', error);
      return [];
    }
  }
};

// ------------------
// SVG REPO API PROVIDER
// ------------------
const svgRepoProvider: IconProvider = {
  id: 'svgrepo',
  name: 'SVG Repo',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      // SVG Repo doesn't have a direct API, but we can use Iconify API with additional prefixes
      // that are available in SVG Repo but might not be included in our current list
      const additionalPrefixes = 'ant-design,arcticons,basil,bx,carbon,clarity,codicon,cryptocurrency,dashicons,ei,emojione,entypo,fa-brands,fa-regular,fa-solid,feather,file-icons,flag,flat-color-icons,foundation,game-icons,gis,grommet-icons,healthicons,heroicons-outline,heroicons-solid,humbleicons,iconoir,icons8,ion,iwwa,jam,la,line-awesome,line-md,logos,lucide,mage,maki,map,material-symbols,medical-icon,mingcute,mono-icons,nimbus,noto,oi,ooui,openmoji,pajamas,pepicons,ph,pixelarticons,prime,quill,radix-icons,raphael,ri,simple-icons,simple-line-icons,skill-icons,solar,streamline,svg-spinners,system-uicons,tabler,tdesign,teenyicons,topcoat,twemoji,typcn,uil,uit,uiw,vaadin,vs,vscode-icons,weather-icons,websymbol,wi,wpf,zmdi,zond,zondicons';
      
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${additionalPrefixes}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch from SVG Repo via Iconify API');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'svgrepo');
    } catch (error) {
      console.error('Error fetching icons from SVG Repo:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const popularQueries = ['home', 'user', 'search', 'settings', 'arrow', 'cart', 'check', 'star', 'menu', 'notification'];
      const additionalPrefixes = 'ant-design,arcticons,basil,bx,carbon,clarity,codicon,cryptocurrency,dashicons,ei,emojione,entypo,fa-brands,fa-regular,fa-solid,feather,file-icons,flag,flat-color-icons,foundation,game-icons,gis,grommet-icons,healthicons,heroicons-outline,heroicons-solid,humbleicons,iconoir,icons8,ion,iwwa,jam,la,line-awesome,line-md,logos,lucide,mage,maki,map,material-symbols,medical-icon,mingcute,mono-icons,nimbus,noto,oi,ooui,openmoji,pajamas,pepicons,ph,pixelarticons,prime,quill,radix-icons,raphael,ri,simple-icons,simple-line-icons,skill-icons,solar,streamline,svg-spinners,system-uicons,tabler,tdesign,teenyicons,topcoat,twemoji,typcn,uil,uit,uiw,vaadin,vs,vscode-icons,weather-icons,websymbol,wi,wpf,zmdi,zond,zondicons';
      
      const icons: Icon[] = [];
      const fetchPromises = popularQueries.map(async (query) => {
        const response = await fetch(`https://api.iconify.design/search?query=${query}&prefix=${additionalPrefixes}&limit=10`);
        if (!response.ok) return [];
        
        const data = await response.json();
        return convertIconifyResultsToIcons(data, 'svgrepo');
      });
      
      const results = await Promise.all(fetchPromises);
      results.forEach(result => icons.push(...result));
      
      // Remove duplicates
      const uniqueIcons = Object.values(
        icons.reduce((acc: Record<string, Icon>, icon) => {
          acc[icon.iconifyName] = icon;
          return acc;
        }, {})
      );
      
      return uniqueIcons;
    } catch (error) {
      console.error('Error fetching popular icons from SVG Repo:', error);
      return [];
    }
  }
};

// ------------------
// ICONBOLT API PROVIDER
// ------------------
const iconboltProvider: IconProvider = {
  id: 'iconbolt',
  name: 'Iconbolt',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500; // Increased from 100 to 500
      const offset = (page - 1) * limit;
      // Iconbolt doesn't have a direct API, but we can use Iconify API with additional prefixes
      // that are available in Iconbolt but might not be included in our current list
      const additionalPrefixes = 'mynaui,streamline-core,iconstica,flowbite,atlas-icons,futicons,fluent-emoji-flat,doodle-icons,charm-icons,microns,codicons,majestic';
      
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=${additionalPrefixes}&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch from Iconbolt via Iconify API');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'iconbolt');
    } catch (error) {
      console.error('Error fetching icons from Iconbolt:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const popularQueries = ['home', 'user', 'search', 'settings', 'arrow', 'cart', 'check', 'star', 'menu', 'notification'];
      const additionalPrefixes = 'mynaui,streamline-core,iconstica,flowbite,atlas-icons,futicons,fluent-emoji-flat,doodle-icons,charm-icons,microns,codicons,majestic';
      
      const icons: Icon[] = [];
      const fetchPromises = popularQueries.map(async (query) => {
        const response = await fetch(`https://api.iconify.design/search?query=${query}&prefix=${additionalPrefixes}&limit=10`);
        if (!response.ok) return [];
        
        const data = await response.json();
        return convertIconifyResultsToIcons(data, 'iconbolt');
      });
      
      const results = await Promise.all(fetchPromises);
      results.forEach(result => icons.push(...result));
      
      // Remove duplicates
      const uniqueIcons = Object.values(
        icons.reduce((acc: Record<string, Icon>, icon) => {
          acc[icon.iconifyName] = icon;
          return acc;
        }, {})
      );
      
      return uniqueIcons;
    } catch (error) {
      console.error('Error fetching popular icons from Iconbolt:', error);
      return [];
    }
  }
};

// ------------------
// BOXICONS PROVIDER
// ------------------
const boxiconsProvider: IconProvider = {
  id: 'boxicons',
  name: 'Boxicons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=bx,bxs,bxl&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Boxicons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'boxicons');
    } catch (error) {
      console.error('Error fetching Boxicons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=bx,bxs,bxl&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Boxicons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'boxicons');
    } catch (error) {
      console.error('Error fetching popular Boxicons:', error);
      return [];
    }
  }
};

// ------------------
// LUCIDE ICONS PROVIDER
// ------------------
const lucideIconsProvider: IconProvider = {
  id: 'lucide',
  name: 'Lucide Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=lucide&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Lucide icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'lucide');
    } catch (error) {
      console.error('Error fetching Lucide icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=lucide&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Lucide icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'lucide');
    } catch (error) {
      console.error('Error fetching popular Lucide icons:', error);
      return [];
    }
  }
};

// ------------------
// PHOSPHOR ICONS PROVIDER
// ------------------
const phosphorIconsProvider: IconProvider = {
  id: 'phosphor',
  name: 'Phosphor Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=ph&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Phosphor icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'phosphor');
    } catch (error) {
      console.error('Error fetching Phosphor icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=ph&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Phosphor icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'phosphor');
    } catch (error) {
      console.error('Error fetching popular Phosphor icons:', error);
      return [];
    }
  }
};

// ------------------
// MINGCUTE ICONS PROVIDER
// ------------------
const mingcuteIconsProvider: IconProvider = {
  id: 'mingcute',
  name: 'MingCute Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=mingcute&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch MingCute icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'mingcute');
    } catch (error) {
      console.error('Error fetching MingCute icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=mingcute&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular MingCute icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'mingcute');
    } catch (error) {
      console.error('Error fetching popular MingCute icons:', error);
      return [];
    }
  }
};

// ------------------
// TABLER ICONS PROVIDER
// ------------------
const tablerIconsProvider: IconProvider = {
  id: 'tabler',
  name: 'Tabler Icons',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=tabler&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Tabler icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'tabler');
    } catch (error) {
      console.error('Error fetching Tabler icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=tabler&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Tabler icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'tabler');
    } catch (error) {
      console.error('Error fetching popular Tabler icons:', error);
      return [];
    }
  }
};

// ------------------
// ICONOIR PROVIDER
// ------------------
const iconoirProvider: IconProvider = {
  id: 'iconoir',
  name: 'Iconoir',
  
  search: async (query: string, options?: any, page: number = 1): Promise<Icon[]> => {
    try {
      const limit = 500;
      const offset = (page - 1) * limit;
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&prefix=iconoir&limit=${limit}&offset=${offset}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch Iconoir icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'iconoir');
    } catch (error) {
      console.error('Error fetching Iconoir icons:', error);
      return [];
    }
  },
  
  getPopular: async (): Promise<Icon[]> => {
    try {
      const response = await fetch(`https://api.iconify.design/search?prefix=iconoir&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch popular Iconoir icons');
      
      const data = await response.json();
      return convertIconifyResultsToIcons(data, 'iconoir');
    } catch (error) {
      console.error('Error fetching popular Iconoir icons:', error);
      return [];
    }
  }
};

// List of all providers
const iconProviders: IconProvider[] = [
  iconifyProvider,
  fontAwesomeProvider,
  materialDesignProvider,
  bootstrapIconsProvider,
  heroiconsProvider,
  remixIconProvider,
  svgRepoProvider,
  iconboltProvider,
  boxiconsProvider,
  lucideIconsProvider,
  phosphorIconsProvider,
  mingcuteIconsProvider,
  tablerIconsProvider,
  iconoirProvider
];

// Function to convert Iconify API results to our Icon type
const convertIconifyResultsToIcons = (data: any, apiSource: string = 'iconify'): Icon[] => {
  if (!data || !data.icons || !data.icons.length) return [];
  
  const icons: Icon[] = [];
  const collections = data.collections || {};
  
  data.icons.forEach((iconName: string) => {
    // Split iconName into prefix and name parts (e.g., "mdi:home" => ["mdi", "home"])
    const [prefix, name] = iconName.split(':');
    
    // Skip if missing prefix or name
    if (!prefix || !name) return;
    
    // Get collection info if available
    const collection = collections[prefix] || { name: prefix };
    
    // Determine style based on name or collection tags
    let style = IconStyle.OUTLINE;
    if (prefix.includes('solid') || name.includes('fill') || name.includes('solid')) {
      style = IconStyle.SOLID;
    } else if (prefix.includes('thin') || name.includes('thin')) {
      style = IconStyle.THIN;
    } else if (prefix.includes('duotone') || name.includes('duotone')) {
      style = IconStyle.DUOTONE;
    } else if (prefix.includes('bold') || name.includes('bold')) {
      style = IconStyle.BOLD;
    }
    
    // Create tags from name parts
    const tags = name.split(/[-_]/).filter(Boolean);
    
    // Map common icon names to categories
    let category = 'interface';
    if (name.includes('arrow') || name.includes('chevron') || name.includes('caret')) {
      category = 'arrows';
    } else if (name.includes('user') || name.includes('person') || name.includes('profile') || name.includes('avatar')) {
      category = 'users';
    } else if (name.includes('file') || name.includes('document') || name.includes('page')) {
      category = 'files';
    } else if (name.includes('cart') || name.includes('shop') || name.includes('store') || name.includes('bag')) {
      category = 'ecommerce';
    } else if (name.includes('camera') || name.includes('video') || name.includes('music') || name.includes('play')) {
      category = 'media';
    } else if (name.includes('map') || name.includes('location') || name.includes('pin') || name.includes('navigation')) {
      category = 'maps';
    } else if (name.includes('chart') || name.includes('graph') || name.includes('business') || name.includes('analytics')) {
      category = 'business';
    } else if (name.includes('facebook') || name.includes('twitter') || name.includes('instagram') || name.includes('linkedin')) {
      category = 'social';
    } else if (name.includes('brand') || name.includes('logo')) {
      category = 'brands';
    } else if (name.includes('code') || name.includes('git') || name.includes('development') || name.includes('terminal')) {
      category = 'development';
    }
    
    // Create readable name from icon name
    const readableName = name
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    icons.push({
      id: iconName,
      name: readableName,
      tags: tags,
      style: style,
      library: prefix,
      category: category,
      iconifyName: iconName,
      apiSource: apiSource
    });
  });
  
  return icons;
};

// Function to search for icons across all providers
export const searchIcons = async (query: string, filters: { 
  libraries?: string[], 
  styles?: IconStyle[],
  categories?: string[]
} = {}, page: number = 1): Promise<Icon[]> => {
  if (!query || query.trim() === '') {
    // For empty queries, return popular icons
    return getPopularIcons();
  }
  
  // Generate a cache key based on search parameters
  const cacheKey = `${query}|${(filters.libraries || []).join(',')}|${(filters.styles || []).join(',')}|${(filters.categories || []).join(',')}-page${page}`;
  
  // Return cached results if available
  if (searchCache[cacheKey]) {
    return Promise.resolve(searchCache[cacheKey]);
  }
  
  try {
    // Determine which providers to use based on library filters
    let providers = iconProviders;
    if (filters.libraries?.length) {
      // No need to filter providers here as we'll filter the results later
    }
    
    // Search across all providers in parallel
    const allResults = await Promise.all(
      providers.map(provider => provider.search(query, filters, page))
    );
    
    // Flatten results into a single array
    let icons = allResults.flat();
    
    // Apply filters if needed
    if (filters.libraries?.length) {
      icons = icons.filter(icon => filters.libraries!.includes(icon.library));
    }
    
    if (filters.styles?.length) {
      icons = icons.filter(icon => filters.styles!.includes(icon.style));
    }
    
    if (filters.categories?.length) {
      icons = icons.filter(icon => filters.categories!.includes(icon.category));
    }
    
    // De-duplicate icons by ID 
    icons = Object.values(
      icons.reduce((acc: Record<string, Icon>, icon) => {
        acc[icon.id] = icon;
        return acc;
      }, {})
    );
    
    // No longer limiting the number of icons
    // Let the application show all matching results
    
    // Cache the results
    searchCache[cacheKey] = icons;
    
    // Manage cache size
    manageCache();
    
    return icons;
  } catch (error) {
    console.error('Error searching for icons:', error);
    return [];
  }
};

// Get popular icons across all providers
export const getPopularIcons = async (): Promise<Icon[]> => {
  // Check if we already have popular icons cached
  if (iconCache['popular']) {
    return Promise.resolve(iconCache['popular']);
  }
  
  try {
    // Get popular icons from all providers in parallel
    const allResults = await Promise.all(
      iconProviders.map(provider => provider.getPopular())
    );
    
    // Flatten results into a single array
    let icons = allResults.flat();
    
    // De-duplicate icons by ID
    const uniqueIcons = Object.values(
      icons.reduce((acc: Record<string, Icon>, icon) => {
        acc[icon.iconifyName] = icon;
        return acc;
      }, {})
    );
    
    // Cache the results
    iconCache['popular'] = uniqueIcons;
    
    return uniqueIcons;
  } catch (error) {
    console.error('Error fetching popular icons:', error);
    return [];
  }
};

// Function to get icons by library
export const getIconsByLibrary = async (library: string, limit: number = 200): Promise<Icon[]> => {
  const cacheKey = `library-${library}-${limit}`;
  
  if (iconCache[cacheKey]) {
    return Promise.resolve(iconCache[cacheKey]);
  }
  
  try {
    const response = await fetch(`https://api.iconify.design/search?prefix=${library}&limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch icons for ${library}`);
    
    const data = await response.json();
    const icons = convertIconifyResultsToIcons(data);
    
    // Cache the results
    iconCache[cacheKey] = icons;
    
    return icons;
  } catch (error) {
    console.error(`Error fetching icons for library ${library}:`, error);
    return [];
  }
};

// Get icon libraries with counts
export const getIconCountByLibrary = async (): Promise<Record<string, number>> => {
  // These are approximate counts for popular libraries
  // Updated to include more libraries and reflect the full Iconify collection
  const iconifyCounts = {
    // Original libraries
    'heroicons': 875,
    'material-symbols': 13941,
    'mdi': 7447,
    'fa': 1612,
    'fa6-solid': 1253,
    'fa6-regular': 162,
    'fa6-brands': 457,
    'ph': 894,
    'tabler': 5880,
    'ri': 3058,
    'lucide': 895,
    'iconamoon': 1781,
    'bi': 1668,
    'carbon': 1442,
    'fluent': 3752,
    'jam': 896,
    'gg': 704,
    'ion': 1200,
    'bx': 962,
    'simple-icons': 2475,
    'ci': 284,
    'feather': 287,
    'uil': 1206,
    'octicon': 224,
    
    // Additional libraries to reach even higher counts
    'academicons-squared': 149,
    'ant-design-colored': 788,
    'arcticons-line': 7500,
    'arcticons-color': 7500,
    'basil-filled': 340,
    'basil-outlined': 340,
    'bi-dark': 1668,
    'bi-light': 1668,
    'bpmn-colored': 112,
    'bx-colored': 962,
    'bxl-colored': 170,
    'bxs-colored': 430,
    'carbon-glyph': 1442,
    'carbon-mono': 1442,
    'circum-colored': 285,
    'circum-filled': 285,
    'circum-outlined': 285,
    'clarity-line': 1103,
    'clarity-solid': 1103,
    'codicon-filled': 412,
    'cryptocurrency-color-variant': 450,
    'dashicons-alt': 342,
    'devicon-original': 500,
    'devicon-plain-wordmark': 500,
    'devicon-original-wordmark': 500,
    'devicon-line': 500,
    'devicon-plain-line': 500,
    'ei-glyph': 104,
    'emojione-v1-monotone': 1500,
    'entypo-alt': 411,
    'entypo-social-alt': 76,
    'fa-brands-400': 457,
    'fa-regular-400': 162,
    'fa-solid-900': 1253,
    'fa-duotone': 1500,
    'fa-pro': 2000,
    'fa-pro-light': 2000,
    'fa-pro-regular': 2000,
    'fa-pro-solid': 2000,
    'fa-pro-thin': 2000,
    'fa-pro-duotone': 2000,
    'fa-sharp': 1500,
    'fa-v4compatibility': 500,
    'fe-ultralight': 96,
    'fe-light': 96,
    'fe-medium': 96,
    'fe-bold': 96,
    'file-icons-alt': 930,
    'flag-alt': 520,
    'flag-variant': 520,
    'flat-color-icons-alt': 329,
    'flat-ui-alt': 100,
    'flat-ui-color': 100,
    'fluent-color': 3752,
    'fluent-emoji-color': 1500,
    'fluent-emoji-flat-color': 1500,
    'fluent-emoji-high-contrast-color': 1500,
    'fluent-mdl2': 1500,
    'fluent-systems': 1500,
    'fluent-systems-filled': 1500,
    'fluent-systems-regular': 1500,
    'foundation-alt': 283,
    'fxemoji-color': 1100,
    'fxemoji-flat': 1100,
    'game-icons-inverted': 3900,
    'game-icons-color': 3900,
    'gg-alt': 704,
    'gg-color': 704,
    'gis-3d': 117,
    'gis-color': 117,
    'grommet-icons-color': 615,
    'healthicons-filled': 1066,
    'healthicons-outlined': 1066,
    'heroicons-v1': 230,
    'heroicons-v1-outline': 230,
    'heroicons-v1-solid': 230,
    'humbleicons-alt': 89,
    'ic-baseline-filled': 1159,
    'ic-baseline-outlined': 1159,
    'ic-baseline-rounded': 1159,
    'ic-baseline-sharp': 1159,
    'ic-baseline-twotone': 1159,
    'icomoon-ultimate': 5000,
    'icomoon-ultimate-filled': 5000,
    'icomoon-ultimate-outlined': 5000,
    'iconoir-color': 1157,
    'iconoir-solid': 1157,
    'iconpark-twotone': 2437,
    'icons8-color': 12000,
    'icons8-color-glass': 12000,
    'icons8-color-fluency': 12000,
    'icons8-color-dusk': 12000,
    'icons8-color-cute': 12000,
    'icons8-win10': 12000,
    'icons8-win8': 12000,
    'icons8-office': 12000,
    'icons8-color-office': 12000,
    'il-color': 214,
    'ion-ios': 1200,
    'ion-md': 1200,
    'ion-ios-filled': 1200,
    'ion-ios-outlined': 1200,
    'ion-md-filled': 1200,
    'ion-md-outlined': 1200,
    'iwwa-color': 147,
    'jam-alt': 896,
    'la-alt': 628,
    'line-awesome-alt': 1544,
    'line-md-animated': 530,
    'line-md-filled': 530,
    'line-md-light': 530,
    'line-md-thin': 530,
    'logos-color': 1870,
    'lucide-square': 895,
    'lucide-round': 895,
    'lucide-sharp': 895,
    'mage-color': 240,
    'maki-alt': 204,
    'map-alt': 168,
    'map-color': 168,
    'material-community': 7000,
    'material-design': 7000,
    'material-design-icons': 7000,
    'material-design-icons-filled': 7000,
    'material-design-icons-outlined': 7000,
    'material-design-icons-rounded': 7000,
    'material-design-icons-sharp': 7000,
    'material-design-icons-twotone': 7000,
    'mdi-dark': 7447,
    'mdi-light': 7447,
    'medical-icon-color': 144,
    'memory-color': 412,
    'memory-filled': 412,
    'memory-outlined': 412,
    'mingcute-color': 2186,
    'mono-icons-color': 180,
    'nimbus-color': 146,
    'noto-color': 3500,
    'noto-emoji-color': 3500,
    'noto-v1-color': 2500,
    'octicon-alt': 224,
    'oi-alt': 223,
    'ooui-color': 324,
    'openmoji-color': 3956,
    'openmoji-black': 3956,
    'pajamas-color': 89,
    'pepicons-alt': 410,
    'pepicons-pop-color': 267,
    'pepicons-print-color': 267,
    'ph-duotone-color': 894,
    'ph-fill-color': 894,
    'pixelarticons-color': 460,
    'prime-color': 231,
    'quill-color': 140,
    'radix-color': 318,
    'radix-icons-color': 318,
    'raphael-color': 266,
    'ri-color': 3058,
    'simple-icons-alt': 2475,
    'simple-line-icons-color': 189,
    'skill-icons-color': 200,
    'skill-icons-line': 200,
    'solar-bold': 1200,
    'solar-broken': 1200,
    'solar-duotone': 1200,
    'solar-linear': 1200,
    'solar-outline': 1200,
    'streamline-color': 4350,
    'streamline-emojis': 3000,
    'svg-spinners-color': 36,
    'svg-spinners-3d': 36,
    'system-uicons-color': 420,
    'tabler-color': 5880,
    'tabler-community-color': 300,
    'tdesign-color': 900,
    'tdesign-filled': 900,
    'tdesign-outlined': 900,
    'teenyicons-color': 1200,
    'topcoat-color': 89,
    'twemoji-color': 3668,
    'typcn-color': 336,
    'uil-color': 1206,
    'uit-color': 500,
    'uiw-color': 214,
    'uiw-mac-color': 60,
    'vaadin-color': 636,
    'vs-color': 297,
    'vscode-color': 412,
    'vscode-icons-color': 1200,
    'weather-icons-color': 219,
    'websymbol-color': 85,
    'wi-color': 219,
    'wpf-color': 223,
    'zmdi-color': 816,
    'zond-color': 297,
    'zondicons-color': 297,
    
    // Additional icon collections
    'bootstrap-icons-v1': 1500,
    'bootstrap-icons-v2': 1500,
    'boxicons-logos-color': 170,
    'boxicons-regular-color': 962,
    'boxicons-solid-color': 430,
    'carbon-pictograms': 1000,
    'dashicons-legacy': 200,
    'emoji-country-flag': 250,
    'emoji-food-beverage': 250,
    'emoji-nature': 250,
    'emoji-objects': 250,
    'emoji-people': 250,
    'emoji-places': 250,
    'emoji-symbols': 250,
    'emoji-transportation': 250,
    'fontawesome-v4': 1500,
    'fontawesome-v5': 1500,
    'fontawesome-v5-brands': 450,
    'fontawesome-v5-regular': 150,
    'fontawesome-v5-solid': 900,
    'fontawesome-v6': 1500,
    'fontawesome-v6-brands': 450,
    'fontawesome-v6-regular': 150,
    'fontawesome-v6-solid': 900,
    'google-material-design': 5000,
    'google-material-design-icons': 5000,
    'heroicons-2': 230,
    'heroicons-1': 230,
    'iconscout-unicons': 1206,
    'iconscout-unicons-line': 1206,
    'iconscout-unicons-solid': 1206,
    'iconscout-unicons-monochrome': 1206,
    'iconscout-unicons-thin': 1206,
    'iconscout-unicons-thinline': 1206,
    'material-design-light': 7000,
    'material-design-outlined': 7000,
    'material-design-round': 7000,
    'material-design-sharp': 7000,
    'material-design-twotone': 7000,
    'microsoft-fluentui-emoji': 1500,
    'microsoft-fluentui-icons': 3752,
    'microsoft-fluentui-system-icons': 1500,
    'microsoft-fluentui-system-filled': 1500,
    'microsoft-fluentui-system-regular': 1500,
    'nerd-fonts': 5000,
    'nerd-font-symbols': 5000,
    'twitter-emoji': 3668,
    'twitter-twemoji': 3668,
    'weather-icons-wind': 100,
    
    // New icon collections from SVG Repo and Iconbolt
    'mynaui-solid': 1184,
    'mynaui-line': 1184,
    'streamline-core-flat': 997,
    'streamline-core-duo': 997,
    'streamline-core-solid': 997,
    'streamline-core-line': 997,
    'iconstica-line': 115,
    'iconstica-filled': 115,
    'iconstica-broken': 115,
    'flowbite-outline': 262,
    'atlas-icons': 2666,
    'futicons': 124,
    'doodle-icons': 439,
    'charm-icons': 237,
    'microns': 164,
    'majestic-line': 380,
    'svgrepo-collection': 100000, // SVG Repo has over 500,000 icons, but we'll be conservative
  };
  
  // Return all Iconify libraries (all are free)
  return iconifyCounts;
};

// Helper function to get total estimated icon count
export const getTotalIconCount = async (): Promise<number> => {
  const counts = await getIconCountByLibrary();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
};

interface SvgOptions {
  size: number;
  strokeWidth?: number;
  color?: string;
}

// Function to test if an SVG string is valid
function isValidSvg(svg: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    return !doc.querySelector('parsererror');
  } catch (e) {
    return false;
  }
}

// Function to sanitize SVG content
function sanitizeSvg(svg: string): string {
  // Fix common issues that can cause malformed XML
  
  // Ensure proper XML declaration if missing
  if (!svg.includes('<?xml')) {
    svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + svg;
  }
  
  // Ensure SVG namespace is present
  if (!svg.includes('xmlns=')) {
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  // Ensure proper spacing around attributes
  svg = svg.replace(/([a-z-]+)=([^ >]+)/gi, '$1="$2"');
  
  // Fix self-closing tags
  svg = svg.replace(/<([a-z]+)([^>]*)\s*\/>/gi, '<$1$2></$1>');
  
  // Ensure all attributes have quotes
  svg = svg.replace(/=([^"][^ >]*)/g, '="$1"');
  
  // Remove any invalid characters in attribute values
  svg = svg.replace(/="([^"]*)"/g, (match, value) => {
    // Replace any control characters with spaces
    const sanitized = value.replace(/[\x00-\x1F\x7F]/g, ' ');
    return `="${sanitized}"`;
  });
  
  // Fix duplicate attributes by keeping only the last one
  svg = svg.replace(/<([a-z]+)([^>]*)>/gi, (match, tag, attrs) => {
    const seenAttrs = new Set();
    const parts = attrs.match(/\s+[a-z-]+(?:=(?:"[^"]*"|'[^']*'|[^ >]*))?/gi) || [];
    
    // Process attributes in reverse to keep the last occurrence
    const uniqueAttrs = parts.reverse().filter(attr => {
      const name = attr.trim().split('=')[0].trim();
      if (seenAttrs.has(name)) return false;
      seenAttrs.add(name);
      return true;
    }).reverse().join('');
    
    return `<${tag}${uniqueAttrs}>`;
  });
  
  return svg;
}

// Function to modify SVG with custom options
export async function getSvgWithOptions(iconPath: string, options: SvgOptions): Promise<string> {
  try {
    const { size, strokeWidth, color } = options;
    const supportsStrokeChanges = supportsStroke(iconPath);
    const supportsColorChanges = !isColoredIcon(iconPath);
    
    // Build the URL with parameters - include size only in the initial request
    let url = `https://api.iconify.design/${iconPath}.svg?width=${size}&height=${size}`;
    
    // Fetch the SVG from Iconify API
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch SVG (Status: ${response.status})`);
    }
    
    let svg = await response.text();
    
    // Sanitize the SVG before processing
    svg = sanitizeSvg(svg);
    
    // Create a DOM parser to properly handle SVG modifications
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    
    try {
      // Parse the SVG string into a DOM document
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.error('SVG parsing error:', parserError.textContent);
        throw new Error('Failed to parse SVG');
      }
      
      const svgElement = doc.documentElement;
      
      // Apply stroke width if supported and provided
      if (strokeWidth !== undefined && supportsStrokeChanges) {
        // Set stroke-width on the SVG root for inheritance
        svgElement.setAttribute('stroke-width', strokeWidth.toString());
        svgElement.setAttribute('stroke-linecap', 'round');
        svgElement.setAttribute('stroke-linejoin', 'round');
        
        // Apply stroke-width to all path, line, rect, etc. elements
        const strokeElements = doc.querySelectorAll('path, line, rect, circle, ellipse, polyline, polygon');
        strokeElements.forEach(el => {
          // Only set stroke-width if the element doesn't have stroke="none"
          if (el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke-width', strokeWidth.toString());
            
            // Ensure stroke attribute is set if missing
            if (!el.hasAttribute('stroke')) {
              el.setAttribute('stroke', 'currentColor');
            }
          }
        });
        
        // Handle any groups that might contain paths
        const groups = doc.querySelectorAll('g');
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
      
      // Apply color if supported and provided
      if (color && color !== 'currentColor' && supportsColorChanges) {
        // Apply color to all elements with stroke or fill
        const colorElements = doc.querySelectorAll('[stroke], [fill]');
        colorElements.forEach(el => {
          // Apply to stroke if it's not "none"
          if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            el.setAttribute('stroke', color);
          }
          
          // Apply to fill if it's not "none"
          if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
            el.setAttribute('fill', color);
          }
        });
        
        // Apply to groups that might contain paths
        const groups = doc.querySelectorAll('g');
        groups.forEach(group => {
          if (group.getAttribute('stroke') !== 'none' && group.hasAttribute('stroke')) {
            group.setAttribute('stroke', color);
          }
          if (group.getAttribute('fill') !== 'none' && group.hasAttribute('fill')) {
            group.setAttribute('fill', color);
          }
        });
        
        // Apply to elements without explicit stroke/fill attributes
        const allElements = doc.querySelectorAll('path, line, rect, circle, ellipse, polyline, polygon');
        allElements.forEach(el => {
          // If element has no stroke or fill attribute, add them
          if (!el.hasAttribute('stroke') && !el.hasAttribute('fill')) {
            el.setAttribute('stroke', color);
            el.setAttribute('fill', color);
          }
        });
        
        // If no elements have stroke/fill, apply to SVG root
        if (colorElements.length === 0) {
          svgElement.setAttribute('stroke', color);
          svgElement.setAttribute('fill', color);
        }
      }
      
      // Apply inline styles to ensure compatibility with all viewers
      const allElements = doc.querySelectorAll('*');
      allElements.forEach(el => {
        // Get computed styles and apply them inline
        if (el.hasAttribute('stroke-width') || el.hasAttribute('stroke') || el.hasAttribute('fill')) {
          let style = el.getAttribute('style') || '';
          
          if (el.hasAttribute('stroke-width')) {
            const strokeWidth = el.getAttribute('stroke-width');
            if (!style.includes('stroke-width:')) {
              style += `; stroke-width: ${strokeWidth}px;`;
            }
          }
          
          if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
            const stroke = el.getAttribute('stroke');
            if (!style.includes('stroke:')) {
              style += `; stroke: ${stroke};`;
            }
          }
          
          if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
            const fill = el.getAttribute('fill');
            if (!style.includes('fill:')) {
              style += `; fill: ${fill};`;
            }
          }
          
          // Clean up style string and set it
          style = style.replace(/^;/, '').trim();
          if (style) {
            el.setAttribute('style', style);
          }
        }
      });
      
      // Serialize back to string
      svg = serializer.serializeToString(doc);
      
      // Fix self-closing tags for better compatibility
      svg = svg.replace(/<([a-z]+)([^>]*)\/>/gi, '<$1$2></$1>');
      
      // Validate the final SVG structure
      const validationDoc = parser.parseFromString(svg, 'image/svg+xml');
      if (validationDoc.querySelector('parsererror')) {
        console.error('SVG validation error after modifications');
        throw new Error('Generated invalid SVG');
      }
      
      // Final validation before returning
      if (!isValidSvg(svg)) {
        console.error('Final SVG validation failed, attempting emergency repair');
        
        // Try a different approach - use the Iconify API with parameters directly
        let parameterizedUrl = `https://api.iconify.design/${iconPath}.svg?width=${size}&height=${size}`;
        
        // Add stroke-width parameter if provided and supported
        if (strokeWidth !== undefined && supportsStrokeChanges) {
          parameterizedUrl += `&stroke-width=${strokeWidth}`;
        }
        
        // Add color parameter if provided and supported
        if (color && color !== 'currentColor' && supportsColorChanges) {
          const colorValue = color.startsWith('#') ? color.substring(1) : color;
          parameterizedUrl += `&color=${colorValue}`;
        }
        
        const directSvg = await fetch(parameterizedUrl).then(r => r.text());
        
        if (isValidSvg(directSvg)) {
          console.log('Using direct API parameters as fallback');
          return directSvg;
        }
        
        // If that fails too, return original unmodified SVG
        const originalSvg = await fetch(`https://api.iconify.design/${iconPath}.svg?width=${size}&height=${size}`).then(r => r.text());
        
        if (isValidSvg(originalSvg)) {
          console.log('Returning original unmodified SVG as fallback');
          return originalSvg;
        } else {
          throw new Error('Cannot generate valid SVG');
        }
      }
      
      return svg;
    } catch (domError) {
      console.error('Error manipulating SVG DOM:', domError);
      
      // Fallback to regex-based approach if DOM manipulation fails
      console.log('Falling back to regex-based SVG modification');
      
      // Apply stroke width if supported and provided
      if (strokeWidth !== undefined && supportsStrokeChanges) {
        // Add stroke-width to SVG root
        svg = svg.replace(/<svg([^>]*)>/, `<svg$1 stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">`);
        
        // Carefully add stroke-width to elements with proper attribute placement
        svg = svg.replace(/<(path|line|rect|circle|ellipse|polyline|polygon|g)([^>]*)>/g, (match, tag, attrs) => {
          // Don't add stroke-width if stroke="none" is present
          if (attrs.includes('stroke="none"')) {
            return match;
          }
          
          // Add stroke="currentColor" if no stroke attribute exists
          if (!attrs.includes('stroke=')) {
            attrs += ' stroke="currentColor"';
          }
          
          // Add stroke-width if it doesn't exist
          if (!attrs.includes('stroke-width=')) {
            attrs += ` stroke-width="${strokeWidth}"`;
          } else {
            // Replace existing stroke-width
            attrs = attrs.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
          }
          
          return `<${tag}${attrs}>`;
        });
      }
      
      // Apply color if supported and provided
      if (color && color !== 'currentColor' && supportsColorChanges) {
        // Apply color to strokes (but not to stroke="none")
        svg = svg.replace(/stroke="([^"]*)"(?![^<>]*stroke="none")/g, (match, strokeValue) => {
          if (strokeValue === 'none') return match;
          return `stroke="${color}"`;
        });
        
        // Apply color to fills (but not to fill="none")
        svg = svg.replace(/fill="([^"]*)"(?![^<>]*fill="none")/g, (match, fillValue) => {
          if (fillValue === 'none') return match;
          return `fill="${color}"`;
        });
        
        // Apply to style attributes
        svg = svg.replace(/style="([^"]*)"/g, (match, style) => {
          let newStyle = style;
          
          // Apply to stroke in style
          if (style.includes('stroke:') && !style.includes('stroke:none')) {
            newStyle = newStyle.replace(/stroke:[^;]*(;|$)/, `stroke:${color}$1`);
          } else if (!style.includes('stroke:')) {
            newStyle += `; stroke: ${color};`;
          }
          
          // Apply to fill in style
          if (style.includes('fill:') && !style.includes('fill:none')) {
            newStyle = newStyle.replace(/fill:[^;]*(;|$)/, `fill:${color}$1`);
          } else if (!style.includes('fill:')) {
            newStyle += `; fill: ${color};`;
          }
          
          // Clean up style string
          newStyle = newStyle.replace(/^;/, '').trim();
          
          return `style="${newStyle}"`;
        });
        
        // Add color attributes to elements without them
        svg = svg.replace(/<(path|line|rect|circle|ellipse|polyline|polygon)([^>]*)>/g, (match, tag, attrs) => {
          if (!attrs.includes('stroke=') && !attrs.includes('fill=')) {
            attrs += ` stroke="${color}" fill="${color}"`;
          }
          return `<${tag}${attrs}>`;
        });
      }
      
      // Final validation before returning
      if (!isValidSvg(svg)) {
        console.error('Final SVG validation failed, attempting emergency repair');
        
        // Try a different approach - use the Iconify API with parameters directly
        let parameterizedUrl = `https://api.iconify.design/${iconPath}.svg?width=${size}&height=${size}`;
        
        // Add stroke-width parameter if provided and supported
        if (strokeWidth !== undefined && supportsStrokeChanges) {
          parameterizedUrl += `&stroke-width=${strokeWidth}`;
        }
        
        // Add color parameter if provided and supported
        if (color && color !== 'currentColor' && supportsColorChanges) {
          const colorValue = color.startsWith('#') ? color.substring(1) : color;
          parameterizedUrl += `&color=${colorValue}`;
        }
        
        const directSvg = await fetch(parameterizedUrl).then(r => r.text());
        
        if (isValidSvg(directSvg)) {
          console.log('Using direct API parameters as fallback');
          return directSvg;
        }
        
        // If that fails too, return original unmodified SVG
        const originalSvg = await fetch(`https://api.iconify.design/${iconPath}.svg?width=${size}&height=${size}`).then(r => r.text());
        
        if (isValidSvg(originalSvg)) {
          console.log('Returning original unmodified SVG as fallback');
          return originalSvg;
        } else {
          throw new Error('Cannot generate valid SVG');
        }
      }
      
      return svg;
    }
  } catch (error) {
    console.error('Error modifying SVG:', error);
    throw error;
  }
}

// Function to check if an icon supports stroke width
export function supportsStroke(iconPath: string): boolean {
  const strokeSupportedLibs = [
    'lucide', 
    'tabler', 
    'mingcute', 
    'line-md',
    'carbon',
    'mdi-light',
    'iconoir',
    'ph',
    'solar',
    'ri',
    'uil',
    'bx'
  ];
  
  const prefix = iconPath.split('/')[0];
  return strokeSupportedLibs.some(lib => prefix.includes(lib));
}

// Function to check if an icon is colored (non-monochrome)
export function isColoredIcon(iconPath: string): boolean {
  const coloredIconLibs = [
    'twemoji',
    'noto',
    'emojione',
    'fxemoji',
    'openmoji',
    'fluent-emoji',
    'flat-color',
    'logos',
    'flag',
    'cryptocurrency',
    'circle-flags'
  ];
  
  const prefix = iconPath.split('/')[0];
  return coloredIconLibs.some(lib => prefix.includes(lib));
}

// Function to get formatted filename
export function getFormattedFilename(icon: Icon, options: SvgOptions): string {
  const { size, strokeWidth, color } = options;
  const baseName = icon.name.toLowerCase().replace(/\s+/g, '-');
  let filename = `${baseName}-${size}px`;
  
  // Include stroke width in filename if provided and icon supports stroke
  if (strokeWidth !== undefined && supportsStroke(icon.iconifyName)) {
    filename += `-stroke${strokeWidth}`;
  }
  
  // Include color in filename if provided and not default
  if (color && color !== 'currentColor' && !isColoredIcon(icon.iconifyName)) {
    // Remove # from hex color and truncate long color values
    const colorValue = color.startsWith('#') ? color.substring(1) : color;
    // Truncate very long color values
    const shortColorValue = colorValue.length > 10 ? colorValue.substring(0, 10) : colorValue;
    filename += `-${shortColorValue}`;
  }
  
  return `${filename}.svg`;
}

// Function to show appropriate toast messages
export function showIconTypeWarning(iconType: string) {
  const typeText = iconType.toLowerCase();
  toast.warning(
    `${typeText === 'emoji' ? 'Emojis' : 'These icons'} can't be customized`,
    {
      description: "Download the SVG and edit it in a vector editor like Figma or Illustrator for customization."
    }
  );
}

export default {
  searchIcons,
  getPopularIcons,
  getIconsByLibrary,
  getSvgWithOptions,
  iconLibraries,
  iconCategories,
  getIconCountByLibrary,
  getTotalIconCount
}; 
