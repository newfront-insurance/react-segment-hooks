import { EventEmitter } from 'events';
import { EventType } from './types';

import {
  SegmentOpts,
  Analytics,
  PageEvent,
  TrackEvent,
  AliasEvent,
  IdentifyEvent,
  GroupEvent,
  Properties,
} from './types';

interface Options {
  apiKey: string;
  debug?: boolean;
  timeout?: number;
  anonymizeIp?: boolean;
}

/**
 * This is the wrapper around the Segment client that allows us to queue events until the library
 * has successfully loaded. If events are tracked before the client has loaded, they will be queued
 * up and triggered once it's ready.
 */
export class SegmentClient {
  private client: Analytics | undefined;

  private options: Options;

  public emitter = new EventEmitter();

  constructor(options: Options) {
    this.options = options;
  }

  /**
   * Set the analytics client. This should only be called once.
   * @param analytics
   */
  initialize(analytics: Analytics): void {
    if (this.client) return;
    const { timeout = 200, debug = false } = this.options;
    this.client = analytics;
    this.client.timeout(timeout);
    this.client.debug(debug);
    this.emitter.emit('initialize');
  }

  /**
   * Track a page view
   * @param name The name of the page
   * @param properties Any properties describing this page
   * @param options Segment options
   * @param callback
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#page
   */
  page(event: PageEvent = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const { name, category, options, properties } = event;
      const { debug } = this.options;
      if (this.client) {
        if (debug) {
          console.log('[Segment] Page', event);
        }
        try {
          this.client.page(
            category,
            name,
            properties,
            {
              ...options,
              context: {
                ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
              },
            },
            () => {
              if (debug) {
                console.log('[Segment] Page succesful', event);
              }
              resolve();
            }
          );
        } catch (error) {
          reject(error);
        }
      } else {
        this.emitter.once('initialize', () => {
          this.page(event).then(() => resolve());
        });
      }
    });
  }

  /**
   * Identify the current user. Whenever this is called, all future track events will
   * be associated with this user.
   * @param userId The uuid of the user
   * @param traits Any extra traits about this person to update in Segment
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#identify
   */
  identify(event: IdentifyEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      const { userId, traits, options } = event;
      const { debug } = this.options;
      if (this.client) {
        if (debug) {
          console.log('[Segment] Identify', event);
        }
        try {
          this.client.identify(
            userId,
            traits,
            {
              ...options,
              context: {
                ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
              },
            },
            () => {
              if (debug) {
                console.log('[Segment] Identify succesful', event);
              }
              resolve();
            }
          );
        } catch (error) {
          reject(error);
        }
      } else {
        this.emitter.once('initialize', () => {
          this.identify(event);
        });
      }
    });
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
  alias(event: AliasEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      const { userId, previousId, options } = event;
      const { debug } = this.options;
      if (this.client) {
        if (debug) {
          console.log('[Segment] Alias', event);
        }
        try {
          this.client.alias(userId, previousId, options, () => {
            if (debug) {
              console.log('[Segment] Alias succesful', event);
            }
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      } else {
        this.emitter.once('initialize', () => {
          this.alias(event);
        });
      }
    });
  }

  /**
   * Track an event representing an action by the user on the page.
   * @param event The name of the event to send to Segment. Make sure you follow the style guide for event names
   * @param properties Properties associated with the event
   * @param options
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#track
   */
  track(track: TrackEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      const { event, properties, options } = track;
      const { debug } = this.options;
      if (this.client) {
        if (debug) {
          console.log('[Segment] Track', track);
        }
        try {
          this.client.track(
            event,
            properties,
            {
              ...options,
              context: {
                ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
              },
            },
            () => {
              if (debug) {
                console.log('[Segment] Track sucessful', track);
              }
              resolve();
            }
          );
        } catch (e) {
          reject(e);
        }
      }
      this.emitter.once('initialize', () => {
        this.track(track);
      });
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
  group(event: GroupEvent): Promise<void> {
    return new Promise((resolve, reject) => {
      const { groupId, options, traits } = event;
      const { debug } = this.options;
      if (this.client) {
        if (debug) {
          console.log('[Segment] Group', event);
        }
        try {
          this.client.group(
            groupId,
            traits,
            {
              ...options,
              context: {
                ip: this.options.anonymizeIp ? '0.0.0.0' : undefined,
              },
            },
            () => {
              if (debug) {
                console.log('[Segment] Group succesful', event);
              }
              resolve();
            }
          );
        } catch (error) {
          reject(error);
        }
      } else {
        this.emitter.once('initialize', () => {
          this.group(event);
        });
      }
    });
  }

  /**
   * The ready method allows you to pass in a callback that is called once all enabled destinations load, and once
   * analytics.js finishes initializing.
   * @param callback
   * @see https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/#ready
   */
  ready(callback?: (analytics: Analytics) => void): Promise<void> {
    return new Promise(resolve => {
      if (this.client) {
        this.client.ready(() => {
          if (callback && this.client) callback(this.client);
          resolve();
        });
      } else {
        this.emitter.once('initialize', () => {
          this.ready(callback);
        });
      }
    });
  }

  /**
   * The global analytics object emits events whenever you call alias, group, identify, track or page.
   * @param method
   * @param callback
   */
  on(
    method: EventType,
    callback: (
      event: string,
      properties?: Properties,
      options?: SegmentOpts
    ) => void
  ): void {
    if (this.client) {
      this.client.on(method, callback);
    } else {
      this.emitter.once('initialize', () => {
        this.on(method, callback);
      });
    }
  }

  /**
   * Set the ID for the anonymous
   * @param id
   */
  setAnonymousId(id: string): Promise<void> {
    return new Promise(resolve => {
      if (this.client) {
        this.client.setAnonymousId(id);
      } else {
        this.emitter.once('initialize', () => {
          this.setAnonymousId(id);
          resolve();
        });
      }
    });
  }
}
