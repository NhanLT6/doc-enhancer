import { Flex } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { InlineEnhancementDoc } from './InlineEnhancementDoc';
import type { DocumentImage } from '@/lib/storage';

interface EnhancementLayoutProps {
  sourceContent: string;
  images?: DocumentImage[];
  documentName: string;
  mockEnhancedContent?: string;
  onOpenSidePanel: () => void;
  onCloseSidePanel: () => void;
}

export function EnhancementLayout({
  sourceContent,
  images,
  documentName,
  onOpenSidePanel,
  onCloseSidePanel,
}: EnhancementLayoutProps) {
  const [documentContent, setDocumentContent] = useState(sourceContent);
  const asideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find the AppShell.Aside element
    const aside = document.querySelector('[data-aside]') as HTMLElement;
    asideRef.current = aside;
  }, []);

  const handleContentChange = (newContent: string) => {
    setDocumentContent(newContent);
  };

  return (
    <Flex h="100%" w="100%">
      <InlineEnhancementDoc
        content={documentContent}
        images={images}
        documentName={documentName}
        onContentChange={handleContentChange}
        sidePanelContainer={asideRef.current}
        onOpenSidePanel={onOpenSidePanel}
        onCloseSidePanel={onCloseSidePanel}
      />
    </Flex>
  );
}
