export interface WriteupSection {
  heading: string
  paragraphs: string[]
  bullets?: { text: string; href?: string }[]
}

export const projectWriteups: Record<string, WriteupSection[]> = {
  apature: [
    {
      heading: 'Overview',
      paragraphs: [
        'Apature is my design tooling startup. It builds automated design review for rendered UI, split across six public MIT repositories that connect through shared wire contracts. I wrote nearly every commit and published five of the packages to npm under @apatureai.',
      ],
    },
    {
      heading: 'Verdict',
      paragraphs: [
        "The core product. One command measures a running page in headless Chromium (WCAG contrast, overflow, touch target size) with no API key. Add a vision model and it critiques the screenshots against the repo's own design system, then deletes every finding it cannot point at a captured element.",
      ],
      bullets: [
        { text: 'apatureai/verdict', href: 'https://github.com/apatureai/verdict' },
        { text: 'npm: @apatureai/verdict-types', href: 'https://www.npmjs.com/package/@apatureai/verdict-types' },
      ],
    },
    {
      heading: 'Gate',
      paragraphs: [
        "A GitHub Action and GitHub App that run a pull request's preview build in a hardened sandbox, send the preview URL to a critique service, and post the review as one sticky comment plus a Check Run. It never requests write access to code and never shows a passing review for a page nothing judged.",
      ],
      bullets: [
        { text: 'apatureai/gate', href: 'https://github.com/apatureai/gate' },
        { text: 'GitHub Marketplace: Apature Gate', href: 'https://github.com/marketplace/actions/apature-gate' },
      ],
    },
    {
      heading: 'Sigil',
      paragraphs: [
        'Error bars for LLM-as-judge evals, in dependency-free TypeScript. Given judge verdicts and human labels, it reports calibration, finite-sample risk certificates, and Pass^k reliability, and only recommends a cheaper model when the evidence supports it. Every report is byte reproducible.',
      ],
      bullets: [
        { text: 'apatureai/sigil', href: 'https://github.com/apatureai/sigil' },
        { text: 'npm: @apatureai/sigil', href: 'https://www.npmjs.com/package/@apatureai/sigil' },
      ],
    },
    {
      heading: 'Bastion',
      paragraphs: [
        'A remote MCP server that gives a coding agent eyes on the UI it just changed: submit a preview URL, get findings with element references and suggested fixes, then ask for a recheck. It doubles as a reference for OAuth 2.1, SSRF-safe URL handling, and long-running jobs over MCP, and is listed in awesome-mcp-servers.',
      ],
      bullets: [
        { text: 'apatureai/bastion', href: 'https://github.com/apatureai/bastion' },
        { text: 'npm: @apatureai/bastion', href: 'https://www.npmjs.com/package/@apatureai/bastion' },
      ],
    },
    {
      heading: 'Lattice',
      paragraphs: [
        'A deterministic scene graph for browser agents. It fuses DOM, accessibility, computed style, and text capture into one content-addressed snapshot, keeps both claims when sources disagree, and renders small token-budgeted views for a prompt.',
      ],
      bullets: [
        { text: 'apatureai/lattice', href: 'https://github.com/apatureai/lattice' },
        { text: 'npm: @apatureai/lattice', href: 'https://www.npmjs.com/package/@apatureai/lattice' },
      ],
    },
    {
      heading: 'Canon',
      paragraphs: [
        'A strict DTCG 2025.10 design token resolver and project scanner for CSS custom properties, Tailwind, and token files. Broken or circular tokens are reported as diagnostics instead of guessed, and a 20-repo conformance corpus measures how much published token data passes the strict profile.',
      ],
      bullets: [
        { text: 'apatureai/canon', href: 'https://github.com/apatureai/canon' },
        { text: 'npm: @apatureai/canon', href: 'https://www.npmjs.com/package/@apatureai/canon' },
      ],
    },
  ],

  macroplace: [
    {
      heading: 'Overview',
      paragraphs: [
        'My solo entry for the Partcl x HRT Macro Placement Challenge 2026. Macro placement decides where the large blocks on a chip go, and every decision affects wirelength, congestion, and timing.',
      ],
    },
    {
      heading: 'What I built',
      paragraphs: [
        'A hybrid placer in Python and PyTorch. It converts the netlist hypergraph into a star-expanded bipartite graph, uses a graph neural network for a fast initial placement, and then hands off to physics-style optimization that a GNN alone does not do well.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: ['The pipeline runs in four stages:'],
      bullets: [
        { text: 'A GNN embeds the netlist graph and produces an initial macro placement, with several restarts.' },
        { text: 'ePlace style density optimization spreads macros using an FFT solved electrostatic field.' },
        { text: 'Density equalization and congestion aware coordinate descent refine the layout.' },
        { text: 'A legalization pass removes any remaining overlap before final refinement.' },
      ],
    },
    {
      heading: 'Results',
      paragraphs: [
        'Evaluated on all 17 IBM benchmarks with zero overlapping macros. The code is split into graph construction, the GNN, the electrostatic optimizer, proxy cost and density losses, and legalization, and each benchmark runs through the challenge evaluator.',
      ],
    },
  ],

  hexmend: [
    {
      heading: 'Overview',
      paragraphs: [
        'Hexmend is an agent evaluation environment disguised as a graph native spell game, built solo for The WebMCP Challenge. A person and a browser agent share one executable spell graph: the person decides what must survive, and the agent finds the smallest repair that respects it.',
        'In the opening lesson, a rain spell floods the observatory with twelve lunar ducks. The player marks the ducks as sacred, so the agent gives them umbrellas instead of deleting them.',
      ],
    },
    {
      heading: 'What I built',
      paragraphs: [
        'Seven narrow WebMCP tools that inspect the graph, trace an effect, simulate, explain the responsible subgraph, record a human constraint, rank repairs, and apply a patch atomically. The browser app validates every mutation, rejects stale patches, and shows each tool call on screen.',
      ],
    },
    {
      heading: 'How it is scored',
      paragraphs: [
        'A visible 23 point rubric rewards gathering evidence, proving cause, capturing the constraint, and verifying the fix, and penalizes invalid calls and premature writes. 96 deterministic tasks across three causal families remap IDs, layout, and wording and add decoy edges, so memorizing one graph does not work.',
      ],
    },
    {
      heading: 'Results',
      paragraphs: [
        'A transparent reference policy scores 23/23 on held-out tasks, while scripted contrast policies score 18 when they mutate before explaining and -8 when they reuse memorized IDs. These controls show the reward separates good and bad behavior; they are not trained model results.',
      ],
    },
  ],

  tauron: [
    {
      heading: 'Overview',
      paragraphs: [
        'Tauron is an early warning system for dairy herd disease, built with a team of 6 at the Cornell Digital Ag Hackathon (February 27 to March 1, 2026). It predicts mastitis, bovine respiratory disease, and lameness risk 48 hours ahead and turns each prediction into a plain English alert.',
      ],
    },
    {
      heading: 'My role',
      paragraphs: [
        'I wrote 64% of the commits. I built the ML pipeline, trained the model, integrated an external cattle disease dataset, and added symptom perturbation to the synthetic data, which moved AUROC from 0.50 to 0.995. I also built frontend pieces like CSV upload and prediction history, documented the explainability method, and made the brief and slides.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        "A GRU encodes a 7 day window of 9 sensor features per cow, two GraphSAGE layers pass information over the pen and bunk contact graph, and a sigmoid head outputs a risk for each disease. Explanations come from a single backward pass instead of GNNExplainer: about 5 ms per cow instead of about 200 ms, a 40x speedup, with matching top feature rankings on our data.",
        'The top features go to Mistral 7B running locally through Ollama, with Claude and template fallbacks, to write the alert.',
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'Runs on a synthetic 60 cow herd with a FastAPI backend and a React and D3 herd map.',
      ],
    },
  ],

  helicity: [
    {
      heading: 'Overview',
      paragraphs: [
        'Helicity scores liquidity stress for stablecoin reserves. It was built with a team of 6 in the Programmable Capital track at the Cornell AI Hackathon 2026.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'A NetworkX knowledge graph links stablecoins, banks, and jurisdictions. Composite risk combines reserve duration, FDIC Call Report data, and weather tail events, and a multi-model LLM jury using Claude and Gemini writes consensus causal narratives. Every score snapshot is pinned to IPFS, and a FastAPI backend plus a five tool MCP server expose scores to the React dashboard and to AI agents.',
      ],
    },
    {
      heading: 'My role',
      paragraphs: [
        'I wrote 57% of the commits, across the backend, dashboard, and pitch.',
      ],
      bullets: [
        { text: 'IPFS pinning through Pinata, plus a trust badge that verifies it' },
        { text: 'A Hurricane Ian backtest service and timeline pages with a scrubber and per dimension breakdown' },
        { text: 'A mock Chainlink oracle endpoint shown in the trust badge' },
        { text: 'Connecting the backend framework to real data APIs and work on the stress score' },
        { text: 'The full dashboard UI overhaul, landing page, and the React slides app' },
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'The dashboard and slides are live, and the repo includes one command setup for running the backend, MCP server, and frontend locally.',
      ],
    },
  ],

  zam: [
    {
      heading: 'Overview',
      paragraphs: [
        'ZAM is a market sizing tool for founders. A four step wizard collects product, target market, go to market, and competitive context, then produces TAM, SAM, and SOM scenarios with an AI written analysis. I built it solo, all 108 commits.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'Sizing is top down: TAM is potential customers times average contract value, SAM narrows it by geography, segment, and reach, and SOM applies a realistic share target. Assumptions can be adjusted with instant recalculation, and analyses are saved to a portfolio backed by MongoDB.',
      ],
    },
    {
      heading: 'AI analysis',
      paragraphs: [
        'The report is grounded with retrieval. An in-process BM25 index over industry benchmarks, comparable companies, and the sizing methodology feeds the prompt, and Groq runs Llama 3.3 70B with a smaller Llama model as fallback. In June 2026 I replaced Gemini embeddings with BM25 and moved generation from Gemini to Groq.',
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'Live on Vercel, with a React and Vite frontend, an Express API, and per IP rate limiting on saved analyses.',
      ],
    },
  ],

  spectre: [
    {
      heading: 'Overview',
      paragraphs: [
        'Spectre is a real-time 1v1 boxing game: each player throws punches at a phone camera and watches their silhouette fight in a live browser overlay. It was built with a team of 4 at the Cornell Claude Builders Club Hackathon in spring 2026.',
      ],
    },
    {
      heading: 'What the team built',
      paragraphs: [
        "My teammates built the parts that turn movement into gameplay: MediaPipe pose estimation in each phone's browser, the Python game server that runs hit detection, damage, and rounds at 60 Hz, and an AI commentator using the Claude API and ElevenLabs.",
      ],
    },
    {
      heading: 'My role',
      paragraphs: [
        'I built the spectator overlay, the screen everyone watches. It is a React, TypeScript, and PixiJS v8 app that connects to the game server over WebSocket with auto-reconnect, projects pose keypoints into on-screen skeletons with interpolation between server ticks, and draws silhouettes, hit sparks, HP bars, a round timer, round and match cards, and sound effects.',
        'I also wrote a mock server that simulates the 60 Hz game state, damage, latency, and a three round match, so the overlay could be developed and tested on its own.',
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'The demo video shows a full match. Teammates have since rewritten the codebase in Rust, so the current repo differs from the hackathon build.',
      ],
    },
  ],

  palate: [
    {
      heading: 'Overview',
      paragraphs: [
        'Palate builds a taste profile from things a person already did (reservations, cancellations, calendar entries, and saved lists) and turns it into a trip where every stop cites a reason from that history. It was built with a team of 3 at the Corgi × Merge × Photon overnight hackathon in July 2026.',
      ],
    },
    {
      heading: 'My role',
      paragraphs: [
        'I wrote 21 of the 26 commits. I wrote the PRD and the technical design with frozen contracts, scaffolded four modules (ingest, profile, chat, and planning) so each person could work on a separate branch, built the profile module, and ran the integration merges into the final build. Teammates finished the Gmail and Calendar ingest and built the iMessage webhook, bridge, and itinerary flow.',
      ],
    },
    {
      heading: 'How the profile works',
      paragraphs: [
        'Every number in the profile is plain SQL over a table of visits, with no model involved, and each headline number carries evidence with the row counts behind it. Metrics include peak dining hour, preferred days, typical party size, price ceiling, revisit ratio, and aversions revealed by cancellations. The model only writes prose around those numbers, and a check guards that the prose matches them.',
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'There is no hosted demo. The repo includes a seeded demo that runs without credentials, an integration test suite, and a static submission page with a demo video.',
      ],
    },
  ],

  paramgolf: [
    {
      heading: 'Overview',
      paragraphs: [
        "OpenAI's Parameter Golf challenge asks for the best small language model whose submission fits in 16 MB. I reproduced Kevin Clark's accepted SP4096 record on a small compute budget and tested one change on top of it.",
      ],
    },
    {
      heading: 'What I did',
      paragraphs: [
        'I ran the record training script on a single H100 with a 60 minute cap and 86 train shards, instead of the official 10 minutes on 8 H100s. I added an artifact fit guard: if the compressed quantized model lands slightly over the 16,000,000 byte cap, it repeatedly coarsens a selected low impact tensor until it fits, which moved the score by only about 0.00012 in the best run.',
      ],
    },
    {
      heading: 'Results',
      paragraphs: [
        'The baseline reproduction reached 1.11043 validation bits per byte with sliding window evaluation. Setting QK_GAIN_INIT=4.5 improved that to 1.10743, with a total artifact of 15,987,195 bytes.',
        'This is a single seed, non-record reproduction, not a new leaderboard result. The record folder and its pull request to the challenge repo are public, and the pull request is still open.',
      ],
    },
  ],

  galatea: [
    {
      heading: 'Overview',
      paragraphs: [
        'Galatea is an on-chain risk co-pilot I prototyped for the Palantir FDSE technical challenge. It is designed for risk analysts at stablecoin issuers and exchanges who need to triage flagged wallet addresses and record why they made each decision.',
      ],
    },
    {
      heading: 'What I built',
      paragraphs: [
        "I wrote the product requirements doc and a UI design spec modeled on Palantir's Blueprint and Gotham layouts. Then I built the prototype: Python scripts that generate and clean synthetic data, score risk on a transaction graph, and seed a case log, plus a static web app with Command Center, Address Explorer, and Case Management screens.",
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'The synthetic dataset has 8,000 transactions across 1,200 addresses with embedded mixer, aggregator, and rapid cycling patterns. NetworkX builds a directed, weighted graph and scores each address from normalized betweenness centrality and log scaled degree, with plain language explanations for each risk driver. The scoring script documents where it departs from the PRD, such as leaving clustering out of the score because it was near zero across this sparse graph.',
      ],
    },
    {
      heading: 'Status',
      paragraphs: [
        'A prototype on synthetic data only, with no live demo. The PRD lays out the production version on Foundry pipelines, Workshop, and AIP agents.',
      ],
    },
  ],

  'off-data-quality': [
    {
      heading: 'Overview',
      paragraphs: [
        'A prototype for my Google Summer of Code 2026 proposal to Open Food Facts. It ports data quality checks from the ProductOpener Perl codebase into tested Python backed by DuckDB.',
      ],
    },
    {
      heading: 'What I built',
      paragraphs: [
        'I migrated five checks from DataQuality.pm and DataQualityFood.pm, keeping the original thresholds, tolerances, and tag names:',
      ],
      bullets: [
        { text: 'Completeness: products missing required fields' },
        { text: 'Quantity: product and serving quantity ranges' },
        { text: 'Nutrition ranges: impossible values, such as more than 105 g per 100 g or negatives' },
        { text: 'Nutrition composition: relationships like saturated fat not exceeding total fat' },
        { text: 'Ingredient text quality: OCR artifacts, unexpected characters, and unknown ingredients' },
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'Checks register through decorators and run from a small orchestrator over a DuckDB data layer, with a CLI that runs every check or just one. A parity test suite loads real products from the Open Food Facts API and compares the Python output against the Perl generated quality tags stored on each product.',
      ],
    },
    {
      heading: 'Related contribution',
      paragraphs: [
        'I also opened a Robotoff pull request that adds an OCR regex to tell the new Nutri-Score apart by detecting "Nouveau calcul" text in 11 languages, with 15 new test cases.',
      ],
      bullets: [
        {
          text: 'feat: add OCR regex to detect Nutri-Score v2 through Nouveau calcul text (open)',
          href: 'https://github.com/openfoodfacts/robotoff/pull/1878',
        },
      ],
    },
  ],

  'graph-attention': [
    {
      heading: 'Overview',
      paragraphs: [
        'An implementation and study of Graph Attention Networks (Velickovic et al., ICLR 2018), reproducing semi-supervised node classification on the Cora citation dataset with PyTorch Geometric.',
      ],
    },
    {
      heading: 'How it works',
      paragraphs: [
        'Each node applies a shared linear transform, computes attention coefficients with its neighbors, and takes a softmax weighted sum of their features, with several attention heads in parallel for stability. My model has two GATConv layers: 8 heads of 8 features with ELU and 0.6 dropout, then a single head that outputs 7 class logits.',
      ],
    },
    {
      heading: 'Setup',
      paragraphs: [
        'Cora has 2,708 papers, 5,429 citations, and 1,433 bag of words features per paper, with only 140 labeled training nodes. I trained for 200 epochs with Adam (learning rate 0.005, weight decay 5e-4).',
      ],
    },
    {
      heading: 'Results',
      paragraphs: [
        'Test accuracy came out around 80%, against about 83% reported in the paper. The notebook also produces training curves and a t-SNE plot of the learned node embeddings.',
      ],
    },
  ],

  openzim: [
    {
      heading: 'Overview',
      paragraphs: [
        "openZIM's freeCodeCamp offliner scrapes freeCodeCamp.org into a ZIM archive for offline use and ships a Vue interface for working through the challenges. My contributions are to that interface: four merged pull requests and one open.",
      ],
    },
    {
      heading: 'Contributions',
      paragraphs: [],
      bullets: [
        {
          text: 'Added a visual flash when the "Check Your Code" tests fail (merged March 2026)',
          href: 'https://github.com/openzim/freecodecamp/pull/138',
        },
        {
          text: 'Fix reset dialog that showed raw {{title}} and not the lesson name (merged March 2026)',
          href: 'https://github.com/openzim/freecodecamp/pull/140',
        },
        {
          text: 'feat: add dark theme using prefers-color-scheme (merged March 2026)',
          href: 'https://github.com/openzim/freecodecamp/pull/141',
        },
        {
          text: 'Translation handling (merged March 2026)',
          href: 'https://github.com/openzim/freecodecamp/pull/143',
        },
        {
          text: 'Add support for --assignment-- sections in markdown (open)',
          href: 'https://github.com/openzim/freecodecamp/pull/148',
        },
      ],
    },
    {
      heading: 'Details',
      paragraphs: [
        'The dark theme replaced hardcoded colors across the components with CSS custom properties and gave the code editor a dark theme. The translation work added a YAML list of the locale keys the UI uses, a scrape time check that fails the build when locale files do not match, a CI check for unlisted keys, and a single lookup function in the main store.',
      ],
    },
  ],

  kubeflow: [
    {
      heading: 'Overview',
      paragraphs: [
        'Kubeflow Trainer runs distributed training and LLM fine-tuning on Kubernetes, and the Kubeflow SDK is the Python SDK for running AI workloads there. I have one merged pull request in Trainer and two open in the SDK.',
      ],
    },
    {
      heading: 'Contributions',
      paragraphs: [],
      bullets: [
        {
          text: 'feat(runtimes): add validation for reserved MPI environment variables (merged May 2026)',
          href: 'https://github.com/kubeflow/trainer/pull/3491',
        },
        {
          text: 'fix(spark): use .svc short form for Spark Connect URL (open)',
          href: 'https://github.com/kubeflow/sdk/pull/512',
        },
        {
          text: 'fix(trainer): use resource key as device for custom Kubernetes resources (open)',
          href: 'https://github.com/kubeflow/sdk/pull/525',
        },
      ],
    },
    {
      heading: 'Details',
      paragraphs: [
        'The Trainer change rejects TrainJob environment entries that collide with the four OpenMPI variables the operator manages, mirroring the existing Torch check. A maintainer asked me to pick it up after an earlier pull request went stale, so I rebased it and resolved the conflicts.',
        'In the SDK, one fix stops job reads from failing when a container requests a custom device plugin resource, and the other switches in-cluster Spark Connect URLs to the shorter .svc form.',
      ],
    },
  ],

  jenkins: [
    {
      heading: 'Overview',
      paragraphs: [
        'Three pull requests across Jenkins projects: the Plugin Manager CLI tool, the AI chatbot plugin, and the Credentials plugin. One is merged and two are in review.',
      ],
    },
    {
      heading: 'Contributions',
      paragraphs: [],
      bullets: [
        {
          text: 'Add --jenkins-update-center-download-url CLI option (merged May 2026)',
          href: 'https://github.com/jenkinsci/plugin-installation-manager-tool/pull/892',
        },
        {
          text: 'tests: add unit tests for exportchat.ts (open, approved)',
          href: 'https://github.com/jenkinsci/resources-ai-chatbot-plugin/pull/371',
        },
        {
          text: 'Reject illegal characters in new credential IDs (open)',
          href: 'https://github.com/jenkinsci/credentials-plugin/pull/1058',
        },
      ],
    },
    {
      heading: 'Details',
      paragraphs: [
        'The CLI option replaces a setting that only worked as an environment variable, moves that read into the CLI options so the library is config driven, and re-enables a test that had been disabled since Java 17. The chatbot tests take the chat export utilities from zero to 100% coverage, including PDF pagination. The credentials change adds server side ID validation at the two interactive creation endpoints while leaving imports of existing credentials alone.',
      ],
    },
  ],

  cockroachdb: [
    {
      heading: 'Overview',
      paragraphs: [
        'CockroachDB is a distributed SQL database. I fixed how its jsonpath scanner reports errors for unquoted keys that start with a digit.',
      ],
    },
    {
      heading: 'The fix',
      paragraphs: [
        'A key like $.2x was scanned as a number, so the error depended on the next character: $.2x came back as an invalid hexadecimal literal, $.2e as an invalid floating point literal, and $.2a as trailing junk. The fix reports all of them as trailing junk after the numeric prefix, matching Postgres, and updates the recorded Postgres differences. $[0x] keeps the hexadecimal message, since it is accurate there.',
      ],
    },
    {
      heading: 'Contributions',
      paragraphs: [],
      bullets: [
        {
          text: 'jsonpath: report trailing junk for keys that start with a digit (open, approved)',
          href: 'https://github.com/cockroachdb/cockroach/pull/173453',
        },
      ],
    },
  ],

  ccextractor: [
    {
      heading: 'Overview',
      paragraphs: [
        "CCSync is a CCExtractor project first built for the Taskserver project in Google Summer of Code 2024. I added Jest test suites to its Tasks frontend, and both pull requests are merged.",
      ],
    },
    {
      heading: 'Contributions',
      paragraphs: [],
      bullets: [
        {
          text: 'test(Tasks): add test suite for multi-select-utils (merged May 2026)',
          href: 'https://github.com/CCExtractor/ccsync/pull/466',
        },
        {
          text: 'test(Tasks): add Reports Toggle tests (merged May 2026)',
          href: 'https://github.com/CCExtractor/ccsync/pull/467',
        },
      ],
    },
    {
      heading: 'Details',
      paragraphs: [
        'The first adds 16 tests for the filtering and create option helpers in multi-select-utils.ts. The second checks that the Reports toggle changes its button text, renders the reports view, and switches back correctly.',
      ],
    },
  ],
}
