# Temporal Collissions

[![Netlify Status](https://api.netlify.com/api/v1/badges/91ce5ae9-2c2b-4ddd-9672-f08504d64d7c/deploy-status)](https://app.netlify.com/sites/temporal-collisions/deploys)

## Overview

This is a service which finds recent Flickr photos which were taken at the exact same second.

It's implemented in TypeScript + Node.js, and is exposed through a simple API service intended for deployment on Netlify. It could probably be deployed to Cloudflare Workers as well since it does not leverage node-specific APIs. The service was ported from its original PHP implementation (saved in `/Archive`) in March 2022.

It's referenced here: https://frontiernerds.com/something-about-simultaneity
And the API is consumed and visualized here: https://frontiernerds.com/temporal-collisions

## Usage

### As a Node library

```ts
import { getTemporalCollisions } from "../../src/main";

const collisions = await getTemporalCollisions(5);

console.log(collisions);
```

### Via web API

Request

```
/api/find
```

Response:

```json
TK
```

## Development

### Setup

```
npm install netlify-cli -g
npm i
```

### Iteration

```
npm run test:watch
```

### Local Netlify Function testing

```
npm run build:watch-netlify
```
