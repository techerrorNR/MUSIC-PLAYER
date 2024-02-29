document.addEventListener("DOMContentLoaded", function () {
    const audio = new Audio();
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const volumeControl = document.getElementById('volumeControl');
    const volumePercentage = document.getElementById('volumePercentage');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const fileInput = document.getElementById('fileInput');
    const progressBar = document.getElementById('progressBar');
    const musicListContainer = document.getElementById('musicList');

    let isShuffle = false;
    let isRepeat = false;
    let playlist = [];
    let currentTrackIndex = 0;

    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrevious);
    volumeControl.addEventListener('input', setVolume);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    fileInput.addEventListener('change', handleFileInput);
    progressBar.addEventListener('input', updateProgressBar);

    function togglePlayPause() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = 'Pause';
        } else {
            audio.pause();
            playPauseBtn.textContent = 'Play';
        }
    }

    function playNext() {
        if (isShuffle) {
            currentTrackIndex = getRandomIndex();
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        }
        loadTrack();
        audio.play();
    }

    function playPrevious() {
        if (isShuffle) {
            currentTrackIndex = getRandomIndex();
        } else {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        }
        loadTrack();
        audio.play();
    }

    function setVolume() {
        const volume = volumeControl.value / 100;
        audio.volume = volume;
        volumePercentage.textContent = `${Math.round(volume * 100)}%`;
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.style.color = isShuffle ? 'green' : 'black';
    }

    function toggleRepeat() {
        isRepeat = !isRepeat;
        repeatBtn.style.color = isRepeat ? 'green' : 'black';
    }

    function handleFileInput(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const audioFiles = [];
            Array.from(files).forEach(file => {
                if (file.type.startsWith('audio/')) {
                    audioFiles.push(file);
                } else if (file.webkitGetAsEntry) { // Check if it's a folder
                    // Recursively fetch audio files from the folder
                    processDirectory(file.webkitGetAsEntry());
                }
            });
            playlist = audioFiles;
            currentTrackIndex = 0;
            loadTrack();
            displayMusicList(audioFiles); // Display the music list inside the player
        }
    }

    function processDirectory(directoryEntry) {
        if (directoryEntry.isDirectory) {
            const directoryReader = directoryEntry.createReader();
            directoryReader.readEntries(entries => {
                entries.forEach(entry => {
                    if (entry.isFile && entry.name.endsWith('.mp3')) {
                        entry.file(file => {
                            playlist.push(file);
                        });
                    } else if (entry.isDirectory) {
                        processDirectory(entry); // Recursively process subfolders
                    }
                });
            });
        }
    }

    function loadTrack() {
        const track = playlist[currentTrackIndex];
        audio.src = URL.createObjectURL(track);
        audio.load();

        // Update song information and album art
        document.getElementById('songTitle').textContent = track.name;
        document.getElementById('artist').textContent = 'Unknown Artist';
        document.getElementById('album').textContent = 'Unknown Album';
        document.getElementById('albumArt').src = 'defaultAlbumArt.jpg';
        if (track.albumArt) {
        document.getElementById('albumArt').src = URL.createObjectURL(track.albumArt);
    } else {
        // Set default album art image
        document.getElementById('albumArt').src = 'Sai-Pallavi.jpg';
    }

        // Reset progress bar
        progressBar.value = 0;

        // Play the track if it was playing before
        if (!audio.paused) {
            audio.play();
        }
    }

    function displayMusicList(audioFiles) {
        musicListContainer.innerHTML = ''; // Clear previous content
        audioFiles.forEach((file, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = file.name;
            listItem.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack();
                audio.play(); // Automatically play the selected song
            });
            musicListContainer.appendChild(listItem);
        });
    }

    function getRandomIndex() {
        return Math.floor(Math.random() * playlist.length);
    }

    function updateProgressBar() {
        const progress = progressBar.value / 100;
        audio.currentTime = audio.duration * progress;
    }

    // Update progress bar while playing
    audio.addEventListener('timeupdate', function () {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
    });

    // Play the next track when the current one ends
    audio.addEventListener('ended', function () {
        if (isRepeat) {
            audio.play();
        } else {
            playNext();
        }
    });
});
