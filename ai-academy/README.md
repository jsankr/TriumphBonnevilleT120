# AI Adventure Academy

A free, beginner-friendly 12-week AI course with interactive exercises.

## Open the academy
- [AI Academy home](./index.html)
- [Detailed practical workbook](./workbook.html)

**Expected GitHub Pages URL (if Pages is enabled for main/root):**
https://jsankr.github.io/TriumphBonnevilleT120/ai-academy/

## Features
- 12-week learning schedule beginning 30 Nov 2026
- Fixed weekly IST sessions: Monday 19:30–20:30; Wednesday 19:30–21:00; Saturday 10:00–12:00; Sunday 10:00–10:30
- 14 companion lessons with analogies, experiments, and reflection challenges
- Nine practical agent prototypes and workflow recipes
- Searchable glossary, 15 official tool/vendor links, six quiz questions
- In-browser progress tracking, reset and JSON backup
- Responsive, accessible, external-dependency-free static website

## How to publish
In the **TriumphBonnevilleT120** repository, open **Settings → Pages → Build and deployment**.
Select **Deploy from a branch**, branch **main**, folder **/(root)**, then Save.
Once GitHub reports the deployment as complete, open the expected URL and verify both pages.
If Pages is already enabled on main/root, these files should deploy with the existing site.

This course is deliberately isolated in `ai-academy/`; the motorcycle project homepage and other files are not replaced.

## How to learn
Use the weekly dashboard and the full workbook together. Begin with fictional data. Prototype agents in chat or a manual n8n/Make workflow; they do not execute autonomously until connected to a model, trigger and tools.

## Safety
No API keys or proprietary data should be placed in this public static site.
No external scripts, analytics, trackers, payments, or accounts are used.
Progress is stored locally in your current browser only.
Use human approvals for actions involving messages, purchases, account changes, financial operations and deletion.

## Source references
- [OpenAI Academy](https://openai.com/academy/ai-fundamentals/)
- [Anthropic: Building effective agents](https://www.anthropic.com/research/building-effective-agents)
- [n8n official AI tutorial](https://docs.n8n.io/advanced-ai/intro-tutorial/)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/quickstart/)
- [GitHub Pages Quickstart](https://docs.github.com/en/pages/quickstart)
- [OWASP GenAI](https://genai.owasp.org/llm-top-10/)

## Validation
Static checks in the publishing session confirmed HTML structure, balanced section tags, homepage JavaScript syntax, responsive CSS, no third-party JavaScript, safer external link attributes, and existence of both linked site files. **Live GitHub Pages serving and multi-browser UI regression were not verifiable from this environment.** Open the public site after deployment and manually test in mobile Safari and desktop Firefox/Chrome.
