document
  .querySelector('#resetPassword')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;

    try {
      const response = await axios.post(
        'http://43.204.103.32:3000/password/forgetpassword',
        { email }
      );

      document.querySelector('#email').value = '';
      alert(response.data.msg);
    } catch (err) {
      console.log(err);
      alert('Failed to send email. Please try again later.');
    }
  });
