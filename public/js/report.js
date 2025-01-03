const token = localStorage.getItem('token');

axios
  .get('/expense/isPremium', { headers: { Authorization: token } })
  .then((response) => {
    const isPremium = response.data.isPremium;

    const downloadButton = document.querySelector('#download');
    if (isPremium) {
      // Enable the download button for premium users
      downloadButton.disabled = false; // Ensure button is enabled
      downloadButton.title = 'Download your expense report';

      // Add event listener to allow file download
      downloadButton.addEventListener('click', async () => {
        try {
          const response = await axios.get('/expense/download', {
            headers: { Authorization: token },
          });

          if (response.data && response.data.fileURL) {
            const a = document.createElement('a');
            a.href = response.data.fileURL;
            a.download = 'myexpense.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          } else {
            console.error('No file URL received:', response);
            alert('Failed to get the file URL.');
          }
        } catch (error) {
          console.error('Error downloading the file:', error);
          alert('An error occurred while downloading the file.');
        }
      });

      alert('Welcome Premium Member! You can download your expense report.');
    } else {
      // Disable the download button for non-premium users
      downloadButton.disabled = true;
      downloadButton.title = 'Upgrade to premium to enable downloads';
      alert('Upgrade to premium to enable downloading expense reports.');
    }
  })
  .catch((error) => {
    console.error('Error fetching user details:', error);
  });
