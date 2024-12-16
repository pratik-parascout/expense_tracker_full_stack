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

  const premiumForm = document.querySelector('#premiumForm');
  premiumForm.addEventListener('submit', function (event) {
    event.preventDefault();
    buyPremium();
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
      listItem.remove();
    })
    .catch(function (error) {
      console.error('Error deleting expense:', error);
    });
}

function buyPremium() {
  const token = localStorage.getItem('token');

  axios
    .post(
      '/expense/create-premium-order',
      { amount: 500 },
      {
        headers: { Authorization: token },
      }
    )
    .then((response) => {
      const order = response.data.order;

      const options = {
        key: 'rzp_test_b7p17DaCbmsO02',
        amount: order.amount,
        currency: 'INR',
        name: 'Expense App Premium',
        description: 'Premium Subscription',
        order_id: order.id,
        handler: function (response) {
          axios
            .post(
              '/expense/payment-success',
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { Authorization: token },
              }
            )
            .then((successResponse) => {
              alert('You are now a premium user!');
            })
            .catch((error) => {
              alert('Payment verification failed.');
              console.error('Error:', error);
            });
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
        },
        theme: {
          color: '#6cc4bf',
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    })
    .catch((error) => {
      console.error('Error creating Razorpay order:', error);
    });
}
