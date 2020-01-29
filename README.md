# react-segment-hooks

Easily add Segment analytics to your Next app. Access analytics.js using React hooks without needing to manually include
the snippet on the page.

```
yarn add react-segment-hooks
```

First, add the provider:

```ts
import { SegmentProvider } from 'react-segment-hooks';
```

```tsx
<SegmentProvider apiKey="12345">
  <MyComponent />
</SegmentProvider>
```

Then you can access the analytics client using the `useSegment` hook:

```tsx
function MyComponent() {
  const analytics = useSegment();

  useEffect(() => {
    analytics.track({
      event: "MyComponent loaded"
    })
  }, [])
}
```

## Why?

This package is really just a wrapper around the analytics.js snippet. Instead of adding the snippet to the page, the React component will load it for you.

- Built with Typescript
- Supports SSR
- The provider will load the script for you using your write key. No snippet needed.
- Tracking functions return promises. This is useful to fire tracking events before `router.push`

## Usage

When you call `useSegment` you will receive a `SegmentClient`. This is usable before the analytics.js library has finished loading on the page.

```ts
const analytics = useSegment();
```

### `analytics.track(event: TrackEvent) => Promise<void>`

Track an event to Segment. Rather than using multiple parameters this accepts a `TrackEvent` object:

```ts
analytics.track({
  event: "Purchase Card",
  properties: {
    color: "red"
  }
})
```

This makes it easy to create function to wrap your events:

```ts
function purchaseCard(color: 'red' | 'yellow'): TrackEvent {
  return {
    event: "Purchase Card",
    properties: {
      color
    }
  }
}
```

This means you can create your own library of events for your app:


```ts
import { purchaseCard } from 'lib/analytics';

analytics.track(purchaseCard('yellow'));
```

### `analytics.identify(event: IdentifyEvent) => Promise<void>`

This wraps the identify call and accepts an `IdentifyEvent`:

```ts
analytics.identify({
  userId: '12345',
  traits: {
    plan: 'Premium'
  }
})
```

Similar to the track call, this allows you to create a strict interface for your identify calls:

```ts
function identifyUser(user: LoggedInUser): IdentifyEvent {
  return {
    userId: user.uuid,
    traits: {
      firstName: user.name
    }
  }
}
```

```ts
const user = useLoggedInUser();

analytics.identify(identifyUser(user));
```

### `analytics.group(event: GroupEvent) => Promise<void>`

```ts
analytics.group({
  groupId: "Admin",
  traits: {
    location: "US"
  }
})
```

### `analytics.alias(event: AliasEvent) => Promise<void>`

```ts
analytics.alias({
  userId: "12345",
  previousId: "54321"
})
```

### `analytics.ready(callback: (analytics: Analytics) => void) => Promise<void>`

Waits for analytics.js to be ready and passes in the analytics.js library. You can use this to get access to analytics.js directly.

```ts
analytics.ready(client => {
  client.setAnonymousId('blah');
});
```

---

# Developing this package

## Commands

TSDX scaffolds your new library inside `/src`, and also sets up a [Parcel-based](https://parceljs.org) playground for it inside `/example`.

The recommended workflow is to run TSDX in one terminal:

```
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run either example playground or storybook:

### Storybook

Run inside another terminal:

```
yarn storybook
```

This loads the stories from `./stories`.

> NOTE: Stories should reference the components as if using the library, similar to the example playground. This means importing from the root project directory. This has been aliased in the tsconfig and the storybook webpack config as a helper.

### Example

Then run the example inside another:

```
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**, [we use Parcel's aliasing](https://github.com/palmerhq/tsdx/pull/88/files).

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

## Configuration

Code quality is [set up for you](https://github.com/palmerhq/tsdx/pull/45/files) with `prettier`, `husky`, and `lint-staged`. Adjust the respective fields in `package.json` accordingly.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`. This runs the test watcher (Jest) in an interactive mode. By default, runs tests related to files changed since the last commit.

#### Setup Files

This is the folder structure we set up for you:

```
/example
  index.html
  index.tsx       # test your component here in a demo app
  package.json
  tsconfig.json
/src
  index.tsx       # EDIT THIS
/test
  blah.test.tsx   # EDIT THIS
.gitignore
package.json
README.md         # EDIT THIS
tsconfig.json
```

#### React Testing Library

We do not set up `react-testing-library` for you yet, we welcome contributions and documentation on this.

### Rollup

TSDX uses [Rollup v1.x](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

### TypeScript

`tsconfig.json` is set up to interpret `dom` and `esnext` types, as well as `react` for `jsx`. Adjust according to your needs.

## Continuous Integration

### Circle

_to be completed_

## Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

## Module Formats

CJS, ESModules, and UMD module formats are supported.

The appropriate paths are configured in `package.json` and `dist/index.js` accordingly. Please report if any issues are found.
