[![Invox Banner](https://github.com/aasherkamal216/Invox/raw/main/public/invox-banner.jpg)](https://github.com/aasherkamal216/Invox)

# Invox

**Upload your contract. Get your invoice.**

Invox is a free, AI-powered invoice tool for freelancers, agencies, and small businesses. Upload a project contract or document, describe your work in plain English, and get a polished, ready-to-send invoice in seconds — no forms, no templates to fill out manually, no account required.

> *"I used to spend 30+ minutes making invoices in Adobe Illustrator. They still looked mediocre. Now I upload my contract, tell the AI my rate, and it's done."*

---

## What Makes It Different

Most invoice tools make you fill out forms. Invox lets you just talk.

Upload a PDF contract and say:
> "I completed this project in 14 hours at $40/hour, due in 15 days."

The AI reads your document, extracts the relevant details, builds the invoice, and streams changes back in real time. You can keep refining it conversationally, tweak it in the settings panel, or click any field to edit inline.

---

## Features

### Upload Documents & Images
Drop in a PDF contract, a project brief, or even a photo of a document. The AI reads it, understands the context, and uses it to build your invoice — no copy-pasting required.

### Natural Language Editing
Describe changes in plain English across multiple turns:
> "Add a 10% early payment discount"
 
> "Change the due date to end of month"

> "Make the template more minimal and switch to blue"

The AI remembers context across messages. No need to repeat yourself.

### 12 Professional Templates
Standard, Modern, Minimal, Classic, Elegant, Bold, Corporate, Creative, Startup, Receipt, Gradient, and Retro. Each template is fully implemented with its own layout, and supports complete color, font, and spacing customization.

### Three Ways to Edit
- **AI Chat** — Describe changes conversationally. The agent handles the rest.
- **Settings Panel** — Tabbed sidebar for branding, typography, financials, and layout.
- **Inline Editing** — Click any field on the invoice to edit it directly.

### PDF Export
One-click export at print-ready resolution (816×1056px). Fonts, colors, and layout are preserved exactly as they appear on screen.

### Signature Support
Add a text signature or draw one by hand using a pressure-sensitive canvas.

### Local-First & Private
All invoice data lives in your browser's localStorage. No account, no server-side storage, no data leaving your machine (except AI requests for processing).


---

## Getting Started

**Prerequisites:** Node.js 18+, an OpenAI API key

```bash
git clone https://github.com/aasherkamal216/Invox.git
cd Invox
npm install
```

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Commands

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Components | Coss UI (Base UI + Tailwind) |
| AI | OpenAI Agents SDK (`@openai/agents`) |
| PDF Export | jsPDF + html-to-image |

The AI agent runs entirely server-side via a Next.js Route Handler. The client sends a message and the current invoice state; the server responds with a Server-Sent Events stream of text deltas and invoice patches.

---

## Known Limitations

- Invoices are stored locally only — no cross-device sync
- No user authentication or multi-user support
- The AI agent cannot upload logos, draw signatures, or customize label strings (these are UI-only actions)

---

## Contributing

Issues and pull requests are welcome. For architectural notes and development conventions, see [CLAUDE.md](./CLAUDE.md).

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes
4. Open a pull request

---

## License

MIT — see [LICENSE](./LICENSE) for details.