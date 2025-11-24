/**
 * Generate HTML email template for payslip
 * @param {Object} payslipData - Payslip data object
 * @returns {String} HTML email content
 */
const generatePayslipEmail = (payslipData) => {
    const {
        employeeName,
        employeeId,
        position,
        month,
        salaryDetails
    } = payslipData;

    // Format month for display (e.g., "2024-03" -> "March 2024")
    const monthDate = new Date(month + '-01');
    const monthName = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const totalDeductions = salaryDetails.deductions.total ||
        (salaryDetails.deductions.tax + salaryDetails.deductions.insurance + salaryDetails.deductions.other);

    const totalEarnings = salaryDetails.baseSalary +
        (salaryDetails.overtime || 0) +
        (salaryDetails.bonuses || 0);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payslip - ${monthName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 700px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      color: white;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    .header p {
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px;
    }
    .employee-info {
      background-color: #f8f9fa;
      border-left: 4px solid #4a90e2;
      padding: 20px;
      margin-bottom: 30px;
      border-radius: 4px;
    }
    .employee-info h2 {
      font-size: 20px;
      color: #2c3e50;
      margin-bottom: 15px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #495057;
    }
    .info-value {
      color: #2c3e50;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h3 {
      font-size: 18px;
      color: #2c3e50;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e9ecef;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table tr {
      border-bottom: 1px solid #e9ecef;
    }
    table tr:last-child {
      border-bottom: none;
    }
    table td {
      padding: 12px 0;
    }
    table td:first-child {
      color: #495057;
      font-weight: 500;
    }
    table td:last-child {
      text-align: right;
      color: #2c3e50;
      font-weight: 600;
    }
    .deduction {
      color: #dc3545 !important;
    }
    .total-row {
      background-color: #f8f9fa;
      padding: 15px !important;
      margin-top: 10px;
      border-radius: 4px;
      font-size: 16px;
    }
    .total-row td {
      padding: 0 !important;
    }
    .net-salary {
      background: linear-gradient(135deg, #28a745 0%, #20873a 100%);
      color: white !important;
      padding: 20px !important;
      border-radius: 8px;
      margin-top: 20px;
    }
    .net-salary td {
      color: white !important;
      font-size: 18px;
      padding: 0 !important;
    }
    .net-salary .amount {
      font-size: 24px;
      font-weight: 700;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 25px 40px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .footer p {
      margin-bottom: 8px;
    }
    .footer a {
      color: #4a90e2;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 20px;
      }
      .header {
        padding: 20px;
      }
      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>PAYSLIP</h1>
      <p>${monthName}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Employee Information -->
      <div class="employee-info">
        <h2>Employee Information</h2>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${employeeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Employee ID:</span>
          <span class="info-value">${employeeId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Position:</span>
          <span class="info-value">${position}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Pay Period:</span>
          <span class="info-value">${monthName}</span>
        </div>
      </div>

      <!-- Earnings -->
      <div class="section">
        <h3>Earnings</h3>
        <table>
          <tr>
            <td>Base Salary</td>
            <td>$${salaryDetails.baseSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          ${salaryDetails.totalHours ? `
          <tr>
            <td>Total Hours (${salaryDetails.totalHours.toFixed(1)}h @ $${salaryDetails.hourlyRate?.toFixed(2)}/hr)</td>
            <td>$${(salaryDetails.totalHours * (salaryDetails.hourlyRate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${salaryDetails.overtime > 0 ? `
          <tr>
            <td>Overtime</td>
            <td>$${salaryDetails.overtime.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${salaryDetails.bonuses > 0 ? `
          <tr>
            <td>Bonuses</td>
            <td>$${salaryDetails.bonuses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td><strong>Total Earnings</strong></td>
            <td><strong>$${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Deductions -->
      ${totalDeductions > 0 ? `
      <div class="section">
        <h3>Deductions</h3>
        <table>
          ${salaryDetails.deductions.tax > 0 ? `
          <tr>
            <td>Tax</td>
            <td class="deduction">-$${salaryDetails.deductions.tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${salaryDetails.deductions.insurance > 0 ? `
          <tr>
            <td>Insurance</td>
            <td class="deduction">-$${salaryDetails.deductions.insurance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          ${salaryDetails.deductions.other > 0 ? `
          <tr>
            <td>Other Deductions</td>
            <td class="deduction">-$${salaryDetails.deductions.other.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>` : ''}
          <tr class="total-row">
            <td><strong>Total Deductions</strong></td>
            <td class="deduction"><strong>-$${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
          </tr>
        </table>
      </div>` : ''}

      <!-- Net Salary -->
      <table>
        <tr class="net-salary">
          <td><strong>NET SALARY</strong></td>
          <td class="amount">$${salaryDetails.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>This is a system-generated payslip.</strong></p>
      <p>If you have any questions regarding your payslip, please contact HR at <a href="mailto:hr@company.com">hr@company.com</a></p>
      <p>&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = { generatePayslipEmail };
