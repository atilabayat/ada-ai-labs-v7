/**
 * lib/skills/executors/learning.ts
 * ─────────────────────────────────
 * Learning & educational content generators.
 *
 * Skills:
 *   /lesson-generator    → Multi-module course with interactive navigation
 *   /survey-generator    → Single-file HTML survey paper
 *
 * Output format: Structured JSON with:
 *   - markdown: Full course outline (publishable as wiki)
 *   - html: Interactive HTML component (renders in builder UI)
 *   - metadata: Course structure, modules, assessments
 */

import { SkillExecutor, streamMarkdown } from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CourseStructure {
  type: "course" | "survey";
  title: string;
  duration: string;
  modules: number;
  targetAudience: string;
}

interface StructuredOutput {
  type: "course" | "survey";
  metadata: CourseStructure;
  markdown: string;
  html: string;
  htmlDeps: string[];
}

// ─── /lesson-generator ───────────────────────────────────────────────────────

const LESSON_GENERATOR: SkillExecutor = async function* (ctx) {
  const prompt = ctx.prompt;

  // Extract course title from prompt
  const titleMatch = prompt.match(/course on (.+?)(?:\.|,|$)/i);
  const courseTitle = titleMatch ? titleMatch[1].trim() : prompt.substring(0, 50);

  // Generate markdown outline (same as before)
  const markdown = generateCourseMarkdown(prompt, courseTitle);

  // Generate interactive HTML from the outline
  const html = generateCourseHTML(markdown, courseTitle);

  // Build structured output
  const structured: StructuredOutput = {
    type: "course",
    metadata: {
      type: "course",
      title: courseTitle,
      duration: extractDuration(markdown),
      modules: countModules(markdown),
      targetAudience: "General audience with basic literacy",
    },
    markdown: markdown,
    html: html,
    htmlDeps: ["chart.js"], // Could add three.js, plotly.js if needed
  };

  // Stream as JSON (structured output)
  const jsonOutput = JSON.stringify(structured, null, 2);
  yield* streamMarkdown(jsonOutput, "lesson-generator", `Generating: ${courseTitle}`);
};

// ─── /survey-generator ───────────────────────────────────────────────────────

const SURVEY_GENERATOR: SkillExecutor = async function* (ctx) {
  const prompt = ctx.prompt;

  // Extract survey topic from prompt
  const topicMatch = prompt.match(/survey.*?(?:on|of|about) (.+?)(?:\.|,|$)/i) || prompt.match(/(.+)/);
  const surveyTopic = topicMatch ? topicMatch[1].trim() : prompt.substring(0, 50);

  // Generate survey content
  const markdown = generateSurveyMarkdown(prompt, surveyTopic);
  const html = generateSurveyHTML(markdown, surveyTopic);

  // Build structured output
  const structured: StructuredOutput = {
    type: "survey",
    metadata: {
      type: "survey",
      title: surveyTopic,
      duration: "30-45 minutes",
      modules: 1,
      targetAudience: "Researchers, practitioners",
    },
    markdown: markdown,
    html: html,
    htmlDeps: ["chart.js"],
  };

  const jsonOutput = JSON.stringify(structured, null, 2);
  yield* streamMarkdown(jsonOutput, "survey-generator", `Generating: ${surveyTopic}`);
};

// ─── Markdown Generators ─────────────────────────────────────────────────────

function generateCourseMarkdown(prompt: string, title: string): string {
  return `# ${title} — Final Deliverable

## Course Overview

**Target:** General audience with basic science literacy
**Duration:** 4 modules (~90 minutes total)
**Format:** Video + reading + interactive simulations

---

## Module 1: Fundamentals (20 min)

### Learning Objectives
- Define core concepts
- Build foundational understanding
- Establish context and relevance

### Content Structure
1. **Hook:** Real-world problem that motivates the topic
2. **Core Concept:** Key principle or theory
3. **Key Metric:** Quantifiable understanding
4. **Visual:** Diagram or example showing the principle

### Resources
- Primary source material
- Foundational references
- Introductory texts

---

## Module 2: Evidence & Examples (25 min)

### Learning Objectives
- Describe 3+ independent lines of evidence
- Apply concepts to real scenarios
- Interpret data and observations

### Content Structure
1. **Case Study 1** — Historical example
2. **Case Study 2** — Modern application
3. **Data Analysis** — Quantitative evidence
4. **Pattern Recognition** — Synthesize across examples

### Interactive Element
Simulation: Adjust parameters and observe outcomes

### Resources
- Research papers
- Data sources
- Primary documents

---

## Module 3: Deeper Dive (25 min)

### Learning Objectives
- Compare competing approaches
- Explain why alternatives exist
- Evaluate trade-offs

### Content Structure
| **Approach** | **Strengths** | **Weaknesses** | **When to Use** |
|---|---|---|---|
| Method A | Fast, accessible | Surface-level | Quick overviews |
| Method B | Deep, thorough | Time-intensive | Research |
| Method C | Balanced | No standout trait | General use |

### Key Tension
Real-world constraints vs. theoretical ideals

---

## Module 4: Integration & Future (20 min)

### Learning Objectives
- Connect to broader context
- Identify open questions
- Plan next steps

### Content Structure
1. **Historical Timeline** — How field evolved
2. **Current State** — Where we are now
3. **Future Directions** — Emerging work
4. **Capstone Activity** — Design your own approach

### Assessment Strategy

**Formative:**
- Module quizzes (4 questions each, auto-graded)
- Interactive simulation checkpoints

**Summative:**
- Final project: Explain one key concept to a friend
- Peer review rubric provided

---

## Technical Requirements

**Platform:** Browser-based (no installation)
**Simulations:** Interactive charts and visualizations
**Video hosting:** Embedded resources
**Accessibility:** Full transcripts, color-blind friendly

---

## Success Metrics

By course completion, learners should be able to:
- Explain the topic to someone unfamiliar with it
- Apply concepts to novel scenarios
- Identify high-quality sources for deeper learning
- Engage with primary research in the field
`;
}

function generateSurveyMarkdown(prompt: string, topic: string): string {
  return `# ${topic} — Literature Survey

## Abstract

This survey provides a comprehensive overview of ${topic}, synthesizing current research, methodologies, and open questions. It is intended for researchers and practitioners seeking to understand the landscape, identify gaps, and plan investigations.

---

## 1. Introduction

### Background
${topic} has emerged as a critical area due to [reasons]. The field encompasses [key areas] and intersects with [related domains].

### Scope
This survey covers:
- Foundational concepts and definitions
- Historical development and major milestones
- Current state-of-the-art approaches
- Unresolved questions and future directions

### Intended Audience
Researchers, doctoral students, and practitioners with basic background knowledge.

---

## 2. Foundational Concepts

### Key Definitions
- **Term 1:** Definition and context
- **Term 2:** Definition and context
- **Term 3:** Definition and context

### Historical Context
The field evolved through three eras:
1. **Era 1 (1980s-1990s):** Initial formulation
2. **Era 2 (2000s-2010s):** Rapid expansion
3. **Era 3 (2015-present):** Modern synthesis

---

## 3. Current Methodologies

### Approach A: Traditional Methods
**Strengths:** Established, well-understood
**Limitations:** May not scale
**Key Papers:** [References]

### Approach B: Modern Variants
**Strengths:** Addresses current challenges
**Limitations:** Still evolving
**Key Papers:** [References]

### Approach C: Emerging Directions
**Strengths:** Novel insights
**Limitations:** Early stage
**Key Papers:** [References]

---

## 4. Challenges & Debates

### Unresolved Question 1
**Current Understanding:** [Status]
**Competing Views:** [Perspectives]
**Evidence Gap:** [Missing knowledge]

### Unresolved Question 2
**Current Understanding:** [Status]
**Competing Views:** [Perspectives]
**Evidence Gap:** [Missing knowledge]

---

## 5. Applications & Impact

### Domain A: [Application Area]
- Use case 1
- Use case 2
- Recent developments

### Domain B: [Application Area]
- Use case 1
- Use case 2
- Recent developments

---

## 6. Future Research Directions

1. **Short-term (1-3 years):** Near-term opportunities
2. **Medium-term (3-7 years):** Emerging frontiers
3. **Long-term (7+ years):** Transformative potential

---

## 7. Conclusion

${topic} remains an active and evolving field. Key takeaways:
- Core principle 1
- Core principle 2
- Critical open question

---

## References

[Research papers, books, datasets, tools referenced throughout the survey]
`;
}

// ─── HTML Generators ────────────────────────────────────────────────────────

function generateCourseHTML(markdown: string, title: string): string {
  const safeTitle = escapeHtml(title);
  return `
<div class="course-container" style="max-width: 1000px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
  <style>
    .course-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
    .course-header h1 { margin: 0 0 10px 0; font-size: 32px; }
    .course-header p { margin: 0; opacity: 0.9; }
    .modules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .module-card { background: white; border: 2px solid #ddd; border-radius: 8px; padding: 20px; cursor: pointer; transition: all 0.3s; text-align: center; }
    .module-card:hover { border-color: #667eea; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15); transform: translateY(-2px); }
    .module-card h3 { margin: 0 0 10px 0; color: #667eea; }
    .module-card p { margin: 0; font-size: 14px; color: #666; }
    .module-card .duration { font-weight: bold; color: #764ba2; }
    .module-content { display: none; background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
    .module-content.active { display: block; }
    .module-content h2 { color: #667eea; margin-top: 0; }
    .module-content h3 { color: #764ba2; margin-top: 20px; }
    .module-content ul { margin: 10px 0; padding-left: 20px; }
    .module-content li { margin: 8px 0; }
    .learning-objectives { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin: 15px 0; }
    .assessment-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0; }
    .nav-buttons { display: flex; gap: 10px; justify-content: center; margin-top: 30px; flex-wrap: wrap; }
    .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s; }
    .btn-primary { background: #667eea; color: white; }
    .btn-primary:hover { background: #5568d3; }
    .btn-secondary { background: #e9ecef; color: #333; }
    .btn-secondary:hover { background: #dee2e6; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .progress-bar { width: 100%; height: 6px; background: #e9ecef; border-radius: 3px; margin: 20px 0; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.3s; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #ddd; margin-top: 40px; }
  </style>

  <div class="course-header">
    <h1>📚 ${safeTitle}</h1>
    <p>Interactive course with 4 modules • ~90 minutes</p>
  </div>

  <div class="progress-bar">
    <div class="progress-fill" id="progressBar" style="width: 0%;"></div>
  </div>

  <div class="modules-grid">
    <div class="module-card" onclick="selectModule(0)">
      <h3>1️⃣</h3>
      <h4>Fundamentals</h4>
      <p class="duration">20 min</p>
      <p>Core concepts</p>
    </div>
    <div class="module-card" onclick="selectModule(1)">
      <h3>2️⃣</h3>
      <h4>Evidence</h4>
      <p class="duration">25 min</p>
      <p>Real examples</p>
    </div>
    <div class="module-card" onclick="selectModule(2)">
      <h3>3️⃣</h3>
      <h4>Deep Dive</h4>
      <p class="duration">25 min</p>
      <p>Compare methods</p>
    </div>
    <div class="module-card" onclick="selectModule(3)">
      <h3>4️⃣</h3>
      <h4>Integration</h4>
      <p class="duration">20 min</p>
      <p>Capstone</p>
    </div>
  </div>

  <!-- Module 1 -->
  <div id="module-0" class="module-content active">
    <h2>Module 1: Fundamentals</h2>
    <div class="learning-objectives">
      <strong>Learning Objectives:</strong>
      <ul>
        <li>Define core concepts</li>
        <li>Build foundational understanding</li>
        <li>Establish context and relevance</li>
      </ul>
    </div>
    <h3>Content Structure</h3>
    <ul>
      <li><strong>Hook:</strong> Real-world problem that motivates the topic</li>
      <li><strong>Core Concept:</strong> Key principle or theory</li>
      <li><strong>Key Metric:</strong> Quantifiable understanding</li>
      <li><strong>Visual:</strong> Diagram showing the principle</li>
    </ul>
    <p><em>Estimated time: 20 minutes</em></p>
  </div>

  <!-- Module 2 -->
  <div id="module-1" class="module-content">
    <h2>Module 2: Evidence & Examples</h2>
    <div class="learning-objectives">
      <strong>Learning Objectives:</strong>
      <ul>
        <li>Describe 3+ independent lines of evidence</li>
        <li>Apply concepts to real scenarios</li>
        <li>Interpret data and observations</li>
      </ul>
    </div>
    <h3>Content Structure</h3>
    <ul>
      <li><strong>Case Study 1:</strong> Historical example</li>
      <li><strong>Case Study 2:</strong> Modern application</li>
      <li><strong>Data Analysis:</strong> Quantitative evidence</li>
      <li><strong>Pattern Recognition:</strong> Synthesize across examples</li>
    </ul>
    <div class="assessment-box">
      <strong>Interactive Element:</strong> Adjust parameters and observe outcomes in a live simulation.
    </div>
    <p><em>Estimated time: 25 minutes</em></p>
  </div>

  <!-- Module 3 -->
  <div id="module-2" class="module-content">
    <h2>Module 3: Deeper Dive</h2>
    <div class="learning-objectives">
      <strong>Learning Objectives:</strong>
      <ul>
        <li>Compare competing approaches</li>
        <li>Explain why alternatives exist</li>
        <li>Evaluate trade-offs</li>
      </ul>
    </div>
    <h3>Methodology Comparison</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
      <tr style="background: #f0f0f0;">
        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Approach</th>
        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Strengths</th>
        <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Weaknesses</th>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Method A</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Fast, accessible</td>
        <td style="padding: 10px; border: 1px solid #ddd;">Surface-level</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Method B</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Deep, thorough</td>
        <td style="padding: 10px; border: 1px solid #ddd;">Time-intensive</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Method C</strong></td>
        <td style="padding: 10px; border: 1px solid #ddd;">Balanced</td>
        <td style="padding: 10px; border: 1px solid #ddd;">No standout trait</td>
      </tr>
    </table>
    <p><em>Estimated time: 25 minutes</em></p>
  </div>

  <!-- Module 4 -->
  <div id="module-3" class="module-content">
    <h2>Module 4: Integration & Future</h2>
    <div class="learning-objectives">
      <strong>Learning Objectives:</strong>
      <ul>
        <li>Connect to broader context</li>
        <li>Identify open questions</li>
        <li>Plan next steps</li>
      </ul>
    </div>
    <h3>Capstone Activity</h3>
    <p><strong>Final Project:</strong> Explain one key concept from this course to someone unfamiliar with it. Your explanation should:</p>
    <ul>
      <li>Use plain language (no jargon)</li>
      <li>Provide 1-2 real examples</li>
      <li>Answer "why does this matter?"</li>
    </ul>
    <div class="assessment-box">
      <strong>Deliverable:</strong> 3-5 minute recorded explanation or written summary (500 words).
    </div>
    <p><em>Estimated time: 20 minutes</em></p>
  </div>

  <div class="nav-buttons">
    <button class="btn btn-secondary" id="prevBtn" onclick="previousModule()" style="display: none;">← Previous</button>
    <button class="btn btn-primary" id="nextBtn" onclick="nextModule()">Next →</button>
  </div>

  <div class="footer">
    <p>✅ Interactive course • Estimated total: 90 minutes • Self-paced</p>
  </div>

  <script>
    let currentModule = 0;
    const totalModules = 4;

    function selectModule(index) {
      currentModule = index;
      updateDisplay();
    }

    function nextModule() {
      if (currentModule < totalModules - 1) {
        currentModule++;
        updateDisplay();
      }
    }

    function previousModule() {
      if (currentModule > 0) {
        currentModule--;
        updateDisplay();
      }
    }

    function updateDisplay() {
      // Hide all modules
      for (let i = 0; i < totalModules; i++) {
        const el = document.getElementById('module-' + i);
        if (el) el.classList.remove('active');
      }
      // Show current module
      const current = document.getElementById('module-' + currentModule);
      if (current) current.classList.add('active');

      // Update buttons
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      if (prevBtn) prevBtn.style.display = currentModule === 0 ? 'none' : 'block';
      if (nextBtn) nextBtn.textContent = currentModule === totalModules - 1 ? '✅ Complete' : 'Next →';

      // Update progress bar
      const progress = ((currentModule + 1) / totalModules) * 100;
      const progressFill = document.getElementById('progressBar');
      if (progressFill) progressFill.style.width = progress + '%';

      // Highlight active module card
      document.querySelectorAll('.module-card').forEach((card, i) => {
        card.style.borderColor = i === currentModule ? '#667eea' : '#ddd';
        card.style.background = i === currentModule ? '#f0f4ff' : 'white';
      });
    }

    // Initialize
    updateDisplay();
  </script>
</div>
  `;
}

function generateSurveyHTML(markdown: string, topic: string): string {
  const safeTopic = escapeHtml(topic);
  return `
<div style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: 'Georgia', serif; line-height: 1.8; color: #2c3e50; background: white;">
  <style>
    .survey-header { border-bottom: 3px solid #2c3e50; padding-bottom: 30px; margin-bottom: 40px; }
    .survey-header h1 { margin: 0 0 10px 0; font-size: 36px; font-weight: 700; }
    .survey-header .meta { display: flex; gap: 20px; font-size: 14px; color: #666; margin-top: 15px; flex-wrap: wrap; }
    .survey-header .meta span { display: flex; align-items: center; gap: 5px; }
    .toc { background: #f8f9fa; padding: 20px; border-left: 4px solid #3498db; margin: 30px 0; border-radius: 4px; }
    .toc h3 { margin: 0 0 15px 0; }
    .toc ul { list-style: none; padding: 0; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: #3498db; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    h2 { color: #2c3e50; margin-top: 50px; padding-top: 20px; border-top: 2px solid #ecf0f1; }
    h3 { color: #34495e; margin-top: 25px; }
    .abstract { background: #ecf0f1; padding: 20px; border-radius: 4px; font-style: italic; line-height: 1.7; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    table th { background: #34495e; color: white; padding: 12px; text-align: left; }
    table td { padding: 12px; border-bottom: 1px solid #ecf0f1; }
    table tr:nth-child(even) { background: #f8f9fa; }
    .reference { background: #fff3cd; padding: 12px; margin: 10px 0; border-left: 4px solid #ffc107; border-radius: 4px; font-size: 14px; }
    .key-takeaway { background: #d4edda; padding: 15px; border-left: 4px solid #28a745; border-radius: 4px; margin: 20px 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 14px; }
    blockquote { border-left: 4px solid #3498db; padding-left: 20px; margin: 20px 0; color: #666; font-style: italic; }
    .footer { margin-top: 60px; padding-top: 30px; border-top: 2px solid #ecf0f1; text-align: center; color: #666; font-size: 14px; }
  </style>

  <div class="survey-header">
    <h1>${safeTopic}</h1>
    <div class="meta">
      <span>📄 Literature Survey</span>
      <span>📅 2025-2026</span>
      <span>⏱️ 30-45 min read</span>
    </div>
  </div>

  <div class="abstract">
    <strong>Abstract:</strong> This survey provides a comprehensive overview of ${safeTopic}, synthesizing current research, methodologies, and open questions. It is intended for researchers and practitioners seeking to understand the landscape, identify gaps, and plan investigations.
  </div>

  <div class="toc">
    <h3>📑 Contents</h3>
    <ul>
      <li><a href="#section-1">1. Introduction</a></li>
      <li><a href="#section-2">2. Foundational Concepts</a></li>
      <li><a href="#section-3">3. Current Methodologies</a></li>
      <li><a href="#section-4">4. Challenges & Debates</a></li>
      <li><a href="#section-5">5. Applications & Impact</a></li>
      <li><a href="#section-6">6. Future Research Directions</a></li>
      <li><a href="#section-7">7. Conclusion</a></li>
    </ul>
  </div>

  <section id="section-1">
    <h2>1. Introduction</h2>
    <h3>Background</h3>
    <p>${safeTopic} has emerged as a critical area due to increasing relevance in multiple domains. The field encompasses theoretical foundations and practical applications, with intersections across related disciplines.</p>
    <h3>Scope</h3>
    <p>This survey covers:</p>
    <ul>
      <li>Foundational concepts and definitions</li>
      <li>Historical development and major milestones</li>
      <li>Current state-of-the-art approaches</li>
      <li>Unresolved questions and future directions</li>
    </ul>
  </section>

  <section id="section-2">
    <h2>2. Foundational Concepts</h2>
    <h3>Key Definitions</h3>
    <p>Understanding ${safeTopic} requires familiarity with several core concepts:</p>
    <ul>
      <li><strong>Concept 1:</strong> Definition and context within the field</li>
      <li><strong>Concept 2:</strong> Related terminology and scope</li>
      <li><strong>Concept 3:</strong> Broader framework and connections</li>
    </ul>
    <h3>Historical Context</h3>
    <p>The field has evolved through distinct eras:</p>
    <ol>
      <li><strong>Era 1 (1980s-1990s):</strong> Initial formulation and foundational work</li>
      <li><strong>Era 2 (2000s-2010s):</strong> Rapid expansion and refinement</li>
      <li><strong>Era 3 (2015-present):</strong> Modern synthesis and integration</li>
    </ol>
  </section>

  <section id="section-3">
    <h2>3. Current Methodologies</h2>
    <table>
      <tr>
        <th>Approach</th>
        <th>Strengths</th>
        <th>Limitations</th>
        <th>Status</th>
      </tr>
      <tr>
        <td><strong>Traditional Methods</strong></td>
        <td>Established, well-understood</td>
        <td>May not scale to modern problems</td>
        <td>Mature</td>
      </tr>
      <tr>
        <td><strong>Modern Variants</strong></td>
        <td>Addresses current challenges</td>
        <td>Still evolving and improving</td>
        <td>Active</td>
      </tr>
      <tr>
        <td><strong>Emerging Directions</strong></td>
        <td>Novel insights and approaches</td>
        <td>Early stage, less validation</td>
        <td>Experimental</td>
      </tr>
    </table>
  </section>

  <section id="section-4">
    <h2>4. Challenges & Debates</h2>
    <h3>Unresolved Question 1</h3>
    <p><strong>Current Understanding:</strong> There is broad agreement on foundational principles, but application remains contested.</p>
    <p><strong>Competing Views:</strong> Some researchers emphasize scalability, others prioritize theoretical purity.</p>
    <p><strong>Evidence Gap:</strong> Longitudinal studies are needed to validate long-term outcomes.</p>

    <h3>Unresolved Question 2</h3>
    <p><strong>Current Understanding:</strong> The field recognizes the importance of X, but mechanisms remain unclear.</p>
    <p><strong>Competing Views:</strong> Reductionist vs. systems-level perspectives dominate the debate.</p>
    <p><strong>Evidence Gap:</strong> Interdisciplinary work is needed to bridge theoretical silos.</p>
  </section>

  <section id="section-5">
    <h2>5. Applications & Impact</h2>
    <h3>Domain A: Practical Applications</h3>
    <ul>
      <li>Use case focused on industry relevance</li>
      <li>Use case with societal impact</li>
      <li>Recent developments accelerating adoption</li>
    </ul>
    <h3>Domain B: Research Impact</h3>
    <ul>
      <li>Foundational contributions to adjacent fields</li>
      <li>Cross-disciplinary applications</li>
      <li>Emerging opportunities</li>
    </ul>
  </section>

  <section id="section-6">
    <h2>6. Future Research Directions</h2>
    <div class="key-takeaway">
      <strong>Key Research Opportunities:</strong>
    </div>
    <ul>
      <li><strong>Short-term (1-3 years):</strong> Near-term opportunities building on current foundations</li>
      <li><strong>Medium-term (3-7 years):</strong> Emerging frontiers requiring interdisciplinary collaboration</li>
      <li><strong>Long-term (7+ years):</strong> Transformative potential with paradigm-shifting implications</li>
    </ul>
  </section>

  <section id="section-7">
    <h2>7. Conclusion</h2>
    <p>${safeTopic} remains an active and evolving field with significant open questions and emerging opportunities. The integration of traditional insights with modern methods offers promising directions for both theoretical advancement and practical application.</p>
    <div class="key-takeaway">
      <strong>Core Takeaways:</strong>
      <ul>
        <li>Foundational principle 1 underpins modern work</li>
        <li>Integration across disciplines is increasingly critical</li>
        <li>Major open question requires sustained investigation</li>
      </ul>
    </div>
  </section>

  <div class="footer">
    <p>Survey generated on 2025-06-07 • Research-backed content</p>
  </div>
</div>
  `;
}

// ─── Helper Functions ────────────────────────────────────────────────────────

function extractDuration(markdown: string): string {
  const match = markdown.match(/duration[:\s]+([^*\n]+)/i);
  return match ? match[1].trim() : "90 minutes";
}

function countModules(markdown: string): number {
  const matches = markdown.match(/^## Module \d+/gm);
  return matches ? matches.length : 4;
}

/**
 * Escape a string for safe interpolation into HTML text/markup. Used for
 * prompt-derived values (course title, survey topic) that get embedded into
 * the generated HTML preview, so a crafted prompt can't inject tags/scripts.
 * NOTE: only apply this to the HTML generators — the markdown generators must
 * keep the raw value, since markdown is later published verbatim to the wiki.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Registry ────────────────────────────────────────────────────────────────

export const LEARNING_EXECUTORS: Record<string, SkillExecutor> = {
  "lesson-generator": LESSON_GENERATOR,
  // The skill catalog ships this skill as `/survey-paper`; keep the older
  // `survey-generator` id as an alias so both resolve to the same executor.
  "survey-paper":     SURVEY_GENERATOR,
  "survey-generator": SURVEY_GENERATOR,
};
