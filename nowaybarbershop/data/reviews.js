/* NO WAY BARBERSHOP — customer reviews.

   ⚠ INTENTIONALLY EMPTY. This is not an oversight.

   The shop has a public Booksy rating, but it is unverified for this site and
   it moves over time. Publishing a hardcoded star rating would go stale and
   misrepresent the business, and inventing testimonials is out of the question.

   So: the review component is fully built and the section simply does not
   render while this list is empty. No aggregateRating is emitted in the
   structured data either — Google penalises self-declared ratings that aren't
   backed by real, visible reviews.

   TO ENABLE: add entries below with approved:true, and flip REVIEWS_APPROVED
   in data/business.js. Only use reviews Jose has approved, quoted accurately,
   with the reviewer's display name as they left it. */
(function (root, factory) {
  var value = factory();
  if (typeof module === "object" && module.exports) module.exports = value;
  else { root.NW = root.NW || {}; root.NW.REVIEWS = value; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Shape, for whoever fills this in:
     {
       reviewText: "…",            // verbatim, never paraphrased
       reviewerDisplayName: "…",   // as the reviewer left it
       source: "booksy" | "google" | "direct",
       rating: 5,                  // 1-5, or null if the source has no rating
       sourceUrl: "https://…",     // link to the original, if public
       approved: true              // Jose approved showing it here
     }
  */
  var REVIEWS = [];

  function approved() {
    return REVIEWS.filter(function (r) { return r.approved && r.reviewText; });
  }

  return { REVIEWS: REVIEWS, approved: approved };
});
