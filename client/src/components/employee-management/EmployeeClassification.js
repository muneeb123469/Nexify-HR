import React, { useMemo, useState } from "react";
import "./EmployeeClassification.css";

const EMPLOYEE_STORAGE_KEY = "nexify_hr_employee_records";
const CLASSIFICATION_STORAGE_KEY = "nexify_hr_employee_classifications";

const CATEGORIES = [
  "Unclassified",
  "Technical",
  "Administrative",
  "Management",
  "Support",
];

const LEVELS = [
  "Unassigned",
  "Junior",
  "Mid-level",
  "Senior",
  "Manager",
  "Director",
];

const BASE_DEPARTMENTS = [
  "Pending Assignment",
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
];

const readStorageArray = (key) => {
  try {
    const storedValue = localStorage.getItem(key);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const saveClassifications = (classifications) => {
  localStorage.setItem(CLASSIFICATION_STORAGE_KEY, JSON.stringify(classifications));
};

const normalizeBadgeClass = (value = "") =>
  value.toLowerCase().replace(/\s+/g, "-");

const inferCategory = (employee) => {
  const department = (employee.department || "").toLowerCase();
  const role = (employee.role || "").toLowerCase();

  if (role.includes("manager") || role.includes("director") || role.includes("head")) {
    return "Management";
  }

  if (
    department.includes("engineering") ||
    role.includes("engineer") ||
    role.includes("developer") ||
    role.includes("technical")
  ) {
    return "Technical";
  }

  if (
    department.includes("hr") ||
    department.includes("finance") ||
    role.includes("recruit") ||
    role.includes("admin") ||
    role.includes("account")
  ) {
    return "Administrative";
  }

  if (department.includes("support") || role.includes("support")) {
    return "Support";
  }

  return "Unclassified";
};

const EmployeeClassification = () => {
  const [employeeRecords] = useState(() => readStorageArray(EMPLOYEE_STORAGE_KEY));
  const [classifications, setClassifications] = useState(() =>
    readStorageArray(CLASSIFICATION_STORAGE_KEY),
  );
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [skillDrafts, setSkillDrafts] = useState({});
  const [projectDrafts, setProjectDrafts] = useState({});

  const employees = useMemo(
    () =>
      employeeRecords.map((employee) => {
        const savedClassification = classifications.find(
          (classification) => classification.employeeId === employee.id,
        );

        return {
          id: employee.id,
          name: employee.name || "Unknown Employee",
          department: employee.department || "Pending Assignment",
          role: employee.role || "Unassigned Role",
          status: employee.status || "Active",
          category: savedClassification?.category || inferCategory(employee),
          level: savedClassification?.level || "Unassigned",
          skills: Array.isArray(savedClassification?.skills)
            ? savedClassification.skills
            : [],
          projects: Array.isArray(savedClassification?.projects)
            ? savedClassification.projects
            : [],
        };
      }),
    [employeeRecords, classifications],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set([
          ...BASE_DEPARTMENTS,
          ...employeeRecords
            .map((employee) => employee.department)
            .filter(Boolean),
        ]),
      ),
    [employeeRecords],
  );

  const persistClassification = (employeeId, updates) => {
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee) return;

    const existingClassification = classifications.find(
      (classification) => classification.employeeId === employeeId,
    );

    const nextClassification = {
      employeeId,
      category: employee.category,
      level: employee.level,
      skills: employee.skills,
      projects: employee.projects,
      ...existingClassification,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const nextClassifications = existingClassification
      ? classifications.map((classification) =>
          classification.employeeId === employeeId
            ? nextClassification
            : classification,
        )
      : [...classifications, nextClassification];

    setClassifications(nextClassifications);
    saveClassifications(nextClassifications);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSkillDraftChange = (employeeId, value) => {
    setSkillDrafts((prev) => ({
      ...prev,
      [employeeId]: value,
    }));
  };

  const handleProjectDraftChange = (employeeId, value) => {
    setProjectDrafts((prev) => ({
      ...prev,
      [employeeId]: value,
    }));
  };

  const handleEmployeeCategoryChange = (employeeId, category) => {
    persistClassification(employeeId, { category });
    setNotification({
      type: "success",
      message: "Category updated successfully!",
    });
  };

  const handleEmployeeLevelChange = (employeeId, level) => {
    persistClassification(employeeId, { level });
    setNotification({
      type: "success",
      message: "Level updated successfully!",
    });
  };

  const handleSkillAdd = (employeeId, skill) => {
    const employee = employees.find((item) => item.id === employeeId);
    const trimmedSkill = skill.trim();
    if (!employee || !trimmedSkill) return;

    persistClassification(employeeId, {
      skills: [...employee.skills, trimmedSkill],
    });
    setNotification({
      type: "success",
      message: "Skill added successfully!",
    });
    handleSkillDraftChange(employeeId, "");
  };

  const handleProjectAdd = (employeeId, project) => {
    const employee = employees.find((item) => item.id === employeeId);
    const trimmedProject = project.trim();
    if (!employee || !trimmedProject) return;

    persistClassification(employeeId, {
      projects: [...employee.projects, trimmedProject],
    });
    setNotification({
      type: "success",
      message: "Project added successfully!",
    });
    handleProjectDraftChange(employeeId, "");
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department === selectedDepartment;
    const matchesCategory =
      selectedCategory === "all" || employee.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || employee.level === selectedLevel;
    const searchableText = [
      employee.id,
      employee.name,
      employee.department,
      employee.role,
      employee.status,
      employee.category,
      employee.level,
      ...employee.skills,
      ...employee.projects,
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());

    return (
      matchesDepartment && matchesCategory && matchesLevel && matchesSearch
    );
  });

  return (
    <div className="employee-classification">
      <div className="classification-header">
        <h1>Employee Classification</h1>
        <div className="filters">
          <div className="filter-group">
            <label>Department</label>
            <select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Level</label>
            <select value={selectedLevel} onChange={handleLevelChange}>
              <option value="all">All Levels</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="search-group">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="classification-content">
        <div className="autosave-note">Changes save automatically.</div>
        {employeeRecords.length === 0 ? (
          <div className="empty-state">
            No employee records available. Add or sync employees from Employee Records first.
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            No employees match the selected filters.
          </div>
        ) : (
          <div className="employees-grid">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div className="employee-header">
                  <h3>{employee.name}</h3>
                  <span className={`level-badge ${normalizeBadgeClass(employee.level)}`}>
                    {employee.level}
                  </span>
                </div>
                <div className="employee-info">
                  <div className="info-item">
                    <label>Department</label>
                    <p>{employee.department}</p>
                  </div>
                  <div className="info-item">
                    <label>Role</label>
                    <p>{employee.role}</p>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <p>{employee.status}</p>
                  </div>
                </div>
                <div className="classification-controls">
                  <div className="classification-control">
                    <label>Category</label>
                    <select
                      value={employee.category}
                      onChange={(e) =>
                        handleEmployeeCategoryChange(employee.id, e.target.value)
                      }
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="classification-control">
                    <label>Level</label>
                    <select
                      value={employee.level}
                      onChange={(e) =>
                        handleEmployeeLevelChange(employee.id, e.target.value)
                      }
                    >
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="skills-section">
                  <h4>Skills</h4>
                  <div className="skills-list">
                    {employee.skills.map((skill, index) => (
                      <span key={`${skill}-${index}`} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="add-skill">
                    <input
                      type="text"
                      placeholder="Add skill..."
                      value={skillDrafts[employee.id] || ""}
                      onChange={(e) =>
                        handleSkillDraftChange(employee.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSkillAdd(employee.id, skillDrafts[employee.id] || "");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleSkillAdd(employee.id, skillDrafts[employee.id] || "")
                      }
                      disabled={!(skillDrafts[employee.id] || "").trim()}
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
                <div className="projects-section">
                  <h4>Projects</h4>
                  <div className="projects-list">
                    {employee.projects.map((project, index) => (
                      <span key={`${project}-${index}`} className="project-tag">
                        {project}
                      </span>
                    ))}
                  </div>
                  <div className="add-project">
                    <input
                      type="text"
                      placeholder="Add project..."
                      value={projectDrafts[employee.id] || ""}
                      onChange={(e) =>
                        handleProjectDraftChange(employee.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleProjectAdd(employee.id, projectDrafts[employee.id] || "");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleProjectAdd(employee.id, projectDrafts[employee.id] || "")
                      }
                      disabled={!(projectDrafts[employee.id] || "").trim()}
                    >
                      Add Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeClassification;
