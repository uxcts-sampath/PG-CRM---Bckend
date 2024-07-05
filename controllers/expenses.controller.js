const Expense = require('../models/expenses');
const Salary = require('../models/salary');

// Create Expense
const createExpense = async (req, res) => {
  try {
    const { userId } = req;
    const expenseData = { ...req.body, userId };

    const newExpense = new Expense(expenseData); 
    const savedExpense = await newExpense.save();

    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Edit Expense
const editExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const updatedExpense = await Expense.findByIdAndUpdate(id, { ...req.body, userId }, { new: true });

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Expense
const deleteExpense = async (req, res) => {
  try { 
    const { id } = req.params;
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// const getAllExpenses = async (req, res) => {
//   try {
//       const { userId } = req;

//       // Fetch all expenses for the user
//       const expenses = await Expense.find({ userId });

//       // Fetch all salaries related to the user's hostel staff
//       const salaries = await Salary.find().populate({
//           path: 'staff',
//           match: { userId } // This ensures we only get salaries for the staff belonging to the user
//       });

//       // Filter salaries that actually match the user's staff
//       const userSalaries = salaries.filter(salary => salary.staff);

//       // Map salaries to match the expense structure
//       const salaryExpenses = userSalaries.map(salary => ({
//           _id: salary._id.toString(),
//           amount: salary.total,
//           description: 'Salary Payment',
//           category: 'Salary',
//           userId: salary.staff.userId.toString(),
//       date: salary.date.toLocaleDateString() // Format date to only include the date part
//       }));

//       // Combine both expenses and salaries
//       const allExpenses = [...expenses, ...salaryExpenses];

//       res.status(200).json(allExpenses);
//   } catch (error) {
//       console.error('Error in getAllExpenses:', error);
//       res.status(500).json({ message: error.message });
//   }
// };



const getAllExpenses = async (req, res) => {
  try {
    const { userId } = req;

    // Fetch all expenses for the user
    const expenses = await Expense.find({ userId });

    // Fetch all salaries related to the user's hostel staff
    const salaries = await Salary.find().populate({
      path: 'staff',
      match: { userId } // This ensures we only get salaries for the staff belonging to the user
    });

    // Filter salaries that actually match the user's staff
    const userSalaries = salaries.filter(salary => salary.staff);

    // Map salaries to match the expense structure
    const salaryExpenses = userSalaries.map(salary => ({
      _id: salary._id.toString(),
      amount: salary.total,
      description: 'Salary Payment',
      category: 'Salary',
      userId: salary.staff.userId.toString(),
      date: salary.date.toLocaleDateString() // Format date to only include the date part
    }));

    // Map expenses to format date correctly
    const formattedExpenses = expenses.map(expense => ({
      _id: expense._id.toString(),
      amount: expense.amount,
      description: expense.description,
      category: expense.category,
      userId: expense.userId.toString(),
      date: expense.date.toLocaleDateString() // Format date to only include the date part
    }));

    // Combine both formatted expenses and salary expenses
    const allExpenses = [...formattedExpenses, ...salaryExpenses];

    res.status(200).json(allExpenses);
  } catch (error) {
    console.error('Error in getAllExpenses:', error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createExpense,
  editExpense,
  deleteExpense,
  getAllExpenses,
};
