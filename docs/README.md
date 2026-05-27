# Project Cod: AI-Guided Learning Platform 
Orbital 26 Project by Coding Beach
<p align="left">
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=flat-square&logo=githubpages&logoColor=white" alt="GitHub Pages" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="left">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ProjectMambo/MamboFolio?style=flat-square&color=orange" /></a>
</p>

## Level of Achievement
Gemini

## 🎯 Project Scope
Cod is an integrated, AI-guided learning platform designed to democratize coding education. Instead of acting as a rigid automated grader, Cod provides an interactive, hands-on environment where users can write, execute, and debug code alongside a real-time AI mentor that explains why errors happen and how to conceptually fix them.

## Problem motivation
Traditional competitive programming and learning platforms (like LeetCode or HackerRank) often act as digital brick walls for beginners. They validate code with passing or failing marks, but rarely explain logical fallacies or architectural bugs in a beginner-friendly manner.

For "false beginners" those who know basic syntax but struggle to write functional, multi-line scripts. The cognitive gap between theory and execution is massive. Cod bridges this gap by acting less like an examiner and more like a supportive pair-programmer.

## Core Features
- Interactive Web IDE: A sleek, modern browser-based code editor using Monaco Editor (the engine behind VS Code) to provide a familiar and professional user experience.

- Integrated Execution Environment: A built-in terminal display providing real-time stdout/stderr outputs directly next to the codebase.

- Contextual AI Canvas: A dedicated UI sidebar built to maximize screen real estate, explicitly designed to stream and format intelligent mentor feedback without disrupting the coding flow.
    
## 👥 User stories
1. Newbie (who want to learn coding but don't know where to start = 'False Beginner'): This tool gives them a head start to any coding language, serving as a coding wiki, personalized adviser, even a buddy in the learning journey.

2. Bug discovery and elimination for student: The AI helps to find the error in the code being pasted by user.

3. Competitive user: wanna to know your own progress? Leaderboard tells them! As mentioned before, leaderboard allows user to check with their personal progress with worldwide learners, even aliens or reptilians if possible?!

## Design and plan
### 🚀 Milestone 1: Frontend Foundations & UI/UX

- Focus: UI Layout & Base IDE Integration.

- Tasks: Build a highly polished, responsive interface utilizing React/Next.js. Embed the Monaco Editor API and configure functional control buttons (Run, Debug, Clear).

### Milestone 2: Backend Architecture & AI Integration

- Focus: Core Logic & Persistent Storage.

- Tasks: Integrate secure Google Gemini API endpoints on the backend to stream contextual code analysis. Implement user authentication (OAuth / JWT) and spin up a secure relational database (e.g., PostgreSQL or Supabase) to manage secure user profiles, state persistence, and code histories.

### Milestone 3: Gamification & User Acceptance Testing (UAT)

- Focus: Optimization & Community Features.

- Tasks: Deploy the global leaderboards. Conduct structured user testing cycles with actual target beginners to gather qualitative feedback, crush edge-case bugs, and optimize prompt engineering parameters before final evaluation.


## License
Distributed under the MIT License. See **[LICENSE](LICENSE)** for more information.
