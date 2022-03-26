import { jest } from "@jest/globals";
import { getTemporalCollisions } from "../src/main";

describe("get recent collisions", () => {
  jest.setTimeout(60 * 1000);

  it(`got some collisions:`, async () => {
    const result = await getTemporalCollisions({ minImageWidth: 278, minImageHeight: 278 });
    console.log(result);
    expect(result).not.toBe("");
  });
});
