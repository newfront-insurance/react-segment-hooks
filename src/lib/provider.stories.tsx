import React from 'react';
import { SegmentProvider, useSegment } from './provider';

export default {
  title: 'SegmentProvider',
};

function MyComponent() {
  const analytics = useSegment();

  function trackEvent() {
    analytics.track({
      event: 'Test Event'
    });
  }

  function pageEvent() {
    analytics.page({
      name: 'Fake page'
    });
  }

  function identifyEvent() {
    analytics.identify({
      userId: '12345',
      traits: {
        email: 'fake@example.com'
      },
    });
  }

  function groupEvent() {
    analytics.group({
      groupId: 'Fake Group'
    });
  }

  function aliasEvent() {
    analytics.alias({
      userId: '12345',
      previousId: '54321'
    });
  }

  return (
    <div>
      <button onClick={trackEvent}>Track event</button>
      <button onClick={pageEvent}>Page event</button>
      <button onClick={identifyEvent}>Identify event</button>
      <button onClick={groupEvent}>Group event</button>
      <button onClick={aliasEvent}>Alias event</button>
    </div>
  );
}

export const WithDebug = () => (
  <SegmentProvider apiKey="1oCyaafUaekERJgYCd3J2uJjhBDLHWNj" debug>
    <MyComponent />
  </SegmentProvider>
);

WithDebug.story = {
  name: 'With debug',
};


export const NoDebug = () => (
  <SegmentProvider apiKey="1oCyaafUaekERJgYCd3J2uJjhBDLHWNj">
    <MyComponent />
  </SegmentProvider>
);

NoDebug.story = {
  name: 'No debug',
};

