import { Grid } from '@mantine/core';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { SourcePanel } from './SourcePanel';
import { PreviewPanel } from './PreviewPanel';

interface EnhancementLayoutProps {
  sourceContent: string;
  documentName: string;
  mockEnhancedContent?: string;
}

export function EnhancementLayout({
  sourceContent,
  documentName,
  mockEnhancedContent,
}: EnhancementLayoutProps) {
  const [enhancedContent, setEnhancedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (instructions: string) => {
    setIsLoading(true);

    // Simulate API call with delay
    setTimeout(() => {
      // In production, this would call the API
      // const result = await enhanceContent(sourceContent, instructions);
      // setEnhancedContent(result);

      // For now, use mock data
      setEnhancedContent(mockEnhancedContent || sourceContent);
      setIsLoading(false);

      notifications.show({
        title: 'Enhancement Complete',
        message: 'Your content has been enhanced with AI',
        color: 'green',
      });
    }, 2000);
  };

  const handleDownload = () => {
    if (!enhancedContent) return;

    const blob = new Blob([enhancedContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentName.toLowerCase().replace(/\s+/g, '-')}-enhanced.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    notifications.show({
      title: 'Download Started',
      message: 'Your enhanced markdown file is downloading',
      color: 'blue',
    });
  };

  return (
    <Grid gutter="md">
      <Grid.Col span={{ base: 12, md: 6 }}>
        <SourcePanel
          sourceContent={sourceContent}
          documentName={documentName}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 6 }}>
        <PreviewPanel
          enhancedContent={enhancedContent}
          documentName={documentName}
          onDownload={handleDownload}
        />
      </Grid.Col>
    </Grid>
  );
}
