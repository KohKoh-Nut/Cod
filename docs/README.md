# Cod

<p align="left">
    <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=githubpages&logoColor=white" alt="GitHub Pages" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Monaco_Editor-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white" alt="Monaco Editor" />
    <img src="https://img.shields.io/badge/Judge0-000000?style=flat-square&logo=gnubash&logoColor=white" alt="Judge0" />
</p>
<p align="left">
    <img src="https://img.shields.io/badge/Deploy-Not Live-red?style=flat-square" alt="Deploy Status" />   
    <img src="https://img.shields.io/badge/Maintenance-Active-brightgreen?style=flat-square" />
    <a href="LICENSE"><img src="https://img.shields.io/github/license/ProjectMambo/MamboFolio?style=flat-square&color=orange" /></a>
</p>

An AI-guided learning platform tailored for coding.

**Team:** Coding Beach\
**Level of Achievement:** Gemini

## Overview

### Scope

Cod is an integrated, AI-guided learning platform designed to improve coding education. Instead of acting as a rigid automated grader, Cod provides an interactive, hands-on environment where users can write, execute, and debug code alongside a real-time AI mentor that explains why errors happen and how to conceptually fix them.

### Motivation

Traditional competitive programming and learning platforms (like LeetCode or HackerRank) often act as digital brick walls for beginners. They validate code with passing or failing marks, but rarely explain logical fallacies or architectural bugs in a beginner-friendly manner.

For "false beginners" those who know basic syntax but struggle to write functional, multi-line scripts. The cognitive gap between theory and execution is massive. Cod bridges this gap by acting less like an examiner and more like a supportive pair-programmer.

## Features

- **Interactive Web IDE:** A sleek, modern browser-based code editor using Monaco Editor to provide a familiar and professional user experience.

- **Integrated Execution Environment:** A built-in terminal display providing real-time outputs directly next to the codebase.

- **Contextual AI Canvas:** A dedicated UI sidebar explicitly designed to stream and format AI feedback without disrupting the coding flow.

## User stories
**Story 1 – The Guided Learner**

> As a beginner who understands programming basics but struggles to start complex scripts independently, I want to ask questions and get clear, contextual guidance at any point in my coding process, so that I can build confidence and make progress without feeling overwhelmed or stuck.

---

**Story 2 – The Debugging Student**

> As a student working on assignments or personal scripts, I want to paste my code and receive a clear explanation of what is wrong and why, so that I can fix my bugs and understand the underlying principle well enough to avoid the same mistake in the future.

---

**Story 3 – The Competitive Progress Tracker**

> As a learner who is motivated by friendly competition, I want to see how my skill progress compares to others in the community, so that I stay consistently engaged and feel a sense of achievement as I improve over time.

## Demo

Not Available for now.

## Getting Started

### Prerequisites

Before running or building the project locally, ensure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)** - The JavaScript runtime env _(v18+ recommended)_.
- **[npm](https://www.npmjs.com/)** or **[pnpm](https://pnpm.io/)** - The package manager to handle project dependencies.

### Quick Start

Clone the repository

```bash
git clone https://github.com/KohKoh-Nut/Cod
```

### Install Prerequisites

#### Install project dependencies

Navigate into the root directory and install the Node modules:

```bash
npm install
```

#### Running Locally

Launch the local development server to preview your changes:

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the site.

### Quick Build

To compile the static production build manually:

```bash
npm run build
```

## Development Roadmap

### Milestone 1: Frontend Foundations & UI/UX

- **Focus:** UI Layout & Base IDE Integration.

- **Tasks:** Build a highly polished, responsive interface utilizing React/Next.js. Embed the Monaco Editor API and configure functional control buttons (Run, Debug, Clear).

### Milestone 2: Backend Architecture & AI Integration

- **Focus:** Core Logic & Persistent Storage.

- **Tasks:** Integrate secure AI model API endpoints on the backend to stream contextual code analysis. Implement user authentication (OAuth / JWT) and spin up a secure relational database to manage secure user profiles, state persistence, and code histories.

### Milestone 3: Gamification & User Acceptance Testing (UAT)

- **Focus:** Optimization & Community Features.

- **Tasks:** Deploy the global leaderboards. Conduct structured user testing cycles with actual target beginners to gather qualitative feedback, crush edge-case bugs, and optimize prompt engineering parameters before final evaluation.

## Deployment

Not Available for now.

## Issues & Feedback

Since this is our personal project, we are not looking for external pull requests. However, if you spot a bug or rendering issue, feel free to open an **Issue** to let us know!

## License

Distributed under the MIT License. See **[LICENSE](LICENSE)** for more information.
