import { Analytics } from './types';

interface Options {
  apiKey: string;
  debug?: boolean;
}

/**
 * Load a script into the DOM
 * @param src
 */
async function loadScript(src: string): Promise<void> {
  if (typeof document === 'undefined') {
    throw new Error('Unable to load script in a server environment');
  }
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * This loads the Segment analytics.js snippet onto the page using the API key. This
 * API key maps to the "source" in Segment. This API key will be different depending on the environment.
 * @param apiKey Segment API key
 */
export async function loadSegmentSnippet(
  options: Options
): Promise<Analytics | undefined> {
  const { apiKey, debug = false } = options;

  if (typeof window === 'undefined') {
    if (debug)
      console.log(
        '[Segment] Unable to load analytics.js in a server environment. Skipping.'
      );
    return undefined;
  }

  if (typeof window.analytics !== 'undefined') {
    // eslint-disable-next-line no-console
    if (debug)
      console.log(
        '[Segment] analytics.js already loaded. Using the existing window.analytics.'
      );
    return window.analytics;
  }

  try {
    if (debug) console.log(`[Segment] Loading analytics.js...`);
    if (debug) console.log(`[Segment] Using write key: ${apiKey}`);
    await loadScript(
      `https://cdn.segment.com/analytics.js/v1/${apiKey}/analytics.min.js`
    );
    if (debug) console.log('[Segment] analytics.js is loaded and ready ✅');
  } catch (error) {
    console.warn(
      '[Segment] Failed to load analytics.js. No analytics events will be tracked.'
    );
    return undefined;
  }

  return (window.analytics as unknown) as Analytics;
}
