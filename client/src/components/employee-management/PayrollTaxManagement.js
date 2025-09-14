import React, { useState } from 'react';
import './PayrollTaxManagement.css';

const PayrollTaxManagement = () => {
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'John Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 80000,
      taxInfo: {
        taxId: 'TAX123456',
        taxCategory: 'Standard',
        exemptions: 2,
        additionalDeductions: 0
      },
      payrollInfo: {
        paymentMethod: 'Direct Deposit',
        bankAccount: '****1234',
        paymentFrequency: 'Monthly',
        lastPayment: '2024-02-28',
        nextPayment: '2024-03-31'
      }
    },
    {
      id: 'EMP002',
      name: 'Jane Smith',
      department: 'HR',
      position: 'HR Manager',
      salary: 90000,
      taxInfo: {
        taxId: 'TAX789012',
        taxCategory: 'Standard',
        exemptions: 1,
        additionalDeductions: 500
      },
      payrollInfo: {
        paymentMethod: 'Direct Deposit',
        bankAccount: '****5678',
        paymentFrequency: 'Monthly',
        lastPayment: '2024-02-28',
        nextPayment: '2024-03-31'
      }
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [showTaxCalculator, setShowTaxCalculator] = useState(false);
  const [taxCalculation, setTaxCalculation] = useState({
    grossSalary: 0,
    taxDeductions: 0,
    netSalary: 0,
    taxBreakdown: {}
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setShowTaxCalculator(false);
  };

  const handleTaxInfoUpdate = (employeeId, field, value) => {
    setEmployees(prev =>
      prev.map(emp =>
        emp.id === employeeId
          ? {
              ...emp,
              taxInfo: {
                ...emp.taxInfo,
                [field]: value
              }
            }
          : emp
      )
    );
    setNotification({
      type: 'success',
      message: 'Tax information updated successfully!'
    });
  };

  const calculateTax = (employee) => {
    const grossSalary = employee.salary;
    const taxRate = 0.2; // 20% tax rate (simplified)
    const taxDeductions = grossSalary * taxRate;
    const netSalary = grossSalary - taxDeductions;

    const taxBreakdown = {
      federalTax: taxDeductions * 0.7, // 70% of total tax
      stateTax: taxDeductions * 0.2, // 20% of total tax
      localTax: taxDeductions * 0.1 // 10% of total tax
    };

    setTaxCalculation({
      grossSalary,
      taxDeductions,
      netSalary,
      taxBreakdown
    });
    setShowTaxCalculator(true);
  };

  const filteredEmployees = employees.filter(employee =>
    Object.values(employee).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
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
              {filteredEmployees.map(employee => (
                <tr
                  key={employee.id}
                  className={selectedEmployee?.id === employee.id ? 'selected' : ''}
                  onClick={() => handleEmployeeSelect(employee)}
                >
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.department}</td>
                  <td>{employee.position}</td>
                  <td>${employee.salary.toLocaleString()}</td>
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
                    onChange={(e) => handleTaxInfoUpdate(selectedEmployee.id, 'taxId', e.target.value)}
                  />
                </div>
                <div className="info-item">
                  <label>Tax Category</label>
                  <select
                    value={selectedEmployee.taxInfo.taxCategory}
                    onChange={(e) => handleTaxInfoUpdate(selectedEmployee.id, 'taxCategory', e.target.value)}
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
                    onChange={(e) => handleTaxInfoUpdate(selectedEmployee.id, 'exemptions', parseInt(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="info-item">
                  <label>Additional Deductions</label>
                  <input
                    type="number"
                    value={selectedEmployee.taxInfo.additionalDeductions}
                    onChange={(e) => handleTaxInfoUpdate(selectedEmployee.id, 'additionalDeductions', parseInt(e.target.value))}
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
                  <p>${taxCalculation.taxBreakdown.federalTax.toLocaleString()}</p>
                </div>
                <div className="breakdown-item">
                  <label>State Tax</label>
                  <p>${taxCalculation.taxBreakdown.stateTax.toLocaleString()}</p>
                </div>
                <div className="breakdown-item">
                  <label>Local Tax</label>
                  <p>${taxCalculation.taxBreakdown.localTax.toLocaleString()}</p>
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