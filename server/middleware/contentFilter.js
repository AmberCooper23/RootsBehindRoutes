const {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} = require("obscenity");

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const customBadWords = [
  "voetsek",
  "poes",
  "kak",
  "naai",
  "moer",
  "blerrie",
  "doos",
  "fok",
  "msunu",
  "bliksem",
  "masepa",
  "nya mao",
  "marete",
];

function containsProfanity(obj) {
  if (!obj) return false;

  if (typeof obj === "string") {
    if (matcher.hasMatch(obj)) return true;
    const lowerStr = obj.toLowerCase();
    return customBadWords.some((word) => lowerStr.includes(word));
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => containsProfanity(item));
  }

  if (typeof obj === "object" && obj !== null) {
    return Object.values(obj).some((val) => containsProfanity(val));
  }

  return false;
}

function contentFilter(req, res, next) {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    if (req.body && containsProfanity(req.body)) {
      return res.status(400).send({
        error:
          "Your submission contains inappropriate language. Please revise it and try again.",
      });
    }
  }
  next();
}

module.exports = { contentFilter };
