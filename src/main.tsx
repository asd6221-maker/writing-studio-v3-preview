import React from 'react';
import { createRoot } from 'react-dom/client';
import WriterV3 from './WriterV3';
import './style.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WriterV3 />
  </React.StrictMode>,
);

// Small workspace conveniences layered over the preview UI.
// WriterV3 already autosaves to IndexedDB; the explicit save button gives a clear
// manual checkpoint without changing the preserved original / AI source texts.
function enhanceWorkspace() {
  const layout = document.querySelector<HTMLElement>('.v3-layout');
  const aside = layout?.querySelector<HTMLElement>('aside');
  if (layout && aside && !aside.querySelector('.sidebar-toggle')) {
    layout.classList.add('sidebar-collapsed');
    const toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle';
    toggle.type = 'button';
    toggle.title = '원고 목록 열기/접기';
    toggle.innerHTML = '<span class="toggle-icon">☰</span><span class="toggle-label">원고 목록</span>';
    toggle.addEventListener('click', () => {
      layout.classList.toggle('sidebar-collapsed');
      toggle.title = layout.classList.contains('sidebar-collapsed') ? '원고 목록 열기' : '원고 목록 접기';
    });
    aside.prepend(toggle);
  }

  const polish = document.querySelector<HTMLElement>('.polish');
  const foot = polish?.querySelector<HTMLElement>('.v3-editor-foot');
  if (polish && foot && !foot.querySelector('.manual-save')) {
    const save = document.createElement('button');
    save.className = 'manual-save primary';
    save.type = 'button';
    save.textContent = '다듬는 원고 저장';
    save.addEventListener('click', () => {
      const editor = polish.querySelector<HTMLTextAreaElement>('textarea');
      editor?.blur();
      save.textContent = '저장 중…';
      save.disabled = true;
      window.setTimeout(() => {
        save.textContent = '✓ 수정본 저장됨';
        save.disabled = false;
        window.setTimeout(() => { save.textContent = '다듬는 원고 저장'; }, 1400);
      }, 650);
    });
    foot.append(save);
  }
}

const observer = new MutationObserver(enhanceWorkspace);
observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
enhanceWorkspace();
