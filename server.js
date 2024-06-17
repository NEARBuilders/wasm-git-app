import http from "http";
import https from "https";
import { parse } from "url";

const PORT = process.env.PORT || 3000;

const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wasm-Git Showcase</title>
    <script defer src="https://cdn.jsdelivr.net/npm/near-bos-webcomponent@0.0.5/dist/runtime.11b6858f93d8625836ab.bundle.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/near-bos-webcomponent@0.0.5/dist/main.577925102326723ff245.bundle.js"></script>
</head>
<body>
  <h1>Wasm-Git Showcase</h1>
  <near-social-viewer src="efiz.near/widget/Tree"></near-social-viewer>
  <button id="cloneBtn">Clone Repository</button>
  <pre id="output"></pre>
  <script src="/client.js"></script>
</body>
</html>
`;

const clientJs = `
document.getElementById('cloneBtn').addEventListener('click', async () => {
  const lg2 = await import('https://cdn.jsdelivr.net/npm/wasm-git@0.0.13/lg2_async.js').then(r => r.default());

  // Use the proxy server to clone the repository
  const repoUrl = 'http://localhost:3000/github/petersalomonsen/quickjs-wasm-near.git';
  await lg2.callMain(['clone', repoUrl, 'wasmgit']);

  // List the contents of the cloned repository
  const files = lg2.FS.readdir('/wasmgit');
  document.getElementById('output').innerText = files.join('\\n');
});
`;

const requestHandler = (req, res) => {
  const parsedUrl = parse(req.url);

  if (parsedUrl.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexHtml);
  } else if (parsedUrl.pathname === "/client.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(clientJs);
  } else if (parsedUrl.pathname === "/favicon.ico") {
    res.writeHead(204);
    res.end();
  } else if (parsedUrl.pathname.startsWith("/github")) {
    const targetPath = parsedUrl.path.replace("/github", "");
    console.log(`Proxying request to: https://github.com${targetPath}`);

    const proxyOptions = {
      hostname: "github.com",
      port: 443,
      path: targetPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: "github.com",
      },
    };

    const proxyReq = https.request(proxyOptions, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, {
        end: true,
      });
    });

    req.pipe(proxyReq, {
      end: true,
    });

    proxyReq.on("error", (e) => {
      console.error(`Problem with request: ${e.message}`);
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("Internal Server Error");
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
};

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
});
