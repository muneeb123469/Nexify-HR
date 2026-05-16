import React, { useMemo, useState } from "react";
import "./PayrollTaxManagement.css";

const EMPLOYEE_STORAGE_KEY = "nexify_hr_employee_records";
const OFFER_STORAGE_KEY = "nexify_hr_offer_letters";

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

const parseSalaryValue = (salary) => {
  if (typeof salary === "number") return Number.isFinite(salary) ? salary : 0;
  const match = String(salary || "").replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
};

const findOfferForEmployee = (employee, offers) =>
  offers.find((offer) =>
    (employee.sourceApplicationId && offer.applicationId === employee.sourceApplicationId) ||
    (employee.email && offer.email === employee.email) ||
    (employee.sourceOfferId && offer.id === employee.sourceOfferId)
  );

const buildPayrollRows = () => {
  const employeeRecords = readStorageArray(EMPLOYEE_STORAGE_KEY);
  const offers = readStorageArray(OFFER_STORAGE_KEY);

  return employeeRecords.map((employee) => {
    const offer = findOfferForEmployee(employee, offers);
    const salarySource = offer?.offerDetails?.salary || employee.salary || employee.basicSalary || "";
    const salary = parseSalaryValue(salarySource);
    const id = employee.id || `EMP-${employee.email || employee.name || "UNKNOWN"}`;

    return {
      id,
      name: employee.name || "Unknown Employee",
      department: employee.department || "Pending Assignment",
      position: employee.role || offer?.position || "Unassigned Role",
      salary,
      salaryDisplay: salarySource ? String(salarySource) : "Not Set",
      taxInfo: {
        taxId: employee.taxId || `TAX-${id}`,
        taxCategory: employee.taxCategory || "Standard",
        exemptions: employee.exemptions || 0,
        additionalDeductions: employee.additionalDeductions || 0,
      },
      payrollInfo: {
        paymentMethod: "Local Demo",
        bankAccount: "Not configured",
        paymentFrequency: "Monthly",
        lastPayment: "Not recorded",
        nextPayment: "Not scheduled",
      },
    };
  });
};

const PayrollTaxManagement = () => {
  const [employees, setEmployees] = useState(buildPayrollRows);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState(null);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState({
    grossSalary: 0,
    taxDeductions: 0,
    netSalary: 0,
    taxBreakdown: {},
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleTaxInfoUpdate = (employeeId, field, value) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === employeeId
        ? {
            ...emp,
            taxInfo: {
              ...emp.taxInfo,
              [field]: value,
            },
          }
        : emp,
    );

    setEmployees(updatedEmployees);
    setSelectedEmployee(updatedEmployees.find((employee) => employee.id === employeeId));
    setNotification({
      type: "success",
      message: "Tax information updated locally.",
    });
  };

  const calculateTax = (employee) => {
    const grossSalary = Number(employee.salary || 0);
    const taxRate = 0.2;
    const taxDeductions = grossSalary * taxRate;
    const netSalary = grossSalary - taxDeductions;

    const taxBreakdown = {
      federalTax: taxDeductions * 0.7,
      stateTax: taxDeductions * 0.2,
      localTax: taxDeductions * 0.1,
    };

    setTaxCalculation({
      grossSalary,
      taxDeductions,
      netSalary,
      taxBreakdown,
    });
    setShowTaxCalculator(true);
    setSelectedEmployee(employee);
    setNotification({
      type: grossSalary ? "success" : "info",
      message: grossSalary
        ? "Tax calculation completed for local demo data."
        : "Salary is not set, so tax calculation is shown as 0.",
    });
  };

  const filteredEmployees = useMemo(
    () =>
      employees.filter((employee) => {
        const searchableText = [
          employee.id,
          employee.name,
          employee.department,
          employee.position,
          employee.salaryDisplay,
          employee.taxInfo.taxId,
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm.toLowerCase());
      }),
    [employees, searchTerm],
  );

  return (
    <div className="payroll-tax-management">
      <div className="management-header">
        <h1>Payroll & Tax Management</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="management-content">
        <div className="employees-list">
          {employees.length === 0 ? (
            <div className="empty-state">
              No employee records found. Sync employees from prepared offers first.
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="empty-state">
              No payroll tax rows match your search.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Salary</th>
                  <th>Tax ID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className={
                      selectedEmployee?.id === employee.id ? "selected" : ""
                    }
                    onClick={() => handleEmployeeSelect(employee)}
                  >
                    <td>{employee.id}</td>
                    <td>{employee.name}</td>
                    <td>{employee.department}</td>
                    <td>{employee.position}</td>
                    <td>{employee.salaryDisplay}</td>
                    <td>{employee.taxInfo.taxId}</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          calculateTax(employee);
                        }}
                        className="calculate-button"
                      >
                        Calculate Tax
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedEmployee && (
          <div className="employee-details">
            <div className="details-section">
              <h3>Tax Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Tax ID</label>
                  <input
                    type="text"
                    value={selectedEmployee.taxInfo.taxId}
                    onChange={(e) =>
                      handleTaxInfoUpdate(
                        selectedEmployee.id,
                        "taxId",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="info-item">
                  <label>Tax Category</label>
                  <select
                    value={selectedEmployee.taxInfo.taxCategory}
                    onChange={(e) =>
                      handleTaxInfoUpdate(
                        selectedEmployee.id,
                        "taxCategory",
                        e.target.value,
                      )
                    }
                  >
                    <option value="Standard">Standard</option>
                    <option value="Senior">Senior</option>
                    <option value="Special">Special</option>
                  </select>
                </div>
                <div className="info-item">
                  <label>Exemptions</label>
                  <input
                    type="number"
                    value={selectedEmployee.taxInfo.exemptions}
                    onChange={(e) =>
                      handleTaxInfoUpdate(
                        selectedEmployee.id,
                        "exemptions",
                        Number(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className="info-item">
                  <label>Additional Deductions</label>
                  <input
                    type="number"
                    value={selectedEmployee.taxInfo.additionalDeductions}
                    onChange={(e) =>
                      handleTaxInfoUpdate(
                        selectedEmployee.id,
                        "additionalDeductions",
                        Number(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="details-section">
              <h3>Payroll Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Payment Method</label>
                  <p>{selectedEmployee.payrollInfo.paymentMethod}</p>
                </div>
                <div className="info-item">
                  <label>Bank Account</label>
                  <p>{selectedEmployee.payrollInfo.bankAccount}</p>
                </div>
                <div className="info-item">
                  <label>Payment Frequency</label>
                  <p>{selectedEmployee.payrollInfo.paymentFrequency}</p>
                </div>
                <div className="info-item">
                  <label>Last Payment</label>
                  <p>{selectedEmployee.payrollInfo.lastPayment}</p>
                </div>
                <div className="info-item">
                  <label>Next Payment</label>
                  <p>{selectedEmployee.payrollInfo.nextPayment}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTaxCalculator && (
          <div className="tax-calculator">
            <h3>Tax Calculation</h3>
            <div className="calculation-grid">
              <div className="calculation-item">
                <label>Gross Salary</label>
                <p>${taxCalculation.grossSalary.toLocaleString()}</p>
              </div>
              <div className="calculation-item">
                <label>Total Tax Deductions</label>
                <p>${taxCalculation.taxDeductions.toLocaleString()}</p>
              </div>
              <div className="calculation-item">
                <label>Net Salary</label>
                <p>${taxCalculation.netSalary.toLocaleString()}</p>
              </div>
            </div>
            <div className="tax-breakdown">
              <h4>Tax Breakdown</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item">
                  <label>Federal Tax</label>
                  <p>
                    ${(taxCalculation.taxBreakdown.federalTax || 0).toLocaleString()}
                  </p>
                </div>
                <div className="breakdown-item">
                  <label>State Tax</label>
                  <p>
                    ${(taxCalculation.taxBreakdown.stateTax || 0).toLocaleString()}
                  </p>
                </div>
                <div className="breakdown-item">
                  <label>Local Tax</label>
                  <p>
                    ${(taxCalculation.taxBreakdown.localTax || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollTaxManagement;
