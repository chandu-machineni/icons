import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={cn("w-full pt-10 pb-4 px-4 sm:px-6 lg:px-8", className)}>
      <div className="container mx-auto flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-4xl font-semibold">Icons</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
