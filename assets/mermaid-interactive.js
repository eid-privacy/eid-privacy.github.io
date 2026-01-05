import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

function addZoomControls(mermaidDiv) {
  const container = document.createElement('div');
  container.className = 'mermaid-container';
  mermaidDiv.parentNode.insertBefore(container, mermaidDiv);
  container.appendChild(mermaidDiv);
  
  const controls = document.createElement('div');
  controls.className = 'mermaid-controls';
  
  let zoomLevel = 1;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStart = { x: 0, y: 0, panX: 0, panY: 0 };
  
  const applyTransform = () => {
    mermaidDiv.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
  };
  
  const resetZoom = () => {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    mermaidDiv.classList.remove('mermaid-zoomed');
    applyTransform();
  };
  
  mermaidDiv.addEventListener('mousedown', (e) => {
    if (e.target.closest('.mermaid-controls')) return;
    isDragging = true;
    container.classList.add('dragging');
    dragStart = { x: e.clientX, y: e.clientY, panX, panY };
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      panX = dragStart.panX + (e.clientX - dragStart.x);
      panY = dragStart.panY + (e.clientY - dragStart.y);
      applyTransform();
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      container.classList.remove('dragging');
    }
  });
  
  container.addEventListener('wheel', (e) => {
    if (e.target.closest('.mermaid-controls')) return;
    e.preventDefault();
    
    const delta = -e.deltaY * 0.001;
    const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
    
    if (newZoom !== zoomLevel) {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const graphX = (mouseX - panX - rect.width / 2) / zoomLevel;
      const graphY = (mouseY - panY - rect.height / 2) / zoomLevel;
      
      zoomLevel = newZoom;
      panX = mouseX - rect.width / 2 - graphX * zoomLevel;
      panY = mouseY - rect.height / 2 - graphY * zoomLevel;
      
      mermaidDiv.classList.toggle('mermaid-zoomed', zoomLevel !== 1);
      applyTransform();
    }
  }, { passive: false });
  
  const createButton = (text, title, onClick) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.onclick = onClick;
    return btn;
  };
  
  controls.appendChild(createButton('+', 'Zoom in', () => {
    zoomLevel = Math.min(zoomLevel + 0.2, 3);
    mermaidDiv.classList.add('mermaid-zoomed');
    applyTransform();
  }));
  
  controls.appendChild(createButton('−', 'Zoom out', () => {
    zoomLevel = Math.max(zoomLevel - 0.2, 0.5);
    mermaidDiv.classList.toggle('mermaid-zoomed', zoomLevel !== 1);
    applyTransform();
  }));
  
  controls.appendChild(createButton('⟲', 'Reset', resetZoom));
  
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.5); z-index: 9998; display: none;';
  document.body.appendChild(overlay);
  
  const toggleFullscreen = () => {
    if (!container.classList.contains('mermaid-fullscreen')) {
      container.classList.add('mermaid-fullscreen');
      document.body.style.overflow = 'hidden';
      overlay.style.display = 'block';
      fullscreenBtn.textContent = '✕';
      fullscreenBtn.title = 'Exit fullscreen';
      resetZoom();
    } else {
      container.classList.remove('mermaid-fullscreen');
      document.body.style.overflow = '';
      overlay.style.display = 'none';
      fullscreenBtn.textContent = '⛶';
      fullscreenBtn.title = 'Fullscreen';
      resetZoom();
    }
  };
  
  const fullscreenBtn = createButton('⛶', 'Fullscreen', toggleFullscreen);
  overlay.onclick = toggleFullscreen;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && container.classList.contains('mermaid-fullscreen')) {
      toggleFullscreen();
    }
  });
  
  controls.appendChild(fullscreenBtn);
  container.appendChild(controls);
}

function convertMermaidBlocks() {
  const mermaidPreBlocks = document.querySelectorAll('pre code.language-mermaid');
  
  mermaidPreBlocks.forEach(codeBlock => {
    const pre = codeBlock.parentElement;
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.textContent = codeBlock.textContent || codeBlock.innerText;
    pre.parentNode.replaceChild(mermaidDiv, pre);
  });
  
  mermaid.initialize({ startOnLoad: false });
  mermaid.run().then(() => {
    document.querySelectorAll('.mermaid').forEach(diagram => {
      if (diagram.querySelector('svg')) {
        addZoomControls(diagram);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', convertMermaidBlocks);
} else {
  convertMermaidBlocks();
}
