import type {
  ExtensionMessage,
  ProfileData,
  ProfileDataResponseMessage,
  ProfileAnalysis,
  StorageData,
  WidgetPosition,
} from '../shared/types';

// Inject styles for the widget
const styles = `
  #relavo-widget {
    position: fixed;
    width: 380px;
    min-width: 320px;
    min-height: 200px;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
    resize: both;
  }

  #relavo-widget * {
    box-sizing: border-box;
  }

  #relavo-header {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 12px 16px;
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }

  #relavo-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  #relavo-header-buttons {
    display: flex;
    gap: 8px;
  }

  #relavo-header button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: background 0.2s;
  }

  #relavo-header button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  #relavo-content {
    padding: 16px;
    max-height: calc(100% - 48px);
    overflow-y: auto;
  }

  #relavo-profile-section {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
  }

  #relavo-profile-section .profile-name {
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  #relavo-profile-section .profile-name button {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, background 0.2s;
  }

  #relavo-profile-section .profile-name button:hover {
    color: #3b82f6;
    background: #f1f5f9;
  }

  #relavo-profile-section .profile-name button.loading {
    animation: relavo-spin 0.8s linear infinite;
  }

  .relavo-analysis-section {
    margin-top: 8px;
  }

  .relavo-analysis-label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }

  .relavo-interests {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
  }

  .relavo-interest-tag {
    padding: 4px 8px;
    background: #eff6ff;
    color: #3b82f6;
    font-size: 11px;
    border-radius: 12px;
  }

  .relavo-alignment {
    font-size: 12px;
    color: #475569;
    line-height: 1.5;
  }

  .relavo-analysis-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #64748b;
    font-size: 12px;
  }

  .relavo-analysis-error {
    color: #dc2626;
    font-size: 12px;
  }

  .relavo-analyze-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .relavo-analyze-btn:hover {
    background: #2563eb;
  }

  .relavo-analyze-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  /* Chip Styles */
  .relavo-chip-section {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
  }

  .relavo-chip-section h4 {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #1e293b;
  }

  .relavo-chip-group {
    margin-bottom: 10px;
  }

  .relavo-chip-group:last-child {
    margin-bottom: 0;
  }

  .relavo-chip-group label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .relavo-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .relavo-chip {
    padding: 6px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: white;
    color: #475569;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .relavo-chip:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .relavo-chip.selected {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  /* Custom Context */
  .relavo-context-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
    color: #334155;
    margin-top: 8px;
  }

  .relavo-context-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .relavo-context-input::placeholder {
    color: #94a3b8;
  }

  #relavo-generate-btn {
    width: 100%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  #relavo-generate-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  #relavo-generate-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }

  #relavo-message-output {
    margin-top: 12px;
    background: white;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    display: none;
  }

  #relavo-message-output.visible {
    display: block;
  }

  #relavo-message-output .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  #relavo-message-output h4 {
    margin: 0;
    font-size: 13px;
    color: #1e293b;
  }

  #relavo-copy-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background 0.2s;
  }

  #relavo-copy-btn:hover {
    background: #059669;
  }

  #relavo-message-text {
    background: #f8fafc;
    border-radius: 6px;
    padding: 10px;
    font-size: 12px;
    color: #334155;
    line-height: 1.5;
    white-space: pre-wrap;
    border: 1px solid #e2e8f0;
  }

  #relavo-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 10px;
    border-radius: 6px;
    font-size: 12px;
    margin-top: 12px;
    display: none;
  }

  #relavo-error.visible {
    display: block;
  }

  #relavo-tip {
    margin-top: 8px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
    padding: 8px;
    border-radius: 6px;
    font-size: 11px;
  }

  .relavo-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: relavo-spin 0.8s linear infinite;
  }

  @keyframes relavo-spin {
    to { transform: rotate(360deg); }
  }

  #relavo-widget.minimized {
    width: auto !important;
    height: auto !important;
    min-width: auto;
    min-height: auto;
    resize: none;
  }

  #relavo-widget.minimized #relavo-content {
    display: none;
  }

  #relavo-settings-panel {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    border: 1px solid #e2e8f0;
    display: none;
  }

  #relavo-settings-panel.visible {
    display: block;
  }

  #relavo-settings-panel h4 {
    margin: 0 0 10px 0;
    font-size: 13px;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .relavo-setting-group {
    margin-bottom: 10px;
  }

  .relavo-setting-group:last-child {
    margin-bottom: 0;
  }

  .relavo-setting-group label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 4px;
  }

  .relavo-setting-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
    color: #334155;
  }

  .relavo-setting-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  #relavo-settings-toggle {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: background 0.2s;
  }

  #relavo-settings-toggle:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  #relavo-settings-toggle.active {
    background: rgba(255, 255, 255, 0.4);
  }

  .relavo-settings-saved {
    font-size: 10px;
    color: #10b981;
    margin-top: 6px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .relavo-settings-saved.visible {
    opacity: 1;
  }
`;

let widget: HTMLElement | null = null;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let profileData: ProfileData | null = null;
let profileAnalysis: ProfileAnalysis | null = null;
let lastUrl = location.href;
let settingsState: {
  businessContext: string;
  vibe: string;
  relationship: string;
  customContext: string;
  widgetPosition: WidgetPosition;
  autoFetchProfile: boolean;
  vibes: string[];
  relationships: string[];
} = {
  businessContext: '',
  vibe: 'professional',
  relationship: 'cold',
  customContext: '',
  widgetPosition: 'top-right',
  autoFetchProfile: true,
  vibes: ['casual', 'professional', 'enthusiastic', 'friendly'],
  relationships: ['cold', 'met-before', 'referral', 'mutual-connection'],
};
let isAnalyzing = false;
let isLoadingProfile = false;
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function injectStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isLinkedInProfileUrl(url: string): boolean {
  return /linkedin\.com\/in\/[^\/]+\/?(\?.*)?$/.test(url);
}

function setupNavigationListener() {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  window.addEventListener('popstate', handleUrlChange);

  // Polling fallback for LinkedIn's SPA navigation that may not trigger History API
  setInterval(() => {
    if (location.href !== lastUrl) {
      handleUrlChange();
    }
  }, 500);
}

function handleUrlChange() {
  const currentUrl = location.href;
  if (currentUrl === lastUrl) return;
  lastUrl = currentUrl;

  const isProfile = isLinkedInProfileUrl(currentUrl);

  if (isProfile && !widget) {
    createWidget();
  } else if (!isProfile && widget) {
    removeWidget();
  } else if (isProfile && widget) {
    // Reset for new profile
    profileData = null;
    profileAnalysis = null;
    isAnalyzing = false;
    isLoadingProfile = true;
    clearGeneratedMessage();
    updateProfileDisplay(); // Show loading state immediately

    // Wait for LinkedIn to load new profile content before extracting
    setTimeout(() => {
      loadProfileData();
    }, 800);
  }
}

function removeWidget() {
  if (widget) {
    widget.remove();
    widget = null;
  }
}

async function loadSettingsFromStorage() {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.get(['businessContext', 'defaultVibe', 'defaultRelationship', 'widgetPosition', 'autoFetchProfile', 'messageOptions'], (result) => {
      const data = result as Partial<StorageData>;
      settingsState.businessContext = data.businessContext || '';
      settingsState.vibe = data.defaultVibe || 'professional';
      settingsState.relationship = data.defaultRelationship || 'cold';
      settingsState.widgetPosition = data.widgetPosition || 'top-right';
      settingsState.autoFetchProfile = data.autoFetchProfile !== false; // default true

      // Load custom message options
      if (data.messageOptions?.vibes?.length) {
        settingsState.vibes = data.messageOptions.vibes;
      }
      if (data.messageOptions?.relationships?.length) {
        settingsState.relationships = data.messageOptions.relationships;
      }

      // Ensure selected vibe/relationship is valid
      if (!settingsState.vibes.includes(settingsState.vibe)) {
        settingsState.vibe = settingsState.vibes[0] || 'professional';
      }
      if (!settingsState.relationships.includes(settingsState.relationship)) {
        settingsState.relationship = settingsState.relationships[0] || 'cold';
      }

      resolve();
    });
  });
}

function getPositionStyles(position: WidgetPosition): { top?: string; bottom?: string; left?: string; right?: string } {
  switch (position) {
    case 'top-left':
      return { top: '100px', left: '20px' };
    case 'top-right':
      return { top: '100px', right: '20px' };
    case 'bottom-left':
      return { bottom: '100px', left: '20px' };
    case 'bottom-right':
      return { bottom: '100px', right: '20px' };
    default:
      return { top: '100px', right: '20px' };
  }
}

function applyWidgetPosition(widgetEl: HTMLElement, position: WidgetPosition) {
  // Clear any existing position styles
  widgetEl.style.top = '';
  widgetEl.style.bottom = '';
  widgetEl.style.left = '';
  widgetEl.style.right = '';

  const styles = getPositionStyles(position);
  if (styles.top) widgetEl.style.top = styles.top;
  if (styles.bottom) widgetEl.style.bottom = styles.bottom;
  if (styles.left) widgetEl.style.left = styles.left;
  if (styles.right) widgetEl.style.right = styles.right;
}

function saveSettingsToStorage() {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  saveDebounceTimer = setTimeout(() => {
    chrome.storage.sync.set({
      businessContext: settingsState.businessContext,
      defaultVibe: settingsState.vibe,
      defaultRelationship: settingsState.relationship,
    });
    showSettingsSaved();
  }, 500);
}

function showSettingsSaved() {
  const savedIndicator = widget?.querySelector('.relavo-settings-saved');
  if (savedIndicator) {
    savedIndicator.classList.add('visible');
    setTimeout(() => {
      savedIndicator.classList.remove('visible');
    }, 1500);
  }
}

async function createWidget() {
  if (widget) return;

  await loadSettingsFromStorage();

  widget = document.createElement('div');
  widget.id = 'relavo-widget';
  widget.innerHTML = `
    <div id="relavo-header">
      <h3>Relavo</h3>
      <div id="relavo-header-buttons">
        <button id="relavo-settings-toggle" title="Settings">&#9881;</button>
        <button id="relavo-refresh" title="Refresh profile data">&#8635;</button>
        <button id="relavo-minimize" title="Minimize">&minus;</button>
        <button id="relavo-close" title="Close">&times;</button>
      </div>
    </div>
    <div id="relavo-content">
      <div id="relavo-settings-panel">
        <h4>&#9881; Business Context</h4>
        <div class="relavo-setting-group">
          <label for="relavo-business-context">About You/Your Business</label>
          <textarea
            id="relavo-business-context"
            placeholder="e.g., I help B2B SaaS companies optimize their marketing..."
            rows="2"
          >${settingsState.businessContext}</textarea>
        </div>
        <div class="relavo-settings-saved">&#10003; Settings saved</div>
      </div>

      <div id="relavo-profile-section">
        <div class="profile-name">
          <span id="relavo-profile-name">Loading...</span>
          <button id="relavo-analyze-btn" title="Analyze profile">&#8635;</button>
        </div>
        <div id="relavo-analysis-content"></div>
      </div>

      <div class="relavo-chip-section">
        <h4>Message Options</h4>

        <div class="relavo-chip-group">
          <label>Vibe</label>
          <div class="relavo-chips" id="relavo-vibe-chips">
            ${settingsState.vibes.map(vibe => `<button class="relavo-chip ${settingsState.vibe === vibe ? 'selected' : ''}" data-vibe="${vibe}">${formatLabel(vibe)}</button>`).join('')}
          </div>
        </div>

        <div class="relavo-chip-group">
          <label>Relationship</label>
          <div class="relavo-chips" id="relavo-relationship-chips">
            ${settingsState.relationships.map(rel => `<button class="relavo-chip ${settingsState.relationship === rel ? 'selected' : ''}" data-rel="${rel}">${formatLabel(rel)}</button>`).join('')}
          </div>
        </div>

        <div class="relavo-chip-group">
          <label>Custom Context (optional)</label>
          <textarea
            class="relavo-context-input"
            id="relavo-custom-context"
            placeholder="Add specific details about why you're reaching out..."
            rows="2"
          ></textarea>
        </div>
      </div>

      <button id="relavo-generate-btn">Generate Message</button>
      <div id="relavo-error"></div>
      <div id="relavo-message-output">
        <div class="message-header">
          <h4>Your Message</h4>
          <button id="relavo-copy-btn">
            <span>&#128203;</span> Copy
          </button>
        </div>
        <div id="relavo-message-text"></div>
        <div id="relavo-tip">Tip: Review and personalize before sending!</div>
      </div>
    </div>
  `;

  document.body.appendChild(widget);
  applyWidgetPosition(widget, settingsState.widgetPosition);
  setupEventListeners();
  loadProfileData();
}

function setupEventListeners() {
  if (!widget) return;

  const header = widget.querySelector('#relavo-header') as HTMLElement;
  const closeBtn = widget.querySelector('#relavo-close') as HTMLElement;
  const minimizeBtn = widget.querySelector('#relavo-minimize') as HTMLElement;
  const refreshBtn = widget.querySelector('#relavo-refresh') as HTMLElement;
  const analyzeBtn = widget.querySelector('#relavo-analyze-btn') as HTMLElement;
  const generateBtn = widget.querySelector('#relavo-generate-btn') as HTMLElement;
  const copyBtn = widget.querySelector('#relavo-copy-btn') as HTMLElement;
  const settingsToggle = widget.querySelector('#relavo-settings-toggle') as HTMLElement;
  const settingsPanel = widget.querySelector('#relavo-settings-panel') as HTMLElement;
  const businessContextInput = widget.querySelector('#relavo-business-context') as HTMLTextAreaElement;
  const customContextInput = widget.querySelector('#relavo-custom-context') as HTMLTextAreaElement;
  const vibeChips = widget.querySelectorAll('#relavo-vibe-chips .relavo-chip');
  const relationshipChips = widget.querySelectorAll('#relavo-relationship-chips .relavo-chip');

  // Dragging
  header.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    isDragging = true;
    const rect = widget!.getBoundingClientRect();
    dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    widget!.style.transition = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !widget) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    widget.style.left = `${Math.max(0, Math.min(x, window.innerWidth - widget.offsetWidth))}px`;
    widget.style.top = `${Math.max(0, Math.min(y, window.innerHeight - widget.offsetHeight))}px`;
    widget.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (widget) widget.style.transition = '';
  });

  // Close
  closeBtn.addEventListener('click', () => {
    widget?.remove();
    widget = null;
  });

  // Minimize
  minimizeBtn.addEventListener('click', () => {
    widget?.classList.toggle('minimized');
    minimizeBtn.textContent = widget?.classList.contains('minimized') ? '+' : '−';
  });

  // Settings toggle
  settingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('visible');
    settingsToggle.classList.toggle('active');
  });

  // Business context change
  businessContextInput.addEventListener('input', () => {
    settingsState.businessContext = businessContextInput.value;
    saveSettingsToStorage();
  });

  // Custom context change (no save to storage, per-session)
  customContextInput.addEventListener('input', () => {
    settingsState.customContext = customContextInput.value;
  });

  // Vibe chip selection
  vibeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      vibeChips.forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      settingsState.vibe = chip.getAttribute('data-vibe') || 'professional';
      saveSettingsToStorage();
    });
  });

  // Relationship chip selection
  relationshipChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      relationshipChips.forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      settingsState.relationship = chip.getAttribute('data-rel') || 'cold';
      saveSettingsToStorage();
    });
  });

  // Refresh
  refreshBtn.addEventListener('click', () => {
    profileAnalysis = null;
    loadProfileData();
  });

  // Analyze
  analyzeBtn.addEventListener('click', analyzeProfile);

  // Generate
  generateBtn.addEventListener('click', generateMessage);

  // Copy
  copyBtn.addEventListener('click', copyMessage);
}

function loadProfileData() {
  profileData = extractProfileData();
  isLoadingProfile = false;
  updateProfileDisplay();

  // Auto-analyze if enabled and not already analyzed
  if (profileData && settingsState.autoFetchProfile && !profileAnalysis) {
    analyzeProfile();
  }
}

function updateProfileDisplay() {
  const nameEl = widget?.querySelector('#relavo-profile-name');
  const analysisContent = widget?.querySelector('#relavo-analysis-content');
  const analyzeBtn = widget?.querySelector('#relavo-analyze-btn') as HTMLElement;

  if (!nameEl || !analysisContent) return;

  if (!profileData) {
    if (isLoadingProfile) {
      nameEl.textContent = 'Loading...';
      analysisContent.innerHTML = '';
    } else {
      nameEl.textContent = 'Could not load profile';
      analysisContent.innerHTML = '<p class="relavo-analysis-error">Make sure you\'re on a LinkedIn profile page.</p>';
    }
    return;
  }

  nameEl.textContent = profileData.name;

  // Update analysis section
  if (isAnalyzing) {
    analyzeBtn.classList.add('loading');
    analysisContent.innerHTML = `
      <div class="relavo-analysis-loading">
        <div class="relavo-spinner" style="width: 14px; height: 14px; border-width: 2px;"></div>
        Analyzing profile...
      </div>
    `;
  } else if (profileAnalysis) {
    analyzeBtn.classList.remove('loading');
    const interestTags = profileAnalysis.interests
      .map(interest => `<span class="relavo-interest-tag">${interest}</span>`)
      .join('');

    analysisContent.innerHTML = `
      <div class="relavo-analysis-section">
        <div class="relavo-analysis-label">Interests</div>
        <div class="relavo-interests">${interestTags}</div>
      </div>
      <div class="relavo-analysis-section">
        <div class="relavo-analysis-label">How to Connect</div>
        <div class="relavo-alignment">${profileAnalysis.alignmentSuggestion}</div>
      </div>
    `;
  } else {
    analyzeBtn.classList.remove('loading');
    analysisContent.innerHTML = `
      <button class="relavo-analyze-btn" id="relavo-analyze-profile-btn">Analyze Profile</button>
    `;
    // Add click handler for the analyze button
    const analyzeProfileBtn = widget?.querySelector('#relavo-analyze-profile-btn');
    analyzeProfileBtn?.addEventListener('click', analyzeProfile);
  }
}

function clearGeneratedMessage() {
  const outputEl = widget?.querySelector('#relavo-message-output') as HTMLElement;
  const messageText = widget?.querySelector('#relavo-message-text') as HTMLElement;
  const errorEl = widget?.querySelector('#relavo-error') as HTMLElement;

  if (outputEl) outputEl.classList.remove('visible');
  if (messageText) messageText.textContent = '';
  if (errorEl) errorEl.classList.remove('visible');
}

async function analyzeProfile() {
  if (!profileData || isAnalyzing) return;

  isAnalyzing = true;
  updateProfileDisplay();

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'ANALYZE_PROFILE',
      profileData,
    });

    if (response.error) {
      profileAnalysis = null;
      const analysisContent = widget?.querySelector('#relavo-analysis-content');
      if (analysisContent) {
        analysisContent.innerHTML = `<p class="relavo-analysis-error">${response.error}</p>`;
      }
    } else if (response.analysis) {
      profileAnalysis = response.analysis;
    }
  } catch (error) {
    const analysisContent = widget?.querySelector('#relavo-analysis-content');
    if (analysisContent) {
      analysisContent.innerHTML = '<p class="relavo-analysis-error">Failed to analyze. Check API key in extension settings.</p>';
    }
  } finally {
    isAnalyzing = false;
    updateProfileDisplay();
  }
}

async function generateMessage() {
  if (!profileData) {
    showError('No profile data available.');
    return;
  }

  const generateBtn = widget?.querySelector('#relavo-generate-btn') as HTMLElement;
  const errorEl = widget?.querySelector('#relavo-error') as HTMLElement;
  const outputEl = widget?.querySelector('#relavo-message-output') as HTMLElement;

  generateBtn.innerHTML = '<div class="relavo-spinner"></div> Generating...';
  generateBtn.setAttribute('disabled', 'true');
  errorEl.classList.remove('visible');
  outputEl.classList.remove('visible');

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GENERATE_MESSAGE',
      profileData,
      profileAnalysis,
      vibe: settingsState.vibe,
      relationship: settingsState.relationship,
      customContext: settingsState.customContext,
      businessContext: settingsState.businessContext,
    });

    if (response.error) {
      showError(response.error);
    } else if (response.message) {
      const messageText = widget?.querySelector('#relavo-message-text') as HTMLElement;
      messageText.textContent = response.message;
      outputEl.classList.add('visible');
    }
  } catch (error) {
    showError('Failed to generate message. Check your API key in the extension settings.');
  } finally {
    generateBtn.innerHTML = 'Generate Message';
    generateBtn.removeAttribute('disabled');
  }
}

function showError(message: string) {
  const errorEl = widget?.querySelector('#relavo-error') as HTMLElement;
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

function copyMessage() {
  const messageText = widget?.querySelector('#relavo-message-text') as HTMLElement;
  const copyBtn = widget?.querySelector('#relavo-copy-btn') as HTMLElement;

  if (messageText?.textContent) {
    navigator.clipboard.writeText(messageText.textContent);
    copyBtn.innerHTML = '<span>&#10003;</span> Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = '<span>&#128203;</span> Copy';
    }, 2000);
  }
}

function extractProfileData(): ProfileData | null {
  try {
    const jsonLdData = extractFromJsonLd();
    if (jsonLdData) return jsonLdData;
    return extractFromDom();
  } catch (error) {
    console.error('Error extracting profile data:', error);
    return null;
  }
}

function extractFromJsonLd(): ProfileData | null {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || '');
      if (data['@type'] === 'Person') {
        return {
          name: data.name || '',
          headline: data.jobTitle || '',
          about: data.description || '',
          experience: extractExperienceFromJsonLd(data),
          location: data.address?.addressLocality || '',
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function extractExperienceFromJsonLd(data: Record<string, unknown>): string[] {
  const experience: string[] = [];
  const worksFor = data.worksFor;
  if (Array.isArray(worksFor)) {
    for (const job of worksFor) {
      if (job.name) experience.push(job.name);
    }
  } else if (worksFor && typeof worksFor === 'object' && 'name' in worksFor) {
    experience.push(String(worksFor.name));
  }
  return experience;
}

function extractFromDom(): ProfileData | null {
  const name = extractText([
    '.text-heading-xlarge',
    'h1.text-heading-xlarge',
    '.pv-top-card h1',
    'h1[data-generated-suggestion-target]',
    '.artdeco-entity-lockup__title',
  ]);

  if (!name) return null;

  const headline = extractText([
    '.text-body-medium.break-words',
    '.pv-top-card .text-body-medium',
    '.pv-text-details__left-panel .text-body-medium',
  ]);

  const location = extractText([
    '.text-body-small.inline.t-black--light.break-words',
    '.pv-top-card .text-body-small.t-black--light',
    '.pv-text-details__left-panel .text-body-small',
  ]);

  const about = extractAboutSection();
  const experience = extractExperience();

  return { name, headline: headline || '', about: about || '', experience, location: location || '' };
}

function extractText(selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) return element.textContent.trim();
  }
  return '';
}

function extractAboutSection(): string {
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
    const aboutText = aboutSection.closest('section')?.querySelector('.pv-shared-text-with-see-more span[aria-hidden="true"]');
    if (aboutText?.textContent) return aboutText.textContent.trim();
    const spans = aboutSection.closest('section')?.querySelectorAll('span');
    if (spans) {
      for (const span of spans) {
        const text = span.textContent?.trim();
        if (text && text.length > 50) return text;
      }
    }
  }
  const aboutDiv = document.querySelector('[data-generated-suggestion-target="urn:li:fsd_profileAbout"]');
  if (aboutDiv?.textContent) return aboutDiv.textContent.trim();
  return '';
}

function extractExperience(): string[] {
  const experience: string[] = [];
  const experienceSection = document.querySelector('#experience');
  if (!experienceSection) return experience;

  const section = experienceSection.closest('section');
  if (!section) return experience;

  const experienceItems = section.querySelectorAll('.artdeco-list__item, li.pvs-list__paged-list-item');
  for (const item of experienceItems) {
    const titleElement = item.querySelector('.t-bold span[aria-hidden="true"], .mr1.t-bold span');
    const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"], .t-14.t-normal .t-black--light span');
    const title = titleElement?.textContent?.trim();
    const company = companyElement?.textContent?.trim();
    if (title && company) {
      experience.push(`${title} at ${company}`);
    } else if (title) {
      experience.push(title);
    }
    if (experience.length >= 5) break;
  }
  return experience;
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProfileDataResponseMessage) => void
  ) => {
    if (message.type === 'GET_PROFILE_DATA') {
      sendResponse({
        type: 'PROFILE_DATA_RESPONSE',
        data: extractProfileData(),
      });
    } else if (message.type === 'TOGGLE_WIDGET') {
      if (widget) {
        widget.remove();
        widget = null;
      } else {
        createWidget();
      }
    }
    return false;
  }
);

// Initialize
injectStyles();
setupNavigationListener();

if (isLinkedInProfileUrl(location.href)) {
  createWidget();
}

console.log('Relavo content script loaded - v2.0.0');
