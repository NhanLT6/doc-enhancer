import { Alert, Button, FileInput, Modal, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconCloud,
  IconFileText,
  IconLoader,
  IconUpload,
} from '@tabler/icons-react';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';
import { convertPdfToMarkdown, fetchFromConfluence } from '@/lib/api-client';
import { htmlToMarkdown } from '@/lib/markdown';
import { getSettings } from '@/lib/settings';
import { storage } from '@/lib/storage';

interface AddDocumentModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Zod schema for Confluence form
const confluenceSchema = z.object({
  name: z.string().optional(),
  confluenceUrl: z.url('Must be a valid URL'),
});

// Zod schema for file upload form
const fileSchema = z.object({
  name: z.string().optional(),
  file: z.instanceof(File).refine((file) => {
    const validTypes = ['text/plain', 'text/markdown', 'application/pdf'];
    const validExtensions = ['.txt', '.md', '.pdf'];
    return validTypes.includes(file.type) || validExtensions.some((ext) => file.name.endsWith(ext));
  }, 'File must be .txt, .md, or .pdf format'),
});

export function AddDocumentModal({ opened, onClose, onSuccess }: AddDocumentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('confluence');

  const confluenceForm = useForm({
    initialValues: {
      name: '',
      confluenceUrl: '',
    },
    validate: zod4Resolver(confluenceSchema),
  });

  const fileForm = useForm({
    initialValues: {
      name: '',
      file: null as File | null,
    },
    validate: zod4Resolver(fileSchema),
  });

  const handleFileChange = (file: File | null) => {
    fileForm.setFieldValue('file', file);

    // Auto-populate name from filename (without extension) if name is empty
    if (file) {
      const currentName = fileForm.values.name;
      if (!currentName || currentName.trim() === '') {
        const nameWithoutExtension = file.name.replace(/\.(txt|md|pdf)$/i, '');
        fileForm.setFieldValue('name', nameWithoutExtension);
      }
    }
  };

  const handleConfluenceSubmit = async (values: typeof confluenceForm.values) => {
    // Check if settings are configured
    const settings = getSettings();
    if (!settings) {
      notifications.show({
        title: 'Settings Required',
        message: 'Please configure your Confluence credentials in Settings first',
        color: 'orange',
        icon: <IconAlertCircle size={18} />,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Fetch content from Confluence
      const confluenceData = await fetchFromConfluence(values.confluenceUrl, {
        confluenceToken: settings.confluenceToken,
        confluenceEmail: settings.confluenceEmail,
      });

      // Convert HTML to Markdown
      const markdownContent = htmlToMarkdown(confluenceData.content);

      // Save document with fetched content
      storage.addDocument({
        name: values.name || confluenceData.title,
        confluenceUrl: values.confluenceUrl,
        lastFetchedContent: markdownContent,
      });

      notifications.show({
        title: 'Success',
        message: `Document "${confluenceData.title}" added successfully`,
        color: 'green',
      });

      confluenceForm.reset();
      onClose();
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message:
          error instanceof Error ? error.message : 'Failed to fetch document from Confluence',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSubmit = async (values: typeof fileForm.values) => {
    if (!values.file) {
      notifications.show({
        title: 'Error',
        message: 'Please select a file',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);

    try {
      let content: string;
      let images: import('@/lib/storage').DocumentImage[] | undefined;

      // Handle different file types
      if (values.file.type === 'application/pdf' || values.file.name.endsWith('.pdf')) {
        // Convert PDF to markdown using Gemini API
        try {
          const result = await convertPdfToMarkdown(values.file);
          content = result.markdown;
          images = result.images;

          notifications.show({
            title: 'PDF Converted',
            message: `PDF converted successfully (${images.length} images extracted)`,
            color: 'green',
          });
        } catch (pdfError) {
          notifications.show({
            title: 'PDF Conversion Failed',
            message: pdfError instanceof Error ? pdfError.message : 'Failed to convert PDF',
            color: 'red',
            icon: <IconAlertCircle size={18} />,
          });
          setIsLoading(false);
          return;
        }
      } else {
        // Read text file content
        content = await values.file.text();
      }

      // Use filename without extension as fallback if name is not provided
      const documentName = values.name || values.file.name.replace(/\.(txt|md|pdf)$/i, '');

      // Save document with file content and images (if any)
      storage.addDocument({
        name: documentName,
        confluenceUrl: '', // No Confluence URL for local files
        lastFetchedContent: content,
        images,
      });

      notifications.show({
        title: 'Success',
        message: `Document "${documentName}" added successfully`,
        color: 'green',
      });

      fileForm.reset();
      onClose();
      onSuccess();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to read file',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const settings = getSettings();

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Document" size="md">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="confluence" leftSection={<IconCloud size={16} />}>
            From Confluence
          </Tabs.Tab>
          <Tabs.Tab value="file" leftSection={<IconFileText size={16} />}>
            From File
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="confluence" pt="md">
          <form onSubmit={confluenceForm.onSubmit(handleConfluenceSubmit)}>
            <Stack gap="md">
              {!settings && (
                <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
                  <Text size="sm">
                    Please configure your Confluence credentials in Settings before adding
                    documents.
                  </Text>
                </Alert>
              )}

              <TextInput
                label="Confluence URL"
                placeholder="https://your-domain.atlassian.net/wiki/pages/123456/..."
                description="The full URL of the Confluence page"
                required
                disabled={isLoading}
                {...confluenceForm.getInputProps('confluenceUrl')}
              />
              <TextInput
                label="Document Name"
                placeholder="Leave empty to use page title"
                description="Will automatically use the Confluence page title if not provided"
                disabled={isLoading}
                {...confluenceForm.getInputProps('name')}
              />
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={!settings}
                leftSection={isLoading ? <IconLoader size={18} /> : <IconCloud size={18} />}
              >
                {isLoading ? 'Fetching from Confluence...' : 'Add from Confluence'}
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="file" pt="md">
          <form onSubmit={fileForm.onSubmit(handleFileSubmit)}>
            <Stack gap="md">
              <FileInput
                label="Select File"
                placeholder="Choose a .txt, .md, or .pdf file"
                description="Supported formats: .txt, .md, .pdf"
                required
                disabled={isLoading}
                accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
                leftSection={<IconFileText size={16} />}
                value={fileForm.values.file}
                onChange={handleFileChange}
                error={fileForm.errors.file}
              />
              <TextInput
                label="Document Name"
                placeholder="Leave empty to use filename"
                description="Will automatically use the filename if not provided"
                disabled={isLoading}
                {...fileForm.getInputProps('name')}
              />
              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                leftSection={isLoading ? <IconLoader size={18} /> : <IconUpload size={18} />}
              >
                {isLoading ? 'Uploading...' : 'Add from File'}
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}
