document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split('/')[3];

  const password = document.querySelector('#password').value;

  if (!id || !password) {
    return alert('Password and ID are required.');
  }

  try {
    const response = await axios.post(
      `http://localhost:3000/password/resetpassword/${id}`,
      {
        password,
      }
    );

    alert(response.data.msg);
    window.location.href = 'http://localhost:3000/login';
  } catch (error) {
    console.error('Error resetting password:', error);
    alert(error.response?.data?.msg || 'Failed to reset password.');
  }
});
