const PDFDocument = require('pdfkit');

class PDFService {
  // Helper function to add a header to each page
  addHeader(doc, title) {
    doc
      .fontSize(20)
      .fillColor('#667eea')
      .text(title, 50, 50, { align: 'center' })
      .moveDown(0.5);
    
    // Add a line under the header
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(1);
  }

  // Helper function to add a section title
  addSectionTitle(doc, title, icon = '') {
    doc
      .fontSize(14)
      .fillColor('#374151')
      .font('Helvetica-Bold')
      .text(`${icon} ${title}`, 50, doc.y, { underline: false })
      .font('Helvetica')
      .moveDown(0.5);
  }

  // Helper function to add key-value pair
  addKeyValue(doc, key, value, x = 50) {
    doc
      .fontSize(10)
      .fillColor('#6b7280')
      .text(key, x, doc.y, { continued: true, width: 150 })
      .fillColor('#374151')
      .font('Helvetica-Bold')
      .text(value, { align: 'right', width: 450 - x })
      .font('Helvetica')
      .moveDown(0.3);
  }

  // Helper function to add a table
  addTable(doc, headers, rows, startY) {
    const tableTop = startY || doc.y;
    const columnWidth = 150;
    const rowHeight = 25;
    let currentY = tableTop;

    // Draw header
    doc
      .fontSize(9)
      .fillColor('#ffffff')
      .font('Helvetica-Bold');

    headers.forEach((header, i) => {
      doc
        .rect(50 + i * columnWidth, currentY, columnWidth, rowHeight)
        .fillAndStroke('#667eea', '#667eea')
        .fillColor('#ffffff')
        .text(header, 55 + i * columnWidth, currentY + 8, {
          width: columnWidth - 10,
          align: 'left'
        });
    });

    currentY += rowHeight;
    doc.font('Helvetica').fillColor('#374151');

    // Draw rows
    rows.forEach((row, rowIndex) => {
      const fillColor = rowIndex % 2 === 0 ? '#f8fafc' : '#ffffff';
      
      row.forEach((cell, colIndex) => {
        doc
          .rect(50 + colIndex * columnWidth, currentY, columnWidth, rowHeight)
          .fillAndStroke(fillColor, '#e2e8f0');
        
        doc
          .fontSize(8)
          .fillColor('#374151')
          .text(String(cell), 55 + colIndex * columnWidth, currentY + 8, {
            width: columnWidth - 10,
            align: 'left'
          });
      });
      
      currentY += rowHeight;
    });

    doc.y = currentY + 10;
  }

  // Helper function to add a metric card
  addMetricCard(doc, label, value, x, y, width = 120, height = 60) {
    // Draw card background
    doc
      .roundedRect(x, y, width, height, 5)
      .fillAndStroke('#f8fafc', '#e2e8f0');

    // Add value
    doc
      .fontSize(18)
      .fillColor('#667eea')
      .font('Helvetica-Bold')
      .text(value, x + 10, y + 15, { width: width - 20, align: 'center' });

    // Add label
    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(label, x + 10, y + 40, { width: width - 20, align: 'center' });
  }

  // Generate Executive Summary PDF
  generateExecutiveSummary(data) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    this.addHeader(doc, 'Executive Summary Report');

    // Add generation date
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.y, { align: 'right' })
      .moveDown(1);

    // Performance Overview Section
    this.addSectionTitle(doc, 'Performance Overview', '📊');
    
    // Add metric cards in a row
    const metricsY = doc.y;
    this.addMetricCard(doc, 'Total Employees', data.totalEmployees || 0, 50, metricsY);
    this.addMetricCard(doc, 'Active Tasks', data.activeTasks || 0, 185, metricsY);
    this.addMetricCard(doc, 'Completion Rate', `${data.completionRate || 0}%`, 320, metricsY);
    this.addMetricCard(doc, 'Avg Productivity', `${data.averageProductivity || 0}%`, 455, metricsY);
    
    doc.y = metricsY + 80;

    // Top Performers Section
    this.addSectionTitle(doc, 'Top Performers', '🏆');
    
    if (data.topPerformers && data.topPerformers.length > 0) {
      const topPerformersRows = data.topPerformers.map((p, i) => [
        `#${i + 1}`,
        p.name,
        p.department,
        `${p.score}`
      ]);
      this.addTable(doc, ['Rank', 'Name', 'Department', 'Score'], topPerformersRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No data available', 50, doc.y).moveDown();
    }

    // Needs Attention Section
    this.addSectionTitle(doc, 'Needs Attention', '⚠️');
    
    if (data.lowPerformers && data.lowPerformers.length > 0) {
      const lowPerformersRows = data.lowPerformers.map((p, i) => [
        `#${i + 1}`,
        p.name,
        p.department,
        `${p.score}`
      ]);
      this.addTable(doc, ['Rank', 'Name', 'Department', 'Score'], lowPerformersRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No data available', 50, doc.y).moveDown();
    }

    // Risk Areas Section
    doc.addPage();
    this.addSectionTitle(doc, 'Risk Areas', '🚨');
    
    if (data.riskAreas && data.riskAreas.length > 0) {
      const riskRows = data.riskAreas.map(r => [
        r.area,
        r.risk,
        r.impact
      ]);
      this.addTable(doc, ['Area', 'Risk Level', 'Impact'], riskRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No risk areas identified', 50, doc.y).moveDown();
    }

    // Employees at Risk Section
    if (data.employeesAtRisk && data.employeesAtRisk.length > 0) {
      this.addSectionTitle(doc, 'Employees with Tasks Near Due Date', '⚠️');
      const empRiskRows = data.employeesAtRisk.map(e => [
        e.employeeName,
        e.department,
        `${e.tasksAtRisk} task(s)`
      ]);
      this.addTable(doc, ['Employee', 'Department', 'Tasks at Risk'], empRiskRows);
    }

    return doc;
  }

  // Generate Productivity Analysis PDF
  generateProductivityAnalysis(data) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    this.addHeader(doc, 'Productivity Analysis Report');

    // Add generation date
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.y, { align: 'right' })
      .moveDown(1);

    // Productivity Trends Section
    this.addSectionTitle(doc, 'Productivity Trends', '📈');
    
    if (data.trends && data.trends.length > 0) {
      const trendsRows = data.trends.map(t => [
        t.period,
        `${t.score}%`,
        `${t.completedTasks || 0}`,
        `${t.activeTasks || 0}`
      ]);
      this.addTable(doc, ['Period', 'Score', 'Completed', 'Active'], trendsRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No trend data available', 50, doc.y).moveDown();
    }

    // Department Comparison Section
    this.addSectionTitle(doc, 'Department Comparison', '🏢');
    
    if (data.departmentComparison && data.departmentComparison.length > 0) {
      const deptRows = data.departmentComparison.map(d => [
        d.department,
        `${d.current}%`,
        `${d.change > 0 ? '+' : ''}${d.change}%`,
        `${d.tasksCount || 0}`
      ]);
      this.addTable(doc, ['Department', 'Current', 'Change', 'Tasks'], deptRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No department data available', 50, doc.y).moveDown();
    }

    // Task Categories Analysis Section
    doc.addPage();
    this.addSectionTitle(doc, 'Task Categories Analysis', '📋');
    
    if (data.taskCategories && data.taskCategories.length > 0) {
      const categoryRows = data.taskCategories.map(c => [
        c.category,
        `${c.completed}`,
        `${c.pending}`,
        `${c.overdue}`,
        `${c.total || (c.completed + c.pending + c.overdue)}`
      ]);
      this.addTable(doc, ['Category', 'Completed', 'Pending', 'Overdue', 'Total'], categoryRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No category data available', 50, doc.y).moveDown();
    }

    return doc;
  }

  // Generate Efficiency Report PDF
  generateEfficiencyReport(data) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    this.addHeader(doc, 'Efficiency Report');

    // Add generation date
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.y, { align: 'right' })
      .moveDown(1);

    // Efficiency Metrics Section
    this.addSectionTitle(doc, 'Efficiency Metrics', '⚡');
    
    // Add metric cards
    const metricsY = doc.y;
    this.addMetricCard(doc, 'Time Utilization', `${data.timeUtilization || 0}%`, 50, metricsY);
    this.addMetricCard(doc, 'Resource Efficiency', `${data.resourceEfficiency || 0}%`, 185, metricsY);
    this.addMetricCard(doc, 'Process Optimization', `${data.processOptimization || 0}%`, 320, metricsY);
    this.addMetricCard(doc, 'Communication', `${data.communicationScore || 0}%`, 455, metricsY);
    
    doc.y = metricsY + 80;

    // Process Bottlenecks Section
    this.addSectionTitle(doc, 'Process Bottlenecks', '🚧');
    
    if (data.bottlenecks && data.bottlenecks.length > 0) {
      const bottleneckRows = data.bottlenecks.map(b => [
        b.process,
        b.delay,
        b.impact
      ]);
      this.addTable(doc, ['Process', 'Delay', 'Impact'], bottleneckRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No bottlenecks identified', 50, doc.y).moveDown();
    }

    // Improvement Opportunities Section
    this.addSectionTitle(doc, 'Improvement Opportunities', '💡');
    
    if (data.improvements && data.improvements.length > 0) {
      data.improvements.forEach((imp, index) => {
        doc
          .fontSize(10)
          .fillColor('#374151')
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${imp.area}`, 50, doc.y)
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#6b7280')
          .text(`Potential: ${imp.potential} | Priority: ${imp.priority}`, 60, doc.y)
          .text(imp.description || '', 60, doc.y)
          .moveDown(0.5);
      });
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No improvements identified', 50, doc.y).moveDown();
    }

    return doc;
  }

  // Generate Compliance Report PDF
  generateComplianceReport(data) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Header
    this.addHeader(doc, 'Compliance Report');

    // Add generation date
    doc
      .fontSize(9)
      .fillColor('#6b7280')
      .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, doc.y, { align: 'right' })
      .moveDown(1);

    // Compliance Metrics Section
    this.addSectionTitle(doc, 'Compliance Metrics', '✅');
    
    // Add metric cards
    const metricsY = doc.y;
    this.addMetricCard(doc, 'Deadline Compliance', `${data.deadlineCompliance || 0}%`, 50, metricsY);
    this.addMetricCard(doc, 'Quality Standards', `${data.qualityStandards || 0}%`, 185, metricsY);
    this.addMetricCard(doc, 'Process Adherence', `${data.processAdherence || 0}%`, 320, metricsY);
    this.addMetricCard(doc, 'Documentation', `${data.documentationScore || 0}%`, 455, metricsY);
    
    doc.y = metricsY + 80;

    // Compliance Violations Section
    this.addSectionTitle(doc, 'Compliance Violations', '⚠️');
    
    if (data.violations && data.violations.length > 0) {
      const violationRows = data.violations.map(v => [
        v.type,
        `${v.count}`,
        v.severity,
        `${v.percentage || 0}%`
      ]);
      this.addTable(doc, ['Type', 'Count', 'Severity', 'Percentage'], violationRows);
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No violations found', 50, doc.y).moveDown();
    }

    // Recommendations Section
    doc.addPage();
    this.addSectionTitle(doc, 'Recommendations', '📝');
    
    if (data.recommendations && data.recommendations.length > 0) {
      data.recommendations.forEach((rec, index) => {
        const title = typeof rec === 'string' ? rec : rec.title;
        const description = typeof rec === 'string' ? '' : rec.description;
        const priority = typeof rec === 'string' ? '' : rec.priority;
        const impact = typeof rec === 'string' ? '' : rec.impact;

        doc
          .fontSize(10)
          .fillColor('#374151')
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${title}`, 50, doc.y)
          .font('Helvetica');

        if (description) {
          doc
            .fontSize(9)
            .fillColor('#6b7280')
            .text(description, 60, doc.y);
        }

        if (priority || impact) {
          doc
            .fontSize(8)
            .fillColor('#667eea')
            .text(`Priority: ${priority} | Impact: ${impact}`, 60, doc.y);
        }

        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(9).fillColor('#6b7280').text('No recommendations available', 50, doc.y).moveDown();
    }

    return doc;
  }
}

module.exports = new PDFService();
