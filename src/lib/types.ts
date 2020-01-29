export type Properties = Record<string, any>;

export enum EventType {
  track = 'track',
  alias = 'alias',
  group = 'group',
  identify = 'identify',
  page = 'page',
}

export interface SegmentOpts {
  integrations?: any;
  anonymousId?: string;
  context?: object;
}

export interface Analytics {
  identify(
    userId: string,
    traits?: Properties,
    options?: SegmentOpts,
    callback?: () => void
  ): void;
  track(
    event: string,
    properties?: Properties,
    options?: SegmentOpts,
    callback?: () => void
  ): void;
  page(
    category?: string,
    name?: string,
    properties?: Properties,
    options?: SegmentOpts,
    callback?: () => void
  ): void;
  group(
    groupId: string,
    traits?: Properties,
    options?: SegmentOpts,
    callback?: () => void
  ): void;
  alias(
    userId: string,
    previousId?: string,
    options?: SegmentOpts,
    callback?: () => void
  ): void;
  ready(callback: () => void): void;
  reset(): void;
  debug(state?: boolean): void;
  setAnonymousId(id: string): void;
  timeout(milliseconds: number): void;
  on(
    method: EventType,
    callback: (
      event: string,
      properties?: Properties,
      options?: SegmentOpts
    ) => void
  ): void;
  once(
    method: EventType,
    callback: (
      event: string,
      properties?: Properties,
      options?: SegmentOpts
    ) => void
  ): void;
  off(
    method: EventType,
    callback?: (
      event: string,
      properties?: Properties,
      options?: SegmentOpts
    ) => void
  ): void;
}

export interface PageEvent {
  name?: string;
  category?: string;
  properties?: Properties;
  options?: SegmentOpts;
}

export interface IdentifyEvent {
  userId: string;
  traits?: Properties;
  options?: SegmentOpts;
}

export interface TrackEvent {
  event: string;
  properties?: Properties;
  options?: SegmentOpts;
}

export interface AliasEvent {
  userId: string;
  previousId?: string;
  options?: SegmentOpts;
}

export interface GroupEvent {
  groupId: string;
  traits?: Properties;
  options?: SegmentOpts;
}

export interface TrackElementEvent {
  elements: Element | Element[];
  event: string;
  properties?: Properties;
}
