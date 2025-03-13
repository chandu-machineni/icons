import React from 'react';
import { cn } from '@/lib/utils';
import DynamicIcon from '../IconGenerator/DynamicIcon';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("w-full py-4 px-4 sm:px-6 lg:px-8 border-t border-border", className)}>
      <div className="container mx-auto flex items-center justify-center">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          🤹 Juggling ideas, making things happen – Chandu Machineni · 

          <a
            href="https://www.linkedin.com/in/chandumanchala"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0A66C2] flex items-center gap-1 ml-1"
          >
            <DynamicIcon iconName="mdi:linkedin" size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
