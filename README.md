# Simple Proxy Server to Showcase Wasm-Git

See [full tutorial](https://near.social/mob.near/widget/MainPage.N.Post.Page?accountId=petersalomonsen.near&blockHeight=119692776).

## Running the app

### Prerequisites
Docker running, install docker

### Build the Docker Image

Build the Docker image using the Dockerfile you created:

```bash
docker build -t wasm-git-proxy .
```

### Run the Docker Container

Run the Docker container using the built image:

```bash
docker run -d -p 3000:3000 wasm-git-proxy
```

### Open app in browser

Go to http://localhost:3000 to view.
