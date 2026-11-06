/**
 * @jest-environment jsdom
 */
import { act, useEffect, useId, type ReactNode } from 'react';

import AppRegistry from '../AppRegistry';

// The Node build, because the browser build of `react-dom/server` needs globals that jsdom lacks.
// `expo` has no `@types/react-dom`, so the type is local.
const { renderToString } = require('react-dom/server.node') as {
  renderToString: (node: ReactNode) => string;
};

let hydratedId: string | undefined;

function App() {
  const id = useId();
  useEffect(() => {
    hydratedId = id;
  }, [id]);
  return (
    <main>
      <label htmlFor={id}>Name</label>
      <input id={id} />
    </main>
  );
}

beforeEach(() => {
  hydratedId = undefined;
  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
});

it('hydrates the document with the same useId values as the server', async () => {
  // The document shape that `@expo/router-server` renders: `<html>` has `[head, body]`, `<body>`
  // has `[root, tail]`.
  const html = renderToString(
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <style id="expo-reset">{'body{margin:0}'}</style>
      </head>
      <body className="app">
        <div id="root">
          <App />
        </div>
        <>
          <style id="font">{'@font-face{}'}</style>
          <script defer src="/app.js" />
        </>
      </body>
    </html>
  );
  document.documentElement.innerHTML = html.slice(
    html.indexOf('<head>'),
    html.lastIndexOf('</html>')
  );
  const rootTag = document.getElementById('root')!;
  const serverId = rootTag.querySelector('input')!.id;
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  try {
    AppRegistry.registerComponent('main', () => App);
    await act(async () => {
      AppRegistry.runApplication('main', { rootTag, hydrate: true, hydrateDocument: true });
    });
    expect(hydratedId).toBe(serverId);
    expect(consoleError).not.toHaveBeenCalled();
    expect(document.head.querySelector('#expo-reset')).not.toBeNull();
    expect(document.body.querySelector('script[src="/app.js"]')).not.toBeNull();
  } finally {
    consoleError.mockRestore();
  }
});
