<!-- title -->

# temporal-collisions

<!-- /title -->

<!-- badges ({
  npm: [],
}) -->

[![License: CC-BY-NC-SA-4.0](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-yellow.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
[![CI](https://github.com/kitschpatrol/temporal-collisions/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/temporal-collisions/actions/workflows/ci.yml)

<!-- /badges -->

<!-- description -->

**See photos from identical instants in time.**

<!-- /description -->

## Overview

This is a service which finds recent Flickr photos which were taken at the exact same second. It was created in 2009.

It's implemented in TypeScript, and is exposed through a simple API service deployed to a Cloudflare Worker. The service was ported from its original PHP implementation (saved in `/archive`) in March 2022.

An interactive version is available on [frontiernerds.com](https://frontiernerds.com/temporal-collisions), along with a [blog post](https://frontiernerds.com/something-about-simultaneity).

## Usage

Requests can take an indefinite amount of time given the breadth of the search involved, so the request operates on a best-effort basis according to the `maxSearchTimeSeconds` parameter that's passed. The API clamps `maxSearchTimeSeconds` to 60 seconds.

### Via web API

Request

```sh
curl -s "https://frontiernerds.com/api/temporal-collisions?maxDistanceSeconds=0&maxSearchTimeSeconds=10&minImageWidth=834&minImageHeight=834" | jq
```

Response:

```json
{
  "status": "success",
  "results": {
    "timeRequested": "2024-09-08T15:43:23.000Z",
    "timeMin": "2024-09-03T15:43:23.000Z",
    "timeMax": "2024-09-08T15:43:23.000Z",
    "imagesChecked": 295,
    "collisions": [
      {
        "time": "2024-09-08T22:20:00.000Z",
        "photos": [
          {
            "id": "53980112124",
            "title": "N-2024-09-08-2220_f",
            "imgUrl": "https://live.staticflickr.com/65535/53980112124_ccffafdb49_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/149567335@N07/53980112124"
          },
          {
            "id": "53980112424",
            "title": "N-2024-09-08-2220_f",
            "imgUrl": "https://live.staticflickr.com/65535/53980112424_b711becde9_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/97102756@N07/53980112424"
          },
          {
            "id": "53980228840",
            "title": "N-2024-09-08-2220_f",
            "imgUrl": "https://live.staticflickr.com/65535/53980228840_e58586ffbe_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/185288333@N07/53980228840"
          },
          {
            "id": "53981233084",
            "title": "20240908_2220_0657",
            "imgUrl": "https://live.staticflickr.com/65535/53981233084_cf1fa7f8ae_o.jpg",
            "pageUrl": "https://www.flickr.com/photos/201213898@N02/53981233084"
          }
        ]
      }
    ]
  }
}
```

### As a module

_This package is not published to NPM, so module resolution is up to the user._

```ts
import { inspect } from 'node:util'
import { getTemporalCollisions } from 'temporal-collisions'

const collisions = await getTemporalCollisions({ minImageWidth: 278, minImageHeight: 278 })

console.log(inspect(collisions, true, 10, true))
```

<!-- license -->

## License

[CC-BY-NC-SA-4.0](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->
