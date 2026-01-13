import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.2;
const WHEEL_SENSITIVITY = 0.001;

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
  
  const resetTransform = () => {
    zoomLevel = 1;
    panX = 0;
    panY = 0;
    mermaidDiv.classList.toggle('mermaid-zoomed', false);
    applyTransform();
  };
  
  const setZoom = (newZoom, updateClass = true) => {
    zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    if (updateClass) {
      mermaidDiv.classList.toggle('mermaid-zoomed', zoomLevel !== 1);
    }
    applyTransform();
  };
  
  const handleMouseDown = (e) => {
    if (e.target.closest('.mermaid-controls')) return;
    isDragging = true;
    container.classList.add('dragging');
    dragStart = { x: e.clientX, y: e.clientY, panX, panY };
    e.preventDefault();
  };
  
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    panX = dragStart.panX + (e.clientX - dragStart.x);
    panY = dragStart.panY + (e.clientY - dragStart.y);
    applyTransform();
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      container.classList.remove('dragging');
    }
  };
  
  const handleWheel = (e) => {
    if (e.target.closest('.mermaid-controls')) return;
    e.preventDefault();
    
    const delta = -e.deltaY * WHEEL_SENSITIVITY;
    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel + delta));
    
    if (newZoom !== zoomLevel) {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const graphX = (mouseX - panX - rect.width / 2) / zoomLevel;
      const graphY = (mouseY - panY - rect.height / 2) / zoomLevel;
      
      setZoom(newZoom, false);
      panX = mouseX - rect.width / 2 - graphX * zoomLevel;
      panY = mouseY - rect.height / 2 - graphY * zoomLevel;
      mermaidDiv.classList.toggle('mermaid-zoomed', zoomLevel !== 1);
      applyTransform();
    }
  };
  
  mermaidDiv.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  container.addEventListener('wheel', handleWheel, { passive: false });
  
  const createButton = (text, title, onClick) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.onclick = onClick;
    return btn;
  };
  
  controls.appendChild(createButton('+', 'Zoom in', () => setZoom(zoomLevel + ZOOM_STEP)));
  controls.appendChild(createButton('−', 'Zoom out', () => setZoom(zoomLevel - ZOOM_STEP)));
  controls.appendChild(createButton('⟲', 'Reset', resetTransform));
  
  const overlay = document.createElement('div');
  overlay.className = 'mermaid-overlay';
  document.body.appendChild(overlay);
  
  const isFullscreen = () => container.classList.contains('mermaid-fullscreen');
  
  const toggleFullscreen = () => {
    const fullscreen = !isFullscreen();
    container.classList.toggle('mermaid-fullscreen', fullscreen);
    document.body.style.overflow = fullscreen ? 'hidden' : '';
    overlay.style.display = fullscreen ? 'block' : 'none';
    fullscreenBtn.textContent = fullscreen ? '✕' : '⛶';
    fullscreenBtn.title = fullscreen ? 'Exit fullscreen' : 'Fullscreen';
    resetTransform();
  };
  
  const fullscreenBtn = createButton('⛶', 'Fullscreen', toggleFullscreen);
  overlay.onclick = toggleFullscreen;
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFullscreen()) {
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

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', convertMermaidBlocks);
} else {
  convertMermaidBlocks();
}
