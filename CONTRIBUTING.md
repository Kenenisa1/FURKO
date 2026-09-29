# Contributing to FURKO

Thank you for your interest in contributing to **FURKO**! As a civic technology initiative, we welcome contributions from developers, designers, and civic tech enthusiasts.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Development Setup](#development-setup)
3. [Branching Strategy](#branching-strategy)
4. [Commit Conventions](#commit-conventions)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and constructive in all communications and reviews.

---

## 🛠 Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/furko.git
   cd furko
   ```

2. **Database & Infrastructure:**
   ```bash
   docker compose up -d
   ```

3. **Backend Service:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. **Frontend Clients:**
   - **Citizen Mobile App (`frontend/citizen`):**
     ```bash
     cd frontend/citizen
     npm install
     npx expo start
     ```
   - **Institution & Admin Web (`frontend/web`):**
     ```bash
     cd frontend/web
     npm install
     npm run dev
     ```

---

## 🌿 Branching Strategy

We follow feature-branch workflows:

- `main`: Production-ready code.
- `develop`: Integration branch for ongoing work.
- `feature/<feature-name>`: New features or enhancements.
- `bugfix/<bug-name>`: Bug fixes.
- `docs/<doc-name>`: Documentation updates.

---

## ✍️ Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation-only changes
- `style:` Formatting, missing semicolons, etc. (no code change)
- `refactor:` Code refactoring without behavioral changes
- `test:` Adding or updating tests
- `chore:` Maintenance tasks, dependency updates, tooling

**Example:**
```bash
git commit -m "feat(routing): implement postgis polygon boundary matching"
```

---

## 🚀 Pull Request Process

1. Fork or branch from `develop`.
2. Ensure existing tests pass and add new tests for your changes.
3. Keep pull requests focused on a single responsibility.
4. Provide a clear description of the problem solved and test steps in your PR description.
5. Request review from team members before merging.

---

## 📐 Coding Standards

- **TypeScript:** Use strict typing; avoid `any`.
- **Linting & Formatting:** Ensure code conforms to ESLint and Prettier configurations.
- **Testing:** Write unit tests in `backend/tests`, client tests in respective frontend packages, and integration/e2e tests in `tests/`.
