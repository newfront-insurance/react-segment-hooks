import { SegmentClient, Analytics } from '../src';

function createFakeAnalytics(): Analytics {
  return {
    track: jest.fn(),
    identify: jest.fn(),
    group: jest.fn(),
    alias: jest.fn(),
    debug: jest.fn(),
    page: jest.fn(),
    ready: jest.fn(),
    reset: jest.fn(),
    timeout: jest.fn(),
    setAnonymousId: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
  };
}

describe('SegmentClient', () => {
  it('should create a new client', () => {
    new SegmentClient({
      apiKey: '1',
    });
  });

  it('should call "ready" event when initialized with analyticsjs', () => {
    const readyCallback = jest.fn();
    const analytics = createFakeAnalytics();
    const client = new SegmentClient({
      apiKey: '1',
    });
    client.emitter.on('initialize', readyCallback);
    client.initialize(analytics);
    expect(readyCallback).toHaveBeenCalled();
  });

  it('should queue up events to be fired once initialized', () => {
    const analytics = createFakeAnalytics();
    const client = new SegmentClient({
      apiKey: '1',
    });
    client.track({
      event: 'Test',
    });
    expect(analytics.track).not.toHaveBeenCalled();
    client.initialize(analytics);
    expect(analytics.track).toHaveBeenCalled();
  });

  it('should fire events immediately after it is initialized', () => {
    const analytics = createFakeAnalytics();
    const client = new SegmentClient({
      apiKey: '1',
    });
    client.initialize(analytics);
    client.track({
      event: 'Test',
    });
    expect(analytics.track).toHaveBeenCalled();
  });

  it('should not fire queued events twice if initialized twice', () => {
    const analytics = createFakeAnalytics();
    const client = new SegmentClient({
      apiKey: '1',
    });
    client.track({
      event: 'Test',
    });
    client.initialize(analytics);
    client.initialize(analytics);
    expect(analytics.track).toHaveBeenCalledTimes(1);
  });

  it('should set the timeout and debug options on analytics.js option when initialized', () => {
    const analytics = createFakeAnalytics();
    const client = new SegmentClient({
      apiKey: '1',
      timeout: 500,
      debug: true,
    });
    client.initialize(analytics);
    expect(analytics.timeout).toHaveBeenCalledWith(500);
    expect(analytics.debug).toHaveBeenCalledWith(true);
  });

  describe('.page()', () => {
    it('should queue up page events', () => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      client.page();
      client.initialize(analytics);
      expect(analytics.page).toHaveBeenCalled();
    });

    it('should return a promise for page calls', done => {
      const analytics = createFakeAnalytics();

      // Call the callback immediate for any page calls
      analytics.page = (_category, _name, _properties, _options, callback) => {
        if (callback) callback();
      };

      const client = new SegmentClient({
        apiKey: '1',
      });
      client.page().then(done);
      client.initialize(analytics);
    });

    it('should call page with the correct parameters', done => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      analytics.page = (category, name, properties) => {
        expect(category).toBe('Category');
        expect(name).toBe('Test');
        expect(properties).toEqual({
          test: '1',
        });
        done();
      };
      client.page({
        name: 'Test',
        category: 'Category',
        properties: {
          test: '1',
        },
      });
      client.initialize(analytics);
    });
  });

  describe('.track()', () => {
    it('should queue up track events', () => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      client.track({
        event: 'Test',
      });
      client.initialize(analytics);
      expect(analytics.track).toHaveBeenCalled();
    });

    it('should return a promise for track calls', async done => {
      const analytics = createFakeAnalytics();

      // Call the callback immediate for any page calls
      analytics.track = (_name, _properties, _options, callback) => {
        expect(callback).toBeTruthy();
        if (callback) callback();
      };

      const client = new SegmentClient({
        apiKey: '1',
      });

      client.initialize(analytics);

      await client.track({
        event: 'Test',
      });

      done();
    });

    it('should call track with the correct parameters', done => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      analytics.track = (event, properties) => {
        expect(event).toBe('Test Event');
        expect(properties).toEqual({
          test: '1',
        });
        done();
      };
      client.track({
        event: 'Test Event',
        properties: {
          test: '1',
        },
      });
      client.initialize(analytics);
    });
  });

  describe('.identify()', () => {
    it('should queue up identify events', () => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      client.identify({
        userId: '12345',
      });
      client.initialize(analytics);
      expect(analytics.identify).toHaveBeenCalled();
    });

    it('should return a promise for identify calls', async done => {
      const analytics = createFakeAnalytics();

      // Call the callback immediate for any page calls
      analytics.identify = (_userId, _traits, _options, callback) => {
        expect(callback).toBeTruthy();
        if (callback) callback();
      };

      const client = new SegmentClient({
        apiKey: '1',
      });

      client.initialize(analytics);

      await client.identify({
        userId: '12345',
      });

      done();
    });

    it('should call identify with the correct parameters', done => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      analytics.identify = (userId, traits) => {
        expect(userId).toBe('12345');
        expect(traits).toEqual({
          test: '1',
        });
        done();
      };
      client.identify({
        userId: '12345',
        traits: {
          test: '1',
        },
      });
      client.initialize(analytics);
    });
  });

  describe('.alias()', () => {
    it('should queue up alias events', () => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      client.alias({
        userId: '12345',
        previousId: '54321',
      });
      client.initialize(analytics);
      expect(analytics.alias).toHaveBeenCalled();
    });

    it('should return a promise for alias calls', async done => {
      const analytics = createFakeAnalytics();

      // Call the callback immediate for any page calls
      analytics.alias = (_userId, _previousId, _options, callback) => {
        if (callback) callback();
      };

      const client = new SegmentClient({
        apiKey: '1',
      });

      client.initialize(analytics);

      await client.alias({
        userId: '12345',
        previousId: '54321',
      });

      done();
    });

    it('should call alias with the correct parameters', done => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      analytics.alias = (userId, previousId) => {
        expect(userId).toBe('12345');
        expect(previousId).toBe('54321');
        done();
      };
      client.alias({
        userId: '12345',
        previousId: '54321',
      });
      client.initialize(analytics);
    });
  });

  describe('.group()', () => {
    it('should queue up group events', () => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      client.group({
        groupId: 'Admin',
      });
      client.initialize(analytics);
      expect(analytics.group).toHaveBeenCalled();
    });

    it('should return a promise for group calls', async done => {
      const analytics = createFakeAnalytics();

      // Call the callback immediate for any page calls
      analytics.group = (_name, _traits, _options, callback) => {
        if (callback) callback();
      };

      const client = new SegmentClient({
        apiKey: '1',
      });

      client.initialize(analytics);

      await client.group({
        groupId: 'Admin',
      });

      done();
    });

    it('should call group with the correct parameters', done => {
      const analytics = createFakeAnalytics();
      const client = new SegmentClient({
        apiKey: '1',
      });
      analytics.group = (groupId, traits) => {
        expect(groupId).toBe('Admin');
        expect(traits).toEqual({
          test: '1',
        });
        done();
      };
      client.group({
        groupId: 'Admin',
        traits: {
          test: '1',
        },
      });
      client.initialize(analytics);
    });
  });
});
