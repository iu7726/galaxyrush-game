# Galaxy Rush Game

[![Node.js]][Node-url]
[![Yarn]][Yarn-url]
[![TypeScript]][ts-url]
[![Socket.IO]][socket-url]
[![Redis]][Redis-url]
[![RabbitMQ]][RabbitMQ-url]
[![jest]][jest-url]
[![GR]][GR-url]

Manage the game progression that can be participated in the OG community.

## Table of Contents
- [Galaxy Rush Game](#galaxy-rush-game)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Game](#game)
  - [Run](#run)
  - [Test](#test)
  - [Container](#container)

## Installation
`yarn install`

## Game
- GalaxyRush<br />
  The order placed by the User is sustainable and performs the Exit function.
  <details>
  <summary>Functions</summary>

    - <b>bet</b>: User Create Order(Betting Order)
    - <b>init</b>: When SeedGenerator receives an event to initialize the seed, it executes and 'exits' all orders of the currently participating users.
    - <b>exit</b>: User leaves the position currently maintained.
    - <b>tick</b>: It runs every time a price is renewed (currently 500ms) and if bust price is reached, the order (Betting) is 'BUST'.
    - <b>myOrder</b>: Returns the position that the user has.
  </details>

## Run
```bash
yarn watch && yarn start
```

## Test
```bash
yarn test
```

 ## Container
 When creating a container, `Seed Generator` and `Gateway` connection are required using the `linkContainer function`.<br />
 Also, when connecting, maybe `authKey` is need.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Node-url]: https://nodejs.org/
[Node.js]: https://img.shields.io/badge/Node.js-green?logo=node.js&logoColor=white
[Yarn]: https://img.shields.io/badge/Yarn-blue?logo=yarn&logoColor=white
[Yarn-url]: https://yarnpkg.com/
[TypeScript]: https://img.shields.io/badge/TypeScript-blue?logo=typescript&logoColor=white
[ts-url]: https://www.typescriptlang.org/
[Socket.IO]: https://img.shields.io/badge/Socket.IO-blue?logo=socket.io&logoColor=white
[socket-url]: https://socket.io/
[Redis]: https://img.shields.io/badge/Redis-red?logo=redis&logoColor=white
[Redis-url]: https://redis.io/
[GR]: https://img.shields.io/badge/GalaxyRush-sky
[GR-url]: https://og.xyz
[RabbitMQ]: https://img.shields.io/badge/RabbitMQ-red?logo=RabbitMQ&logoColor=white
[RabbitMQ-url]: https://www.rabbitmq.com/
[jest]: https://img.shields.io/badge/jest-green?logo=jest&logoColor=white
[jest-url]: https://jestjs.io/