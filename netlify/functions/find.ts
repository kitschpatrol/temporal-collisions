import { Handler } from "@netlify/functions";
import { getTemporalCollisions } from "../../src/main";

const handler: Handler = async (event, context) => {
  let response = {};

  try {
    // Netlify Functions timeout after 10 seconds
    const collisions = await getTemporalCollisions(event.queryStringParameters);
    response["status"] = "success";
    response["results"] = collisions;
  } catch (error) {
    response["status"] = "error";
    response["reason"] = error.message;
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "access-control-allow-origin": "https://frontiernerds.com",
      // "access-control-allow-origin": "*",
    },
    body: JSON.stringify(response),
  };
};

export { handler };
