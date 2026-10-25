import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shapeHome } from "./shape";

/**
 * The closing scene's photograph is chosen by the editor on the Home document ("Closing scene —
 * photograph"). It goes through the same rights gate as every other photograph: one whose usage rights
 * are not confirmed never reaches the page.
 */
const picture = (rights?: string) => ({
  rightsStatus: rights,
  alt: "A stone-fronted house at sunset",
  asset: { _id: "local:/photos/homes/example.jpg", metadata: { dimensions: { width: 1350, height: 900 } } },
});

describe("home: the closing scene photograph", () => {
  it("is passed through when its rights allow publication", () => {
    const home = shapeHome({ ctaImage: picture("owner_directed") });
    assert.equal(home.ctaImage?.src, "/photos/homes/example.jpg");
    assert.deepEqual([home.ctaImage?.width, home.ctaImage?.height], [1350, 900]);
  });

  it("is withheld when its rights are not confirmed", () => {
    assert.equal(shapeHome({ ctaImage: picture("pending") }).ctaImage, undefined);
    assert.equal(shapeHome({ ctaImage: picture(undefined) }).ctaImage, undefined);
  });

  it("is simply absent when the editor chose none", () => {
    assert.equal(shapeHome({}).ctaImage, undefined);
    assert.equal(shapeHome(null).ctaImage, undefined);
    assert.equal(shapeHome({ ctaImage: { alt: "no file uploaded" } }).ctaImage, undefined);
  });
});
