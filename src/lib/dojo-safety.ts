const DOJO_UNSAFE_PATTERNS: RegExp[] = [
  /\b(how to (punch|kick|strike|elbow|knee|hit|hurt|injure|knock ?out|choke|strangle|break (?:an? )?(?:arm|wrist|bone|neck|leg)|attack|fight someone|beat someone|bully|intimidate|get revenge|retaliate))\b/i,
  /\b(rear naked choke|guillotine choke|armbar|kimura|heel hook|neck crank|pressure point(?:s)? to hurt|street fight(?:ing)?|self[- ]defense weapon|knife fighting|stick fighting|brass knuckles)\b/i,
  /\b(weight ?cut(?:ting)?|dehydrat(?:e|ion) before weigh|extreme diet|concussion diagnosis|diagnose (?:my )?injury|treat (?:my )?fracture)\b/i,
  /(كيف (أضرب|أركل|أخنق|أكسر|أؤذي|أهاجم|أنتقم|أتشاجر)|قتال الشوارع|قفل مفاصل|تخفيف الوزن السريع|تشخيص إصابة)/i,
];

const ARABIC_CHAR_RE = /[\u0600-\u06FF]/;

export function detectUnsafeDojoRequest(
  text: string,
  lang?: string,
): { unsafe: boolean; refusalText: string } {
  const clean = text.trim();
  const isUnsafe = DOJO_UNSAFE_PATTERNS.some((re) => re.test(clean));
  if (!isUnsafe) {
    return { unsafe: false, refusalText: "" };
  }
  const isAr = lang === "ar" || ARABIC_CHAR_RE.test(clean);
  const refusalText = isAr
    ? "لا يقدّم موجّه الدوجو أي تعليمات للهجوم أو الضرب أو الإخضاع أو القتال بالأسلحة أو الانتقام أو إنقاص الوزن الخطير أو التشخيص الطبي.\n\n**إعادة توجيه آمنة:** القوة في فنون القتال للخير مسؤولية لحماية النفس والآخرين عبر الحكمة وتهدئة التوتر (De-escalation)، والابتعاد عن الخطر، وطلب المساعدة من شخص بالغ موثوق أو مدرب معتمد أو خدمات الطوارئ. للتعلّم البدني السليم، تدرّب فقط في نادٍ مرخص تحت إشراف مدرب مؤهل ومع طبيب عند أي إصابة."
    : "Dojo Mentor AI does not teach striking, grappling submissions, joint locks, weapon fighting, retaliation, extreme weight-cutting, or medical injury diagnosis.\n\n**Safe Redirection:** True martial arts strength is responsibility and wisdom—focus on situational awareness, calm de-escalation, keeping safe distance, and involving a trusted adult, certified instructor, or emergency services when unsafe situations arise. For any physical technique or injury concern, learn strictly in person under a qualified, certified coach or licensed medical professional.";
  return { unsafe: true, refusalText };
}
