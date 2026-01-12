'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  Share2, 
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportShareButtonsProps {
  onExportPDF: () => void;
  onShare: () => Promise<boolean>;
  size?: 'sm' | 'default' | 'icon';
  className?: string;
}

export function ExportShareButtons({
  onExportPDF,
  onShare,
  size = 'icon',
  className = '',
}: ExportShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const success = await onShare();
      if (success) {
        setShareSuccess(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setShareSuccess(false), 2000);
      } else {
        toast.error('Failed to share');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (size === 'icon') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onExportPDF}
          title="Export as PDF"
        >
          <FileDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleShare}
          disabled={isSharing}
          title="Share"
        >
          {isSharing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : shareSuccess ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size={size}
        onClick={onExportPDF}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        PDF
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={handleShare}
        disabled={isSharing}
        className="gap-2"
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : shareSuccess ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share
      </Button>
    </div>
  );
}

