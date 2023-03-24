const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API 1

const changeDBObject = (object) => {
  return {
    playerId: object.player_id,
    playerName: object.player_name,
    jerseyNumber: object.jersey_number,
    role: object.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerObjectQuery = `select * from cricket_team`;
  const getPlayerDbResponse = await db.all(getPlayerObjectQuery);

  response.send(
    getPlayerDbResponse.map((playerObject) => changeDBObject(playerObject))
  );
});

//API 2

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const createPlayerQuery = ` insert into cricket_team(player_name,
    jersey_number,role) 
    values('${playerName}',${jerseyNumber},'${role}');`;
  const createPlayerQueryResponse = await db.run(createPlayerQuery);
  response.send(`Player Added to Team`);
});

//API 3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerObject = `select * from cricket_team where player_id=${playerId}`;
  const getPlayerDbResponse = await db.get(getPlayerObject);

  response.send(changeDBObject(getPlayerDbResponse));
});

//API 4

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayerObject = `update cricket_team 
  set player_name = '${playerName}', jersey_number = '${jerseyNumber}',
  role = '${role}' where player_id ='${playerId}';`;
  const updatedPlayerObjectDBResponse = await db.run(updatePlayerObject);
  response.send("Player Details Updated");
});

//API 5

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
