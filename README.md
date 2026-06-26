# ClaimCheck 🧾

> Not sure if you can claim? Just ask lah.

ClaimCheck is an AI-powered expense claim advisor for Malaysian employees. Describe your situation, paste your company policy, get an instant yes or no — with the exact policy clause and what documents to attach.

Built for **NexHack 2026** · Track 1: Agentic AI for Internal Enterprise Operations

---

## The Problem

Every week, employees ask HR the same questions:

- "Can I claim my Grab ride home after working late?"
- "I tapau lunch for the team, is that claimable?"
- "I bought a mouse for WFH, boleh ke?"

HR answers the same questions repeatedly. Claims get submitted and rejected. The policy PDF exists but nobody reads it — and it doesn't answer situational questions anyway.

**ClaimCheck fixes this before the claim is submitted.**


## How It Works

```
Employee types situation → Pastes company policy → Gemini reasons against policy → Instant ruling
```

1. **Describe your situation** in plain language — no forms, no dropdowns
2. **Paste your expense policy** — copy from your HR portal or employee handbook
3. **Get your answer** — Yes / No / Partial, with the policy clause cited and documents needed

---

## Features

- ✅ Instant claim ruling with clear Yes / No / Partial verdict
- 📋 Exact policy clause cited for every decision
- 📎 List of supporting documents to attach
- 💡 Pro tip for each claim type
- 🇲🇾 Malaysian English friendly — understands "tapau", "Grab", "EPF", "LHDN"

---

## Architecture

```
User Browser
     │
     ▼
React Frontend
     │  (situation + policy text)
     ▼
Node.js Backend
     │
     ▼
Gemini API ──► Structured JSON response
     │          (verdict, clause, documents, tip)
     ▼
React Frontend renders result card
```


## Business Case

| | |
|--|--|
| **Target market** | Malaysian SMEs with 20–500 staff |
| **Market size** | 1.5M+ SMEs in Malaysia |
| **Pricing** | RM 99 / month per company |
| **Time saved** | ~4 hours/week per HR person |
| **Buyer** | HR Manager or Finance Manager |

**Why now:** Affordable payroll and HR tools in Malaysia handle calculations but none interpret policy for edge cases. SAP Concur starts at RM50k/year — completely out of reach for SMEs.

---

## Team

Built solo for NexHack 2026 in under 24 hours.

---

## License

MIT

---

*Built with Google AI Studio · Gemini API · NexHack 2026*
