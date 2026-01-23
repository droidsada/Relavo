import type {
  ExtensionMessage,
  ProfileData,
  ProfileDataResponseMessage,
} from '../shared/types';

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ProfileDataResponseMessage) => void
  ) => {
    if (message.type === 'GET_PROFILE_DATA') {
      const profileData = extractProfileData();
      sendResponse({
        type: 'PROFILE_DATA_RESPONSE',
        data: profileData,
      });
    }
    return false;
  }
);

function extractProfileData(): ProfileData | null {
  try {
    // Try to extract from JSON-LD first (more reliable)
    const jsonLdData = extractFromJsonLd();
    if (jsonLdData) {
      return jsonLdData;
    }

    // Fallback to DOM extraction
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
      if (job.name) {
        experience.push(job.name);
      }
    }
  } else if (worksFor && typeof worksFor === 'object' && 'name' in worksFor) {
    experience.push(String(worksFor.name));
  }

  return experience;
}

function extractFromDom(): ProfileData | null {
  // Name - multiple selector fallbacks
  const name = extractText([
    '.text-heading-xlarge',
    'h1.text-heading-xlarge',
    '.pv-top-card h1',
    'h1[data-generated-suggestion-target]',
    '.artdeco-entity-lockup__title',
  ]);

  if (!name) {
    return null; // Name is required
  }

  // Headline
  const headline = extractText([
    '.text-body-medium.break-words',
    '.pv-top-card .text-body-medium',
    '.pv-text-details__left-panel .text-body-medium',
  ]);

  // Location
  const location = extractText([
    '.text-body-small.inline.t-black--light.break-words',
    '.pv-top-card .text-body-small.t-black--light',
    '.pv-text-details__left-panel .text-body-small',
  ]);

  // About section
  const about = extractAboutSection();

  // Experience
  const experience = extractExperience();

  return {
    name,
    headline: headline || '',
    about: about || '',
    experience,
    location: location || '',
  };
}

function extractText(selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element?.textContent) {
      return element.textContent.trim();
    }
  }
  return '';
}

function extractAboutSection(): string {
  // Try to find the about section
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
    // Navigate to the text content within the about section
    const aboutText = aboutSection.closest('section')?.querySelector('.pv-shared-text-with-see-more span[aria-hidden="true"]');
    if (aboutText?.textContent) {
      return aboutText.textContent.trim();
    }

    // Fallback: get any span with substantial text in the about section
    const spans = aboutSection.closest('section')?.querySelectorAll('span');
    if (spans) {
      for (const span of spans) {
        const text = span.textContent?.trim();
        if (text && text.length > 50) {
          return text;
        }
      }
    }
  }

  // Alternative selector for about section
  const aboutDiv = document.querySelector('[data-generated-suggestion-target="urn:li:fsd_profileAbout"]');
  if (aboutDiv?.textContent) {
    return aboutDiv.textContent.trim();
  }

  return '';
}

function extractExperience(): string[] {
  const experience: string[] = [];

  // Find the experience section
  const experienceSection = document.querySelector('#experience');
  if (!experienceSection) {
    return experience;
  }

  const section = experienceSection.closest('section');
  if (!section) {
    return experience;
  }

  // Find all experience items
  const experienceItems = section.querySelectorAll('.artdeco-list__item, li.pvs-list__paged-list-item');

  for (const item of experienceItems) {
    // Try to extract job title and company
    const titleElement = item.querySelector('.t-bold span[aria-hidden="true"], .mr1.t-bold span');
    const companyElement = item.querySelector('.t-14.t-normal span[aria-hidden="true"], .t-14.t-normal .t-black--light span');

    const title = titleElement?.textContent?.trim();
    const company = companyElement?.textContent?.trim();

    if (title && company) {
      experience.push(`${title} at ${company}`);
    } else if (title) {
      experience.push(title);
    }

    // Limit to 5 most recent experiences
    if (experience.length >= 5) {
      break;
    }
  }

  return experience;
}

// Signal that content script is loaded
console.log('Relavo content script loaded');
