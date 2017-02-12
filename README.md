flipboard-downloader
====================

Flipboard image downloader. Loops through all magazines for the `USER` downloads the images. The processing date is stored so that images will not be downloaded multiple times.

To use: `make run USER=xxx PASS=yyy OUTPUT=path_to_dir`

Arguments:
USER: Flipboard user to download images from
PASS: Password for the flipboard user
OUTPUT: Directory to store the images
