/**
 * Test page for Tiptap Editor
 * This is a temporary page to verify Phase 1 implementation
 */

import { useRef, useState } from 'react';
import { Container, Stack, Title, Button, Group, Code, Text, Paper, Divider, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { TiptapEditor, TiptapEditorRef } from '@/components/editor/TiptapEditor';
import { markdownToTiptapJson } from '@/lib/content-converters';
import { enhanceContent } from '@/lib/api-client';

// Sample HTML content with various elements
const SAMPLE_HTML = `
<h1>Welcome to Tiptap Editor</h1>
<p>This is a <strong>test document</strong> with various content types to verify Phase 1 implementation.</p>

<h2>Features to Test</h2>
<ul>
  <li>Text formatting (bold, italic, code)</li>
  <li>Headers (H1, H2, H3)</li>
  <li>Lists (ordered and unordered)</li>
  <li>Tables</li>
  <li>Images (base64)</li>
  <li>Links</li>
</ul>

<h2>Sample Table</h2>
<table class="tiptap-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Status</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Text Editing</td>
      <td>✓ Working</td>
      <td>Basic text input and formatting</td>
    </tr>
    <tr>
      <td>Tables</td>
      <td>✓ Working</td>
      <td>This table itself!</td>
    </tr>
    <tr>
      <td>Images</td>
      <td>⏳ Testing</td>
      <td>Base64 images embedded</td>
    </tr>
  </tbody>
</table>

<h2>Code Example</h2>
<p>Inline code: <code>const x = 42;</code></p>

<pre><code>// Code block
function greet(name) {
  return \`Hello, \${name}!\`;
}</code></pre>

<h2>Links</h2>
<p>Check out <a href="https://tiptap.dev" class="tiptap-link">Tiptap documentation</a> for more info.</p>

<h2>Sample Image</h2>
<p>Below is a small base64 test image (1x1 pixel red):</p>
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==" alt="Test image" class="tiptap-image" />
`;

// Sample Markdown for Phase 2 testing
const SAMPLE_MARKDOWN = `# Phase 2: Markdown Conversion Test

This is a **markdown document** with _various_ formatting options.

## Lists

- Unordered list item 1
- Unordered list item 2
  - Nested item
- Unordered list item 3

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

## Code

Inline code: \`const x = 42;\`

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello World!");
}
\`\`\`

## Links and Images

[Link to Tiptap](https://tiptap.dev)

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown | ✓ | Converts to Tiptap |
| Tables | ⏳ | Testing |
| Images | ⏳ | Placeholder support |

## Blockquote

> This is a blockquote with **bold** text inside.

---

**End of markdown test**
`;

export function TiptapTest() {
  const editorRef = useRef<TiptapEditorRef>(null);
  const [editable, setEditable] = useState(true);
  const [currentHtml, setCurrentHtml] = useState('');
  const [currentJson, setCurrentJson] = useState('');
  const [selection, setSelection] = useState('');
  const [convertedJson, setConvertedJson] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedHtml, setEnhancedHtml] = useState('');
  const [enhanceError, setEnhanceError] = useState('');

  const handleGetHTML = () => {
    if (editorRef.current) {
      const html = editorRef.current.getHTML();
      setCurrentHtml(html);
      console.log('HTML:', html);
    }
  };

  const handleGetJSON = () => {
    if (editorRef.current) {
      const json = editorRef.current.getJSON();
      setCurrentJson(JSON.stringify(json, null, 2));
      console.log('JSON:', json);
    }
  };

  const handleSetContent = () => {
    if (editorRef.current) {
      editorRef.current.setContent('<h2>Content Updated!</h2><p>This content was set programmatically.</p>');
    }
  };

  const handleSelectionChange = (sel: { text: string; from: number; to: number; empty: boolean }) => {
    if (!sel.empty) {
      setSelection(`Selected: "${sel.text}" (${sel.from}-${sel.to})`);
    } else {
      setSelection('');
    }
  };

  const handleConvertMarkdown = () => {
    try {
      // Convert markdown to Tiptap JSON
      const json = markdownToTiptapJson(SAMPLE_MARKDOWN);
      setConvertedJson(JSON.stringify(json, null, 2));

      // Load into editor
      if (editorRef.current) {
        editorRef.current.setContent(json);
      }

      console.log('Markdown converted to Tiptap JSON:', json);
    } catch (error) {
      console.error('Markdown conversion failed:', error);
    }
  };

  const handleTestEnhancement = async () => {
    setEnhancing(true);
    setEnhanceError('');
    setEnhancedHtml('');

    try {
      // Get current editor HTML
      if (!editorRef.current) {
        throw new Error('Editor not initialized');
      }

      const fullHtml = editorRef.current.getHTML();

      // Create a sample target block with <target> tags
      const targetBlockHtml = '<p>This is a <target>sample text</target> that needs enhancement.</p>';

      console.log('Testing enhancement API with:', {
        fullDocumentHtml: fullHtml.substring(0, 100) + '...',
        targetBlockHtml,
      });

      // Call enhancement API
      const result = await enhanceContent({
        fullDocumentHtml: fullHtml,
        targetBlockHtml,
        documentName: 'Phase 3 Test Document',
      });

      console.log('Enhancement result:', result);
      setEnhancedHtml(result.newHtml);
    } catch (error) {
      console.error('Enhancement test failed:', error);
      setEnhanceError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Tiptap Editor - Phase 1 Test</Title>
          <Text c="dimmed">Testing basic editor functionality with various content types</Text>
        </div>

        {/* Control Buttons */}
        <Group>
          <Button onClick={() => setEditable(!editable)}>
            {editable ? 'Make Read-Only' : 'Make Editable'}
          </Button>
          <Button onClick={handleGetHTML} variant="light">
            Get HTML
          </Button>
          <Button onClick={handleGetJSON} variant="light">
            Get JSON
          </Button>
          <Button onClick={handleSetContent} variant="light" color="orange">
            Set Sample Content
          </Button>
        </Group>

        {selection && (
          <Paper p="sm" bg="blue.0">
            <Text size="sm" fw={500}>
              {selection}
            </Text>
          </Paper>
        )}

        {/* Editor */}
        <TiptapEditor
          ref={editorRef}
          content={SAMPLE_HTML}
          editable={editable}
          onContentChange={(content) => {
            console.log('Content changed:', content);
          }}
          onSelectionChange={handleSelectionChange}
          placeholder="Start typing to test the editor..."
        />

        {/* Output Display */}
        {currentHtml && (
          <div>
            <Title order={3}>HTML Output</Title>
            <Code block>{currentHtml}</Code>
          </div>
        )}

        {currentJson && (
          <div>
            <Title order={3}>JSON Output</Title>
            <Code block>{currentJson}</Code>
          </div>
        )}

        {/* Instructions */}
        <Paper p="md" withBorder>
          <Title order={3} mb="sm">
            Test Checklist
          </Title>
          <Stack gap="xs">
            <Text size="sm">✓ Editor renders with sample HTML content</Text>
            <Text size="sm">✓ Can toggle between editable and read-only modes</Text>
            <Text size="sm">✓ Can type and edit text</Text>
            <Text size="sm">✓ Text selection shows selected text info</Text>
            <Text size="sm">✓ "Get HTML" button extracts current HTML</Text>
            <Text size="sm">✓ "Get JSON" button extracts Tiptap JSON</Text>
            <Text size="sm">✓ "Set Sample Content" replaces editor content</Text>
            <Text size="sm">✓ Tables render correctly</Text>
            <Text size="sm">✓ Images (base64) render correctly</Text>
            <Text size="sm">✓ Links are styled but don't navigate</Text>
            <Text size="sm">✓ Code blocks and inline code styled correctly</Text>
          </Stack>
        </Paper>

        <Divider my="xl" label="Phase 2: Markdown Conversion Test" labelPosition="center" />

        {/* Markdown Conversion Test */}
        <Paper p="md" withBorder bg="orange.0">
          <Title order={3} mb="md">
            Markdown → Tiptap JSON Conversion
          </Title>
          <Text size="sm" mb="md">
            Test converting markdown to Tiptap JSON format. Click the button below to convert the sample markdown and load it into the editor.
          </Text>
          <Button onClick={handleConvertMarkdown} color="orange">
            Convert & Load Sample Markdown
          </Button>
        </Paper>

        {/* Show sample markdown */}
        <div>
          <Title order={4}>Sample Markdown</Title>
          <Code block>{SAMPLE_MARKDOWN}</Code>
        </div>

        {/* Show converted JSON */}
        {convertedJson && (
          <div>
            <Title order={4}>Converted Tiptap JSON</Title>
            <Code block>{convertedJson}</Code>
          </div>
        )}

        <Divider my="xl" label="Phase 3: HTML Enhancement API Test" labelPosition="center" />

        {/* Enhancement API Test */}
        <Paper p="md" withBorder bg="grape.0">
          <Title order={3} mb="md">
            HTML-Based Enhancement API
          </Title>
          <Text size="sm" mb="md">
            Test the new HTML-based enhancement API. This will send the current editor content as HTML along with a sample target block to the API.
          </Text>
          <Alert icon={<IconInfoCircle size={16} />} title="Test Details" mb="md">
            Sample input: <Code>{'<p>This is a <target>sample text</target> that needs enhancement.</p>'}</Code>
            <br />
            The API will enhance the text inside <Code>{'<target>'}</Code> tags while preserving HTML structure.
          </Alert>
          <Button onClick={handleTestEnhancement} color="grape" loading={enhancing}>
            {enhancing ? 'Enhancing...' : 'Test Enhancement API'}
          </Button>
        </Paper>

        {/* Show enhancement result */}
        {enhancedHtml && (
          <Paper p="md" withBorder bg="green.0">
            <Title order={4} mb="sm">
              ✓ Enhancement Successful
            </Title>
            <Text size="sm" mb="xs" fw={500}>
              Enhanced HTML:
            </Text>
            <Code block>{enhancedHtml}</Code>
          </Paper>
        )}

        {/* Show enhancement error */}
        {enhanceError && (
          <Paper p="md" withBorder bg="red.0">
            <Title order={4} mb="sm">
              ✗ Enhancement Failed
            </Title>
            <Text size="sm" c="red">
              {enhanceError}
            </Text>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
