

#  **OPTIMUS: University Timetable Visualization & Analytics Engine**

> **A modern, generalized timetable intelligence system for universities, faculty, and administrators.**
> Upload CSVs → Visualize → Detect conflicts → Schedule meetings → Explore insights.

---

## 📖 **Overview**

**OPTIMUS** is a fully client-side React application that transforms raw, messy university timetable CSV files into a powerful, interactive analytics dashboard.

It helps **professors**, **students**, **timetable creators**, and **administrators** understand:

* Who teaches what
* When & where classes happen
* How rooms are utilized
* Which instructors are overloaded
* How to detect class conflicts
* When faculty are jointly free for meetings

OPTIMUS works directly in the browser using **LocalStorage**, ensuring privacy with **zero backend** and **zero data upload**.

---

## ✨ **Key Features**

###  1. Intelligent Data Ingestion

* **Drag & Drop multiple CSV files**
* **Fuzzy header recognition** (handles inconsistent column names)
* **Auto-semester detection** from filenames
* **Smart academic-time parsing** like:

  * `M W F 2`
  * `T TH 10`
  * `MonWedFri 08:00-08:50`

OPTIMUS standardizes these into machine-readable slots.

---

### 🕸️ 2. Interactive Data Explorer

Visualize the entire academic structure:

* **Sankey/Flow Graph:**
  `Instructor → Course → Room`
* **Campus Heatmap:**
  See busiest/quietest times of the week.
* **Powerful Search:**
  Filter by instructor, department, room, slot, semester — instantly.

---

### 📅 3. Meeting Scheduler & Conflict Solver

* Pick multiple professors to find **common free time**.
* Preview combined weekly availability.
* Save custom **groups** like:

  * Thesis Committee
  * Lab Instructors
  * Faculty Team
* Export free slots to CSV / calendar format.

---

### 💾 4. Local Persistence

* Dataset saved automatically via **LocalStorage**
* Reload data after refresh
* File Manager to delete or swap dataset versions

---

## 🛠️ **Tech Stack**

| Layer              | Technology                     |
| ------------------ | ------------------------------ |
| UI Framework       | React 18 + Vite                |
| Styling            | Tailwind CSS (Dark mode ready) |
| Data Ingestion     | PapaParse                      |
| Time Parsing       | Custom Regex + Logic Engine    |
| Charts             | Recharts                       |
| Relationship Graph | Custom SVG engine              |
| Icons              | Lucide React                   |

All processing occurs **client-side** for privacy and speed.

---

##  **Getting Started**

### **Prerequisites**

* Node.js (v16+)
* npm or yarn

### **Installation**

```bash
git clone https://github.com/GovindaJeswani/optimus-timetable.git
cd optimus-timetable
npm install
```

### **Run Development Server**

```bash
npm run dev
```

Then open:

```
http://localhost:5173
```

---


## 📂 **Data Format Guide**

OPTIMUS supports generic timetable formats. It fuzzy-matches common headers:

| Column               | Description      | Example                       |
| -------------------- | ---------------- | ----------------------------- |
| COM_CODE / COURSE_NO | Course ID        | `CS F111`                     |
| COURSE_TITLE         | Course Name      | `Data Structures`             |
| INSTRUCTORS          | Instructor Names | `A. Sharma, K. Verma`         |
| ROOM                 | Classroom/Lab    | `C401`                        |
| DAYS_H / TIME        | Timings          | `M W F 2`, `T TH 10`, `M 2 3` |

> ⚠️ The parser assumes periods start at **8:00 AM** (configurable in `parser.js`).

---

## 🧱 **Project Architecture**

```
src/
├── components/
│   ├── dashboard/
│   │   ├── ExplorerView.jsx       # Main analytics area
│   │   └── MeetingScheduler.jsx   # Multi-faculty scheduler
│   └── visualization/
│       ├── FlowChart.jsx          # Instructor→Course→Room graph
│       └── Heatmap.jsx            # Weekly room usage map
├── core/
│   └── engine/
│       ├── ingestor.js            # CSV → Normalized dataset
│       └── parser.js              # DAYS_H time parsing logic
├── App.jsx                        # App root + routing
└── index.css                      # Global styles

```

## 🚀 Deployed Application
[https://optimustimetable.vercel.app](https://optimus-timetable.vercel.app/)

## 🤝 **Contributing**

We welcome improvements!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Push and open a pull request

---

## 📄 **License**

MIT License — free to use and extend.

---

### ⭐ Built with passion to simplify academic timetabling.