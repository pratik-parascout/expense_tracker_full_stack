document.addEventListener('DOMContentLoaded', function () {
  fetchExpenses();

  const expenseForm = document.querySelector('#expenseForm');
  expenseForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const amount = parseFloat(document.querySelector('#amount').value);
    const description = document.querySelector('#description').value;
    const category = document.querySelector('#category').value;

    addExpense(amount, description, category);
  });
});

function fetchExpenses() {
  const token = localStorage.getItem('token');
  axios
    .get('/expense/expenses', { headers: { Authorization: token } })
    .then((response) => {
      const expenses = response.data.expenses;
      const expenseList = document.querySelector('#expenseList');

      expenseList.innerHTML = '';

      expenses.forEach(function (expense) {
        const li = document.createElement('li');
        li.textContent = `Amount: ${expense.amount}, Description: ${expense.description}, Category: ${expense.category}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function () {
          deleteExpense(expense.id, li);
        });

        li.appendChild(deleteButton);
        expenseList.appendChild(li);
      });
    })
    .catch(function (error) {
      console.error('Error fetching expenses:', error);
    });
}

function addExpense(amount, description, category) {
  const expenseData = {
    amount: amount,
    description: description,
    category: category,
  };
  const token = localStorage.getItem('token');

  axios
    .post('/expense/add-expense', expenseData, {
      headers: { Authorization: token },
    })
    .then((response) => {
      //   alert(response.data.msg);
      fetchExpenses();
      document.querySelector('#expenseForm').reset();
    })
    .catch(function (error) {
      console.error('Error adding expense:', error);
    });
}

function deleteExpense(id, listItem) {
  const token = localStorage.getItem('token');
  axios
    .delete(`http://localhost:3000/expense/expenses/${id}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      //   alert(response.data.msg); // Show a success message
      listItem.remove();
    })
    .catch(function (error) {
      console.error('Error deleting expense:', error);
    });
}
