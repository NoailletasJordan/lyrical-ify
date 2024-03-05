# Lyrical-ify

Lyrical-ify is a desktop application that finds the lyrics of your current music
on Spotify.

![lyrical-light](https://user-images.githubusercontent.com/48062996/102907022-bac0ec00-4475-11eb-9e3e-2a3d7efde6e5.gif)

## Usage

Before proceeding with the local installation, ensure that you have
electron-forge, sass, and concurrently installed globally on your system.

1. Download the app [here](https://lyrical-ify.jordannoailletas.com/)

1. Extract the Setup.exe file

1. Run the Setup.exe, it will install the app on your computer

1. Log into the app

1. Play a song on your Spotify, the lyrics should appear

Enjoy.

## Local installation

We assume that `electron-forge`,
[sass](https://sass-lang.com/dart-sass/#command-line), `yarn` and `concurrently`
are installed globally on your system.

1.  Clone this repo

          $ git clone git@github.com:NoailletasJordan/lyrical-ify.git
          $ cd lyrical-ify

1.  Install dependencies

          $ npm install

1.  Create a new [Spotify project](https://developer.spotify.com/dashboard/) and
    add this redirect URI: **http://localhost:54860/callback**

1.  Create a **.env** file at the root of the project and complete it like this:

          CLIENT_ID=<your-spotify-client-id>
          REDIRECT_URI=http://localhost:54860/callback

1.  Start the local server

          $ npm run start

## Github publishing

1.  Start the command with your github token

          $ GITHUB_TOKEN=<your-github-token> npm run publish

## License

[MIT]
