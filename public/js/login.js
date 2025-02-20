document.querySelector('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  try {
    const response = await axios.post('http://13.203.1.119:3000/login', {
      email,
      password,
    });

    if (response.status === 200) {
      // alert(response.data.msg);
      document.querySelector('#loginForm').reset();
      localStorage.setItem('token', response.data.token);
      window.location.href = 'http://13.203.1.119:3000/expense';
    }
  } catch (err) {
    if (err.response) {
      const { status, data } = err.response;
      if (status === 404) {
        alert(data.msg);
      } else if (status === 401) {
        alert(data.msg);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  }
});
