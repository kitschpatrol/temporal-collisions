# Temporal Collissions

[![Netlify Status](https://api.netlify.com/api/v1/badges/91ce5ae9-2c2b-4ddd-9672-f08504d64d7c/deploy-status)](https://app.netlify.com/sites/temporal-collisions/deploys)

## Overview

This is a service which finds recent Flickr photos which were taken at the exact same second.

It's implemented in TypeScript + Node.js, and is exposed through a simple API service intended for deployment on Netlify. It could probably be deployed to Cloudflare Workers as well since it does not leverage node-specific APIs. The service was ported from its original PHP implementation (saved in `/Archive`) in March 2022.

It's referenced here: https://frontiernerds.com/something-about-simultaneity
And the API is consumed and visualized here: https://frontiernerds.com/temporal-collisions

## Usage

Note that requests can take an indefinite amount of time given the breadth of the search involved, so the request operates on a best-effort basis according to the `maxSearchTime` (in seconds) parameter that's passed;

### As a Node library

```ts
import { getTemporalCollisions } from "../../src/main";
import util from "util";

const collisions = await getTemporalCollisions({ minImageWidth: 278, minImageHeight: 278 });

console.log(util.inspect(collisions, true, 10, true));
```

### Via web API

Request

```
/api/find?maxSearchTime=5&minWidth=834&minHeight=834
```

Response:

```json
{
  "status": "success",
  "results": {
    "timeRequested": "2022-03-26T12:42:37.000Z",
    "timeMin": "2022-03-21T12:42:37.000Z",
    "timeMax": "2022-03-26T12:42:37.000Z",
    "imagesChecked": 1129,
    "collisions": [
      {
        "time": "2022-03-26T19:31:40.000Z",
        "photos": [
          {
            "id": "51963038879",
            "title": "",
            "imgUrl": "https://live.staticflickr.com/65535/51963038879_6f1b0382da_b.jpg",
            "pageUrl": "https://www.flickr.com/photos/91689596@N04/51963038879"
          },
          {
            "id": "51961868696",
            "title": "L1420829",
            "imgUrl": "https://live.staticflickr.com/65535/51961868696_a8b621fd8c_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/110074903@N02/51961868696"
          },
          {
            "id": "51963467565",
            "title": "ALF-2196",
            "imgUrl": "https://live.staticflickr.com/65535/51963467565_30580b093e_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/146063064@N08/51963467565"
          },
          {
            "id": "51962848278",
            "title": "Gdansk - Royal Route",
            "imgUrl": "https://live.staticflickr.com/65535/51962848278_56c7fc69d9_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/184503435@N04/51962848278"
          },
          {
            "id": "51961200282",
            "title": "IMG_2658",
            "imgUrl": "https://live.staticflickr.com/65535/51961200282_38fee67b8d_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/140700773@N08/51961200282"
          }
        ]
      }
    ]
  }
}
```

## Development

### Setup

```
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
