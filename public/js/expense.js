let currentPage = 1;

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
      const razorpay_key = response.data.RAZORPAY_KEY_ID;

      const options = {
        key: razorpay_key,
        amount: order.amount,
        currency: 'INR',
        name: 'Expense App Premium',
        description: 'Premium Subscription',
        image: 'https://cdn.razorpay.com/logos/7K3b6d18wHwKzL_medium.png',
        theme: {
          color: '#3399cc',
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          },
        },
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
              alert('Something went wrong with payment verification');
              console.error(error);
            });
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    })
    .catch((error) => {
      alert('Something went wrong!');
      console.error(error);
    });
}

function showLeaderboard() {
  const leaderboard = document.querySelector('#leaders');
  const token = localStorage.getItem('token');

  axios
    .get('/expense/leaderboard', {
      headers: { Authorization: token },
    })
    .then((response) => {
      const leaderList = document.querySelector('#leaderList');
      leaderList.innerHTML = '';

      response.data.forEach((user) => {
        const li = document.createElement('li');
        li.textContent = `${user.name} - Total Expense: ${user.totalExpense}`;
        leaderList.appendChild(li);
      });

      leaderboard.style.display = 'block';
    })
    .catch((error) => {
      console.error(error);
    });
}

// Add other existing functions back
function addExpense(amount, description, category) {
  const token = localStorage.getItem('token');

  axios
    .post(
      '/expense/add-expense',
      {
        amount,
        description,
        category,
      },
      {
        headers: { Authorization: token },
      }
    )
    .then(() => {
      fetchExpenses(currentPage);
    })
    .catch((error) => {
      console.error(error);
    });
}

function deleteExpense(id, listItem) {
  const token = localStorage.getItem('token');

  axios
    .delete(`/expense/expenses/${id}`, {
      headers: { Authorization: token },
    })
    .then(() => {
      listItem.remove();
    })
    .catch((error) => {
      console.error(error);
    });
}

function fetchExpenses(page = 1) {
  const token = localStorage.getItem('token');
  const itemsPerPage = document.getElementById('itemsPerPage').value;

  axios
    .get(`/expense/expenses?page=${page}&items=${itemsPerPage}`, {
      headers: { Authorization: token },
    })
    .then((response) => {
      const expenseList = document.querySelector('#expenseList');
      expenseList.innerHTML = '';

      response.data.expenses.forEach((expense) => {
        const li = document.createElement('li');
        li.textContent = `Amount: ${expense.amount}, Description: ${expense.description}, Category: ${expense.category}`;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteExpense(expense.id, li);

        li.appendChild(deleteBtn);
        expenseList.appendChild(li);
      });

      updatePaginationButtons(response.data.pagination);
    })
    .catch((error) => {
      console.error(error);
    });
}

function updatePaginationButtons(pagination) {
  const paginationDiv = document.querySelector('#paginationButtons');
  paginationDiv.innerHTML = '';

  if (pagination.hasPreviousPage) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => {
      currentPage--;
      fetchExpenses(currentPage);
    };
    paginationDiv.appendChild(prevButton);
  }

  if (pagination.hasNextPage) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => {
      currentPage++;
      fetchExpenses(currentPage);
    };
    paginationDiv.appendChild(nextButton);
  }
}

// Event Listeners
document.getElementById('expenseForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;

  addExpense(amount, description, category);
  e.target.reset();
});

document.getElementById('premiumForm').addEventListener('submit', (e) => {
  e.preventDefault();
  buyPremium();
});

document.getElementById('itemsPerPage').addEventListener('change', () => {
  currentPage = 1;
  fetchExpenses(currentPage);
});

// Initial load
fetchExpenses();
