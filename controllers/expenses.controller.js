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

const getAllExpenses = async (req, res) => {
  try {
    // Fetch all expenses for the user
    const expenseList = await Expense.find({});

    // Fetch all salaries
    const salaryList = await Salary.find({});

    // Map salary data to match the expense structure
    const salaryExpenses = salaryList.map(salary => ({
      _id: salary._id.toString(), // Ensure _id is converted to string if ObjectId
      amount: salary.total, // Assuming 'total' from Salary is the expense amount
      description: 'Salary Payment', // Add any description if necessary
      category: 'Salary', // Add appropriate category for salary expenses
      userId: salary.staff.toString(), // Assuming 'staff' is the user ID for salary
      date: salary.date // Assuming 'date' from Salary is the expense date
    }));

    // Combine both expenseList and salaryExpenses
    const allExpenses = [...expenseList, ...salaryExpenses];

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
