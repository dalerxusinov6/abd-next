/*
 * Converts Uzbek text from the old Latin spelling to the new alphabet:
 *   o' → ō, g' → ğ, sh → ş, ch → ç, other apostrophes (tutuq belgisi) → ’
 * Used on the Uzbek fields of admin forms, so text typed either way ends up the same.
 * Text already in the new alphabet passes through unchanged.
 */
const APOS = "'‘’ʻʼ`";
const LETTER = "A-Za-zÀ-ž";

/** Brand / English words whose "sh" or "ch" must stay. */
const KEEP = new Set(["dashboard", "fintech", "logitech", "push", "tech", "touch", "search", "match", "fresh", "flash", "splash", "cash", "branch", "launch", "pitch", "chat", "chatbot", "check", "checkout", "shop", "shopify", "share", "sharing"]);

/**
 * Words that look English rather than Uzbek: Uzbek has no "w", "th", "ph",
 * "ck", no "c" outside "ch", no "ee"/"oo" and no "-tion" ending.
 * ("-ing" is not a sign: the Uzbek genitive ends in "-ning".)
 */
const looksEnglish = (w: string) => /w|th|ph|ck|c(?!h)|tion$|ee|oo/i.test(w);

function word(w: string): string {
  let out = w
    .replace(new RegExp(`O[${APOS}]`, "g"), "Ō")
    .replace(new RegExp(`o[${APOS}]`, "g"), "ō")
    .replace(new RegExp(`G[${APOS}]`, "g"), "Ğ")
    .replace(new RegExp(`g[${APOS}]`, "g"), "ğ");
  const bare = out.replace(new RegExp(`[${APOS}]`, "g"), "").toLowerCase();
  if (!KEEP.has(bare) && !looksEnglish(bare)) {
    out = out.replace(/SH|Sh/g, "Ş").replace(/sh/g, "ş").replace(/CH|Ch/g, "Ç").replace(/ch/g, "ç");
  }
  // an apostrophe between two letters is the tutuq belgisi (ta’m, e’tibor)
  return out.replace(new RegExp(`(?<=[${LETTER}])[${APOS}](?=[${LETTER}])`, "g"), "’");
}

export function toNewLatin(text: string): string {
  // leave links and e-mail addresses alone
  return text.replace(new RegExp(`https?://\\S+|\\S+@\\S+|[${LETTER}${APOS}]+`, "g"), (m) => (/^https?:|@/.test(m) ? m : word(m)));
}
