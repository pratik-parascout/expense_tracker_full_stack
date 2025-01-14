const token = localStorage.getItem('token');

// Download button functionality
document.querySelector('#download').addEventListener('click', async () => {
  try {
    const response = await axios.get('http://localhost:3000/expense/download', {
      headers: { Authorization: token },
    });

    const a = document.createElement('a');
    a.href = response.data.fileURL;
    a.download = 'myexpense.txt';
    a.click();

    alert('File downloaded successfully!');
    fetchDownloadedFiles(); // Refresh the downloaded files table
  } catch (error) {
    console.error('Error downloading the file:', error);
    alert('An error occurred while downloading the file.');
  }
});

// Fetch and display downloaded files
async function fetchDownloadedFiles() {
  try {
    const response = await axios.get(
      'http://localhost:3000/expense/downloads',
      {
        headers: { Authorization: token },
      }
    );

    const downloadsTableBody = document.querySelector('#downloads-table tbody');
    downloadsTableBody.innerHTML = ''; // Clear previous entries

    response.data.downloads.forEach((file) => {
      const row = document.createElement('tr');

      const fileNameCell = document.createElement('td');
      fileNameCell.textContent = file.fileName;

      const downloadLinkCell = document.createElement('td');
      const downloadLink = document.createElement('a');
      downloadLink.href = file.fileURL;
      downloadLink.textContent = 'Download';
      downloadLink.target = '_blank';

      downloadLinkCell.appendChild(downloadLink);

      row.appendChild(fileNameCell);
      row.appendChild(downloadLinkCell);
      downloadsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching downloaded files:', error);
  }
}

// Call the function on page load
fetchDownloadedFiles();
