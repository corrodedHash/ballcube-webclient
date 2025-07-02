# BallCube

A local implementation of the "BallCube" game using Vue.js, TypeScript, and Three.js.

## Features

- Interactive 3D graphics using Three.js.
- Vue.js for building the user interface.
- Local game state management.

## Usage
1. Set planks
    Silver and Gold player alternately push planks into the layers
2. Place balls
    Silver and Gold player alternately place balls on the top layer,
    possibly already falling through holes in the planks
3. Pull
    Silver and Gold player take turn pulling one of their planks out of the
    layers by one hole
4. Win
    The first player to have all balls of their color disappear, wins

## Setup

To get started with the project, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/corrodedHash/ballcube-webclient ballcube
   cd ballcube
   ```

2. **Install**
    ```bash
    npm install
    ```

3. **Run**
    ```bash
    npm run dev
    ```

4. **Launch**  

    Navigate to `localhost:5173` 

