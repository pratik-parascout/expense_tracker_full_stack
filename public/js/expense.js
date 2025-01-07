let currentPage = 1;
let itemsPerPage = localStorage.getItem('itemsPerPage')
  ? parseInt(localStorage.getItem('itemsPerPage'))
  : 10;

document.addEventListener('DOMContentLoaded', function () {
  const itemsPerPageDropdown = document.querySelector('#itemsPerPage');
  itemsPerPageDropdown.value = itemsPerPage;

  itemsPerPageDropdown.addEventListener('change', function () {
    itemsPerPage = parseInt(this.value);
    localStorage.setItem('itemsPerPage', itemsPerPage);
    currentPage = 1;
    fetchExpenses(currentPage);
  });

  fetchExpenses(currentPage);

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

  const token = localStorage.getItem('token');

  axios
    .get('/expense/isPremium', { headers: { Authorization: token } })
    .then((response) => {
      const isPremium = response.data.isPremium;

      const premium = document.querySelector('.premium');
      const para = document.createElement('p');
      const btn = document.createElement('button');
      btn.textContent = 'Show Leaderboard';
      btn.id = 'leaderBtn';
      para.textContent = isPremium
        ? 'You are a premium member.'
        : 'You are a regular user.';
      premium.appendChild(para);
      premium.appendChild(btn);

      btn.addEventListener('click', showLeaderboard);

      if (isPremium) {
        document.querySelector('#premiumForm').style.display = 'none';

        alert('Welcome Premium Member!');
      } else {
        document.querySelector('#leaders').style.display = 'block';
      }
    })
    .catch((error) => {
      console.error('Error fetching user details:', error);
    });
});

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
      // fetchExpenses();
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
      {},
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
              if (successResponse.data.isPremium) {
                document.querySelector('#premiumForm').style.display = 'none';
                const premium = document.querySelector('.premium');
                const para = document.createElement('p');
                const btn = document.createElement('button');
                btn.textContent = 'Show Leaderboard';
                btn.id = 'leaderBtn';
                para.textContent = 'You are a premium member.';
                premium.appendChild(para);
                premium.appendChild(btn);

                btn.addEventListener('click', showLeaderboard);
              }
            })
            .catch((error) => {
              alert('Payment verification failed.');
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

function showLeaderboard() {
  const token = localStorage.getItem('token');
  axios
    .get('/expense/leaderboard', { headers: { Authorization: token } })
    .then((response) => {
      const leaders = response.data.leaders;
      const expenseList = document.querySelector('#leaderList');
      expenseList.innerHTML = '';

      if (leaders.length === 0) {
        const message = document.createElement('p');
        message.textContent =
          'No premium members are currently listed in the leaderboard.';
        expenseList.appendChild(message);
        return;
      }

      leaders.forEach(function (leader) {
        const li = document.createElement('li');
        li.textContent = `${leader.username} >> ${leader.totalExpense}`;
        expenseList.appendChild(li);
      });
    })
    .catch(function (error) {
      console.error('Error fetching leaderboard:', error);
    });
}

function fetchExpenses(page = 1) {
  const token = localStorage.getItem('token');

  axios
    .get(`/expense/expenses?page=${page}&limit=${itemsPerPage}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      const { expenses, pagination } = response.data;
      const expenseList = document.querySelector('#expenseList');

      expenseList.innerHTML = '';

      expenses.forEach((expense) => {
        const li = document.createElement('li');
        li.textContent = `Amount: ${expense.amount}, Description: ${expense.description}, Category: ${expense.category}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
          deleteExpense(expense.id, li);
        });

        li.appendChild(deleteButton);
        expenseList.appendChild(li);
      });

      updatePaginationButtons(pagination);
    })
    .catch((error) => {
      console.error('Error fetching expenses:', error);
    });
}

function updatePaginationButtons(pagination) {
  const paginationButtons = document.querySelector('#paginationButtons');
  if (!paginationButtons) {
    console.error('#paginationButtons element not found');
    return;
  }

  paginationButtons.innerHTML = '';

  const { hasNextPage, hasPrevPage } = pagination;

  if (hasPrevPage) {
    const prevButton = document.createElement('button');
    prevButton.id = 'change';
    prevButton.textContent = 'Previous';
    prevButton.addEventListener('click', () => {
      currentPage--;
      fetchExpenses(currentPage);
    });
    paginationButtons.appendChild(prevButton);
  }

  const pageIndicator = document.createElement('span');
  pageIndicator.textContent = `Page ${currentPage}`;
  paginationButtons.appendChild(pageIndicator);

  if (hasNextPage) {
    const nextButton = document.createElement('button');
    nextButton.id = 'change';
    nextButton.textContent = 'Next';
    nextButton.addEventListener('click', () => {
      currentPage++;
      fetchExpenses(currentPage);
    });
    paginationButtons.appendChild(nextButton);
  }
}
