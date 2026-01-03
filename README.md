<div align="center">
  <h1>Request Mock Interceptor — a browser extension for mocking HTTP requests</h1>
  <p>
    The extension intercepts network requests in the active tab and returns mocked data based on your rules.
    Define a URL (or a substring), HTTP method, status code, and JSON response — then turn interception on.
  </p>
</div>

<hr />

<section id="features">
  <h2>Features</h2>
  <ul>
    <li>Intercept HTTP requests <strong>in the current browser tab</strong></li>
    <li>Rule configuration:
      <ul>
        <li>URL or part of the path (mask)</li>
        <li>Method: GET / POST / PUT / PATCH / DELETE</li>
        <li>Response status code (e.g., 200, 400, 404, 500)</li>
        <li>Response body in JSON format</li>
      </ul>
    </li>
    <li>Global “Intercept” toggle for quick on/off</li>
    <li>Checkbox to activate each rule</li>
    <li>A shared rule list is visible across all tabs, but interception runs only in the selected tab</li>
  </ul>

<strong style="font-size: 24px">This version supports interception of requests sent using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noopener noreferrer">Fetch API</a>.</strong>

</section>

<section id="build">
  <h2>Build</h2>
  <p>Install dependencies and build the project:</p>
  <pre><code class="language-bash">npm i
npm run build
</code></pre>
  <p>After building, you’ll get the <strong>dist</strong> folder with compiled extension files.</p>
</section>

<section id="install">
  <h2>Install in Chrome (unpacked)</h2>
  <ol>
    <li>Open <code>chrome://extensions</code></li>
    <li>Enable “Developer mode”</li>
    <li>Click “Load unpacked” and select the build folder</li>
  </ol>
  <p>
    Detailed instructions from Chrome:
    <a href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked" target="_blank" rel="noopener noreferrer">Load an unpacked extension</a>
  </p>
</section>

<section id="ui">
  <h2>Interface</h2>
  <ul>
    <li><strong>“Intercept” toggle</strong> — turns interception on/off in the current tab.</li>
    <li><strong>“Add rule” form</strong>:
      <ul>
        <li>Field “URL or part of path”</li>
        <li>Dropdown “Method”</li>
        <li>Field “Status code”</li>
        <li>Field “Response” (JSON)</li>
        <li>Buttons “Add” and “Clear”</li>
      </ul>
    </li>
    <li><strong>Buttons</strong> “Select all” and “Deselect all”</li>
    <li><strong>Rule list</strong> — each item includes:
      <ul>
        <li>Checkbox “Activate rule”</li>
        <li>Fields URL, Method, Status code, Response</li>
        <li>Button “Delete”</li>
      </ul>
    </li>
  </ul>
</section>

<section id="examples">
  <h2>Rule examples</h2>

  <h3>Intercept a GET request and return a successful response</h3>
  <pre><code class="language-json">{
  "url": "https://jsonplaceholder.typicode.com/todos/1",
  "method": "GET",
  "status": 200,
  "response": { "ok": "12345" }
}
</code></pre>

  <h3>Intercept by partial path</h3>
  <pre><code class="language-json">{
  "url": "/api/users",
  "method": "GET",
  "status": 200,
  "response": { "users": [] }
}
</code></pre>

  <h3>Server error</h3>
  <pre><code class="language-json">{
  "url": "/api/orders",
  "method": "POST",
  "status": 500,
  "response": { "error": "Internal error" }
}
</code></pre>
</section>

<section id="how-to">
  <h2>How to start intercepting</h2>
  <ol>
    <li>Add a rule via the form:
      <ul>
        <li>Provide a full URL or a substring</li>
        <li>Select the method</li>
        <li>Set the status code</li>
        <li>Paste valid JSON into the <code>Response</code> field</li>
      </ul>
    </li>
    <li>Click “Add”</li>
    <li>In the rule list, check “Activate rule”</li>
    <li>Turn on the “Intercept” toggle</li>
  </ol>
  <p><strong>Important:</strong> interception applies only to the active tab where the toggle is enabled. The rule list is shared, but only the rules with the checkbox enabled are applied. The response must be valid JSON (for example, <code>{"ok": true}</code>).</p>
</section>

<section id="tips">
  <h2>Tips</h2>
  <ul>
    <li><strong>URL matching:</strong> a partial path matches when the substring is contained in the request URL; use a full URL for exact matching.</li>
    <li><strong>Content-Type:</strong> responses are JSON — ensure valid syntax.</li>
    <li><strong>Rule order and uniqueness:</strong> if multiple rules match the same request, the first match is used — keep rules unique.</li>
  </ul>
</section>

<section id="troubleshooting">
  <h2>Troubleshooting</h2>
  <ul>
    <li><strong>Interception doesn’t work:</strong>
      <ul>
        <li>Verify the “Intercept” toggle is on in the current tab.</li>
        <li>Ensure the rule is activated via the checkbox.</li>
        <li>Check the method and URL mask.</li>
        <li>Reload the page after adding or editing rules.</li>
      </ul>
    </li>
    <li><strong>JSON parse error:</strong> check quotes, commas, and the correctness of the object/array in the <code>Response</code> field.</li>
  </ul>
</section>
