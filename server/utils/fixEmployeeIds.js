const mongoose = require('mongoose');
const User = require('../models/User');

// Utility script to fix duplicate employee IDs
async function fixEmployeeIds() {
  try {
    console.log('Starting employee ID fix...');
    
    // Find all employees without employeeId or with duplicate IDs
    const employees = await User.find({ role: 'employee' }).sort({ createdAt: 1 });
    
    console.log(`Found ${employees.length} employees to process`);
    
    // Track used IDs
    const usedIds = new Set();
    let nextNumber = 1;
    
    for (const employee of employees) {
      // Generate a new unique ID
      let newId;
      do {
        newId = `EMP${String(nextNumber).padStart(3, '0')}`;
        nextNumber++;
      } while (usedIds.has(newId));
      
      usedIds.add(newId);
      
      // Update the employee if ID is different
      if (employee.employeeId !== newId) {
        console.log(`Updating employee ${employee.username}: ${employee.employeeId || 'null'} -> ${newId}`);
        
        // Update directly in database to avoid pre-save hooks
        await User.updateOne(
          { _id: employee._id },
          { $set: { employeeId: newId } }
        );
      }
    }
    
    console.log('Employee ID fix completed successfully');
  } catch (error) {
    console.error('Error fixing employee IDs:', error);
  }
}

// Export for use in other scripts
module.exports = { fixEmployeeIds };

// Run if called directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal')
    .then(() => {
      console.log('Connected to MongoDB');
      return fixEmployeeIds();
    })
    .then(() => {
      console.log('Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}