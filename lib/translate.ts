import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

/*
 * Auto-translation of admin content (Uzbek → Russian + English) with Claude.
 * Needs ANTHROPIC_API_KEY in the environment; without it translation is skipped
 * and the site keeps falling back to Uzbek for the empty fields.
 */
export type Fields = Record<string, string | string[]>;
export type Translated = { ru: Fields; en: Fields };

export const canTranslate = () => Boolean(process.env.ANTHROPIC_API_KEY);

const SYSTEM = `You translate website copy for ABD Group, a digital product studio in Tashkent (websites, mobile apps, branding, UI/UX, CRM systems), from Uzbek into Russian and English.

The Uzbek is written in the new Latin alphabet: ö = o‘, ğ = g‘, ş = sh, ç = ch, ’ = tutuq belgisi.

- Write natural, concise marketing copy a native speaker would publish, keeping the meaning and tone. Don't add or drop information.
- Keep brand, product, company and people's names, numbers, prices, percentages, URLs and e-mails exactly as they are (Maktab TOP, Redmar, Payme, Click, Telegram, CRM, UI/UX, Next.js…).
- Translate units inside short figures ("3 oy" → "3 месяца" / "3 months", "3.2 daq" → "3.2 мин" / "3.2 min").
- Keep the markers "|" (line break) and "*…*" (highlight) where they are.
- Lists: translate each item, keeping the same number of items in the same order.
- Return every field you were given, in both languages, with the same keys.`;

/** Translates the given Uzbek fields into Russian and English in one request. */
export async function translateFields(fields: Fields, context: string): Promise<Translated> {
  const shape: Record<string, z.ZodType> = {};
  for (const [k, v] of Object.entries(fields)) shape[k] = Array.isArray(v) ? z.array(z.string()) : z.string();
  const lang = z.object(shape);
  const schema = z.object({ ru: lang, en: lang });

  const client = new Anthropic({ timeout: 60_000, maxRetries: 2 });
  const res = await client.beta.messages.parse({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    // if a safety classifier ever declines, the API retries on a fallback model in the same call
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    messages: [{ role: "user", content: `Context: ${context}\n\nUzbek fields (JSON):\n${JSON.stringify(fields, null, 2)}` }],
  });

  if (res.stop_reason === "refusal") throw new Error("translation declined");
  if (res.stop_reason === "max_tokens") throw new Error("translation cut off");
  const out = res.parsed_output;
  if (!out) throw new Error("translation returned no JSON");
  return out as Translated;
}
