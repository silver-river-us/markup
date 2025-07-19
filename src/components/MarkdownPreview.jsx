import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';

const MarkdownPreview = ({ markdown, onLinkClick }) => {
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

      // Configure marked to generate header IDs
      marked.setOptions({
        headerIds: true,
        mangle: false
      });

      // Parse markdown to HTML
      const html = marked.parse(markdown);
      previewRef.current.innerHTML = html;

      // Manually add IDs to headers if they don't have them
      const headers = previewRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach(header => {
        if (!header.id) {
          // Generate ID from header text
          const id = header.textContent
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
          header.id = id;
          console.log(`Added ID "${id}" to header "${header.textContent}"`);
        }
      });

      // Handle links
      const links = previewRef.current.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if it's an anchor link (internal page link)
        if (href && href.startsWith('#')) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = href.substring(1); // Remove the #
            const targetElement = previewRef.current.querySelector(`[id="${targetId}"]`);
            if (targetElement) {
              targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
              });
            }
          });
          link.style.cursor = 'pointer';
        }
        // Check if it's a relative markdown file link
        else if (href && href.startsWith('./') && href.endsWith('.md') && onLinkClick) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cross-file link clicked:', href);
            onLinkClick(href);
          });
          link.style.cursor = 'pointer';
        } else {
          // For external links, open in new tab
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });

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
          if (preElement && preElement.parentNode) {
            preElement.parentNode.replaceChild(wrapper, preElement);
          } else if (element.parentNode) {
            element.parentNode.replaceChild(wrapper, element);
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          const errorDiv = document.createElement('div');
          errorDiv.className = 'mermaid-error';
          errorDiv.textContent = `Error rendering diagram: ${error.message}`;
          
          const preElement = element.closest('pre');
          if (preElement && preElement.parentNode) {
            preElement.parentNode.replaceChild(errorDiv, preElement);
          } else if (element.parentNode) {
            element.parentNode.replaceChild(errorDiv, element);
          }
        }
      }
    };

    renderMarkdown();
  }, [markdown]);

  return (
    <div className="flex-1 flex flex-col bg-neutral-900 overflow-hidden h-full">
      <div className="bg-neutral-700 px-4 py-1 border-b border-neutral-600 text-white text-xs font-medium flex-shrink-0 h-7 flex items-center">
        <h3>Preview</h3>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-neutral-900 text-gray-200 font-sans leading-relaxed preview-content" ref={previewRef}></div>
    </div>
  );
};

export default MarkdownPreview;