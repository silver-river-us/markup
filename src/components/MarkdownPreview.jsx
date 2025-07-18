import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';

const MarkdownPreview = ({ markdown }) => {
  const previewRef = useRef(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        primaryColor: '#4f46e5',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#4f46e5',
        lineColor: '#6b7280',
        sectionBkColor: '#374151',
        altSectionBkColor: '#1f2937',
        gridColor: '#4b5563',
        secondaryColor: '#7c3aed',
        tertiaryColor: '#059669'
      }
    });
  }, []);

  useEffect(() => {
    const renderMarkdown = async () => {
      if (!previewRef.current) return;

      // Parse markdown to HTML
      const html = marked.parse(markdown);
      previewRef.current.innerHTML = html;

      // Find and render mermaid diagrams
      const mermaidElements = previewRef.current.querySelectorAll('code.language-mermaid');
      
      for (let i = 0; i < mermaidElements.length; i++) {
        const element = mermaidElements[i];
        const mermaidCode = element.textContent;
        
        try {
          const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, mermaidCode);
          const wrapper = document.createElement('div');
          wrapper.className = 'mermaid-diagram';
          wrapper.innerHTML = svg;
          
          // Replace the entire pre element, not just the code element
          const preElement = element.closest('pre');
          if (preElement) {
            preElement.parentNode.replaceChild(wrapper, preElement);
          } else {
            element.parentNode.replaceChild(wrapper, element);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'mermaid-error';
          errorDiv.textContent = `Error rendering diagram: ${error.message}`;
          
          const preElement = element.closest('pre');
          if (preElement) {
            preElement.parentNode.replaceChild(errorDiv, preElement);
          } else {
            element.parentNode.replaceChild(errorDiv, element);
          }
        }
      }
    };

    renderMarkdown();
  }, [markdown]);

  return (
    <div className="markdown-preview">
      <div className="preview-header">
        <h3>Preview</h3>
      </div>
      <div className="preview-content" ref={previewRef}></div>
    </div>
  );
};

export default MarkdownPreview;