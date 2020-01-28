import { EventEmitter } from 'events';

type Properties = Record<string, any>;
type AnalyticsJS = SegmentAnalytics.AnalyticsJS;

declare global {
  interface Window {
    analytics: SegmentAnalytics.AnalyticsJS;
  }
}

interface Options {
  apiKey: string;
  debug?: boolean;
  timeout?: number;
  anonymizeIp?: boolean;
  autoload?: boolean;
}

export interface PageEvent {
  name?: string;
  category?: string;
  properties?: Properties;
  options?: SegmentAnalytics.SegmentOpts;
}

export interface IdentifyEvent {
  userId: string;
  traits?: Properties;
  options?: SegmentAnalytics.SegmentOpts;
}

export interface TrackEvent {
  event: string;
  properties?: Properties;
  options?: SegmentAnalytics.SegmentOpts;
}

export interface AliasEvent {
  userId: string;
  previousId?: string;
  options?: SegmentAnalytics.SegmentOpts;
}

export interface GroupEvent {
  groupId: string;
  traits?: Properties;
  options?: SegmentAnalytics.SegmentOpts;
}

export interface TrackElementEvent {
  elements: Element | Element[];
  event: string;
  properties?: Properties;
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
    let script = document.createElement("script");
    script.type = "text/javascript";
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
export async function loadSegmentSnippet(options: Options): Promise<SegmentAnalytics.AnalyticsJS | undefined> {
  const { apiKey, debug } = options;

  if (typeof window === 'undefined') {
    if (debug) console.log('[Segment] Unable to load analytics.js in a server environment. Skipping.');
    return undefined;
  }

  if (typeof window.analytics !== 'undefined') {
    // eslint-disable-next-line no-console
    if (debug) console.log('[Segment] analytics.js already loaded. Using the existing window.analytics.');
    return window.analytics;
  }

  try {
    if (debug) console.log(`[Segment] Loading analytics.js...`);
    if (debug) console.log(`[Segment] Using write key: ${apiKey}`);
    await loadScript(`https://cdn.segment.com/analytics.js/v1/${apiKey}/analytics.min.js`);
    if (debug) console.log('[Segment] analytics.js is loaded and ready ✅');
  } catch (error) {
    console.warn('[Segment] Failed to load analytics.js. No analytics events will be tracked.');
    return undefined;
  }

  return (window.analytics as unknown) as SegmentAnalytics.AnalyticsJS;
}


/**
 * This is the wrapper around the Segment client that allows us to queue events until the library
 * has successfully loaded. If events are tracked before the client has loaded, they will be queued
 * up and triggered once it's ready.
 */
export class SegmentClient {
  private client: AnalyticsJS | undefined;

  private options: Options;

  private emitter = new EventEmitter();

  constructor(options: Options) {
    this.options = options;

    loadSegmentSnippet(this.options)
      .then((analytics) => {
        if (analytics) {
          this.initialize(analytics);
        }
      })
  }

  /**
   * Set the analytics client. This should only be called once.
   * @param analytics
   */
  initialize(analytics: SegmentAnalytics.AnalyticsJS): void {
    const { timeout = 200, debug = false } = this.options;
    this.client = analytics;
    this.client.timeout(timeout);
    this.client.debug(debug);
    this.emitter.emit('ready');
  }

  /**
   * Track a page view
   * @param name The name of the page
   * @param properties Any properties describing this page
   * @param options Segment options
   * @param callback
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#page
   */
  page(event: PageEvent): void {
    const { name, category, options, properties } = event;
    const { debug } = this.options;
    if (this.client) {
      if (debug) {
        console.log('[Segment] Page', event);
      }
      this.client.page(category, name, properties, {
        ...options,
        context: {
          ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
        },
      }, () => {
        if (debug) {
          console.log('[Segment] Page succesful', event);
        }
      });
    } else {
      this.emitter.once('ready', () => {
        this.page(event);
      });
    }
  }

  /**
   * Identify the current user. Whenever this is called, all future track events will
   * be associated with this user.
   * @param userId The uuid of the user
   * @param traits Any extra traits about this person to update in Segment
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#identify
   */
  identify(event: IdentifyEvent): void {
    const { userId, traits, options } = event;
    const { debug } = this.options;
    if (this.client) {
      if (debug) {
        console.log('[Segment] Identify', event);
      }
      this.client.identify(userId, traits, {
        ...options,
        context: {
          ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
        },
      }, () => {
        if (debug) {
          console.log('[Segment] Identify succesful', event);
        }
      });
    } else {
      this.emitter.once('ready', () => {
        this.identify(event);
      });
    }
  }

  /**
   * The alias method combines two previously unassociated user identities. Aliasing is generally handled automatically
   * when you identify a user. However, some tools require an explicit alias call.
   *
   * This is an advanced method, but it is required to manage user identities successfully in some of our destinations.
   * Most notably, alias is necessary for properly implementing KISSmetrics and Mixpanel.
   *
   * @param userId The uuid of the user
   * @param traits Any extra traits about this person to update in Segment
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#alias
   */
  alias(event: AliasEvent): void {
    const { userId, previousId, options } = event;
    const { debug } = this.options;
    if (this.client) {
      if (debug) {
        console.log('[Segment] Alias', event);
      }
      this.client.alias(userId, previousId, options, () => {
        if (debug) {
          console.log('[Segment] Alias succesful', event);
        }
      });
    } else {
      this.emitter.once('ready', () => {
        this.alias(event);
      });
    }
  }

  /**
   * Track an event representing an action by the user on the page.
   * @param event The name of the event to send to Segment. Make sure you follow the style guide for event names
   * @param properties Properties associated with the event
   * @param options
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#track
   */
  track(track: TrackEvent): void {
    const { event, properties, options } = track;
    const { debug } = this.options;
    if (this.client) {
      if (debug) {
        console.log('[Segment] Track', track);
      }
      this.client.track(event, properties, {
        ...options,
        context: {
          ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
        },
      }, () => {
        if (debug) {
          console.log('[Segment] Track sucessful', track);
        }
      });
    }
    this.emitter.once('ready', () => {
      this.track(track);
    });
  }

  /**
   * Track an event when a link is click. When this is used in the browser it will add a slight delay so that
   * the event has a chance to be sent.
   * @param event
   * @param properties
   * @param options
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#trackLink
   */
  trackLink(track: TrackElementEvent): void {
    const { elements, event, properties } = track;
    if (this.client) {
      this.client.trackLink(elements, event, properties);
    }
    this.emitter.once('ready', () => {
      this.trackLink(track);
    });
  }

  /**
   * Track an event when a form is submitted
   * @param elements one or more DOM elements
   * @param event
   * @param properties
   * @param options
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#trackForm
   */
  trackForm(track: TrackElementEvent): void {
    const { elements, event, properties } = track;
    if (this.client) {
      this.client.trackForm(elements, event, properties);
    }
    this.emitter.once('ready', () => {
      this.trackForm(track);
    });
  }

  /**
   * This will associate the current user with this group
   * @param name The name of the group to associate the current user with
   * @param traits Traits about this group
   * @param options
   * @param callback
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#group
   */
  group(event: GroupEvent): void {
    const { groupId, options, traits } = event;
    const { debug } = this.options;
    if (this.client) {
      if (debug) {
        console.log('[Segment] Group', event);
      }
      this.client.group(groupId, traits, {
        ...options,
        context: {
          ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
        },
      }, () => {
        if (debug) {
          console.log('[Segment] Group succesful', event);
        }
      });
    } else {
      this.emitter.once('ready', () => {
        this.group(event);
      });
    }
  }

  /**
   * The ready method allows you to pass in a callback that is called once all enabled destinations load, and once
   * analytics.js finishes initializing.
   * @param callback
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#ready
   */
  ready(callback: () => void): void {
    if (this.client) {
      this.client.ready(callback);
    } else {
      this.emitter.once('ready', () => {
        this.ready(callback);
      });
    }
  }

  /**
   * The global analytics object emits events whenever you call alias, group, identify, track or page.
   * @param method
   * @param callback
   */
  on(
    method: 'track' | 'alias' | 'group' | 'identify' | 'page',
    callback: (event: string, properties?: Properties, options?: SegmentAnalytics.SegmentOpts) => void,
  ): void {
    if (this.client) {
      this.client.on(method, callback);
    } else {
      this.emitter.once('ready', () => {
        this.on(method, callback);
      });
    }
  }
}
