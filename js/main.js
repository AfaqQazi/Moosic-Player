$(function () {
    // get inputs
    let $header = $('header');
    let $artistSearchBar = $header.find('#searchbar .search-artist');
    let $musicSearchBar = $header.find('#searchbar .search-music');
    let $submitBtn = $header.find('#searchbar button');
    let $mainContainer = $('#main-container');
    let $nowPlayingSpan = $('#now-playing p span');

    // table
    let $table = $('#main-container table');

    // player
    let $player = $('#player');
    let $playerPlayBtn = $player.find('.buttons div:nth-child(2) img');
    let $playerNextBtn = $player.find('.buttons div:nth-child(3) img ');
    let $PlayerPrevBtn = $player.find('.buttons div:nth-child(1) img');

    // START AJAX
    $submitBtn.on('click', getSongs);
    function getSongs() {
        // clear all tds
        $table.html(`
            <tr>
                <th> Play</th>
                <th>Song</th>
                <th>Artist</th>
            </tr>
        `)

        // if bar is empty or is wrong
        if ($artistSearchBar.val() == '' || $musicSearchBar.val() == '') {
            alert('Plese Enter Artist and song name')
            return;
        }

        var settings = {
            method: 'GET',
            crossDomain: true,
            url: "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + $artistSearchBar.val(),
            headers: {
                "x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
                "x-rapidapi-key": "3613e5104fmsh1f504a20c8013c3p139af5jsn932a9b2d3a86"
            }
        }

        // remove repeated songs
        function removeDuplicates() {
            let tableRows = document.querySelectorAll('table tr td:nth-child(2)');
            let nestedCounter = 1;
            for (i = 0; i < tableRows.length; i++) {
                for (j = nestedCounter; j < tableRows.length; j++) {
                    if (tableRows[i].innerHTML == tableRows[j].innerHTML) {
                        tableRows[j].parentElement.remove();
                    }
                }
                nestedCounter++;
            }
        }

        let catchError = () => alert('Problem Contacting Server');
        $.ajax(settings).done(function (response) {
            // if response is empty return
            if (response.data.length == 0) {
                alert('No Such Artist Found')
                return;
            }

            // cache
            let $songsArray = response.data;
            let $typedSong = $musicSearchBar.val().toLowerCase();
            let regex = new RegExp($typedSong, 'gi');


            // find typed song if you can
            let $selectedSong;
            $($songsArray).each(function (i, object) {
                // match typed song
                if (object.title.toLowerCase().match(regex)) {
                    $selectedSong = object.title.toLowerCase();
                    $table.append(`
                     <tr>
                        <td>
                            <img src="images/play.png">
                            <audio>
                                <source src="../test.mp3">
                            </audio>
                        </td>
                        <td>${object.title}</td>
                        <td>${object.artist.name}</td>
                    </tr> 
                    `)
                    console.log('MATCHED');
                }
            })


            // display extra songs from artist
            $($songsArray).each(function (i, object) {
                // dont display main song
                if ($selectedSong != object.title.toLowerCase()) {
                    // display rest of the songs
                    $table.append(`
                        <tr>
                        <td>
                            <img src="images/play.png">
                            <audio>
                                <source src="../test.mp3">
                            </audio>
                        </td>
                            <td>${object.title}</td>
                            <td>${object.artist.name}</td>
                        </tr> 
                        `);

                    // apply scroll to main container
                    $mainContainer.css('overflow-y', 'scroll');
                }
            }
            )

            // constructor for flipping audio and img
            function Flip(img, audio) {
                // play current song
                if (img.src == "../images/play.png" || img.src == "http://127.0.0.1:5500/images/play.png") {
                    audio.play();
                    img.src = "../images/stop.png";
                    // do same with player button
                    $playerPlayBtn.attr("src", "../images/player_stop.png");

                } else {
                    audio.pause();
                    if (audio.currentTime >= 0 && audio.currentTime <= audio.duration) {
                        audio.currentTime = audio.currentTime;
                    } else {
                        audio.currentTime = 0;
                    }

                    img.src = "../images/play.png";
                    // do same with player button
                    $playerPlayBtn.attr("src", "../images/player_play.png");
                }
            }

            // attach event listeners to play button
            let $playButtons = $table.find('tr td:nth-child(1)');
            $playButtons.on('click', function () {
                let $audio = this.querySelector('audio');
                let $img = this.querySelector('img');
                let $tr = $(this).parents()[0];
                let $songName = $tr.getElementsByTagName('td')[1].innerHTML;
                let $allAudios = $playButtons.find('audio');
                let $allImages = $playButtons.find('img');

                // // stop all songs 
                $allAudios.each(function (i, audio) {
                    audio.pause();
                    audio.currentTime = 0;
                });

                // change all to play image
                $allImages.each(function (i, img) {
                    if (img == $img) return;
                    img.src = "../images/play.png"
                })

                // pause and stop songs and change buttons
                Flip($img, $audio)
                showPlayingSong($songName);
            })

            // show current song being played
            function showPlayingSong(songName) {
                $nowPlayingSpan.html(`${songName}`);
            }

            // find current song constructor
            let FindSong = (tableImg, audio) => {
                let $allTableSongs = $('#main-container table tr td:nth-child(2)');
                $allTableSongs.each(function (i, td) {
                    if (td.innerHTML.toLowerCase() == $nowPlayingSpan.html().toLowerCase()) {
                        audio = td.parentElement.firstElementChild.querySelector('audio');
                        tableImg = td.parentElement.firstElementChild.querySelector('img');
                    }
                })
                return {
                    tableImg,
                    audio,
                }
            }


            // player Play Button 
            $playerPlayBtn.on('click', function () {
                let $img = $(this);
                let $audio = FindSong().audio;
                let $tableImg = FindSong().tableImg;
                // stop current song
                Flip($img, $audio);
                Flip($tableImg, $audio);
            })

            // Next Song
            $playerNextBtn.on('click', next);
            function next() {
                // all audio reset
                let table = document.getElementsByTagName('table')[0];
                let allAudios = table.querySelectorAll('audio');
                allAudios.forEach(audio => {
                    audio.currentTime = 0;
                });
                console.log(allAudios);
                // NEXT
                let $tableImg = FindSong().tableImg;
                let $tableAudio = FindSong().audio;
                // Flip($tableImg, $tableAudio); // bug in this one
                $tableAudio.pause();
                $tableAudio.currentTime = 0;
                $tableImg.src = "../images/play.png";

                let $nextElement = $tableImg.parentElement.parentElement.nextElementSibling;
                if ($nextElement) {
                    let $nextElementImg = $nextElement.getElementsByTagName('td')[0].querySelector('img');
                    let $nextElementAudio = $nextElement.getElementsByTagName('td')[0].querySelector('audio');
                    Flip($nextElementImg, $nextElementAudio);
                    let $nextElementSongTag = $nextElement.getElementsByTagName('td')[1];
                    let $nextElementSong = $nextElementSongTag.innerHTML;
                    $nowPlayingSpan.html($nextElementSong);
                } else {
                    let $table = document.getElementsByTagName('table')[0];
                    $nextElement = $table.querySelector('tr:nth-child(2)');
                    let $nextElementImg = $nextElement.getElementsByTagName('td')[0].querySelector('img');
                    let $nextElementAudio = $nextElement.getElementsByTagName('td')[0].querySelector('audio');
                    Flip($nextElementImg, $nextElementAudio);
                    let $nextElementSongTag = $nextElement.getElementsByTagName('td')[1];
                    let $nextElementSong = $nextElementSongTag.innerHTML;
                    $nowPlayingSpan.html($nextElementSong);
                }
            }


            // prev
            $PlayerPrevBtn.on('click', prev);
            function prev() {
                // all audio reset
                let table = document.getElementsByTagName('table')[0];
                let allAudios = table.querySelectorAll('audio');
                allAudios.forEach(audio => {
                    audio.currentTime = 0;
                });
                let $tableImg = FindSong().tableImg;
                let $tableAudio = FindSong().audio;
                // Flip($tableImg, $tableAudio); // bug in this one
                $tableAudio.pause();
                $tableAudio.currentTime = 0;
                $tableImg.src = "../images/play.png";

                let $previous = $tableImg.parentElement.parentElement.previousElementSibling;
                if ($previous) {
                    if (!$previous.querySelector('th')) {
                        let $previousImg = $previous.getElementsByTagName('td')[0].querySelector('img');
                        let $previousAudio = $previous.getElementsByTagName('td')[0].querySelector('audio');
                        Flip($previousImg, $previousAudio);
                        let $previousSongTag = $previous.getElementsByTagName('td')[1];
                        let $previousSong = $previousSongTag.innerHTML;
                        $nowPlayingSpan.html($previousSong);
                    } else {
                        let $table = document.getElementsByTagName('table')[0];
                        let $tableRows = $table.querySelectorAll('tr');
                        $previous = $table.querySelector(`tr:nth-child(${$tableRows.length})`);
                        let $previousImg = $previous.getElementsByTagName('td')[0].querySelector('img');
                        let $previousAudio = $previous.getElementsByTagName('td')[0].querySelector('audio');
                        Flip($previousImg, $previousAudio);
                        let $previousSongTag = $previous.getElementsByTagName('td')[1];
                        let $previousSong = $previousSongTag.innerHTML;
                        $nowPlayingSpan.html($previousSong);
                    }

                }

            }



            // player range
            let $tableBtns = $('table tr td:nth-child(1) img');
            $tableBtns.on('click', startRange);
            $playerNextBtn.on('click', startRange);
            $PlayerPrevBtn.on('click', startRange);
            let a;
            function startRange() {
                setTimeout(function () {
                    clearInterval(a);
                    let audio = FindSong().audio;
                    let $tableImg = FindSong().tableImg;

                    let $songRow = audio.parentElement.parentElement;
                    let $songPlaying = $songRow.querySelector('td:nth-child(2)').innerHTML.toLowerCase();
                    let $songBar = $('#bar');
                    let $startTime = $songBar.prev();
                    let $endTime = $songBar.next();

                    // find song duration
                    let duration = response.data.find(song => {
                        return song.title.toLowerCase() == $songPlaying;
                    })
                    let songDuraInMinutes = Math.floor(duration.duration / 60);
                    let SongDuratSecLeft = duration.duration % 60;

                    if (SongDuratSecLeft <= 10) {
                        SongDuratSecLeft = '0' + SongDuratSecLeft;
                    }

                    $startTime.html('0:00');
                    $endTime.html(`${songDuraInMinutes}:${SongDuratSecLeft}`);

                    a = setInterval(start, 1000);
                    function start() {
                        if (audio.ended == true) {
                            clearInterval(a);
                            next();
                            startRange();
                        }
                        $songBar.val(`${audio.currentTime / audio.duration * 100}`);
                    }

                    $songBar.on('change', function () {
                        audio.currentTime = ($songBar.val() / 100) * audio.duration;
                    })
                }, 0.5)
            }

            removeDuplicates();

        }).fail(catchError);

    }
})