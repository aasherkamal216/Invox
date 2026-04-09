import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is Invox free to use?",
    a: "Yes, completely free. There's no account required and no usage limits when you self-host it. Just clone the repo, add your OpenAI API key to .env.local, and run it locally. It costs nothing beyond your own API usage.",
  },
  {
    q: "Do I need an account?",
    a: "No account needed for most features. AI features require a quick Google sign-in to prevent abuse — one click, no forms.",
  },
  {
    q: "What can I upload?",
    a: "PDFs, images, and documents — contracts, project briefs, scope of work, anything with project details. The AI reads it and extracts what's relevant.",
  },
  {
    q: "Can I add my own logo and branding?",
    a: "Yes. You can upload a logo, pick from 12 templates, customize the theme color, adjust fonts, and control spacing — all from the settings panel or directly through the AI chat.",
  },
  {
    q: "Can I self-host Invox for my team?",
    a: "Yes. Invox is open source under the MIT license. For public deployments, you can enable optional Clerk auth and Upstash rate limiting via environment variables to protect your API key from abuse. The editor itself remains free and unrestricted regardless.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative w-full bg-white py-24 overflow-hidden">

      {/* Gradient — slightly inside, left-center */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -left-6 w-[520px] h-[520px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(244,63,94,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-6">

        {/* ── Heading ── */}
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl font-semibold text-foreground tracking-tight leading-[1.2]">
            Questions I get
            <br />
            <span className="font-serif italic font-medium text-accent">asked most.</span>
          </h2>
        </div>

        {/* ── FAQ Accordion ── */}
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.q}
              value={faq.q}
              className="border-b border-dashed border-black/10 last:border-b-0"
            >
              <AccordionTrigger className="py-5 text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-black/45 leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}
