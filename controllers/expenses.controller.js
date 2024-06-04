const Expense = require('../models/expenses');

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

// Get All Expenses
const getAllExpenses = async (req, res) => {
  try {
    const { userId } = req;
    const expenseList = await Expense.find({ userId });

    res.status(200).json(expenseList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Expense by ID
// const getExpenseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { userId } = req;
//     const expense = await Expense.findOne({ _id: id, userId });

//     if (!expense) {
//       return res.status(404).json({ message: 'Expense not found' });
//     }

//     res.status(200).json(expense);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = {
  createExpense,
  editExpense,
  deleteExpense,
  getAllExpenses,
//   getExpenseById
};
