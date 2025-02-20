const form = document
  .querySelector('#signupForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    if (!username || !email || !password) {
      alert('Please fill in all fields and select a rating.');
      return;
    }

    try {
      const response = await axios.post('http://13.203.1.119:3000/signup', {
        username,
        email,
        password,
      });
      document.querySelector('#signupForm').reset();
      window.location.href = 'http://13.203.1.119:3000/login';
    } catch (err) {
      console.log(err);
    }
  });
