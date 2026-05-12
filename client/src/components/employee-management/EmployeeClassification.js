import React, { useState } from "react";
import "./EmployeeClassification.css";

const EmployeeClassification = () => {
  const [employees, setEmployees] = useState([
    {
      id: "EMP001",
      name: "John Doe",
      department: "Engineering",
      role: "Senior Developer",
      category: "Technical",
      level: "Senior",
      skills: ["JavaScript", "React", "Node.js"],
      projects: ["Project A", "Project B"],
    },
    {
      id: "EMP002",
      name: "Jane Smith",
      department: "HR",
      role: "HR Manager",
      category: "Administrative",
      level: "Manager",
      skills: ["Recruitment", "Employee Relations", "HR Policies"],
      projects: ["HR System Implementation"],
    },
  ]);

  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);

  const departments = ["Engineering", "HR", "Finance", "Marketing"];
  const categories = ["Technical", "Administrative", "Management", "Support"];
  const levels = ["Junior", "Mid-level", "Senior", "Manager", "Director"];

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

  const handleSkillAdd = (employeeId, skill) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, skills: [...emp.skills, skill] }
          : emp,
      ),
    );
    setNotification({
      type: "success",
      message: "Skill added successfully!",
    });
  };

  const handleProjectAdd = (employeeId, project) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === employeeId
          ? { ...emp, projects: [...emp.projects, project] }
          : emp,
      ),
    );

    setNotification({
      type: "success",
      message: "Project added successfully!",
    });
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment =
      selectedDepartment === "all" ||
      employee.department === selectedDepartment;
    const matchesCategory =
      selectedCategory === "all" || employee.category === selectedCategory;
    const matchesLevel =
      selectedLevel === "all" || employee.level === selectedLevel;
    const matchesSearch = Object.values(employee).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
              {categories.map((cat) => (
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
              {levels.map((level) => (
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
        <div className="employees-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="employee-card">
              <div className="employee-header">
                <h3>{employee.name}</h3>
                <span className={`level-badge ${employee.level.toLowerCase()}`}>
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
                  <label>Category</label>
                  <p>{employee.category}</p>
                </div>
              </div>
              <div className="skills-section">
                <h4>Skills</h4>
                <div className="skills-list">
                  {employee.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="add-skill">
                  <input
                    type="text"
                    placeholder="Add skill..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.target.value) {
                        handleSkillAdd(employee.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
              <div className="projects-section">
                <h4>Projects</h4>
                <div className="projects-list">
                  {employee.projects.map((project, index) => (
                    <span key={index} className="project-tag">
                      {project}
                    </span>
                  ))}
                </div>
                <div className="add-project">
                  <input
                    type="text"
                    placeholder="Add project..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && e.target.value) {
                        handleProjectAdd(employee.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeClassification;
