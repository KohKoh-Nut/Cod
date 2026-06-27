# Cod

<p align="left">
    <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=githubpages&logoColor=white" alt="GitHub Pages" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
    <img src="https://img.shields.io/badge/Monaco_Editor-007ACC?style=flat-square&logo=vscodium&logoColor=white" alt="Monaco Editor" />
    <img src="https://img.shields.io/badge/Cloudflare-F48120?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare" />
</p>
<p align="left">
    <img src="https://img.shields.io/badge/Deploy-Live-green?style=flat-square" alt="Deploy Status" />   
    <img src="https://img.shields.io/badge/Maintenance-Active-brightgreen?style=flat-square" />
    <a href="LICENSE"><img src="https://img.shields.io/github/license/ProjectMambo/MamboFolio?style=flat-square&color=orange" /></a>
</p>

A collaborative coding platform to build, share, and learn together.

**Team:** Coding Beach\
**Level of Achievement:** Gemini

## Demo

Live site available at: [https://kohkoh-nut.github.io/Cod/](https://kohkoh-nut.github.io/Cod/)

## Overview

### What is COD?

<p style="text-align: justify;">COD is a collaborative coding platform designed to help developers build, share, and learn together. The platform provides an interactive, hands-on environment that enables users to write, execute, and debug code seamlessly. By emphasizing community-driven learning, COD encourages users to share their creations and build directly on top of work done by others. This ecosystem shifts the focus away from pure competition, encouraging a supportive community where developers grow together.</p>

### Motivation

<p style="text-align: justify;">Most online coding tools isolate developers in their own private workspaces. When you want to share your work, get feedback, or show someone a bug, you are forced to copy and paste large blocks of text or take screenshots, which completely breaks the development flow. Furthermore, standard platforms treat code as a dead end; once you submit a script, it just sits there. We created COD because we wanted a workspace that feels alive and connected. We wanted to build a platform where sharing code is as simple as sending a link, and where developers can actively learn from one another by taking existing ideas and instantly expanding upon them in real time.</p>

### Project Aim

<p style="text-align: justify;">The primary aim of COD is to lower the barrier to entry for developers of all skill levels by creating a fully integrated, easy-to-use environment in the browser. We want to eliminate the painful setup processes, like downloading compilers, managing local extensions, and configuring confusing terminal paths, that often stop people from coding before they even start. Our ultimate goal is to build a highly interactive network where code is not just written, but shared and remixed, giving users a direct pathway to experiment with and learn from real community projects.</p>

### Why are we different?

<p style="text-align: justify;">Traditional platforms are built for solo work or strict competition, but COD is built entirely around community collaboration.</p>

<p style="text-align: justify;">Instead of treating shared code as static text on a page, our environment turns every shared script into an active playground. Anyone who clicks a shared link can instantly run the code or fork it into their own workspace to build on top of it without breaking the original creator's work.</p>

<p style="text-align: justify;">What truly sets us apart is how we track this collaboration. By using a visual tree structure, we map out the exact parent-to-child lineage of every script. You can see the full family tree of how an idea started, who edited it along the way, and all the different branches it created. We turn coding into a collaborative team effort where you can watch your ideas grow across the community.</p>

## Features

- **Interactive Web IDE** - A high-performance, responsive code editor embedded directly within the web browser, providing users with instant code execution and a responsive multi-language environment.
- **URL Sharing & Social Integration** - Generates a secure, persistent URL snapshot of any code session that can be shared instantly across the web or published directly to social media networks with a single click.
- **Tree-Based Fork History** - When a user opens a shared link, they can "fork" the workspace to copy the code directly into their own IDE. The system automatically injects author’s metadata, mapping out a visual tree that tracks original creators, current editors, and the complete parent-to-child relation.

## User Stories

### Code Sharers and Creators

<p style="text-align: justify;">A developer who builds useful scripts or templates often wants to share their work with an audience, students, or team members on social media and chat channels. Currently, sharing code online requires pasting unformatted text blocks, sending screenshots, or linking to a repository that requires local installation. This friction stops people from interacting with the code.</p>

### Independent Learners

<p style="text-align: justify;">Many students and junior developers learn best by analyzing existing, functional code and modifying it to see how the output changes. However, downloading another developer's script locally often leads to frustrating environment configuration issues, missing dependencies, or terminal errors. Furthermore, beginners are often hesitant to edit shared workspaces out of fear of breaking the original author's working code.</p>

### Group Collaborators

<p style="text-align: justify;">When multiple people or community members improve a script together, tracking the history of those changes usually becomes messy. Traditional code sharing sites treat code as static text, making it impossible to see where a snippet originated, who modified it, or how many spin-off versions were created from the original idea.</p>

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

## Issues & Feedback

Since this is our personal project, we are not looking for external pull requests. However, if you spot a bug or rendering issue, feel free to open an **Issue** to let us know!

## License

Distributed under the MIT License. See **[LICENSE](LICENSE)** for more information.
