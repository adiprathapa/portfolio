\documentclass[letterpaper,10pt]{article}

\usepackage{setspace}
\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{hyperref}

% Configure hyperlinks to be underlined instead of boxed
\hypersetup{
    colorlinks=false,
    pdfborder={0 0 0},
}

\urlstyle{same}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Adjust margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.7in}
\addtolength{\textheight}{1.5in}

\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-6pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-6pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\pdfgentounicode=1

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-3pt}}
  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-6pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-8pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\begin{document}

\begin{center}
  \textbf{\LARGE \scshape Aditya (Adi) Prathapa} \\
  \vspace{1pt}
  \small \underline{\href{tel:4024194740}{(402) 419-4740}}~$|$~\underline{\href{mailto:agp96@cornell.edu}{agp96@cornell.edu}}~$|$~\underline{\href{https://adiprathapa.space}{adiprathapa.space}}~$|$~\underline{\href{https://linkedin.com/in/adi-prathapa}{linkedin.com/in/adi-prathapa}}~$|$~\underline{\href{https://github.com/adiprathapa}{github.com/adiprathapa}}
\end{center}

%-----------EDUCATION-----------
\section{Education}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Cornell University}{Ithaca, NY}
      {B.A. Computer Science, Minor in Artificial Intelligence; GPA: 3.56/4.0}{Anticipated: May 2028}
      \resumeItemListStart
        \resumeItem{Relevant Coursework: Data Structures, Object-Oriented Programming, Theory of Computation, Discrete Math, Python Design and Development, Linear Algebra for Engineers, Calculus 1, Calculus 2}
      \resumeItemListEnd
  \resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\section{Experience}
  \resumeSubHeadingListStart
    
\resumeSubheading{MITRE}{Omaha, NE}{Data Science Intern}{May 2026 -- Present}
    \resumeItemListStart
        \resumeItem{Built PyTorch Geometric graph learning workflows using GINEConv to model cyber event relationships}
        \resumeItem{Applied Optuna based hyperparameter optimization across model architecture and training parameters}
        \resumeItem{Refactored a legacy training codebase into modular scripts and built an end to end pipeline testing suite}
    \resumeItemListEnd
    \resumeSubheading
      {Colorado School of Mines}{Golden, CO}
      {Software Engineering Intern}{June 2024 -- July 2024}
      \resumeItemListStart
        \resumeItem{Built an AI powered chatbot module enabling real time natural language question answering on a cybersecurity platform}
        \resumeItem{Developed an interactive cybersecurity site with phishing detection simulations in JavaScript, HTML, and CSS}
      \resumeItemListEnd

    \resumeSubheading
      {University Nebraska Lincoln}{Lincoln, NE}
      {Physics Research Assistant}{June 2023 -- August 2023}
      \resumeItemListStart
        \resumeItem{Created Python simulation programs to model Bohmian trajectories and visualize quantum behavior using Scikit-learn}
        \resumeItem{Produced 3D printed models from simulation data using Matplotlib visualizations to support educational demonstrations}
        \resumeItem{Presented findings at the Nebraska Summer Research Symposium after biweekly reviews with professor to refine methodology}
      \resumeItemListEnd

  \resumeSubHeadingListEnd

%-----------PROJECTS-----------
\section{Projects}
    \resumeSubHeadingListStart
    \resumeProjectHeading
    {\textbf{Open Source Contributor to Jenkins} $|$ \emph{Java, Maven, JUnit, Jest, TypeScript}}{ \underline{\href{https://github.com/jenkinsci/plugin-installation-manager-tool/pull/892}{Source}}}
    \resumeItemListStart
        \resumeItem{Contributed a merged PR to plugin-installation-manager-tool adding a CLI flag for configuring the Jenkins update center download URL, with a refactor moving environment variable resolution into the CLI options API}
        \resumeItem{Re-enabled a JUnit test broken since Java 17, updating assertions to match documented precedence rules}
        \resumeItem{Submitted Jest unit tests for chat export utilities in resources-ai-chatbot-plugin covering TXT, MD, DOCX, PDF}
    \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Open Source Contributor to Kubeflow} $|$ \emph{Python, Go, Kubernetes, Kubeflow Trainer, Kubeflow SDK}}{
          \underline{\href{https://github.com/kubeflow/trainer/pull/3491}{Source}}}

          \resumeItemListStart
            \resumeItem{Contributed a merged PR to Kubeflow Trainer validating reserved MPI environment variables in TrainingRuntime}
            \resumeItem{Submitted a follow up PR to Kubeflow SDK fixing the in-cluster Spark Connect URL to use the short form DNS suffix}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Helicity} $|$ \emph{FastAPI, React, NetworkX, Claude API, Gemini API, FastMCP, Leaflet}}{
          \underline{\href{https://helicity-theta.vercel.app/}{Website}}}

          \resumeItemListStart
            \resumeItem{Engineered a composite liquidity stress scoring engine over a NetworkX knowledge graph linking stablecoins, banks, and jurisdictions, computing WAM duration risk, FDIC Call Report LTV ratios, and NOAA tail risk multipliers}
            \resumeItem{Implemented a multi model LLM jury (Claude + Gemini) for consensus causal narrative generation, surfacing counterparty health divergences above 15 points and pinning score snapshots to IPFS via Pinata for verifiable onchain audit trails}
            \resumeItem{Exposed risk scores via FastAPI REST and a FastMCP server with 5 agent callable tools, backed by a React, Recharts \& Leaflet dashboard with bank markers, data center overlays, and live weather stress events}
          \resumeItemListEnd

      \resumeProjectHeading
          {\textbf{Tauron} $|$ \emph{PyTorch Geometric, FastAPI, React, D3.js, Ollama}}{
          \underline{\href{https://tauron.vercel.app/}{Website}}}

          \resumeItemListStart
            \resumeItem{Built a GRU + GraphSAGE model over a 60 cow contact graph encoding 9 sensor features to predict mastitis, BRD, and lameness risk 48 hours ahead on 581 labeled graph snapshots}
            \resumeItem{Replaced GNNExplainer with gradient based feature attribution, reducing per cow explanation latency by 40$\times$}
            \resumeItem{Served real time risk scores and LLM generated farmer alerts (Mistral-7B via Ollama) through a FastAPI backend and React + D3.js force directed herd map}
          \resumeItemListEnd

    \resumeSubHeadingListEnd

%-----------INVOLVEMENT-----------
\section{Involvement}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Cornell Custom Silicon Systems (C2S2)}{}
      {Operations Engineer}{November 2025 -- Present}
      \resumeItemListStart
        \resumeItem{Led migration of legacy static webpages to React frontend, introducing reusable components and improving maintainability}
        \resumeItem{Built and deployed web applications to an Apache server, managing build artifacts and static asset configuration}
      \resumeItemListEnd

    \resumeSubheading
      {Cornell Data \& Strategy}{}
      {Technology Implementation Associate}{September 2025 -- Present}
      \resumeItemListStart
        \resumeItem{Implemented Redis backed endpoints to optimize data access and reduce latency across backend services}
        \resumeItem{Used pandas to clean datasets, built cost forecasting models using TensorFlow, and tested with Scikit-learn}
      \resumeItemListEnd
  \resumeSubHeadingListEnd

%-----------SKILLS-----------
\section{Skills}
 \begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
     \textbf{AI \& ML}{: Anthropic SDK (Claude), Gemini API, Google ADK, FastMCP, PyTorch, PyTorch Geometric, TensorFlow, Scikit-learn} \\
     \textbf{Languages}{: Python, Java, Go, C, SQL, JavaScript, TypeScript, HTML, CSS} \\
     \textbf{Frameworks \& Libraries}{: FastAPI, Flask, React, Node.js, Express.js, Tailwind CSS, NumPy, pandas, Matplotlib, NetworkX} \\
     \textbf{Developer Tools}{: Git, CI/CD (GitHub Actions), Docker, Kubernetes, Redis, SQLite, MongoDB, Vercel}
    }}
 \end{itemize}

\end{document}