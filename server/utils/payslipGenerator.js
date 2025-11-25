const PDFDocument = require('pdfkit');

/**
 * Generate a professional payslip PDF
 * @param {Object} payslipData - The payslip data containing employee and salary information
 * @returns {Promise<Buffer>} - PDF buffer
 */
async function generatePayslipPDF(payslipData) {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            // Buffer to store the PDF
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', reject);

            // Extract data
            const { employeeInfo, period, salaryDetails, workHours } = payslipData;

            // Company Header
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text('Nexify-HR', { align: 'center' });

            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#666666')
                .text('Payslip', { align: 'center' });

            doc.moveDown(1);

            // Period Information
            doc.fontSize(14)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text(`Pay Period: ${period.monthName} ${period.year}`, { align: 'center' });

            doc.moveDown(1.5);

            // Horizontal line
            doc.strokeColor('#4C9F9F')
                .lineWidth(2)
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .stroke();

            doc.moveDown(1);

            // Employee Information Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text('Employee Information', { underline: true });

            doc.moveDown(0.5);

            const leftColumn = 50;
            const rightColumn = 300;
            let currentY = doc.y;

            // Left column - employee details
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#333333')
                .text('Name:', leftColumn, currentY);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(employeeInfo.name, leftColumn + 80, currentY);

            currentY += 20;
            doc.font('Helvetica-Bold')
                .fillColor('#333333')
                .text('Employee ID:', leftColumn, currentY);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(employeeInfo.employeeId, leftColumn + 80, currentY);

            currentY += 20;
            doc.font('Helvetica-Bold')
                .fillColor('#333333')
                .text('Position:', leftColumn, currentY);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(employeeInfo.position, leftColumn + 80, currentY);

            // Right column
            currentY = doc.y - 40;
            doc.font('Helvetica-Bold')
                .fillColor('#333333')
                .text('Department:', rightColumn, currentY);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(employeeInfo.department, rightColumn + 80, currentY);

            currentY += 20;
            doc.font('Helvetica-Bold')
                .fillColor('#333333')
                .text('Email:', rightColumn, currentY);
            doc.font('Helvetica')
                .fillColor('#666666')
                .text(employeeInfo.email, rightColumn + 80, currentY, { width: 200 });

            doc.moveDown(3);

            // Work Hours Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text('Work Hours', { underline: true });

            doc.moveDown(0.5);

            currentY = doc.y;
            const hoursTableTop = currentY;

            // Table headers
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .rect(leftColumn, currentY, 495, 25)
                .fill('#4C9F9F');

            doc.fillColor('#FFFFFF')
                .text('Description', leftColumn + 10, currentY + 8, { width: 200 });
            doc.text('Hours', leftColumn + 400, currentY + 8, { width: 85, align: 'right' });

            currentY += 25;

            // Table rows
            const rows = [
                { label: 'Office Hours', value: workHours.attendanceHours?.toFixed(2) || '0.00' },
                { label: 'Remote Work Hours', value: workHours.remoteHours?.toFixed(2) || '0.00' },
                { label: 'Total Work Hours', value: workHours.totalHours?.toFixed(2) || '0.00', isBold: true }
            ];

            rows.forEach((row, index) => {
                const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
                doc.rect(leftColumn, currentY, 495, 25).fill(bgColor);

                const font = row.isBold ? 'Helvetica-Bold' : 'Helvetica';
                doc.font(font)
                    .fillColor('#333333')
                    .text(row.label, leftColumn + 10, currentY + 8, { width: 200 });
                doc.text(row.value, leftColumn + 400, currentY + 8, { width: 85, align: 'right' });

                currentY += 25;
            });

            doc.moveDown(2);

            // Salary Details Section
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text('Salary Details', { underline: true });

            doc.moveDown(0.5);

            currentY = doc.y;

            // Table headers
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .fillColor('#FFFFFF')
                .rect(leftColumn, currentY, 495, 25)
                .fill('#4C9F9F');

            doc.fillColor('#FFFFFF')
                .text('Description', leftColumn + 10, currentY + 8, { width: 200 });
            doc.text('Amount ($)', leftColumn + 400, currentY + 8, { width: 85, align: 'right' });

            currentY += 25;

            // Table rows
            const salaryRows = [
                { label: 'Base Salary', value: salaryDetails.baseSalary?.toFixed(2) || '0.00' },
                { label: 'Bonuses', value: salaryDetails.bonuses?.toFixed(2) || '0.00' },
                { label: 'Deductions', value: salaryDetails.deductions?.toFixed(2) || '0.00', isNegative: true }
            ];

            salaryRows.forEach((row, index) => {
                const bgColor = index % 2 === 0 ? '#F8F9FA' : '#FFFFFF';
                doc.rect(leftColumn, currentY, 495, 25).fill(bgColor);

                doc.font('Helvetica')
                    .fillColor('#333333')
                    .text(row.label, leftColumn + 10, currentY + 8, { width: 200 });

                const valueText = row.isNegative ? `-$${row.value}` : `$${row.value}`;
                doc.text(valueText, leftColumn + 400, currentY + 8, { width: 85, align: 'right' });

                currentY += 25;
            });

            // Net Salary (highlighted)
            doc.rect(leftColumn, currentY, 495, 30).fill('#E8F5E9');
            doc.fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#0A3D56')
                .text('Net Salary', leftColumn + 10, currentY + 10, { width: 200 });
            doc.fontSize(14)
                .text(`$${salaryDetails.netSalary?.toFixed(2) || '0.00'}`, leftColumn + 400, currentY + 10, { width: 85, align: 'right' });

            doc.moveDown(3);

            // Footer
            doc.fontSize(8)
                .font('Helvetica')
                .fillColor('#999999')
                .text('This is a system-generated payslip and does not require a signature.', { align: 'center' });

            doc.moveDown(0.5);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });

            // Horizontal line at bottom
            doc.strokeColor('#4C9F9F')
                .lineWidth(1)
                .moveTo(50, doc.page.height - 50)
                .lineTo(545, doc.page.height - 50)
                .stroke();

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generatePayslipPDF };
