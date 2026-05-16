import React, { useMemo, useState } from "react";
import "./EmployeeDatabaseManagement.css";

const EMPLOYEE_STORAGE_KEY = "nexify_hr_employee_records";
const OFFER_STORAGE_KEY = "nexify_hr_offer_letters";

const emptyEmployee = {
  name: "",
  department: "",
  role: "",
  email: "",
  phone: "",
  status: "Active",
};

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

const saveEmployees = (records) => {
  localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(records));
};

const createEmployeeId = (records) => {
  const highestNumber = records.reduce((highest, employee) => {
    const numericId = Number(String(employee.id || "").replace("EMP", ""));
    return Number.isFinite(numericId) ? Math.max(highest, numericId) : highest;
  }, 0);

  return `EMP${String(highestNumber + 1).padStart(3, "0")}`;
};

const getTimestamp = () => new Date().toISOString();

const EmployeeDatabaseManagement = () => {
  const [employees, setEmployees] = useState(() =>
    readStorageArray(EMPLOYEE_STORAGE_KEY),
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [notification, setNotification] = useState(null);

  const [newEmployee, setNewEmployee] = useState(emptyEmployee);

  const preparedOffers = readStorageArray(OFFER_STORAGE_KEY);
  const importableOffers = useMemo(
    () =>
      preparedOffers.filter(
        (offer) =>
          !employees.some(
            (employee) =>
              employee.sourceOfferId === offer.id ||
              employee.sourceApplicationId === offer.applicationId ||
              (offer.email && employee.email === offer.email),
          ),
      ),
    [employees, preparedOffers],
  );

  const updateEmployees = (records) => {
    setEmployees(records);
    saveEmployees(records);
  };

  const resetForm = () => {
    setNewEmployee(emptyEmployee);
    setSelectedEmployee(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEmployee = () => {
    resetForm();
    setShowAddForm(true);
    setShowEditForm(false);
    setShowAuditLogs(false);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      name: employee.name || "",
      department: employee.department || "",
      role: employee.role || "",
      email: employee.email || "",
      phone: employee.phone || "",
      status: employee.status || "Active",
    });
    setShowEditForm(true);
    setShowAddForm(false);
    setShowAuditLogs(false);
  };

  const handleViewAuditLogs = (employee) => {
    setSelectedEmployee(employee);
    setShowAuditLogs(true);
    setShowAddForm(false);
    setShowEditForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImportPreparedOffers = () => {
    if (importableOffers.length === 0) {
      const hasPreparedOffers = preparedOffers.length > 0;

      setNotification({
        type: "info",
        message: hasPreparedOffers
          ? "All prepared offers have already been synced to employee records."
          : "No prepared offers found. Prepare an offer letter for a hired candidate first.",
      });
      return;
    }

    const timestamp = getTimestamp();
    let nextEmployees = [...employees];
    const importedEmployees = importableOffers.map((offer) => {
      const employee = {
        id: createEmployeeId(nextEmployees),
        name: offer.candidateName || "Unknown Applicant",
        department: "Pending Assignment",
        role: offer.position || "Unknown Role",
        email: offer.email || "",
        phone: offer.phone || "",
        status: "Onboarding",
        createdAt: timestamp,
        lastModified: timestamp,
        modifiedBy: "HR User",
        sourceApplicationId: offer.applicationId || "",
        sourceOfferId: offer.id || "",
        source: "Prepared Offer",
      };
      nextEmployees = [...nextEmployees, employee];
      return employee;
    });

    updateEmployees([...employees, ...importedEmployees]);
    setNotification({
      type: "success",
      message: `${importedEmployees.length} hired candidate record(s) imported.`,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const timestamp = getTimestamp();
    const employeeToAdd = {
      ...newEmployee,
      id: createEmployeeId(employees),
      createdAt: timestamp,
      lastModified: timestamp,
      modifiedBy: "HR User",
      sourceApplicationId: "",
      sourceOfferId: "",
      source: "Manual Entry",
    };

    updateEmployees([...employees, employeeToAdd]);
    setShowAddForm(false);
    resetForm();
    setNotification({
      type: "success",
      message: "Employee added successfully!",
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const timestamp = getTimestamp();
    const updatedEmployees = employees.map((emp) =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            ...newEmployee,
            lastModified: timestamp,
            modifiedBy: "HR User",
          }
        : emp,
    );

    updateEmployees(updatedEmployees);
    setShowEditForm(false);
    resetForm();
    setNotification({
      type: "success",
      message: "Employee updated successfully!",
    });
  };

  const filteredEmployees = employees.filter((employee) =>
    Object.values(employee).some((value) =>
      String(value || "").toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <div className="employee-database-management">
      <div className="database-header">
        <h1>Employee Database Management</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button onClick={handleImportPreparedOffers} className="sync-button">
            Sync From Prepared Offers
          </button>
          <button onClick={handleAddEmployee} className="add-button">
            Add New Employee
          </button>
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="database-content">
        <div className="employees-list">
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">
              {employees.length === 0
                ? "No employee records found. Add an employee or prepare an offer letter for a hired candidate."
                : "No employee records match your search."}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Modified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.department}</td>
                    <td>{employee.role}</td>
                    <td>
                      <span
                        className={`status-badge ${employee.status.toLowerCase()}`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td>{new Date(employee.lastModified).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewAuditLogs(employee)}
                          className="audit-button"
                        >
                          Audit Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showAddForm && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Add New Employee</h2>
              <form onSubmit={handleSubmit}>
                <EmployeeFormFields
                  employee={newEmployee}
                  onChange={handleInputChange}
                />
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Add Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditForm && selectedEmployee && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Edit Employee</h2>
              <form onSubmit={handleUpdate}>
                <EmployeeFormFields
                  employee={newEmployee}
                  onChange={handleInputChange}
                />
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Update Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAuditLogs && selectedEmployee && (
          <div className="form-overlay">
            <div className="form-container">
              <h2>Audit Logs - {selectedEmployee.name}</h2>
              <div className="audit-logs">
                <div className="log-entry">
                  <p>
                    <strong>Created:</strong>{" "}
                    {selectedEmployee.createdAt
                      ? new Date(selectedEmployee.createdAt).toLocaleString()
                      : "Not recorded"}
                  </p>
                  <p>
                    <strong>Last Modified:</strong>{" "}
                    {selectedEmployee.lastModified
                      ? new Date(selectedEmployee.lastModified).toLocaleString()
                      : "Not recorded"}
                  </p>
                  <p>
                    <strong>Modified By:</strong> {selectedEmployee.modifiedBy}
                  </p>
                  <p>
                    <strong>Source:</strong>{" "}
                    {selectedEmployee.source || "Manual Entry"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="close-button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmployeeFormFields = ({ employee, onChange }) => (
  <>
    <div className="form-group">
      <label>Name</label>
      <input
        type="text"
        name="name"
        value={employee.name}
        onChange={onChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Department</label>
      <select
        name="department"
        value={employee.department}
        onChange={onChange}
        required
      >
        <option value="">Select Department</option>
        <option value="Pending Assignment">Pending Assignment</option>
        <option value="Engineering">Engineering</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Marketing">Marketing</option>
      </select>
    </div>
    <div className="form-group">
      <label>Role</label>
      <input
        type="text"
        name="role"
        value={employee.role}
        onChange={onChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Email</label>
      <input
        type="email"
        name="email"
        value={employee.email}
        onChange={onChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Phone</label>
      <input
        type="tel"
        name="phone"
        value={employee.phone}
        onChange={onChange}
        required
      />
    </div>
    <div className="form-group">
      <label>Status</label>
      <select
        name="status"
        value={employee.status}
        onChange={onChange}
        required
      >
        <option value="Active">Active</option>
        <option value="Onboarding">Onboarding</option>
        <option value="Inactive">Inactive</option>
      </select>
    </div>
  </>
);

export default EmployeeDatabaseManagement;
