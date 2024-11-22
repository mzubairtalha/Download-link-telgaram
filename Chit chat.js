for image


// ImageBB API Key
const imageBBApiKey = '65f269399bbac0cf4fa69d8f4a0345d5';

// Create an overlay for upload progress
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
overlay.style.color = 'white';
overlay.style.display = 'flex';
overlay.style.alignItems = 'center';
overlay.style.justifyContent = 'center';
overlay.style.fontSize = '20px';
overlay.style.zIndex = '1000';
overlay.style.display = 'none';
document.body.appendChild(overlay);

document.getElementById('image-input-btn').addEventListener('click', () => {
  document.getElementById('image-input').click();
});

document.getElementById('image-input').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Convert the file to Base64 for ImageBB API
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    const base64Image = reader.result.split(',')[1];
    
    // Use XMLHttpRequest for API request
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.imgbb.com/1/upload?key=${imageBBApiKey}`, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Show overlay and initialize progress text
    overlay.style.display = 'flex';
    overlay.textContent = 'Uploading Image... 0%';

    // Update overlay text with upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        overlay.textContent = `Uploading Image... ${percentComplete}%`;
      }
    };

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        overlay.style.display = 'none'; // Hide overlay when upload is complete

        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            const imageUrl = response.data.url;

            // Optional: Send the image URL to Firebase
            const message = {
              imageURL: imageUrl, // Store the image URL in the message
              timestamp: new Date().toISOString(),
              userName: userName,
              userColor: userColor
            };

            // Send the message to Firebase (or another chat database)
            database.ref(`chats/${currentRoom}`).push(message);

            // Display the image in the chat only for other users
            if (!isCurrentUser) {
              displayMessage(message);
            }
          } else {
            alert("Image upload failed. Please try again.");
          }
        } else {
          alert("Image upload failed. Please check your network connection.");
        }
      }
    };

    // Send base64 image data in the required format
    xhr.send(`image=${encodeURIComponent(base64Image)}`);
  };
});

// Function to display messages, including images, in the chat
function displayMessage(message) {
  const messageElement = document.createElement('p');

  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${message.userName || ''}: `;
  nameSpan.style.color = message.userColor;
  nameSpan.style.fontWeight = 'bold';
  messageElement.appendChild(nameSpan);

  // Check if the message contains an image URL
  if (message.imageURL) {
    const imageElement = document.createElement('img');
    imageElement.src = message.imageURL; // Set image source to the URL from ImageBB
    imageElement.style.maxWidth = '100px'; // Adjust image size if necessary
    messageElement.appendChild(imageElement);
  } else {
    messageElement.appendChild(document.createTextNode(message.text));
  }

  chatBox.appendChild(messageElement); // Add the message to the chat box
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom of the chat
}












for adio (not working) 




let mediaRecorder; // For recording audio
let audioChunks = []; // To store recorded audio chunks
let audioBlob; // To store the final audio blob
let audioURL; // To store the generated audio URL for playback
// Chat container

// Start recording
function startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      audioURL = URL.createObjectURL(audioBlob); // Generate a local URL for playback
      document.getElementById('preview-audio').src = audioURL;
      document.getElementById('preview-container').style.display = 'block'; // Show the preview section
    };

    mediaRecorder.start();
    document.getElementById('recording-status').textContent = 'Recording...';
    document.getElementById('start-btn').disabled = true;
    document.getElementById('stop-btn').disabled = false;
  }).catch((error) => {
    console.error('Error accessing microphone:', error);
    alert('Unable to access your microphone. Please check permissions.');
  });
}

// Stop recording
function stopRecording() {
  mediaRecorder.stop();
  document.getElementById('recording-status').textContent = 'Recording stopped.';
  document.getElementById('start-btn').disabled = false;
  document.getElementById('stop-btn').disabled = true;
}

// Upload audio
function uploadAudio() {
  if (!audioBlob) {
    alert('No audio to upload. Please record first.');
    return;
  }

  const formData = new FormData();
  formData.append('file', new File([audioBlob], 'audio.webm', { type: 'audio/webm' }));

  // Show upload progress
  const overlay = document.getElementById('upload-overlay');
  overlay.style.display = 'flex';
  overlay.textContent = 'Uploading Audio... 0%';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://file.io/?expires=1d', true);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percentComplete = Math.round((event.loaded / event.total) * 100);
      overlay.textContent = `Uploading Audio... ${percentComplete}%`;
    }
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      overlay.style.display = 'none'; // Hide overlay when upload is complete
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          alert('Audio uploaded successfully!');
          saveAudioMessage(response.link); // Save the uploaded audio to the chat database
        } else {
          alert('Audio upload failed.');
        }
      } else {
        alert('Error uploading audio. Please check your connection.');
      }
    }
  };

  xhr.send(formData);
}

// Save and display audio message in the database and chat
function saveAudioMessage(audioURL) {
  const userName = 'John Doe'; // Replace with dynamic user details
  const userColor = '#FF5733'; // Replace with dynamic user color

  // Save to the database
  database.ref(`chats/${currentRoom}`).push({
    userName,
    userColor,
    audioURL,
    timestamp: Date.now(),
  });

  // Display in the chat
  displayAudioInChat(audioURL, userName, userColor);
}

// Display uploaded audio in the chat
function displayAudioInChat(audioURL, userName, userColor) {
  const messageElement = document.createElement('p');

  // Add user name with color styling
  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${userName}: `;
  nameSpan.style.color = userColor;
  nameSpan.style.fontWeight = 'bold';
  messageElement.appendChild(nameSpan);

  // Add the audio element
  const audioElement = document.createElement('audio');
  audioElement.controls = true;
  audioElement.src = audioURL;
  audioElement.style.margin = '5px 0';
  messageElement.appendChild(audioElement);

  // Append to the chat box
  chatBox.appendChild(messageElement);

  // Auto-scroll to the bottom of the chat
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Real-time listener for new messages
database.ref(`chats/${currentRoom}`).on('child_added', (snapshot) => {
  const message = snapshot.val();
  displayMessage(message);
});

// General function to display messages (text, images, audio)
function displayMessage(message) {
  const messageElement = document.createElement('p');

  // Add user name with color styling
  const nameSpan = document.createElement('span');
  nameSpan.textContent = `${message.userName || ''}: `;
  nameSpan.style.color = message.userColor;
  nameSpan.style.fontWeight = 'bold';
  messageElement.appendChild(nameSpan);

  if (message.audioURL) {
    // Handle audio messages
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    audioElement.src = message.audioURL;
    audioElement.style.margin = '5px 0';
    messageElement.appendChild(audioElement);
  } else {
    // Handle text messages
    messageElement.appendChild(document.createTextNode(message.text || ''));
  }

  // Append the message to the chat box
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}
