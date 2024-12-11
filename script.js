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
const backButton = document.getElementById('back-btn');
let currentPath = ''; // To track the current directory

// Function to fetch files and directories from a given path
async function fetchFiles(path = '') {
  try {
    const response = await fetch(repoUrl + path);
    const files = await response.json();

    // Clear previous content
    fileListElement.innerHTML = '';

    // If it's an empty directory or an error, show a message
    if (!Array.isArray(files) || files.length === 0) {
      fileListElement.innerHTML = "<p>No files or directories found here.</p>";
      return;
    }

    // Loop through files and directories
    files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.classList.add('file-item');
      
      if (file.type === 'file') {
        // Display files (like videos)
        fileItem.innerHTML = `
          <i class="fas fa-file-video"></i><br>
          <strong>${file.name}</strong>
        `;
        fileItem.onclick = () => openFile(file);
      } else if (file.type === 'dir') {
        // Display directories
        fileItem.innerHTML = `
          <i class="fas fa-folder"></i><br>
          <strong>${file.name}</strong>
        `;
        fileItem.onclick = () => openDirectory(file.path);
      }

      fileListElement.appendChild(fileItem);
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

// Open directory (navigate into it)
function openDirectory(path) {
  currentPath = path; // Set the current directory path
  fetchFiles(path); // Fetch and display contents of the directory
  backButton.style.display = 'block'; // Show the "back" button
}

// Back to the previous directory
function goBack() {
  const pathParts = currentPath.split('/');
  pathParts.pop(); // Remove last directory from the path
  currentPath = pathParts.join('/');
  fetchFiles(currentPath); // Fetch and display contents of the parent directory

  if (currentPath === '') {
    backButton.style.display = 'none'; // Hide the back button when at the root
  }
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

// Initialize file manager (fetch root files and dirs)
fetchFiles();

// Set the "back" button's click handler
backButton.addEventListener('click', goBack);
