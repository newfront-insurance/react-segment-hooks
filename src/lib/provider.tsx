import React, { createContext, useMemo, useContext, useEffect } from 'react';
import { SegmentClient } from './client';
import { loadSegmentSnippet } from './load';
import { Analytics } from './types';

declare global {
  interface Window {
    analytics: Analytics;
  }
}

/**
 * This is the context object that useAnalytics will be grabbing the client from.
 * When you're trying to mock analytics calls, you should pass a fake value here.
 */
export const SegmentContext = createContext<SegmentClient | undefined>(
  undefined
);

/**
 * The provider props. The API key is for the Segment source.
 */
interface SegmentProviderProps {
  apiKey: string;
  hostAddress?: string;
  debug?: boolean;
  timeout?: number;
  anonymizeIp?: boolean;
  autoload?: boolean;
  children: React.ReactNode;
}

interface SegmentClientOptions {
  apiKey: string;
  hostAddress?: string;
  debug?: boolean;
  timeout?: number;
  anonymizeIp?: boolean;
  autoload?: boolean;
}

/**
 * Create a Segment client. The client will maintain it's identity while the options are unchanged between renders.
 * @param options
 */
export function useSegmentClient(options: SegmentClientOptions): SegmentClient {
  const { apiKey, hostAddress, debug, timeout, anonymizeIp } = options;

  const client = useMemo(
    () =>
      new SegmentClient({
        apiKey,
        debug,
        timeout,
        anonymizeIp,
      }),
    [apiKey, debug, timeout, anonymizeIp]
  );

  useEffect(() => {
    loadSegmentSnippet({ apiKey, hostAddress, debug }).then(analytics => {
      if (analytics) {
        client.initialize(analytics);
      }
    });
  }, [apiKey, client, debug]);

  return client;
}

/**
 * Load the Segment snippet and add it to the app context. This client will be available before the script
 * has finished loading so that it doesn't block page rendering.
 * @param props SegmentProviderProps
 */
export function SegmentProvider(props: SegmentProviderProps): JSX.Element {
  const { apiKey, hostAddress, children, debug, timeout, anonymizeIp } = props;

  const client = useSegmentClient({
    apiKey,
    hostAddress,
    debug,
    timeout,
    anonymizeIp,
  });

  return (
    <SegmentContext.Provider value={client}>{children}</SegmentContext.Provider>
  );
}

/**
 * Return the Segment client added by <SegmentProvider>. This provider must be added higher up in the React tree to
 * be able to use this hook.
 */
export function useSegment(): SegmentClient {
  const client = useContext(SegmentContext);
  if (!client) {
    throw new Error(
      'The useSegment hook needs <SegmentProvider> to be present higher in the React tree.'
    );
  }
  return client;
}
