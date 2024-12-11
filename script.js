// Function to get URL parameters (username and repo name)
function getURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  const repoName = urlParams.get('repo');
  return { username, repoName };
}

// Get GitHub username and repository name from URL parameters
const { username, repoName } = getURLParameters();

// If parameters are missing, display an error
if (!username || !repoName) {
  document.body.innerHTML = "<h1>Error: Please provide 'username' and 'repo' parameters in the URL.</h1>";
  throw new Error("Missing GitHub username or repository name in URL parameters");
}

// Construct the GitHub API URL for repository contents
const repoUrl = `https://api.github.com/repos/${username}/${repoName}/contents/`;

// Elements
const fileListElement = document.getElementById('file-list');
const fileViewerElement = document.getElementById('file-viewer');
const fileTitleElement = document.getElementById('file-title');
const filePlayerElement = document.getElementById('file-player');
const searchBarElement = document.getElementById('search-bar');

// Fetch files from GitHub repository
async function fetchFiles() {
  try {
    const response = await fetch(repoUrl);
    const files = await response.json();

    // Filter files and display
    files.forEach(file => {
      if (file.type === 'file') {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `
          <i class="fas fa-file-video"></i><br>
          <strong>${file.name}</strong>
        `;
        fileItem.onclick = () => openFile(file);
        fileListElement.appendChild(fileItem);
      }
    });
  } catch (error) {
    console.error("Error fetching files: ", error);
    fileListElement.innerHTML = "<p>Error fetching files. Please check the repository or try again later.</p>";
  }
}

// Open file (video player or file viewer)
function openFile(file) {
  // Set file title
  fileTitleElement.textContent = file.name;

  // Check file type (e.g., .mp4 for video)
  const fileExtension = file.name.split('.').pop().toLowerCase();

  if (fileExtension === 'mp4') {
    const videoElement = document.createElement('video');
    videoElement.src = file.download_url;
    videoElement.controls = true;
    filePlayerElement.innerHTML = '';
    filePlayerElement.appendChild(videoElement);
  } else {
    filePlayerElement.innerHTML = `<p>File type not supported for preview.</p>`;
  }

  // Show the file viewer
  fileViewerElement.style.display = 'flex';
}

// Close file viewer
function closeViewer() {
  fileViewerElement.style.display = 'none';
}

// Search functionality
searchBarElement.addEventListener('input', () => {
  const searchTerm = searchBarElement.value.toLowerCase();
  const fileItems = document.querySelectorAll('.file-item');
  
  fileItems.forEach(item => {
    const fileName = item.innerText.toLowerCase();
    if (fileName.includes(searchTerm)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
});

// Initialize file manager
fetchFiles();
